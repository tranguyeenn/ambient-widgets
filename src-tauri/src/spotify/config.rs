use crate::spotify::error::SpotifyError;

const DEFAULT_REDIRECT_URI: &str = "http://127.0.0.1:8888/callback";

#[derive(Debug, Clone)]
pub struct SpotifyConfig {
    pub client_id: String,
    pub redirect_uri: String,
}

impl SpotifyConfig {
    pub fn load() -> Result<Self, SpotifyError> {
        let client_id = std::env::var("SPOTIFY_CLIENT_ID")
            .ok()
            .filter(|value| !value.trim().is_empty())
            .ok_or(SpotifyError::NotConfigured)?;

        let redirect_uri = std::env::var("SPOTIFY_REDIRECT_URI")
            .ok()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| DEFAULT_REDIRECT_URI.to_string());

        Ok(Self {
            client_id,
            redirect_uri,
        })
    }
}
