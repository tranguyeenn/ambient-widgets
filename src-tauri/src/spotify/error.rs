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
