// After your engine injects the template into #content, we render lists and charts.
document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('content');
  if (!mount) return;

  const once = new MutationObserver(async () => {
    if (!mount.children.length) return;
    once.disconnect();
    try {
      const res = await fetch('data/about.json', { cache: 'no-store' });
      const data = await res.json();

      // Fill lists/loops from JSON (your existing behavior)
      renderLists(data);

      // Load Chart.js on the fly, then draw charts (your existing behavior)
      await loadChartJs();
      initCharts(data);

      // === NEW: Footer sources + byline, scroll reveals, smooth anchors ===
      await renderFooterExtras(data);
      setupScrollReveals();     // adds .js-reveal to key blocks + observes
      enableSmoothAnchors();    // smooth scroll for same-page hash links
    } catch (e) {
      console.error('Failed to initialize page:', e);
    }
  });
  once.observe(mount, { childList: true, subtree: true });
});

// ---------------- Lists (unchanged) ----------------
function renderLists(data) {
  // navbar links
  fillAnchors('navLinks', (data.nav?.links || []).map(l =>
    `<a href="${esc(l.href)}">${esc(l.label)}</a>`
  ));

  // footer links (reuse nav)
  fillList('footerNav', (data.nav?.links || []).map(l =>
    `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`
  ));

  // overview bullets
  fillList('overviewPoints', (data.overview?.points || []).map(t =>
    `<li>${esc(t)}</li>`
  ));

  // milestones
  fillList('milestoneList', (data.milestones?.items || []).map(m => `
    <li class="cp-milestone">
      <span class="cp-m-year">${esc(m.year || '')}</span>
      <div class="cp-m-body">
        <h3 class="cp-h3">${esc(m.title || '')}</h3>
        <p class="cp-body">${esc(m.desc || '')}</p>
      </div>
    </li>
  `));

  // timeline
  const tMount = document.getElementById('timelineDecades');
  if (tMount) {
    tMount.innerHTML = (data.timeline?.decades || []).map(d => `
      <article class="cp-row js-reveal">
        <div class="cp-year">${esc(d.label || '')}</div>
        <ul class="cp-events">
          ${(d.events || []).map(ev => `
            <li class="cp-event">
              <p class="cp-event-date">${esc(ev.date || '')}</p>
              <h3 class="cp-h3">${esc(ev.title || '')}</h3>
              <p class="cp-body">${esc(ev.summary || '')}</p>
            </li>
          `).join('')}
        </ul>
      </article>
    `).join('');
  }

  // themes
  fillContainer('themesCards', (data.themes?.cards || []).map(c => `
    <article class="cp-card js-reveal">
      <h3 class="cp-h3">${esc(c.title || '')}</h3>
      <p class="cp-body">${esc(c.text || '')}</p>
    </article>
  `).join(''));
}

// ---------------- Charts (unchanged) ----------------
function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function initCharts(data) {
  const charts = data.charts || {};
  // Adoption line
  const a = document.getElementById('adoptionChart');
  if (a && charts.adoption) {
    new Chart(a, {
      type: 'line',
      data: {
        labels: charts.adoption.labels || [],
        datasets: [{ data: charts.adoption.values || [], tension: 0.3, label: 'Adoption (%)' }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + '%' } } }
      }
    });
  }
  // Access mix doughnut
  const b = document.getElementById('accessMixChart');
  if (b && charts.accessMix) {
    new Chart(b, {
      type: 'doughnut',
      data: {
        labels: charts.accessMix.labels || [],
        datasets: [{ data: charts.accessMix.values || [] }]
      },
      options: { plugins: { legend: { position: 'bottom' } }, cutout: '60%' }
    });
  }
}

// ---------------- Footer extras (NEW) ----------------
async function renderFooterExtras(aboutData) {
  // 1) Sources: prefer about.json -> sources; else fallback to history + milestones
  let sources = Array.isArray(aboutData?.sources) ? aboutData.sources : [];
  if (!sources.length) {
    try {
      const [h, m] = await Promise.all([
        fetch('data/history.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
        fetch('data/milestones.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      ]);
      sources = [...(h?.sources || []), ...(m?.sources || [])];
    } catch (_) { /* ignore */ }
  }

  // Render #footerSources
  fillList('footerSources',
    (sources || []).map(s => {
      const label = esc(s.label || s.text || s.url || 'Source');
      const url = s.url || '#';
      return `<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`;
    })
  );

  // 2) Byline: ensure "Created by Mustafa Khan Khetran" exists
  const byline =
    document.querySelector('.cp-byline') ||
    (() => {
      const left = document.querySelector('.cp-foot-left') || document.getElementById('footerNav')?.closest('section');
      if (!left) return null;
      const p = document.createElement('p');
      p.className = 'cp-byline';
      left.appendChild(p);
      return p;
    })();

  if (byline && !byline.textContent.trim()) {
    byline.innerHTML = `Created by <strong>Mustafa Khan Khetran</strong>`;
  }
}

// ---------------- Scroll-trigger reveals (NEW) ----------------
function setupScrollReveals() {
  // Inject minimal CSS for reveal effect
  const style = document.createElement('style');
  style.textContent = `
    .js-reveal{opacity:0;transform:translateY(12px);
      transition:opacity .45s ease, transform .45s ease;will-change:opacity,transform}
    .js-reveal.is-in{opacity:1;transform:none}
  `;
  document.head.appendChild(style);

  const nodes = [
    ...document.querySelectorAll('.cp-h2, .cp-h3, .cp-card, .cp-row, .cp-milestone, .cp-chart-card')
  ];
  nodes.forEach(n => n.classList.add('js-reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  nodes.forEach(n => io.observe(n));
}

// ---------------- Smooth same-page anchor scrolling (NEW) ----------------
function enableSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    }
  });
}

// ---------------- helpers (unchanged) ----------------
function fillAnchors(id, arr) { const n = document.getElementById(id); if (n) n.innerHTML = arr.join(''); }
function fillList(id, arr) { const n = document.getElementById(id); if (n) n.innerHTML = arr.join(''); }
function fillContainer(id, html) { const n = document.getElementById(id); if (n) n.innerHTML = html; }
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
