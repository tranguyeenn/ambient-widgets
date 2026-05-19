use regex::Regex;
use reqwest::Client;
use scraper::{Html, Selector};
use serde::Deserialize;
use thiserror::Error;

use crate::lyric_filter::{
    artist_similarity, meaningful_lines, normalize_title, split_lyrics, title_similarity,
};

#[derive(Debug, Error)]
pub enum GeniusError {
    #[error("Genius access token not configured (set GENIUS_ACCESS_TOKEN in src-tauri/.env)")]
    NotConfigured,

    #[error("no matching Genius song found")]
    NoMatch,

    #[error("lyrics were empty or unusable")]
    EmptyLyrics,

    #[error("API error: {0}")]
    Api(String),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

#[derive(Debug, Deserialize)]
struct SearchResponse {
    response: SearchBody,
}

#[derive(Debug, Deserialize)]
struct SearchBody {
    hits: Vec<SearchHit>,
}

#[derive(Debug, Deserialize)]
struct SearchHit {
    result: SearchResult,
}

#[derive(Debug, Deserialize)]
struct SearchResult {
    title: String,
    url: String,
    primary_artist: GeniusArtist,
}

#[derive(Debug, Deserialize)]
struct GeniusArtist {
    name: String,
}

#[derive(Debug, Clone)]
struct RankedSong {
    url: String,
    score: f32,
}

fn genius_token() -> Result<String, GeniusError> {
    std::env::var("GENIUS_ACCESS_TOKEN")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .ok_or(GeniusError::NotConfigured)
}

pub async fn fetch_lyric_candidates(song: &str, artist: &str) -> Result<Vec<String>, GeniusError> {
    let token = genius_token()?;
    let best = search_best_match(&token, song, artist, false).await?;
    let lyrics = fetch_lyrics_from_url(&best.url).await?;
    lyrics_to_candidates(lyrics)
}

/// Genius English Translation page for HAN — Hold My Hand.
pub const HOLD_MY_HAND_ENGLISH_URL: &str =
    "https://genius.com/Genius-english-translations-han-of-stray-kids-hold-my-hand-english-translation-lyrics";

pub async fn fetch_lyric_candidates_from_url(url: &str) -> Result<Vec<String>, GeniusError> {
    let lyrics = fetch_lyrics_from_url(url).await?;
    lyrics_to_candidates(lyrics)
}

/// Prefer Genius "English Translation" pages over the original Korean lyrics.
pub async fn fetch_lyric_candidates_english(
    song: &str,
    artist: &str,
) -> Result<Vec<String>, GeniusError> {
    if let Ok(candidates) = fetch_lyric_candidates_from_url(HOLD_MY_HAND_ENGLISH_URL).await {
        return Ok(candidates);
    }

    let token = genius_token()?;
    let best = search_best_match(&token, song, artist, true).await?;
    let lyrics = fetch_lyrics_from_url(&best.url).await?;
    lyrics_to_candidates(lyrics)
}

fn lyrics_to_candidates(lyrics: String) -> Result<Vec<String>, GeniusError> {
    let lines = split_lyrics(&lyrics);
    let candidates = meaningful_lines(&lines);

    if candidates.is_empty() {
        return Err(GeniusError::EmptyLyrics);
    }

    Ok(candidates)
}

async fn search_best_match(
    token: &str,
    song: &str,
    artist: &str,
    prefer_english: bool,
) -> Result<RankedSong, GeniusError> {
    let query = if prefer_english {
        format!(
            "{} {} english translation",
            normalize_title(song),
            artist.trim()
        )
    } else {
        format!("{} {}", normalize_title(song), artist.trim())
    };
    let client = Client::new();

    let response = client
        .get("https://api.genius.com/search")
        .bearer_auth(token)
        .query(&[("q", query.as_str())])
        .send()
        .await?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(GeniusError::Api(format!("search status {status}: {body}")));
    }

    let payload: SearchResponse = response.json().await?;
    let mut ranked: Vec<RankedSong> = payload
        .response
        .hits
        .into_iter()
        .map(|hit| {
            let title_lower = hit.result.title.to_lowercase();
            let title_score = title_similarity(song, &hit.result.title);
            let artist_score = artist_similarity(artist, &hit.result.primary_artist.name);
            let mut score = title_score * 0.55 + artist_score * 0.45;

            if prefer_english && title_lower.contains("english translation") {
                score += 0.45;
            }

            RankedSong {
                url: hit.result.url,
                score,
            }
        })
        .filter(|candidate| candidate.score >= 0.25)
        .collect();

    ranked.sort_by(|left, right| {
        right
            .score
            .partial_cmp(&left.score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    ranked.into_iter().next().ok_or(GeniusError::NoMatch)
}

async fn fetch_lyrics_from_url(url: &str) -> Result<String, GeniusError> {
    let client = Client::new();
    let response = client
        .get(url)
        .header(
            "User-Agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        )
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(GeniusError::Api(format!(
            "lyrics page status {}",
            response.status()
        )));
    }

    let html = response.text().await?;
    extract_lyrics_from_html(&html).ok_or(GeniusError::EmptyLyrics)
}

fn extract_lyrics_from_html(html: &str) -> Option<String> {
    let document = Html::parse_document(html);
    let selector = Selector::parse("[data-lyrics-container='true']").ok()?;

    let mut chunks = Vec::new();
    for element in document.select(&selector) {
        let inner = element.inner_html();
        if let Some(text) = html_fragment_to_text(&inner) {
            if !text.trim().is_empty() {
                chunks.push(text);
            }
        }
    }

    if chunks.is_empty() {
        return None;
    }

    Some(chunks.join("\n"))
}

fn html_fragment_to_text(html: &str) -> Option<String> {
    let with_breaks = html
        .replace("<br>", "\n")
        .replace("<br/>", "\n")
        .replace("<br />", "\n");

    let tag_re = Regex::new(r"<[^>]+>").ok()?;
    let text = tag_re.replace_all(&with_breaks, "");
    let decoded = text
        .replace("&amp;", "&")
        .replace("&quot;", "\"")
        .replace("&#x27;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">");

    let normalized = decoded
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    if normalized.is_empty() {
        None
    } else {
        Some(normalized)
    }
}
