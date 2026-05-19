mod api;
mod auth;
mod config;
mod error;
mod tokens;

pub use api::{fetch_now_playing, NowPlaying};
pub use auth::login;
pub use error::{is_transient, SpotifyError};
pub use tokens::is_authenticated;

use tauri::AppHandle;

pub async fn get_now_playing(app: &AppHandle) -> Result<NowPlaying, SpotifyError> {
    fetch_now_playing(app).await
}
