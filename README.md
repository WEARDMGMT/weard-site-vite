# WEARD Site (Vite + React + Tailwind)

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

This outputs a static site to `dist/` suitable for Namecheap shared hosting (cPanel) or any static host.

## Configure live roster
Create a `.env` file with:
```
VITE_SHEET_URL=https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
```
