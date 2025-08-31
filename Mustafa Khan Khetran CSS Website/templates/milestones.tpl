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
    <a href="history.html">History</a>
    <a class="active" href="milestones.html" aria-current="page">Milestones</a>
  </nav>
  <span aria-hidden="true"></span>
</header>

<!-- HERO (ALT) -->
<section class="cp-hero-alt cp-section" aria-label="Milestones Overview">
  <div class="cp-wrap cp-hero-alt-grid">
    <div class="cp-hero-alt-text">
      <p class="cp-kicker">{{ hero.kicker }}</p>
      <h1 class="cp-title">
        <span>{{ hero.titleTop }}</span>
        <span>{{ hero.titleBottom }}</span>
      </h1>
      <p class="cp-lead">{{ hero.lead }}</p>
    </div>

    <aside class="cp-hero-stats">
      {{#each kpis}}
      <article class="cp-hero-stat">
        <div class="cp-hero-stat-num" data-count="{{ value }}">
          {{ value }}<span>{{ unit }}</span>
        </div>
        <div class="cp-hero-stat-label">{{ label }}</div>
      </article>
      {{/each}}
    </aside>
  </div>
</section>

<!-- TIMELINE -->
<section class="cp-section" aria-label="Key Milestones Timeline">
  <div class="cp-wrap">
    <h2 class="cp-h2">Connectivity Milestones (by Year)</h2>
    <ol class="cp-timeline">
      {{#each milestones}}
      <li class="cp-tl {{ side }}">
        <div class="cp-tl-year">{{ year }}</div>
        <div class="cp-tl-card">
          <h3 class="cp-h3">{{ title }}</h3>
          <p class="cp-body">{{ text }}</p>
          {{#if sourceUrl}}
          <p class="cp-note">
            <a href="{{ sourceUrl }}" target="_blank" rel="noopener">Source</a>
          </p>
          {{/if}}
        </div>
      </li>
      {{/each}}
    </ol>
  </div>
</section>

<!-- FACTS GRID -->
<section class="cp-section" aria-label="Snapshot">
  <div class="cp-wrap">
    <h2 class="cp-h2">Snapshot</h2>
    <div class="cp-stats-grid">
      {{#each facts}}
      <article class="cp-statcard">
        <div class="cp-statcard-top">
          <span class="cp-statcard-value">{{ value }}</span>
          <span class="cp-statcard-unit">{{ unit }}</span>
        </div>
        <div class="cp-statcard-label">{{ label }}</div>
        {{#if note}}
        <div class="cp-note">{{ note }}</div>
        {{/if}}
      </article>
      {{/each}}
    </div>
  </div>
</section>

<!-- CHARTS (adds new display types vs. History: stacked bar + radar) -->
<section class="cp-section" aria-label="By the Numbers">
  <div class="cp-wrap">
    <h2 class="cp-h2">By the Numbers</h2>
    <div class="cp-chart-grid">
      <figure class="cp-chart-card">
        <figcaption>Milestones per Year</figcaption>
        <canvas
          id="msLineChart"
          class="chart-canvas"
          role="img"
          aria-label="Line: milestones per year"
        ></canvas>
      </figure>
      <figure class="cp-chart-card">
        <figcaption>Milestones by Category</figcaption>
        <canvas
          id="msDoughnut"
          class="chart-canvas"
          role="img"
          aria-label="Doughnut: category split"
        ></canvas>
      </figure>
      <figure class="cp-chart-card">
        <figcaption>Impact by Era</figcaption>
        <canvas
          id="msStackedBar"
          class="chart-canvas"
          role="img"
          aria-label="Stacked bar: impact by era"
        ></canvas>
      </figure>
      <figure class="cp-chart-card">
        <figcaption>Capability Radar</figcaption>
        <canvas
          id="msRadar"
          class="chart-canvas"
          role="img"
          aria-label="Radar: capabilities"
        ></canvas>
      </figure>
    </div>
  </div>
</section>

<!-- CARD LIST (new element: dense milestone cards with badges) -->
<section class="cp-section" aria-label="Milestone Cards">
  <div class="cp-wrap">
    <h2 class="cp-h2">Highlights</h2>
    <div class="cp-cards">
      {{#each cards}}
      <article class="cp-card" data-year="{{ year }}" data-cat="{{ category }}">
        <header
          class="cp-statcard-top"
          style="display: flex; align-items: baseline; gap: 8px"
        >
          <span class="cp-statcard-value">{{ year }}</span>
          <span class="cp-statcard-unit">{{ category }}</span>
        </header>
        <p class="cp-body" style="margin-top: 6px">{{ title }}</p>
        {{#if tags}}
        <ul class="cp-bullets">
          {{#each tags}}
          <li>{{ this }}</li>
          {{/each}}
        </ul>
        {{/if}}
      </article>
      {{/each}}
    </div>
  </div>
</section>

<!-- OUTLOOK -->
{{#if outlook}}
<section class="cp-section" aria-label="Outlook">
  <div class="cp-wrap">
    <h2 class="cp-h2">Outlook</h2>
    <div class="cp-outlook">
      <ul class="cp-bullets">
        {{#each outlook.points}}
        <li>{{ text }}</li>
        {{/each}}
      </ul>
      {{#if outlook.image.src}}
      <figure class="cp-outlook-fig">
        <img src="{{ outlook.image.src }}" alt="{{ outlook.image.alt }}" />
        {{#if outlook.image.credit}}
        <figcaption class="cp-credit">{{ outlook.image.credit }}</figcaption>
        {{/if}}
      </figure>
      {{/if}}
    </div>
  </div>
</section>
{{/if}}

<!-- FOOTER (with sources) -->
<footer class="cp-footer" role="contentinfo">
  <div class="cp-wrap cp-footer-grid">
    <section class="cp-foot-left">
      <h3 class="cp-h5">Connected Pakistan</h3>
      <ul class="cp-foot-links" id="footerNav"></ul>
      <p class="cp-byline">Created by <strong>Mustafa Khan Khetran</strong></p>
    </section>
    <section class="cp-foot-right">
      <h3 class="cp-h5">Sources</h3>
      <ul class="cp-sources">
        {{#each sources}}
        <li>
          <a href="{{ url }}" target="_blank" rel="noopener">{{ label }}</a>
        </li>
        {{/each}}
      </ul>
    </section>
  </div>
  <div class="cp-wrap cp-foot-bottom">
    <p class="cp-legal">{{ footer.legal }}</p>
  </div>
</footer>
