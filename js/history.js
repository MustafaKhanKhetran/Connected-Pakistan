// history.js
(function () {
  // Wait until #content is populated by loadTemplate()
  document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("content");
    if (!target) return;

    const observer = new MutationObserver(async () => {
      // Only continue once our canvases exist in the DOM
      const users = document.getElementById("usersChart");
      const mix = document.getElementById("mixChart");
      const coverage = document.getElementById("coverageChart");
      if (users && mix && coverage) {
        observer.disconnect();
        try {
          const data = await fetch("data/history.json", { cache: "no-store" }).then(r => r.json());
          initCharts(data?.metrics || {}, { users, mix, coverage });
        } catch (e) {
          console.error("Failed to load history.json for charts:", e);
        }
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  });

  // -------- Chart helpers --------

  function initCharts(metrics, els) {
    // 1) Users over time (line)
    const uot = normalizeUsersOverTime(metrics?.usersOverTime);
    if (uot.labels.length && uot.values.length) {
      new Chart(els.users.getContext("2d"), {
        type: "line",
        data: {
          labels: uot.labels,
          datasets: [{
            label: "Internet users (millions)",
            data: uot.values,
            borderWidth: 2,
            tension: 0.25,
            borderColor: "#111827",
            backgroundColor: "rgba(17,24,39,0.15)",
            pointRadius: 2.5
          }]
        },
        options: baseLineOptions()
      });
    } else {
      softEmptyState(els.users, "No users-over-time data");
    }

    // 2) Access mix (doughnut)
    const mix = normalizeLabelValue(metrics?.accessMix2024, ["Mobile Broadband", "Fixed Broadband", "Other"]);
    if (mix.labels.length && mix.values.length) {
      new Chart(els.mix.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: mix.labels,
          datasets: [{
            data: mix.values,
            borderWidth: 1
          }]
        },
        options: baseDoughnutOptions()
      });
    } else {
      softEmptyState(els.mix, "No access-mix data");
    }

    // 3) Coverage (bar)
    const cov = normalizeLabelValue(metrics?.coverage2024, ["2G", "3G", "4G", "5G"]);
    if (cov.labels.length && cov.values.length) {
      new Chart(els.coverage.getContext("2d"), {
        type: "bar",
        data: {
          labels: cov.labels,
          datasets: [{
            label: "Population coverage (%)",
            data: cov.values,
            borderWidth: 1,
            backgroundColor: "rgba(17,24,39,0.15)"
          }]
        },
        options: baseBarOptions("%")
      });
    } else {
      softEmptyState(els.coverage, "No coverage data");
    }
  }

  // -------- Normalizers (handle arrays OR objects) --------

  // usersOverTime may be: [{year: 2005, usersMillions: 5}, ...]
  // or an object like { "2005": 5, "2010": 25, ... }
  function normalizeUsersOverTime(raw) {
    if (!raw) return { labels: [], values: [] };

    if (Array.isArray(raw)) {
      // Try to guess keys
      const byYear = [...raw]
        .filter(Boolean)
        .map(d => ({
          y: parseFloat(d.year ?? d.Year ?? d.date ?? d.t) || null,
          v: parseFloat(d.usersMillions ?? d.value ?? d.users ?? d.y) || null
        }))
        .filter(d => d.y !== null && d.v !== null)
        .sort((a, b) => a.y - b.y);
      return { labels: byYear.map(d => d.y), values: byYear.map(d => d.v) };
    }

    if (typeof raw === "object") {
      const entries = Object.entries(raw)
        .map(([k, v]) => [Number(k), Number(v)])
        .filter(([k, v]) => !Number.isNaN(k) && !Number.isNaN(v))
        .sort((a, b) => a[0] - b[0]);
      return { labels: entries.map(([k]) => k), values: entries.map(([, v]) => v) };
    }

    return { labels: [], values: [] };
  }

  // Accepts either:
  //  - array of {label, value} / {name, pct}
  //  - object map { "4G": 82, "3G": 45, ... }
  function normalizeLabelValue(raw, preferredOrder = []) {
    if (!raw) return { labels: [], values: [] };

    if (Array.isArray(raw)) {
      const rows = raw.map(d => ({
        l: String(d.label ?? d.name ?? d.key ?? "").trim(),
        v: Number(d.value ?? d.pct ?? d.count ?? d.val)
      })).filter(r => r.l && Number.isFinite(r.v));

      // respect preferred order if provided
      if (preferredOrder.length) {
        rows.sort((a, b) => {
          const ia = preferredOrder.indexOf(a.l);
          const ib = preferredOrder.indexOf(b.l);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      }
      return { labels: rows.map(r => r.l), values: rows.map(r => r.v) };
    }

    if (typeof raw === "object") {
      let entries = Object.entries(raw)
        .map(([k, v]) => [String(k), Number(v)])
        .filter(([, v]) => Number.isFinite(v));

      if (preferredOrder.length) {
        entries.sort((a, b) => {
          const ia = preferredOrder.indexOf(a[0]);
          const ib = preferredOrder.indexOf(b[0]);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      }
      return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) };
    }

    return { labels: [], values: [] };
  }

  // -------- Chart.js base option presets (clean, responsive) --------

  function baseLineOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { boxWidth: 12 } },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#e5e7eb" }, ticks: { precision: 0 } }
      }
    };
  }

  function baseDoughnutOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      },
      cutout: "58%"
    };
  }

  function baseBarOptions(suffix = "") {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y}${suffix}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#e5e7eb" },
          ticks: {
            callback: v => `${v}${suffix}`
          }
        }
      }
    };
  }

  // If a chart has no data, show a small hint instead of leaving a blank box
  function softEmptyState(canvas, msg) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.fillText(msg || "No data", width / 2, height / 2);
  }
})();
// history.js
(function () {
  // Wait for the template to be injected into #content by loadTemplate()
  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.getElementById("content");
    if (!mount) return;

    const onDom = new MutationObserver(async () => {
      const chartGrid = document.querySelector(".cp-chart-grid");
      const hero = document.querySelector(".cp-hero");
      const timeline = document.querySelector(".cp-timeline");
      const facts = document.querySelector(".cp-stats-grid");
      const outlook = document.querySelector(".cp-outlook");
      const footer = document.querySelector(".cp-footer");

      // Proceed once key sections exist
      if (chartGrid && hero && timeline && facts && outlook && footer) {
        onDom.disconnect();

        // Tag sections for scroll reveal
        [hero, timeline, facts, chartGrid, outlook, footer].forEach(el => el.classList.add("reveal"));

        // IntersectionObserver to reveal sections
        const revealObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              revealObs.unobserve(entry.target);
            }
          });
        }, { root: null, threshold: 0.15 });

        [hero, timeline, facts, chartGrid, outlook, footer].forEach(el => revealObs.observe(el));

        // Build charts only when chart grid is in view (first time)
        const onceObs = new IntersectionObserver(async (entries) => {
          const hit = entries.find(e => e.isIntersecting);
          if (!hit) return;
          onceObs.disconnect();

          // Load metrics and draw charts
          let data;
          try {
            data = await fetch("data/history.json", { cache: "no-store" }).then(r => r.json());
          } catch (e) {
            console.error("Failed to load data/history.json", e);
            return;
          }
          initCharts(data?.metrics || {});
        }, { root: null, threshold: 0.2 });

        onceObs.observe(chartGrid);
      }
    });

    onDom.observe(mount, { childList: true, subtree: true });
  });

  // ---------- Charts ----------
  function initCharts(metrics) {
    const usersEl = document.getElementById("usersChart");
    const mixEl = document.getElementById("mixChart");
    const covEl = document.getElementById("coverageChart");
    if (!usersEl || !mixEl || !covEl) return;

    // 1) Users over time (line)
    const uot = normalizeUsersOverTime(metrics?.usersOverTime);
    if (uot.labels.length) {
      new Chart(usersEl.getContext("2d"), {
        type: "line",
        data: {
          labels: uot.labels,
          datasets: [{
            label: "Internet users (millions)",
            data: uot.values,
            borderWidth: 2,
            tension: 0.25,
            borderColor: "#111827",
            backgroundColor: "rgba(17,24,39,0.12)",
            pointRadius: 2,
            clip: { left: 6, right: 6, top: 4, bottom: 4 } // keep stroke inside card
          }]
        },
        options: baseLineOptions()
      });
    } else {
      softEmptyState(usersEl, "No users-over-time data");
    }

    // 2) Access mix (doughnut)
    const mix = normalizeLabelValue(metrics?.accessMix2024, ["Mobile Broadband", "Fixed Broadband", "Other"]);
    if (mix.labels.length) {
      new Chart(mixEl.getContext("2d"), {
        type: "doughnut",
        data: { labels: mix.labels, datasets: [{ data: mix.values, borderWidth: 1 }] },
        options: baseDoughnutOptions()
      });
    } else {
      softEmptyState(mixEl, "No access-mix data");
    }

    // 3) Coverage (bar)
    const cov = normalizeLabelValue(metrics?.coverage2024, ["2G", "3G", "4G", "5G"]);
    if (cov.labels.length) {
      new Chart(covEl.getContext("2d"), {
        type: "bar",
        data: {
          labels: cov.labels,
          datasets: [{
            label: "Population coverage (%)",
            data: cov.values,
            borderWidth: 1,
            backgroundColor: "rgba(17,24,39,0.12)"
          }]
        },
        options: baseBarOptions("%")
      });
    } else {
      softEmptyState(covEl, "No coverage data");
    }
  }

  // ---------- Normalizers ----------
  function normalizeUsersOverTime(raw) {
    if (!raw) return { labels: [], values: [] };
    if (Array.isArray(raw)) {
      const rows = raw.map(r => ({
        y: Number(r.year ?? r.Year),
        v: Number(r.usersMillions ?? r.value ?? r.users)
      })).filter(d => Number.isFinite(d.y) && Number.isFinite(d.v))
        .sort((a, b) => a.y - b.y);
      return { labels: rows.map(r => r.y), values: rows.map(r => r.v) };
    }
    if (typeof raw === "object") {
      const entries = Object.entries(raw)
        .map(([k, v]) => [Number(k), Number(v)])
        .filter(([k, v]) => Number.isFinite(k) && Number.isFinite(v))
        .sort((a, b) => a[0] - b[0]);
      return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) };
    }
    return { labels: [], values: [] };
  }

  function normalizeLabelValue(raw, preferredOrder = []) {
    if (!raw) return { labels: [], values: [] };
    if (Array.isArray(raw)) {
      const rows = raw.map(d => ({
        l: String(d.label ?? d.name ?? d.key ?? "").trim(),
        v: Number(d.value ?? d.pct ?? d.val)
      })).filter(r => r.l && Number.isFinite(r.v));
      if (preferredOrder.length) {
        rows.sort((a, b) =>
          (preferredOrder.indexOf(a.l) + 1000) - (preferredOrder.indexOf(b.l) + 1000)
        );
      }
      return { labels: rows.map(r => r.l), values: rows.map(r => r.v) };
    }
    if (typeof raw === "object") {
      let entries = Object.entries(raw).map(([k, v]) => [String(k), Number(v)])
        .filter(([, v]) => Number.isFinite(v));
      if (preferredOrder.length) {
        entries.sort((a, b) =>
          (preferredOrder.indexOf(a[0]) + 1000) - (preferredOrder.indexOf(b[0]) + 1000)
        );
      }
      return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) };
    }
    return { labels: [], values: [] };
  }

  // ---------- Chart.js options (with internal padding so nothing overflows) ----------
  function baseLineOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 8, right: 8, top: 6, bottom: 6 } },
      plugins: {
        legend: { display: true, labels: { boxWidth: 10, padding: 8 } },
        tooltip: { mode: "index", intersect: false }
      },
      elements: { point: { radius: 2 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
        y: { grid: { color: "#e5e7eb" }, ticks: { precision: 0, maxTicksLimit: 6 } }
      }
    };
  }

  function baseDoughnutOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 8, right: 8, top: 6, bottom: 6 } },
      plugins: { legend: { position: "bottom", labels: { boxWidth: 10, padding: 8 } } },
      cutout: "58%"
    };
  }

  function baseBarOptions(suffix = "") {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 8, right: 8, top: 6, bottom: 6 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}${suffix}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
        y: {
          beginAtZero: true,
          grid: { color: "#e5e7eb" },
          ticks: { callback: (v) => `${v}${suffix}`, maxTicksLimit: 6 }
        }
      }
    };
  }

  // If a chart has no data, show a hint rather than a blank box
  function softEmptyState(canvas, msg) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.fillText(msg || "No data", width / 2, height / 2);
  }
})();
document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('content');
  if (!mount) return;

  const once = new MutationObserver(async () => {
    if (!mount.children.length) return;
    once.disconnect();

    try {
      const hist = await fetch('data/history.json', { cache: 'no-store' }).then(r => r.json());

      // Footer nav: use nav.links if present (or fallback to common pages)
      const links = hist?.nav?.links?.length
        ? hist.nav.links
        : [
            { href: 'index.html', label: 'Home' },
            { href: 'about.html', label: 'About' },
            { href: 'history.html', label: 'History' },
            { href: 'milestones.html', label: 'Milestones' }
          ];
      fillList('footerNav', links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`));

      // Footer sources: prefer history.json -> sources; else merge from about + milestones
      let sources = Array.isArray(hist?.sources) ? hist.sources : [];
      if (!sources.length) {
        const [about, mil] = await Promise.all([
          fetch('data/about.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
          fetch('data/milestones.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
        ]);
        sources = [...(about?.sources || []), ...(mil?.sources || [])];
      }
      fillList('footerSources', (sources || []).map(s => {
        const label = esc(s.label || s.text || s.url || 'Source');
        const url = s.url || '#';
        return `<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`;
      }));
    } catch (e) {
      console.warn('History footer wiring skipped:', e);
    }
  });

  once.observe(mount, { childList: true, subtree: true });
});

// tiny helpers (no collisions)
function fillList(id, arr){ const n = document.getElementById(id); if (n) n.innerHTML = arr.join(''); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
