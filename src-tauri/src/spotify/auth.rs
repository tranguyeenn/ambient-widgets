use std::sync::Mutex;
use std::thread;
use std::time::Duration;

use base64::Engine;
use rand::Rng;
use reqwest::Client;
use sha2::{Digest, Sha256};
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;
use url::Url;

use crate::spotify::config::SpotifyConfig;
use crate::spotify::error::SpotifyError;
use crate::spotify::tokens::{TokenResponse, TokenStore, save};

const PKCE_CHARSET: &[u8] =
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const SCOPES: &str = "user-read-currently-playing user-read-playback-state";

static AUTH_IN_PROGRESS: Mutex<bool> = Mutex::new(false);

fn generate_pkce_pair() -> (String, String) {
    let mut rng = rand::thread_rng();
    let verifier: String = (0..64)
        .map(|_| PKCE_CHARSET[rng.gen_range(0..PKCE_CHARSET.len())] as char)
        .collect();

    let digest = Sha256::digest(verifier.as_bytes());
    let challenge = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(digest);
    (verifier, challenge)
}

fn random_state() -> String {
    let mut rng = rand::thread_rng();
    (0..16)
        .map(|_| PKCE_CHARSET[rng.gen_range(0..PKCE_CHARSET.len())] as char)
        .collect()
}

fn build_authorize_url(config: &SpotifyConfig, challenge: &str, state: &str) -> String {
    format!(
        "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}&code_challenge_method=S256&code_challenge={}&state={}",
        urlencoding::encode(&config.client_id),
        urlencoding::encode(&config.redirect_uri),
        urlencoding::encode(SCOPES),
        urlencoding::encode(challenge),
        urlencoding::encode(state),
    )
}

fn callback_port(redirect_uri: &str) -> Result<u16, SpotifyError> {
    let redirect = Url::parse(redirect_uri)
        .map_err(|err| SpotifyError::AuthFailed(format!("invalid redirect URI: {err}")))?;
    Ok(redirect
        .port()
        .unwrap_or(if redirect.scheme() == "https" { 443 } else { 80 }))
}

fn wait_for_auth_code(server: tiny_http::Server, redirect_uri: &str) -> Result<String, SpotifyError> {
    let redirect_uri = redirect_uri.to_string();
    let (tx, rx) = std::sync::mpsc::sync_channel::<Result<String, SpotifyError>>(1);

    thread::spawn(move || {
        if let Some(request) = server.recv_timeout(Duration::from_secs(180)).ok().flatten() {
            let url = request.url().to_string();
            let response = match parse_callback_code(&url, &redirect_uri) {
                Ok(code) => {
                    let _ = request.respond(tiny_http::Response::from_string(
                        "<html><body><h1>Spotify connected</h1><p>You can close this tab.</p></body></html>",
                    ));
                    Ok(code)
                }
                Err(err) => {
                    let _ = request.respond(tiny_http::Response::from_string(format!(
                        "<html><body><h1>Authorization failed</h1><p>{err}</p></body></html>"
                    )));
                    Err(err)
                }
            };
            let _ = tx.send(response);
        } else {
            let _ = tx.send(Err(SpotifyError::AuthFailed(
                "authorization timed out".into(),
            )));
        }
    });

    rx.recv()
        .map_err(|_| SpotifyError::AuthFailed("authorization cancelled".into()))?
}

fn open_authorize_url(url: &str) -> Result<(), SpotifyError> {
    #[cfg(target_os = "macos")]
    {
        if std::process::Command::new("open")
            .arg(url)
            .spawn()
            .is_ok()
        {
            return Ok(());
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = url;
    }

    Err(SpotifyError::AuthFailed(
        "could not open browser for Spotify login".into(),
    ))
}

fn open_browser(app: &AppHandle, url: &str) -> Result<(), SpotifyError> {
    #[cfg(target_os = "macos")]
    if open_authorize_url(url).is_ok() {
        return Ok(());
    }

    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|err| SpotifyError::AuthFailed(err.to_string()))
}

fn resolve_callback_url(request_url: &str, redirect_uri: &str) -> Result<Url, SpotifyError> {
    if request_url.contains("://") {
        return Url::parse(request_url)
            .map_err(|err| SpotifyError::AuthFailed(format!("invalid callback URL: {err}")));
    }

    let base = Url::parse(redirect_uri)
        .map_err(|err| SpotifyError::AuthFailed(format!("invalid redirect URI: {err}")))?;

    let origin = format!(
        "{}://{}{}",
        base.scheme(),
        base.host_str()
            .ok_or_else(|| SpotifyError::AuthFailed("redirect URI missing host".into()))?,
        base.port()
            .map(|port| format!(":{port}"))
            .unwrap_or_default()
    );

    let path = if request_url.starts_with('/') {
        request_url.to_string()
    } else {
        format!("/{request_url}")
    };

    Url::parse(&format!("{origin}{path}"))
        .map_err(|err| SpotifyError::AuthFailed(format!("invalid callback URL: {err}")))
}

fn parse_callback_code(request_url: &str, redirect_uri: &str) -> Result<String, SpotifyError> {
    let parsed = resolve_callback_url(request_url, redirect_uri)?;

    if let Some(error) = parsed
        .query_pairs()
        .find(|(key, _)| key == "error")
        .map(|(_, value)| value.to_string())
    {
        return Err(SpotifyError::AuthFailed(error));
    }

    parsed
        .query_pairs()
        .find(|(key, _)| key == "code")
        .map(|(_, value)| value.to_string())
        .ok_or_else(|| SpotifyError::AuthFailed("missing authorization code".into()))
}

async fn exchange_code(
    config: &SpotifyConfig,
    code: &str,
    verifier: &str,
) -> Result<TokenStore, SpotifyError> {
    let client = Client::new();
    let response = client
        .post("https://accounts.spotify.com/api/token")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", config.redirect_uri.as_str()),
            ("client_id", config.client_id.as_str()),
            ("code_verifier", verifier),
        ])
        .send()
        .await?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(SpotifyError::AuthFailed(body));
    }

    let token_response: TokenResponse = response.json().await?;
    Ok(TokenStore::from_token_response(&token_response))
}

pub async fn refresh_access_token(
    config: &SpotifyConfig,
    refresh_token: &str,
) -> Result<TokenStore, SpotifyError> {
    let client = Client::new();
    let response = client
        .post("https://accounts.spotify.com/api/token")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&[
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh_token),
            ("client_id", config.client_id.as_str()),
        ])
        .send()
        .await?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(SpotifyError::AuthFailed(body));
    }

    let token_response: TokenResponse = response.json().await?;
    let mut store = TokenStore::from_token_response(&token_response);
    if store.refresh_token.is_none() {
        store.refresh_token = Some(refresh_token.to_string());
    }
    Ok(store)
}

pub async fn login(app: &AppHandle) -> Result<(), SpotifyError> {
    {
        let mut guard = AUTH_IN_PROGRESS
            .lock()
            .map_err(|_| SpotifyError::AuthFailed("auth already in progress".into()))?;
        if *guard {
            return Err(SpotifyError::AuthFailed(
                "Spotify login already in progress".into(),
            ));
        }
        *guard = true;
    }

    let result = login_inner(app).await;

    if let Ok(mut guard) = AUTH_IN_PROGRESS.lock() {
        *guard = false;
    }

    result
}

async fn login_inner(app: &AppHandle) -> Result<(), SpotifyError> {
    let config = SpotifyConfig::load()?;
    let (verifier, challenge) = generate_pkce_pair();
    let state = random_state();
    let auth_url = build_authorize_url(&config, &challenge, &state);
    let port = callback_port(&config.redirect_uri)?;

    let server = tiny_http::Server::http(format!("127.0.0.1:{port}")).map_err(|err| {
        SpotifyError::AuthFailed(format!(
            "could not start callback server on port {port}: {err}"
        ))
    })?;

    open_browser(app, &auth_url)?;

    let code = wait_for_auth_code(server, &config.redirect_uri)?;
    let tokens = exchange_code(&config, &code, &verifier).await?;
    save(app, &tokens)?;
    Ok(())
}

pub async fn ensure_access_token(app: &AppHandle) -> Result<String, SpotifyError> {
    let config = SpotifyConfig::load()?;
    let mut tokens = match crate::spotify::tokens::load(app) {
        Ok(tokens) => tokens,
        Err(SpotifyError::NotAuthenticated) => return Err(SpotifyError::NotAuthenticated),
        Err(err) => return Err(err),
    };

    if !tokens.is_expired() {
        return Ok(tokens.access_token);
    }

    let refresh_token = tokens
        .refresh_token
        .clone()
        .ok_or(SpotifyError::NotAuthenticated)?;

    tokens = refresh_access_token(&config, &refresh_token).await?;
    save(app, &tokens)?;
    Ok(tokens.access_token)
}
