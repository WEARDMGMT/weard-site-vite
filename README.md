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

Server-backed deployments leave this variable unset and must serve `api/contact.js` (for example, on Vercel) with the server-only EmailJS variables listed in `.env.example`. A failed API request preserves the form and explains how to contact us by email.

Run contact validation regression checks with `node --test scripts/contact.test.mjs`.

### Automatic delivery on GitHub Pages
Create a Formspree form, verify its recipient email, and add its public `https://formspree.io/f/<id>` endpoint as the GitHub Actions repository variable `VITE_FORMSPREE_ENDPOINT`. Re-run the deployment after setting it. The endpoint is public and is embedded in the site. It overrides mailto mode; no EmailJS credentials or Vercel account are needed for this option. Set the same variable in `.env.local` for local testing. Never put private account credentials in a VITE variable.

Screenshot attachments are sent as multipart uploads and require a Formspree plan supporting file uploads. Confirm the plan before enabling this workflow for talent attachments. A failed request preserves the form and explains how to contact us by email. Verify inbox delivery after activation; do not treat a mocked browser response as proof of email delivery.

Video files used for looping previews are limited to 12 seconds, 480px width, 24fps, muted H.264 with fast-start metadata. Original footage remains recoverable from Git history. The blocking opening loader has been removed; roster videos load on hover or keyboard focus and do not automatically play on touch devices.

### Browser checks
Run `npm test` for contact regression tests. Run `npm run test:browser` with Chromium installed (`CHROMIUM_PATH` overrides `/usr/bin/chromium`). The browser suite starts its own Vite server on port 5180, mocks Formspree so no email is sent, checks mobile keyboard navigation, required fields, success/failure states, creator navigation, and accessibility/overflow at 390px and 1280px. Accessibility injection bypasses CSP only in the audit browser context; interaction checks use the actual CSP.
