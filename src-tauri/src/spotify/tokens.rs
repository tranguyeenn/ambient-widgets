use std::fs;
use std::path::PathBuf;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri::Manager;

use crate::spotify::error::SpotifyError;

const TOKEN_FILE: &str = "spotify_tokens.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenStore {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub token_type: String,
    pub expires_at: Option<DateTime<Utc>>,
}

impl TokenStore {
    pub fn is_expired(&self) -> bool {
        match self.expires_at {
            Some(expires_at) => Utc::now() >= expires_at - chrono::Duration::seconds(60),
            None => false,
        }
    }

    pub fn from_token_response(response: &TokenResponse) -> Self {
        let expires_at = response
            .expires_in
            .map(|seconds| Utc::now() + chrono::Duration::seconds(seconds));

        Self {
            access_token: response.access_token.clone(),
            refresh_token: response.refresh_token.clone(),
            token_type: response
                .token_type
                .clone()
                .unwrap_or_else(|| "Bearer".to_string()),
            expires_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: Option<String>,
    pub expires_in: Option<i64>,
    pub refresh_token: Option<String>,
}

fn token_path(app: &AppHandle) -> Result<PathBuf, SpotifyError> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|err| SpotifyError::Storage(err.to_string()))?;

    fs::create_dir_all(&dir)?;
    Ok(dir.join(TOKEN_FILE))
}

pub fn is_authenticated(app: &AppHandle) -> bool {
    load(app).is_ok()
}

pub fn load(app: &AppHandle) -> Result<TokenStore, SpotifyError> {
    let path = token_path(app)?;
    if !path.exists() {
        return Err(SpotifyError::NotAuthenticated);
    }

    let contents = fs::read_to_string(&path)?;
    serde_json::from_str(&contents).map_err(|err| SpotifyError::Storage(err.to_string()))
}

pub fn save(app: &AppHandle, tokens: &TokenStore) -> Result<(), SpotifyError> {
    let path = token_path(app)?;
    let contents = serde_json::to_string_pretty(tokens)?;
    fs::write(path, contents)?;
    Ok(())
}

#[allow(dead_code)]
pub fn clear(app: &AppHandle) -> Result<(), SpotifyError> {
    let path = token_path(app)?;
    if path.exists() {
        fs::remove_file(path)?;
    }
    Ok(())
}
