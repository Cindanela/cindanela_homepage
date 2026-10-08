// Builds data/repos.json from the GitHub API (public repos only).
// Run: GITHUB_TOKEN=... node scripts/fetch-repos.mjs
import { readFile, writeFile } from "node:fs/promises";

const cfg = JSON.parse(await readFile(new URL("../data/config.json", import.meta.url)));
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "cindanela-homepage",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const all = [];
for (let page = 1; ; page++) {
  const batch = await gh(`/users/${cfg.owner}/repos?type=owner&per_page=100&page=${page}`);
  all.push(...batch);
  if (batch.length < 100) break;
}

const wanted = all.filter(
  (r) =>
    !r.private &&
    !cfg.exclude.includes(r.name) &&
    (cfg.includeForks || !r.fork) &&
    (cfg.includeArchived || !r.archived)
);

const repos = [];
for (const r of wanted) {
  const rel = await gh(`/repos/${cfg.owner}/${r.name}/releases/latest`);
  repos.push({
    name: r.name,
    description: r.description,
    language: r.language,
    url: r.html_url,
    homepage: r.homepage || null,
    stars: r.stargazers_count,
    topics: r.topics ?? [],
    pushed_at: r.pushed_at,
    release: rel ? { tag: rel.tag_name, url: rel.html_url, date: rel.published_at } : null,
  });
}
repos.sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));

// Keep the old file (and its timestamp) untouched when nothing changed.
const file = new URL("../data/repos.json", import.meta.url);
let prev = null;
try { prev = JSON.parse(await readFile(file)); } catch {}
if (prev && JSON.stringify(prev.repos) === JSON.stringify(repos)) {
  console.log("No changes.");
} else {
  await writeFile(file, JSON.stringify({ generated: new Date().toISOString(), owner: cfg.owner, repos }, null, 2) + "\n");
  console.log(`Wrote ${repos.length} repos.`);
}
