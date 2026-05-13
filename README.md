# Ambient Widgets

Ambient Widgets is a lightweight desktop widget system built for macOS.

The project focuses on creating transparent, minimal, and personal desktop widgets that feel naturally integrated into the desktop environment rather than separate applications.

Instead of relying on bulky third-party widgets, Ambient Widgets aims to provide customizable widgets centered around music, productivity, and daily desktop ambience.

---

# Vision

Modern desktop widgets often feel disconnected from the actual desktop experience:

- too large
- visually inconsistent
- overloaded with features
- lacking transparency/customization
- designed more like mini apps than ambient tools

Ambient Widgets is designed differently.

The goal is to create small desktop components that quietly exist within the workspace while still being visually meaningful and useful.

The system focuses on:

- transparency
- minimalism
- ambient computing
- personalization
- lightweight desktop interaction

---

# Core Widgets

## LyricTile

A music-centered widget that displays a lyric line from a recently played song.

Features:
- lyric line display
- song title + artist
- optional album art
- local lyric storage
- future Spotify integration

Purpose:
Turn listening history into a small visual memory on the desktop.

Example:

```txt
♪ "one lyric line here"

Song Title — Artist
```
---
## ReminderTile

A lightweight reminder and task widget.

Unlike traditional todo applications, ReminderTile focuses on realistic workload management instead of infinite task accumulation.

Planned features:

daily tasks
- lightweight reminders
- estimated workload tracking
- completion history
- rule-based workload recommendations
- overload detection

Future behavior:
The widget will gradually learn realistic daily task limits based on completion patterns.

Example:
```txt
Today's Recommended Load: Moderate

• Finish DSA assignment
• Read chapter notes
• Review linear algebra
```

---
## WeatherTile

A transparent weather widget built to better visually integrate with the desktop.

Purpose:
Provide weather information without the bulky appearance of traditional widgets.

Planned features:
- current temperature
- hourly forecast
- weekly preview
- transparent glass-style UI
- desktop-matching color themes

---
# Why I’m Building This

Music, desktop aesthetics, and ambient environments are a major part of how I study, focus, and organize daily life.

Most widget systems feel either:
- overly corporate
- visually outdated
- overloaded with features
- disconnected from the actual desktop aesthetic

Ambient Widgets is intended to feel:
- softer
- more personal
- visually integrated
- minimal but expressive

This project combines:
- desktop customization
- ambient UI design
- lightweight utility tools
- music-centered interaction

--- 
# Design Philosophy

Ambient Widgets prioritizes:

## Minimal UI
Widgets should remain lightweight and unobtrusive.
The desktop should feel calm rather than crowded.

## Transparency
Widgets should visually blend into the desktop instead of covering it.

The interface aims to use:
- glassmorphism
- translucent surfaces
- soft shadows
- subtle blur
- low visual noise

## Personal Computing
The widgets are designed around personal routines rather than productivity-maxing behavior.

The goal is not:
- optimization obsession
- gamified productivity
- endless metrics

The goal is:
- intentional daily interaction
- emotional personalization
- lightweight usefulness

---
# Tech Stack

**Current:** React, TypeScript, Vite, CSS; desktop shell via **Tauri 2**; **npm** for JavaScript dependencies.

**Planned:** local JSON and SQLite storage; Spotify Web API and weather API integrations.

### Local development

Install [Rust](https://www.rust-lang.org/tools/install) and the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```bash
npm install
npm run tauri dev      # Vite dev server + native window
npm run build          # production web assets (to ../dist)
npm run tauri build    # packaged desktop app
```

Recommended VS Code extensions: [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

---
# Project Scope
Ambient Widgets begins as a local desktop application.

The first versions will prioritize:
- visual polish
- desktop integration
- local data
- widget architecture

---
# MVP Goals

## Phase 1 — Widget Foundation
- draggable desktop widget system
- transparent windows
- shared styling system
- basic layout engine

## Phase 2 — Static Widgets
Build initial widget versions using hardcoded/local data.

Widgets:
- LyricTile
- ReminderTile
- WeatherTile

## Phase 3 — Dynamic Data
Add:
- local persistence
- JSON-based updates
- task tracking
- configurable widget behavior

## Phase 4 — API Integration
Add:
- Spotify recently played integration
- live weather data
- smarter reminder behavior

## Phase 5 — Personalization
Add:
- themes
- animations
- album-color accents
- saved lyric history
- desktop positioning presets

---
# Folder Structure
``` bash
ambient-widgets/
│
├── src/
│   ├── widgets/
│   │   ├── lyric/
│   │   ├── reminder/
│   │   └── weather/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── themes/
│   │   ├── storage/
│   │   └── utils/
│   │
│   └── App.tsx
│
├── src-tauri/
├── public/
├── README.md
└── package.json
```

---
# Long-Term Goals
Possible future additions:
- music-reactive animations
- focus mode widgets
- calendar integration
- desktop ambient modes
- adaptive color systems
- multiple desktop layouts
- widget syncing
- lightweight AI-assisted workload estimation

---
# What This Project Is Not

Ambient Widgets is not:
- a full operating system
- a productivity dashboard
- a Spotify clone
- a giant workspace manager
- a bloated widget marketplace

The project is intentionally focused on small ambient desktop interactions.

---
# Author
Trang Nguyen

# License
MIT License