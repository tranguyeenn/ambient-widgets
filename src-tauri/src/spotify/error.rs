use thiserror::Error;

#[derive(Debug, Error)]
pub enum SpotifyError {
    #[error("Spotify client ID not configured (set SPOTIFY_CLIENT_ID in src-tauri/.env)")]
    NotConfigured,

    #[error("not authenticated with Spotify")]
    NotAuthenticated,

    #[error("nothing is currently playing")]
    NothingPlaying,

    #[error("no active Spotify device")]
    NoActiveDevice,

    #[error("auth failed: {0}")]
    AuthFailed(String),

    #[error("API request failed: {0}")]
    Api(String),

    #[error("token storage error: {0}")]
    Storage(String),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}

/// True for rate limits and gateway blips (503 overflow/timeouts) — safe to retry.
pub fn is_transient(err: &SpotifyError) -> bool {
    match err {
        SpotifyError::Http(http) => http.is_timeout() || http.is_connect() || http.is_request(),
        SpotifyError::Api(body) => {
            body.starts_with("status 429:")
                || body.starts_with("status 502:")
                || body.starts_with("status 503:")
                || body.starts_with("status 504:")
        }
        _ => false,
    }
}

/// True when Spotify rejected the refresh token (user revoked app access, password reset, etc.).
pub fn is_revoked_refresh(err: &SpotifyError) -> bool {
    matches!(
        err,
        SpotifyError::AuthFailed(body)
            if body.contains("invalid_grant")
                || body.contains("Refresh token revoked")
    )
}
