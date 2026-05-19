# Orbit web showcase

A standalone product case-study page for **Orbit**. This is not the desktop widget UI. It is a portfolio landing page that explains the project, the stack, and how the system fits together.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Customize links

Edit `src/config/site.ts` for GitHub, LinkedIn, and demo anchor URLs.

## App icon / favicon

`public/app-icon.png` is copied from `src-tauri/app-icon.png`. After regenerating the desktop icon, refresh the web copy:

```bash
cp ../src-tauri/app-icon.png public/app-icon.png
```

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4 (`@tailwindcss/vite`)
