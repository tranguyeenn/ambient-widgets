from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.lyrics_service import get_widget_lyric

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Ambient Widgets backend is alive",
    }


@app.get("/lyric")
def lyric(song: str, artist: str):
    return get_widget_lyric(song, artist)