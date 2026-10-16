# Bizablers website

Static website for **Bizablers**, part of the Enabler-S group.

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

## Deploying on Vercel
Static site, no build step (Framework preset: **Other**, no build command, output directory = repo root). `vercel.json` sets the security headers (CSP, clickjacking and MIME-sniffing protection, referrer and permissions policies) and long caching for fonts and media; `.vercelignore` keeps this README and dot-files out of the published site.

After deploying, replace the local `../…/index.html` paths in the `SITES` list (top of `main.js`) with the live URLs of Enabler-S and the sister brands.
