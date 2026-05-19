use reqwest::Client;
use serde::Deserialize;
use tauri::AppHandle;

use crate::spotify::auth::{ensure_access_token, refresh_access_token};
use crate::spotify::config::SpotifyConfig;
use crate::spotify::error::{is_revoked_refresh, SpotifyError};
use crate::spotify::tokens::{clear, load, save};

#[derive(Debug, Clone)]
pub struct NowPlaying {
    pub track_id: Option<String>,
    pub song: String,
    pub artist: String,
    pub album_art: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CurrentlyPlayingResponse {
    item: Option<TrackItem>,
}

#[derive(Debug, Deserialize)]
struct TrackItem {
    id: String,
    name: String,
    artists: Vec<Artist>,
    album: Album,
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

pub async fn fetch_now_playing(app: &AppHandle) -> Result<NowPlaying, SpotifyError> {
    if SpotifyConfig::load().is_err() {
        return Err(SpotifyError::NotConfigured);
    }

    let client = Client::new();
    let mut access_token = ensure_access_token(app).await?;
    let mut response = currently_playing_request(&client, &access_token).await?;

    if response.status() == reqwest::StatusCode::UNAUTHORIZED {
        let config = SpotifyConfig::load()?;
        let stored = load(app)?;
        let refresh_token = stored.refresh_token.ok_or(SpotifyError::NotAuthenticated)?;
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
        response = currently_playing_request(&client, &access_token).await?;
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

    let payload: CurrentlyPlayingResponse = response.json().await?;
    let item = payload.item.ok_or(SpotifyError::NothingPlaying)?;

    let artist = item
        .artists
        .first()
        .map(|artist| artist.name.clone())
        .unwrap_or_else(|| "Unknown Artist".to_string());

    let album_art = item
        .album
        .images
        .iter()
        .max_by_key(|image| image.height.unwrap_or(0))
        .map(|image| image.url.clone());

    Ok(NowPlaying {
        track_id: Some(item.id),
        song: item.name,
        artist,
        album_art,
    })
}

async fn currently_playing_request(
    client: &Client,
    access_token: &str,
) -> Result<reqwest::Response, SpotifyError> {
    client
        .get("https://api.spotify.com/v1/me/player/currently-playing")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(SpotifyError::from)
}
