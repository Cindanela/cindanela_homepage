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

## Deploying

1. Merge this branch into `main`.
2. Repo **Settings > Pages**: Source = *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. Same page: Custom domain = `cindanela.se`, then tick *Enforce HTTPS* once the certificate is ready.
4. DNS at your registrar:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` for `www`: `cindanela.github.io`

Preview locally: `python3 -m http.server` and open http://localhost:8000.
