use reqwest::Client;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    pub text: String,
    pub author: String,
}

#[derive(Debug, Deserialize)]
struct ZenQuotesItem {
    q: String,
    a: String,
}

fn zenquotes_url() -> String {
    match std::env::var("ZENQUOTES_API_KEY") {
        Ok(key) if !key.trim().is_empty() => {
            format!(
                "https://zenquotes.io/api/random?key={}",
                urlencoding::encode(key.trim())
            )
        }
        _ => "https://zenquotes.io/api/random".to_string(),
    }
}

fn is_rate_limit_payload(text: &str, author: &str) -> bool {
    text.contains("Too many requests")
        || (author.eq_ignore_ascii_case("zenquotes.io") && text.contains("auth key"))
}

pub async fn fetch_random_quote() -> Result<Quote, String> {
    let client = Client::new();
    let response = client
        .get(zenquotes_url())
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|err| err.to_string())?;

    if !response.status().is_success() {
        return Err(format!("zenquotes HTTP {}", response.status()));
    }

    let items: Vec<ZenQuotesItem> = response.json().await.map_err(|err| err.to_string())?;
    let item = items.first().ok_or_else(|| "zenquotes returned no items".to_string())?;

    let text = item.q.trim().to_string();
    let author = item.a.trim().to_string();

    if text.is_empty() || author.is_empty() {
        return Err("zenquotes returned empty quote".into());
    }

    if is_rate_limit_payload(&text, &author) {
        return Err("zenquotes rate limited (set ZENQUOTES_API_KEY in src-tauri/.env)".into());
    }

    Ok(Quote { text, author })
}
