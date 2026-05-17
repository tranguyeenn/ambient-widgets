use std::collections::HashSet;

pub const MIN_LINE_LENGTH: usize = 20;

const OFFENSIVE_WORDS: &[&str] = &[
    "nigga", "nigger", "faggot", "retard", "chink", "spic", "kike", "tranny",
];

const METADATA_MARKERS: &[&str] = &[
    "contributors",
    "translations",
    "read more",
    "you might also like",
    "embed",
    "genius is the",
    "lyrics powered",
];

pub fn normalize_title(title: &str) -> String {
    let lower = title.to_lowercase();

    let trimmed = lower
        .split(" feat.")
        .next()
        .unwrap_or(&lower)
        .split(" (feat.")
        .next()
        .unwrap_or(&lower)
        .split(" featuring ")
        .next()
        .unwrap_or(&lower);

    let mut cleaned = trimmed.to_string();
    for phrase in [
        "remastered",
        "radio edit",
        " - remaster",
        "(remaster",
        " deluxe",
        " bonus track",
    ] {
        cleaned = cleaned.replace(phrase, "");
    }

    cleaned
        .chars()
        .filter(|ch| ch.is_alphanumeric() || ch.is_whitespace())
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn normalize_key(value: &str) -> String {
    normalize_title(value).replace(' ', "_")
}

pub fn title_similarity(left: &str, right: &str) -> f32 {
    let left_norm = normalize_title(left);
    let right_norm = normalize_title(right);
    let left_tokens: HashSet<_> = left_norm.split_whitespace().collect();
    let right_tokens: HashSet<_> = right_norm.split_whitespace().collect();

    if left_tokens.is_empty() || right_tokens.is_empty() {
        return 0.0;
    }

    let overlap = left_tokens.intersection(&right_tokens).count() as f32;
    let union = left_tokens.union(&right_tokens).count() as f32;
    overlap / union
}

pub fn artist_similarity(left: &str, right: &str) -> f32 {
    let left = normalize_title(left);
    let right = normalize_title(right);

    if left == right {
        return 1.0;
    }

    if left.contains(&right) || right.contains(&left) {
        return 0.85;
    }

    title_similarity(&left, &right)
}

pub fn split_lyrics(text: &str) -> Vec<String> {
    text.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(ToString::to_string)
        .collect()
}

pub fn meaningful_lines(lines: &[String]) -> Vec<String> {
    let mut scored: Vec<(f32, String)> = lines
        .iter()
        .filter(|line| is_meaningful_line(line))
        .map(|line| (score_line(line), line.clone()))
        .collect();

    scored.sort_by(|left, right| {
        right
            .0
            .partial_cmp(&left.0)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    scored.into_iter().map(|(_, line)| line).collect()
}

pub fn pick_line_at_index(candidates: &[String], index: usize) -> Option<String> {
    if candidates.is_empty() {
        return None;
    }
    Some(candidates[index % candidates.len()].clone())
}

pub fn is_meaningful_line(line: &str) -> bool {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return false;
    }

    if trimmed.len() < MIN_LINE_LENGTH {
        return false;
    }

    if is_section_header(trimmed) {
        return false;
    }

    if is_metadata_line(trimmed) {
        return false;
    }

    let word_count = trimmed
        .split_whitespace()
        .filter(|word| !word.is_empty())
        .count();

    if word_count < 2 {
        return false;
    }

    if is_repeated_adlib(trimmed) {
        return false;
    }

    if contains_offensive_word(trimmed) {
        return false;
    }

    true
}

fn is_section_header(line: &str) -> bool {
    let trimmed = line.trim();
    trimmed.starts_with('[') && trimmed.ends_with(']')
}

fn is_metadata_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    METADATA_MARKERS
        .iter()
        .any(|marker| lower.contains(marker))
}

fn is_repeated_adlib(line: &str) -> bool {
    let words: Vec<_> = line
        .split_whitespace()
        .map(|word| word.to_lowercase())
        .collect();

    if words.len() < 4 {
        return false;
    }

    let unique: HashSet<_> = words.iter().collect();
    unique.len() <= 2
}

fn contains_offensive_word(line: &str) -> bool {
    let lower = line.to_lowercase();
    OFFENSIVE_WORDS
        .iter()
        .any(|word| lower.contains(word))
}

fn score_line(line: &str) -> f32 {
    let trimmed = line.trim();
    let len = trimmed.len();
    let word_count = trimmed.split_whitespace().count();

    let mut score = 0.0;

    if (40..=100).contains(&len) {
        score += 3.0;
    } else if (25..=120).contains(&len) {
        score += 2.0;
    } else {
        score += 1.0;
    }

    if (4..=14).contains(&word_count) {
        score += 2.5;
    } else if word_count >= 3 {
        score += 1.5;
    }

    if trimmed.contains(',') || trimmed.contains('—') || trimmed.contains("...") {
        score += 0.75;
    }

    if trimmed.chars().filter(|ch| ch.is_alphabetic()).count() > 0
        && trimmed.chars().all(|ch| !ch.is_lowercase() && ch.is_alphabetic())
    {
        score -= 1.0;
    }

    if trimmed.ends_with('?') || trimmed.ends_with('!') {
        score += 0.5;
    }

    score
}
