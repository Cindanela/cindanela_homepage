# cindanela.se

Personal homepage. Plain HTML, CSS and JS, no build step. Hosted on GitHub Pages.

## Editing content

| What | File |
|---|---|
| "Currently working on" cards | `data/now.json` |
| Which repos are listed (owner, exclude list, forks) | `data/config.json` |
| Packages section (hidden while empty) | `data/packages.json` |
| Public repo list and dates | `data/repos.json` (auto-generated, don't edit) |
| Name, tagline, links | `index.html` |
| Colours, glass, background | `assets/style.css` (tokens at the top) |

`data/packages.json` entries look like:

```json
[{ "name": "my_package", "registry": "pub.dev", "version": "1.0.0", "url": "https://pub.dev/packages/my_package", "description": "What it does", "updated": "2026-10-01" }]
```

## Repo list updates

`.github/workflows/update-repos.yml` runs daily (and on demand via the Actions tab), fetches your **public** repos and commits `data/repos.json`. Private repos are never listed.

Run locally: `GITHUB_TOKEN=... node scripts/fetch-repos.mjs`

## Preview locally

Run `python3 -m http.server` and open http://localhost:8000.
