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

The build includes routing fallbacks for the supported deployment targets:

- Apache/Namecheap uses the generated `dist/.htaccess` file.
- Netlify-style hosts use the generated `dist/_redirects` file.
- Vercel uses the rewrite in `vercel.json`.
- GitHub Pages uses the generated `dist/404.html` redirect shim together with the route-restoration script in `index.html`.

When uploading the `dist/` directory manually, make sure hidden files are included so `.htaccess` reaches the site root. This allows direct visits and refreshes on routes such as `/about`, `/roster`, and creator profiles instead of returning a server 404.

## Configure live roster
Create a `.env` file with:
```
VITE_SHEET_URL=https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
```

## Contact forms
GitHub Pages builds set `VITE_CONTACT_MODE=mailto`: forms prepare an email draft that the visitor must send. Screenshots must be attached manually. For other static hosts, set the same variable at build time.

Server-backed deployments leave this variable unset and must serve `api/contact.js` (for example, on Vercel) with the server-only EmailJS variables listed in `.env.example`. A failed API request offers an email draft without claiming the message was delivered.

Run contact validation regression checks with `node --test scripts/contact.test.mjs`.
