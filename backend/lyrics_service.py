import os
import random
import lyricsgenius
from dotenv import load_dotenv

from backend.filters import is_meaningful_line, score_line

load_dotenv()

GENIUS_ACCESS_TOKEN = os.getenv("GENIUS_ACCESS_TOKEN")

if not GENIUS_ACCESS_TOKEN:
    raise ValueError("Missing GENIUS_ACCESS_TOKEN in backend/.env")

genius = lyricsgenius.Genius(
    GENIUS_ACCESS_TOKEN,
    remove_section_headers=True,
    skip_non_songs=True,
    excluded_terms=["(Remix)", "(Live)", "(Demo)", "(Instrumental)"],
)


def clean_lyrics(raw_lyrics):
    lines = raw_lyrics.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        cleaned.append(line)

    return cleaned


def pick_widget_line(lines):
    filtered = []

    for line in lines:
        if is_meaningful_line(line):
            filtered.append(line)

    if not filtered:
        return None

    filtered.sort(key=score_line, reverse=True)

    top_lines = filtered[:10]

    return random.choice(top_lines)


def get_widget_lyric(song_title, artist_name):
    song = genius.search_song(song_title, artist_name)

    if not song:
        return {
            "success": False,
            "error": "Song not found",
            "line": None,
            "song": song_title,
            "artist": artist_name,
        }

    cleaned_lines = clean_lyrics(song.lyrics)
    selected_line = pick_widget_line(cleaned_lines)

    if not selected_line:
        return {
            "success": False,
            "error": "No meaningful widget-sized lyric found",
            "line": None,
            "song": song.title,
            "artist": song.artist,
        }

    return {
        "success": True,
        "error": None,
        "line": selected_line,
        "song": song.title,
        "artist": song.artist,
    }


if __name__ == "__main__":
    result = get_widget_lyric("Nights", "Frank Ocean")

    print("\nLYRIC RESULT")
    print(result)