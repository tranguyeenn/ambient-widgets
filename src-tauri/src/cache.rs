use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri::Manager;

use crate::lyric_filter::{normalize_key, pick_line_at_index};
use crate::spotify::NowPlaying;

const CACHE_FILE: &str = "lyric_cache.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub song: String,
    pub artist: String,
    pub album_art: Option<String>,
    pub line: String,
    pub source: String,
    pub timestamp: DateTime<Utc>,
    #[serde(default)]
    pub candidates: Vec<String>,
    #[serde(default)]
    pub candidate_index: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub track_id: Option<String>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct CacheStore {
    entries: HashMap<String, CacheEntry>,
}

#[derive(Debug, thiserror::Error)]
pub enum CacheError {
    #[error("cache storage error: {0}")]
    Storage(String),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

pub fn cache_key(track_id: Option<&str>, artist: &str, title: &str) -> String {
    if let Some(track_id) = track_id.filter(|id| !id.is_empty()) {
        return format!("track:{track_id}");
    }

    format!(
        "meta:{}:{}",
        normalize_key(artist),
        normalize_key(title)
    )
}

fn cache_path(app: &AppHandle) -> Result<PathBuf, CacheError> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|err| CacheError::Storage(err.to_string()))?;
    fs::create_dir_all(&dir)?;
    Ok(dir.join(CACHE_FILE))
}

fn load_store(app: &AppHandle) -> Result<CacheStore, CacheError> {
    let path = cache_path(app)?;
    if !path.exists() {
        return Ok(CacheStore::default());
    }

    let contents = fs::read_to_string(path)?;
    if contents.trim().is_empty() {
        return Ok(CacheStore::default());
    }

    Ok(serde_json::from_str(&contents)?)
}

fn save_store(app: &AppHandle, store: &CacheStore) -> Result<(), CacheError> {
    let path = cache_path(app)?;
    let contents = serde_json::to_string_pretty(store)?;
    fs::write(path, contents)?;
    Ok(())
}

fn advance_entry(entry: &mut CacheEntry) {
    if entry.candidates.len() <= 1 {
        return;
    }

    entry.candidate_index = (entry.candidate_index + 1) % entry.candidates.len();
    if let Some(line) = pick_line_at_index(&entry.candidates, entry.candidate_index) {
        entry.line = line;
    }
}

pub fn get_rotated(app: &AppHandle, now_playing: &NowPlaying) -> Result<Option<CacheEntry>, CacheError> {
    let mut store = load_store(app)?;
    let key = cache_key(
        now_playing.track_id.as_deref(),
        &now_playing.artist,
        &now_playing.song,
    );

    let Some(entry) = store.entries.get_mut(&key) else {
        return Ok(None);
    };

    advance_entry(entry);
    entry.timestamp = Utc::now();
    let snapshot = entry.clone();
    save_store(app, &store)?;

    Ok(Some(snapshot))
}

pub fn save(
    app: &AppHandle,
    now_playing: &NowPlaying,
    candidates: &[String],
    source: &str,
) -> Result<(), CacheError> {
    let mut store = load_store(app)?;
    let key = cache_key(
        now_playing.track_id.as_deref(),
        &now_playing.artist,
        &now_playing.song,
    );

    let line = pick_line_at_index(candidates, 0).unwrap_or_default();

    store.entries.insert(
        key,
        CacheEntry {
            song: now_playing.song.clone(),
            artist: now_playing.artist.clone(),
            album_art: now_playing.album_art.clone(),
            line,
            source: source.to_string(),
            timestamp: Utc::now(),
            candidates: candidates.to_vec(),
            candidate_index: 0,
            track_id: now_playing.track_id.clone(),
        },
    );

    save_store(app, &store)
}
