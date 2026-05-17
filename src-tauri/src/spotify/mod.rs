mod api;
mod auth;
mod config;
mod error;
mod tokens;

pub use api::{NowPlaying, fetch_now_playing};
pub use auth::login;
pub use error::SpotifyError;
pub use tokens::is_authenticated;

use tauri::AppHandle;

pub async fn get_now_playing(app: &AppHandle) -> Result<NowPlaying, SpotifyError> {
    fetch_now_playing(app).await
}
