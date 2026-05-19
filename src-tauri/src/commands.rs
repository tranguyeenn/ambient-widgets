use serde::Serialize;
use tauri::AppHandle;

use crate::cache::{self, CacheEntry};
use crate::genius::{self, GeniusError};
use crate::spotify::{NowPlaying, SpotifyError, login};
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LyricResult {
    pub line: String,
    pub song: String,
    pub artist: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album_art: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
}

const HOLD_MY_HAND_COVER: &str = "/hold-my-hand-cover.png";
const HOLD_MY_HAND_SONG: &str = "Hold My Hand";
const HOLD_MY_HAND_ARTIST: &str = "HAN";
const HOLD_MY_HAND_LINE_BACKUP: &str =
    "'Cause all I want is you, not your tears";
const HOLD_MY_HAND_CACHE_ID: &str = "ambient:fallback:hold-my-hand";

fn hold_my_hand_stub() -> NowPlaying {
    NowPlaying {
        track_id: Some(HOLD_MY_HAND_CACHE_ID.into()),
        song: HOLD_MY_HAND_SONG.into(),
        artist: HOLD_MY_HAND_ARTIST.into(),
        album_art: Some(HOLD_MY_HAND_COVER.into()),
    }
}

async fn hold_my_hand_fallback(app: &AppHandle) -> LyricResult {
    let stub = hold_my_hand_stub();

    if let Ok(Some(cached)) = cache::get_rotated(app, &stub) {
        return cache_entry_to_lyric(cached);
    }

    let candidates = match genius::fetch_lyric_candidates_english(HOLD_MY_HAND_SONG, HOLD_MY_HAND_ARTIST).await
    {
        Ok(c) if !c.is_empty() => c,
        Ok(_) => vec![HOLD_MY_HAND_LINE_BACKUP.to_string()],
        Err(err) => {
            eprintln!("[fallback] Hold My Hand genius: {err}");
            vec![HOLD_MY_HAND_LINE_BACKUP.to_string()]
        }
    };

    if candidates.len() > 1 {
        if let Err(err) = cache::save(app, &stub, &candidates, "fallback") {
            eprintln!("[cache] {err}");
        }
    }

    let line = candidates
        .first()
        .cloned()
        .unwrap_or_else(|| HOLD_MY_HAND_LINE_BACKUP.to_string());

    LyricResult {
        line,
        song: HOLD_MY_HAND_SONG.into(),
        artist: HOLD_MY_HAND_ARTIST.into(),
        album_art: Some(HOLD_MY_HAND_COVER.into()),
        source: Some("fallback".into()),
    }
}

fn cache_entry_to_lyric(entry: CacheEntry) -> LyricResult {
    LyricResult {
        line: entry.line,
        song: entry.song,
        artist: entry.artist,
        album_art: entry.album_art,
        source: Some("cache".into()),
    }
}

fn track_lyric(now_playing: &NowPlaying, line: String, source: &str) -> LyricResult {
    LyricResult {
        line,
        song: now_playing.song.clone(),
        artist: now_playing.artist.clone(),
        album_art: now_playing.album_art.clone(),
        source: Some(source.to_string()),
    }
}

async fn lyric_from_genius(now_playing: &NowPlaying) -> Result<(LyricResult, Vec<String>), GeniusError> {
    let candidates =
        genius::fetch_lyric_candidates(&now_playing.song, &now_playing.artist).await?;
    let line = candidates
        .first()
        .cloned()
        .ok_or(GeniusError::EmptyLyrics)?;
    Ok((track_lyric(now_playing, line, "genius"), candidates))
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NowPlayingTrack {
    pub song: String,
    pub artist: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album_art: Option<String>,
}

fn now_playing_to_track(now_playing: NowPlaying) -> NowPlayingTrack {
    NowPlayingTrack {
        song: now_playing.song,
        artist: now_playing.artist,
        album_art: now_playing.album_art,
    }
}

#[tauri::command]
pub async fn get_now_playing_track(app: AppHandle) -> Option<NowPlayingTrack> {
    match crate::spotify::get_now_playing(&app).await {
        Ok(now_playing) => Some(now_playing_to_track(now_playing)),
        Err(err) => {
            if should_log_spotify_error(&err) {
                eprintln!("[spotify] {err}");
            }
            None
        }
    }
}

#[tauri::command]
pub async fn get_current_lyric(app: AppHandle) -> LyricResult {
    let now_playing = match crate::spotify::get_now_playing(&app).await {
        Ok(track) => track,
        Err(err) => {
            if should_log_spotify_error(&err) {
                eprintln!("[spotify] {err}");
            }
            return hold_my_hand_fallback(&app).await;
        }
    };

    if let Ok(Some(cached)) = cache::get_rotated(&app, &now_playing) {
        return cache_entry_to_lyric(cached);
    }

    match lyric_from_genius(&now_playing).await {
        Ok((result, candidates)) => {
            if let Err(err) = cache::save(&app, &now_playing, &candidates, "genius") {
                eprintln!("[cache] {err}");
            }
            result
        }
        Err(err) => {
            if should_log_genius_error(&err) {
                eprintln!("[genius] {err}");
            }
            hold_my_hand_fallback(&app).await
        }
    }
}

fn should_log_spotify_error(err: &SpotifyError) -> bool {
    !matches!(
        err,
        SpotifyError::NotAuthenticated
            | SpotifyError::NotConfigured
            | SpotifyError::NothingPlaying
            | SpotifyError::NoActiveDevice
    )
}

fn should_log_genius_error(err: &GeniusError) -> bool {
    !matches!(
        err,
        GeniusError::NotConfigured | GeniusError::NoMatch | GeniusError::EmptyLyrics
    )
}

#[tauri::command]
pub fn spotify_is_authenticated(app: AppHandle) -> bool {
    crate::spotify::is_authenticated(&app)
}

#[tauri::command]
pub async fn spotify_login(app: AppHandle) -> Result<(), String> {
    login(&app).await.map_err(|err| err.to_string())
}
