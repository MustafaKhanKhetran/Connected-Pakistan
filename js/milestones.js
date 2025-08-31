/* Connected Pakistan — Milestones page script (enhanced) */
(function () {
  // ---------- Paths / Mount ----------
  const TEMPLATE_PATH = "templates/milestones.tpl";
  const DATA_PATH = "data/milestones.json";
  const MOUNT_ID = "content";

  // ---------- Palette (aligns with site tokens) ----------
  const COLORS = {
    ink: "#0f172a",
    border: "#e5e7eb",
    accent1: "#ab947e",
    accent2: "#6f5e53",
    blue: "#3b82f6",
    teal: "#14b8a6",
    amber: "#f59e0b",
    rose: "#f43f5e",
    violet: "#8b5cf6",
  };
  const withAlpha = (hex, a = 0.2) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // ---------- Tiny utils ----------
  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }
  const $ = (sel, root = document) => root.querySelector(sel);

  // ---------- Footer nav (now uses data.nav.links if available) ----------
  function ensureFooterNavContainer() {
    // If template forgot the UL#footerNav, create it in the left column of the footer.
    let ul = $("#footerNav");
    if (!ul) {
      const leftCol =
        document.querySelector(".cp-footer .cp-foot-left") ||
        document.querySelector(".cp-footer");
      if (leftCol) {
        ul = document.createElement("ul");
        ul.id = "footerNav";
        ul.className = "cp-foot-links";
        leftCol.insertBefore(ul, leftCol.firstChild || null);
      }
    }
    return ul;
  }

  function populateFooterNavFromData(navLinks) {
    const ul = ensureFooterNavContainer();
    if (!ul) return;

    const fallback = [
      { href: "about.html", label: "About" },
      { href: "history.html", label: "History" },
      { href: "milestones.html", label: "Milestones" },
    ];

    const links = Array.isArray(navLinks) && navLinks.length ? navLinks : fallback;
    const here = (location.pathname.split("/").pop() || "milestones.html").toLowerCase();

    ul.innerHTML = links
      .map((l) => {
        const href = (l.href || "").replace(/^\/+/, ""); // keep it simple for local files
        const active = href.toLowerCase().endsWith(here);
        return `<li><a href="${href || "#"}"${
          active ? ' aria-current="page"' : ""
        }>${l.label || "Link"}</a></li>`;
      })
      .join("");
  }







  // ---------- KPI count-up (robust) ----------
  function setupKpiCounters() {
    const els = document.querySelectorAll(".cp-hero-stat-num[data-count]");
    if (!els.length) return;

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const unitEl = el.querySelector("span");
      const unit = unitEl ? unitEl.textContent : "";
      const dur = parseInt(el.getAttribute("data-duration"), 10) || 900;

      let start = null;
      const ease = (t) => 1 - Math.pow(1 - t, 3);

      function step(ts) {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        const v = Math.round(ease(p) * target * 100) / 100;
        const formatted = Number.isInteger(target) ? v.toFixed(0) : v.toFixed(2);
        el.innerHTML = unit ? `${formatted}<span>${unit}</span>` : `${formatted}`;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(animate);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          animate(e.target);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Charts ----------
  function getCtx(id) {
    const el = document.getElementById(id);
    return el ? el.getContext("2d") : null;
  }

  function makeLineChart(ctx, labels, data) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Milestones per year",
            data,
            borderColor: COLORS.accent2,
            backgroundColor: withAlpha(COLORS.accent2, 0.18),
            fill: true,
            tension: 0.25,
            pointRadius: 2.5,
            pointBackgroundColor: COLORS.accent2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: COLORS.ink }, grid: { color: withAlpha(COLORS.border, 0.6) } },
          y: { beginAtZero: true, ticks: { color: COLORS.ink }, grid: { color: withAlpha(COLORS.border, 0.6) } },
        },
        plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
      },
    });
  }

  function makeDoughnut(ctx, labels, data) {
    if (!ctx || !window.Chart) return;
    const palette = [COLORS.accent1, COLORS.teal, COLORS.violet, COLORS.amber, COLORS.rose];
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: palette.map((c) => withAlpha(c, 0.6)),
            borderColor: palette,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: { legend: { position: "bottom", labels: { color: COLORS.ink } } },
      },
    });
  }

  function makeStackedBar(ctx, labels, infra, adopt, serv) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Infrastructure", data: infra, backgroundColor: withAlpha(COLORS.blue, 0.6), borderColor: COLORS.blue, borderWidth: 1 },
          { label: "Adoption", data: adopt, backgroundColor: withAlpha(COLORS.teal, 0.6), borderColor: COLORS.teal, borderWidth: 1 },
          { label: "Services", data: serv, backgroundColor: withAlpha(COLORS.accent1, 0.6), borderColor: COLORS.accent1, borderWidth: 1 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { color: COLORS.ink }, grid: { color: withAlpha(COLORS.border, 0.6) } },
          y: { stacked: true, beginAtZero: true, ticks: { color: COLORS.ink }, grid: { color: withAlpha(COLORS.border, 0.6) } },
        },
        plugins: { legend: { position: "bottom", labels: { color: COLORS.ink } } },
      },
    });
  }

  function makeRadar(ctx, labels, scores) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Capability score",
            data: scores,
            borderColor: COLORS.accent2,
            backgroundColor: withAlpha(COLORS.accent2, 0.2),
            pointBackgroundColor: COLORS.accent2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: withAlpha(COLORS.border, 0.6) },
            grid: { color: withAlpha(COLORS.border, 0.6) },
            pointLabels: { color: COLORS.ink },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  function initCharts(charts) {
    if (!charts || !window.Chart) return;
    const l = charts.milestonesPerYear || [];
    makeLineChart(getCtx("msLineChart"), l.map((d) => d.year), l.map((d) => d.count));

    const d = charts.milestonesByCategory || [];
    makeDoughnut(getCtx("msDoughnut"), d.map((x) => x.category), d.map((x) => x.count));

    const s = charts.impactByEra || [];
    makeStackedBar(
      getCtx("msStackedBar"),
      s.map((e) => e.era),
      s.map((e) => e.infrastructure),
      s.map((e) => e.adoption),
      s.map((e) => e.services)
    );

    const r = charts.capabilityRadar || { labels: [], scores: [] };
    makeRadar(getCtx("msRadar"), r.labels || [], r.scores || []);
  }

  // ---------- Template render ----------
  async function render() {
    const data = await fetchJson(DATA_PATH);

    if (window.SimpleTemplateEngine) {
      const engine = new SimpleTemplateEngine(TEMPLATE_PATH);
      await engine.loadTemplate();
      engine.renderTemplate(MOUNT_ID, data);
    } else if (typeof window.loadTemplate === "function") {
      await window.loadTemplate(TEMPLATE_PATH, DATA_PATH);
    } else {
      const mount = document.getElementById(MOUNT_ID);
      if (mount) mount.innerHTML = "<p style='color:red'>Template engine missing.</p>";
      return;
    }

    // After DOM injection:
    populateFooterNavFromData(data?.nav?.links);
    setupKpiCounters();
    initCharts(data.charts);

    // Optional: redraw charts when tab becomes visible
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") initCharts(data.charts);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
