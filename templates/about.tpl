<a class="cp-skip" href="#main">Skip to content</a>

<!-- Nav (your style) -->
<header class="NavBar" role="banner">
  <a class="brand" href="index.html" aria-label="Connected Pakistan — Home">
    <span class="brand-mark" aria-hidden="true">CP</span>
    <span class="brand-text">Connected Pakistan</span>
  </a>
  <nav class="nav-pill" aria-label="Primary">
    <a class="active" href="about.html" aria-current="page">About</a>
    <a href="history.html">History</a>
    <a href="milestones.html">Milestones</a>
  </nav>
  <span aria-hidden="true"></span>
</header>

<main id="main">
  <!-- HERO -->
  <section class="cp-hero">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ site.tagline }}</p>
      <h1 class="cp-title">
        <span>{{hero.titleLines.0}}</span>
        <span>{{hero.titleLines.1}}</span>
        <span>{{hero.titleLines.2}}</span>
      </h1>
      <p class="cp-lead">{{ hero.subtitle }}</p>
      <figure class="cp-hero-media">
        <img src="{{ hero.media.src }}" alt="{{ hero.media.alt }}" />
      </figure>
    </div>
  </section>

  <!-- OVERVIEW -->
  <section class="cp-section">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ overview.kicker }}</p>
      <h2 class="cp-h2">{{ overview.heading }}</h2>
      <p class="cp-body">{{ overview.body }}</p>
      <ul class="cp-points" id="overviewPoints"></ul>
    </div>
  </section>

  <!-- MILESTONES -->
  <section class="cp-section cp-milestones">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ milestones.kicker }}</p>
      <h2 class="cp-h2">{{ milestones.heading }}</h2>
      <ul class="cp-milestone-list" id="milestoneList"></ul>
    </div>
  </section>

  <!-- TIMELINE -->
  <section class="cp-section cp-timeline" id="timeline">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ timeline.kicker }}</p>
      <h2 class="cp-h2">{{ timeline.heading }}</h2>
      <div class="cp-rows" id="timelineDecades"></div>
    </div>
  </section>

  <!-- THEMES -->
  <section class="cp-section cp-themes">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ themes.kicker }}</p>
      <h2 class="cp-h2">{{ themes.heading }}</h2>
      <div class="cp-cards" id="themesCards"></div>
    </div>
  </section>

  <!-- CHARTS -->
  <section class="cp-section cp-charts" id="charts">
    <div class="cp-wrap">
      <p class="cp-kicker">{{ charts.kicker }}</p>
      <h2 class="cp-h2">{{ charts.heading }}</h2>

      <div class="cp-chart-grid">
        <figure class="cp-chart-card">
          <figcaption>{{ charts.adoption.title }}</figcaption>
          <canvas id="adoptionChart" height="140"></canvas>
        </figure>

        <figure class="cp-chart-card">
          <figcaption>{{ charts.accessMix.title }}</figcaption>
          <canvas id="accessMixChart" height="140"></canvas>
        </figure>
      </div>
    </div>
  </section>

  <footer class="cp-footer" role="contentinfo">
    <div class="cp-wrap cp-footer-grid">
      <section class="cp-foot-left">
        <h3 class="cp-h5">Connected Pakistan</h3>

        <!-- Page links from JSON (populated by JS) -->
        <ul class="cp-foot-links" id="footerNav"></ul>

        <!-- Your byline -->
        <p class="cp-byline">
          Created by <strong>Mustafa Khan Khetran</strong>
        </p>
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
