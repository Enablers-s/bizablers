# Bizabler-S website

Static website for **Bizabler-S**, part of the Enabler-S group.

- `index.html`, `styles.css`, `main.js`: the site (no build step; open `index.html`)
- `assets/`: logos and media used by this site
- `fonts/`: self-hosted web fonts (open licence)

## Links to Enabler-S and sister brands
All addresses are in the `SITES` list at the top of `main.js`. Locally the repos are expected side by side:

```
enabler/
  webpage1/      Enabler-S (repo: enabler-s)
  bizablers/     finablers/     trustablers/     brandora/
```

When a brand gets its own domain, change its line in `SITES`.

## Where enquiries go
The contact form (home page) and the "Send me this quote" form (calculator) post to the Google Form
**Bizabler-S website enquiries** in the enablers26@gmail.com Google account. Each enquiry becomes a row in its
linked Google Sheet (Forms → Responses → View in Sheets). The form address and question IDs are in `lead-form.js`.
WhatsApp buttons go straight to +971 54 558 6455; nothing from them is stored.

Calculator prices live in `calculator-data.js`.

## Deploying on Vercel
Import this repo in Vercel as a new project named **`bizablers`**: Framework preset **Other**, no build command, no output directory (the repo root is the site). Nothing else to configure; there are no environment variables.

The five sites link to each other at these addresses (set in main.js (LIVE) and the matching href in index.html). Opened from disk or localhost, the links use the side-by-side local folders instead.

| Site | GitHub repo | Vercel project name | Live address |
|---|---|---|---|
| Enabler-S | Enablers-s/enabler-s | `enabler-s` | https://enabler-s.vercel.app |
| Bizabler-S | Enablers-s/bizablers | `bizablers` | https://bizablers.vercel.app |
| Finablers | Enablers-s/finablers | `finablers` | https://finablers.vercel.app |
| Trustablers | Enablers-s/trustablers | `trustablers` | https://trustablers.vercel.app |
| Brandora | Enablers-s/brandora | `brandora-s` (brandora.vercel.app is taken) | https://brandora-s.vercel.app |

If a project ends up with a different address (for example a custom domain), update the addresses in main.js (LIVE) and the matching href in index.html, the `canonical`/`og:` tags in index.html, robots.txt and sitemap.xml.

Already set up for production:
- `vercel.json`: security headers (Content-Security-Policy allowing only this site's own scripts, fonts and media; clickjacking protection; nosniff; referrer and permissions policies) and long caching for fonts and media
- `.vercelignore`: keeps source files and notes out of the published site
- `404.html`: branded "page not found" page
- `robots.txt`, `sitemap.xml`, and share-preview tags (`og:` / Twitter) with `assets/og.jpg`
