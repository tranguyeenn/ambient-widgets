use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};

use reqwest::Client;
use serde::Deserialize;
use tauri::AppHandle;

use crate::spotify::auth::{ensure_access_token, refresh_access_token};
use crate::spotify::config::SpotifyConfig;
use crate::spotify::error::{is_revoked_refresh, is_transient, SpotifyError};
use crate::spotify::tokens::{clear, load, save};

const PLAYBACK_CACHE_TTL: Duration = Duration::from_secs(3);
const MAX_ATTEMPTS: u32 = 4;
const INITIAL_RETRY_DELAY: Duration = Duration::from_millis(500);

#[derive(Debug, Clone)]
pub struct NowPlaying {
    pub track_id: Option<String>,
    pub song: String,
    pub artist: String,
    pub album_art: Option<String>,
}

struct PlaybackCache {
    fetched_at: Instant,
    track: NowPlaying,
}

static HTTP: OnceLock<Client> = OnceLock::new();
static PLAYBACK_CACHE: Mutex<Option<PlaybackCache>> = Mutex::new(None);

#[derive(Debug, Deserialize)]
struct PlaybackStateResponse {
    item: Option<PlayableItem>,
}

/// Spotify returns either a track or a podcast episode on the active player.
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum PlayableItem {
    Track {
        id: Option<String>,
        name: String,
        artists: Vec<Artist>,
        album: Album,
    },
    Episode {
        id: Option<String>,
        name: String,
        show: Show,
    },
}

#[derive(Debug, Deserialize)]
struct Show {
    name: String,
}

#[derive(Debug, Deserialize)]
struct Artist {
    name: String,
}

#[derive(Debug, Deserialize)]
struct Album {
    images: Vec<AlbumImage>,
}

#[derive(Debug, Deserialize)]
struct AlbumImage {
    url: String,
    height: Option<u32>,
}

fn http_client() -> &'static Client {
    HTTP.get_or_init(|| {
        Client::builder()
            .timeout(Duration::from_secs(12))
            .build()
            .expect("reqwest client")
    })
}

fn read_playback_cache() -> Option<NowPlaying> {
    let guard = PLAYBACK_CACHE.lock().ok()?;
    let entry = guard.as_ref()?;
    if entry.fetched_at.elapsed() > PLAYBACK_CACHE_TTL {
        return None;
    }
    Some(entry.track.clone())
}

fn write_playback_cache(track: &NowPlaying) {
    if let Ok(mut guard) = PLAYBACK_CACHE.lock() {
        *guard = Some(PlaybackCache {
            fetched_at: Instant::now(),
            track: track.clone(),
        });
    }
}

/// Fetches playback state, with a short TTL cache and retries on transient errors.
pub async fn fetch_now_playing(app: &AppHandle) -> Result<NowPlaying, SpotifyError> {
    if let Some(track) = read_playback_cache() {
        return Ok(track);
    }

    let mut last_err: Option<SpotifyError> = None;
    for attempt in 0..MAX_ATTEMPTS {
        match fetch_now_playing_once(app).await {
            Ok(track) => {
                write_playback_cache(&track);
                return Ok(track);
            }
            Err(err) if is_transient(&err) && attempt + 1 < MAX_ATTEMPTS => {
                let delay = INITIAL_RETRY_DELAY * 2u32.pow(attempt);
                tokio::time::sleep(delay).await;
                last_err = Some(err);
            }
            Err(err) => return Err(err),
        }
    }

    Err(last_err.unwrap_or(SpotifyError::Api(
        "playback request failed after retries".into(),
    )))
}

async fn fetch_now_playing_once(app: &AppHandle) -> Result<NowPlaying, SpotifyError> {
    if SpotifyConfig::load().is_err() {
        return Err(SpotifyError::NotConfigured);
    }

    let client = http_client();
    let mut access_token = ensure_access_token(app).await?;
    let mut response = playback_state_request(client, &access_token).await?;

    if response.status() == reqwest::StatusCode::UNAUTHORIZED {
        let config = SpotifyConfig::load()?;
        let stored = load(app)?;
        let refresh_token = stored
            .refresh_token
            .ok_or(SpotifyError::NotAuthenticated)?;
        let refreshed = match refresh_access_token(&config, &refresh_token).await {
            Ok(tokens) => tokens,
            Err(err) if is_revoked_refresh(&err) => {
                let _ = clear(app);
                return Err(SpotifyError::NotAuthenticated);
            }
            Err(err) => return Err(err),
        };
        access_token = refreshed.access_token.clone();
        save(app, &refreshed)?;
        response = playback_state_request(client, &access_token).await?;
    }

    match response.status().as_u16() {
        204 => return Err(SpotifyError::NothingPlaying),
        401 => return Err(SpotifyError::NotAuthenticated),
        404 => return Err(SpotifyError::NoActiveDevice),
        status if !response.status().is_success() => {
            let body = response.text().await.unwrap_or_default();
            return Err(SpotifyError::Api(format!("status {status}: {body}")));
        }
        _ => {}
    }

    let payload: PlaybackStateResponse = response.json().await?;
    let item = payload.item.ok_or(SpotifyError::NothingPlaying)?;
    now_playing_from_item(item)
}

fn now_playing_from_item(item: PlayableItem) -> Result<NowPlaying, SpotifyError> {
    match item {
        PlayableItem::Track {
            id,
            name,
            artists,
            album,
        } => {
            let artist = artists
                .first()
                .map(|artist| artist.name.clone())
                .unwrap_or_else(|| "Unknown Artist".to_string());

            let album_art = album
                .images
                .iter()
                .max_by_key(|image| image.height.unwrap_or(0))
                .map(|image| image.url.clone());

            Ok(NowPlaying {
                track_id: id,
                song: name,
                artist,
                album_art,
            })
        }
        PlayableItem::Episode {
            id,
            name,
            show,
        } => Ok(NowPlaying {
            track_id: id,
            song: name,
            artist: show.name,
            album_art: None,
        }),
    }
}

async fn playback_state_request(
    client: &Client,
    access_token: &str,
) -> Result<reqwest::Response, SpotifyError> {
    client
        .get("https://api.spotify.com/v1/me/player")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(SpotifyError::from)
}
