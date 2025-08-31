<!-- a11y -->
<a class="cp-skip" href="#cp-main">Skip to content</a>

<!-- Same navbar structure -->
<header class="NavBar" role="banner">
  <a class="brand" href="index.html" aria-label="Connected Pakistan — Home">
    <span class="brand-mark" aria-hidden="true">CP</span>
    <span class="brand-text">Connected Pakistan</span>
  </a>
  <nav class="nav-pill" aria-label="Primary">
    <a href="about.html">About</a>
    <a class="active" href="history.html" aria-current="page">History</a>
    <a href="milestones.html">Milestones</a>
  </nav>
  <span aria-hidden="true"></span>
</header>

<section class="cp-hero cp-wrap cp-section">
  <div class="cp-hero-text">
    <p class="cp-kicker">{{ hero.kicker }}</p>
    <h1 class="cp-title">
      <span>{{ hero.titleTop }}</span>
      <span>{{ hero.titleBottom }}</span>
    </h1>
    <p class="cp-lead">{{ hero.lead }}</p>

    <div class="cp-kpis">
      {{#each kpis}}
      <article class="cp-kpi">
        <div class="cp-kpi-num">{{ value }}<span>{{ unit }}</span></div>
        <div class="cp-kpi-label">{{ label }}</div>
      </article>
      {{/each}}
    </div>
  </div>
</section>


  <!-- SECTION 2 — 2005–2025 TIMELINE (alternating, text-first) -->
  <section class="cp-wrap cp-section">
    <h2 class="cp-h2">Connectivity Timeline (2005–2025)</h2>
    <ol class="cp-timeline">
      {{#each timeline}}
      <li class="cp-tl {{ side }}">
        <div class="cp-tl-year">{{ year }}</div>
        <div class="cp-tl-card">
          <h3 class="cp-h3">{{ title }}</h3>
          <p class="cp-body">{{ text }}</p>
          <p class="cp-note">
            <a href="{{ sourceUrl }}" target="_blank" rel="noopener">Source</a>
          </p>
        </div>
      </li>
      {{/each}}
    </ol>
  </section>

  <!-- SECTION 3 — INFRASTRUCTURE & MARKET SNAPSHOT (facts grid) -->
  <section class="cp-wrap cp-section">
    <h2 class="cp-h2">Infrastructure & Market Snapshot</h2>
    <div class="cp-stats-grid">
      {{#each facts}}
      <article class="cp-statcard">
        <div class="cp-statcard-top">
          <div class="cp-statcard-value">{{ value }}</div>
          <div class="cp-statcard-unit">{{ unit }}</div>
        </div>
        <div class="cp-statcard-label">{{ label }}</div>
        <div class="cp-note">{{ note }}</div>
      </article>
      {{/each}}
    </div>
  </section>

  <!-- SECTION 4 — CHARTS (responsive, no overflow) -->
  <section class="cp-wrap cp-section">
    <h2 class="cp-h2">By the Numbers</h2>

    <div class="cp-chart-grid">
      <figure class="cp-chart-card">
        <figcaption>Internet users over time (millions)</figcaption>
        <canvas
          id="usersChart"
          class="chart-canvas"
          role="img"
          aria-label="Line chart of internet users"
        ></canvas>
      </figure>

      <figure class="cp-chart-card">
        <figcaption>Broadband subscribers: 2024 mix</figcaption>
        <canvas
          id="mixChart"
          class="chart-canvas"
          role="img"
          aria-label="Doughnut chart of access mix"
        ></canvas>
      </figure>

      <figure class="cp-chart-card">
        <figcaption>Population coverage (Dec 2024)</figcaption>
        <canvas
          id="coverageChart"
          class="chart-canvas"
          role="img"
          aria-label="Bar chart of coverage"
        ></canvas>
      </figure>
    </div>
  </section>

  <!-- SECTION 5 — 2025 OUTLOOK (brief + 2nd image) -->
  <section class="cp-wrap cp-section">
    <h2 class="cp-h2">2025 Outlook</h2>
    <div class="cp-outlook">
      <ul class="cp-bullets">
        {{#each outlook.points}}
        <li>{{ text }}</li>
        {{/each}}
      </ul>
      <!-- 2nd (and last) image -->
      <figure class="cp-outlook-fig">
        <img src="{{ outlook.image.src }}" alt="{{ outlook.image.alt }}" />
        <figcaption class="cp-credit">{{ outlook.image.credit }}</figcaption>
      </figure>
    </div>
  </section>

  <footer class="cp-footer" role="contentinfo">
    <div class="cp-wrap cp-footer-grid">
      <section class="cp-foot-left">
        <h3 class="cp-h5">Connected Pakistan</h3>
  
        <!-- Page links from JSON (populated by JS) -->
        <ul class="cp-foot-links" id="footerNav"></ul>
  
        <!-- Your byline -->
        <p class="cp-byline">Created by <strong>Mustafa Khan Khetran</strong></p>
      </section>
  
      <section class="cp-foot-right">
        <h3 class="cp-h5">Sources</h3>
        <!-- Populated by JS -->
        <ul class="cp-sources" id="footerSources"></ul>
      </section>
    </div>
  
    <div class="cp-wrap cp-foot-bottom">
      <p class="cp-legal">{{ footer.legal }}</p>
    </div>
  </footer>
  
</main>
