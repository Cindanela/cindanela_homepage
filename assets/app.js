(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  // ---------- Theme ----------
  const toggle = $("theme-toggle");
  function syncToggle() {
    const dark = root.dataset.theme === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#0b1730" : "#dbe9ff";
  }
  toggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    syncToggle();
  });
  syncToggle();
  $("year").textContent = new Date().getFullYear();

  // ---------- Helpers ----------
  const LANG_COLORS = {
    Dart: "#00b4ab", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26",
    CSS: "#563d7c", Python: "#3572a5", "C++": "#f34b7d", C: "#888", Kotlin: "#a97bff", Shell: "#89e051",
  };

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  }

  // YYYY-MM-DD plus a relative hint, e.g. "2026-09-29 (9 days ago)"
  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const day = d.toISOString().slice(0, 10);
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    let rel;
    if (days < 1) rel = "today";
    else if (days === 1) rel = "yesterday";
    else if (days < 31) rel = `${days} days ago`;
    else if (days < 365) rel = `${Math.floor(days / 30)} mo ago`;
    else rel = `${Math.floor(days / 365)} y ago`;
    return { day, rel };
  }

  async function load(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  }

  function message(text) {
    return el("p", { class: "muted" }, text);
  }

  // ---------- Currently working on ----------
  async function renderNow() {
    const list = $("now-list");
    try {
      const data = await load("data/now.json");
      list.replaceChildren(
        ...data.items.map((it) =>
          el(it.url ? "a" : "div", { class: "glass card", href: it.url, rel: it.url ? "noopener" : null },
            el("div", { class: "row" },
              el("span", { class: "status" }, it.status || "active")),
            el("h3", {}, it.title),
            el("p", { class: "grow" }, it.text),
            it.tags?.length ? el("div", { class: "row" }, it.tags.map((t) => el("span", { class: "tag" }, t))) : null
          )
        )
      );
      if (data.updated) $("now-updated").textContent = `Updated ${data.updated}`;
    } catch (e) {
      list.replaceChildren(message("Couldn't load current projects."));
    }
  }

  // ---------- Repositories ----------
  let repos = [];

  function repoCard(r) {
    const when = formatDate(r.pushed_at);
    return el("a", { class: "glass card", href: r.url, rel: "noopener" },
      el("h3", {}, r.name),
      el("p", { class: "grow" }, r.description || "No description yet."),
      r.release ? el("div", { class: "row" }, el("span", { class: "tag" }, `Release ${r.release.tag}`)) : null,
      el("div", { class: "row meta" },
        el("span", {},
          r.language ? el("span", { class: "dot", style: `--lang:${LANG_COLORS[r.language] || "var(--muted)"}` }) : null,
          r.language || ""),
        r.stars ? el("span", { title: "Stars" }, `★ ${r.stars}`) : null,
        el("time", { datetime: r.pushed_at, title: "Last pushed" }, when ? `${when.day} · ${when.rel}` : ""))
    );
  }

  function renderRepos() {
    const mode = $("sort").value;
    const sorted = [...repos].sort((a, b) =>
      mode === "name" ? a.name.localeCompare(b.name)
      : mode === "stars" ? b.stars - a.stars || b.pushed_at.localeCompare(a.pushed_at)
      : b.pushed_at.localeCompare(a.pushed_at));
    $("repo-list").replaceChildren(...(sorted.length ? sorted.map(repoCard) : [message("No public repositories yet.")]));
  }

  async function initRepos() {
    try {
      const data = await load("data/repos.json");
      repos = data.repos;
      renderRepos();
      const g = formatDate(data.generated);
      if (g) $("repo-meta").textContent = `Dates show the last push. List refreshed ${g.day}.`;
    } catch (e) {
      $("repo-list").replaceChildren(message("Couldn't load repositories. They're all on github.com/Cindanela."));
    }
    $("sort").addEventListener("change", renderRepos);
  }

  // ---------- Packages (optional, from data/packages.json) ----------
  async function renderPackages() {
    try {
      const pkgs = await load("data/packages.json");
      if (!pkgs.length) return;
      $("package-list").replaceChildren(
        ...pkgs.map((p) =>
          el("a", { class: "glass card", href: p.url, rel: "noopener" },
            el("div", { class: "row" }, el("span", { class: "tag" }, p.registry || "package"), p.version ? el("span", { class: "tag" }, `v${p.version}`) : null),
            el("h3", {}, p.name),
            el("p", { class: "grow" }, p.description || ""),
            p.updated ? el("div", { class: "row meta" }, el("span", {}, `Updated ${p.updated}`)) : null
          )
        )
      );
      $("packages").hidden = false;
      $("nav-packages").hidden = false;
    } catch (e) { /* section stays hidden */ }
  }

  renderNow();
  initRepos();
  renderPackages();
})();
