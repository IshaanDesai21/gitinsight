<script>
  import '../app.css';
  import { parseUsername, getProfile, getRepos, getCommitCounts,
           getEvents, getLanguageBreakdown, getContributorStats } from '$lib/github.js';
  import { buildAnalysis, buildHeatmapData, inferSkillDomains } from '$lib/metrics.js';
  import { getCached, setCached } from '$lib/cache.js';
  import { onMount } from 'svelte';

  import ProfileCard        from '$lib/components/ProfileCard.svelte';
  import RepoInsights       from '$lib/components/RepoInsights.svelte';
  import ContributionStats  from '$lib/components/ContributionStats.svelte';
  import MetricsDashboard   from '$lib/components/MetricsDashboard.svelte';
  import SummaryBox         from '$lib/components/SummaryBox.svelte';
  import SkeletonLoader     from '$lib/components/SkeletonLoader.svelte';
  import ErrorBanner        from '$lib/components/ErrorBanner.svelte';
  import ActivityHeatmap    from '$lib/components/ActivityHeatmap.svelte';
  import LanguageSkillsCard from '$lib/components/LanguageSkillsCard.svelte';
  import SearchDropdown     from '$lib/components/SearchDropdown.svelte';
  import ContributedRepos   from '$lib/components/ContributedRepos.svelte';

  // ─── State ───────────────────────────────────────────────────
  let loading      = $state(false);
  let error        = $state('');
  let result       = $state(null);
  let showToken    = $state(false);
  let tokenInput   = $state('');
  let hasToken     = $state(false);

  // Progressive phase-2 data
  let heatmap      = $state(null);
  let langData     = $state(null);
  let locStats     = $state(null);
  let skillDomains = $state(null);
  let phase2Loading = $state(false);

  onMount(() => {
    tokenInput = sessionStorage.getItem('gh_token') || '';
    hasToken   = !!tokenInput;
  });

  function saveToken() {
    const t = tokenInput.trim();
    if (t) { sessionStorage.setItem('gh_token', t); hasToken = true; }
    else    { sessionStorage.removeItem('gh_token'); hasToken = false; }
    showToken = false;
  }

  function clearToken() {
    tokenInput = '';
    sessionStorage.removeItem('gh_token');
    hasToken = false;
    showToken = false;
  }

  // ─── Core analyze ────────────────────────────────────────────
  async function analyze(usernameOrInput) {
    const username = parseUsername(usernameOrInput || '');
    if (!username) {
      error = 'Please enter a valid GitHub username, URL, or search and select a result.';
      return;
    }

    error = '';
    result = null;
    heatmap = null;
    langData = null;
    locStats = null;
    skillDomains = null;
    loading = true;

    // Check cache
    const cached = getCached(username);
    if (cached) {
      result = cached.result;
      heatmap = cached.heatmap ?? null;
      langData = cached.langData ?? null;
      locStats = cached.locStats ?? null;
      skillDomains = cached.skillDomains ?? null;
      loading = false;
      scrollToResults();
      return;
    }

    try {
      // Phase 1: core data (fast — 3–12 API calls)
      const [profile, repos] = await Promise.all([getProfile(username), getRepos(username)]);
      const commitData = await getCommitCounts(username, repos, 10);
      result = buildAnalysis(profile, repos, commitData);
      loading = false;
      scrollToResults();

      // Phase 2: supplementary data (progressive — can take longer)
      phase2Loading = true;
      const rawRepos = repos; // keep raw for API calls
      const [events, languages, contribStats] = await Promise.all([
        getEvents(username),
        getLanguageBreakdown(username, rawRepos, 8),
        getContributorStats(username, rawRepos, 4),
      ]);

      heatmap      = buildHeatmapData(events);
      langData     = languages;
      locStats     = contribStats.length ? contribStats : null;
      skillDomains = inferSkillDomains(languages);
      phase2Loading = false;

      // Cache everything
      setCached(username, { result, heatmap, langData, locStats, skillDomains });

    } catch (err) {
      loading = false;
      phase2Loading = false;
      if (err.status === 404) {
        error = `GitHub user "${parseUsername(usernameOrInput || '')}" not found. Check the spelling and try again.`;
      } else if (err.status === 403 || err.status === 429) {
        error = 'GitHub API rate limit reached. Add a Personal Access Token using the 🔑 button to increase limits to 5,000 req/hr.';
      } else {
        error = 'Failed to fetch GitHub data. Please try again.';
        console.error(err);
      }
    }
  }

  function scrollToResults() {
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function reset() {
    result = null;
    heatmap = null;
    langData = null;
    locStats = null;
    skillDomains = null;
    error = '';
  }
</script>

<svelte:head>
  <title>GitInsight — GitHub Activity Intelligence</title>
  <meta name="description" content="Analyze any GitHub developer's coding activity, repository behavior, language skills, and contribution patterns — instantly." />
  <meta property="og:title" content="GitInsight — GitHub Activity Intelligence" />
  <meta property="og:description" content="Deep GitHub profile analytics: heatmap, language skills, metrics, and more." />
</svelte:head>

<!-- ─── Header ─────────────────────────────────────────────────── -->
<header class="header">
  <div class="container header-inner">
    <a class="wordmark" href="/" onclick={(e) => { e.preventDefault(); reset(); }}>
      <svg class="logo-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"/>
      </svg>
      GitInsight
    </a>

    <div class="header-right">
      <button
        class="btn-ghost token-btn"
        onclick={() => showToken = !showToken}
        title="Configure GitHub API Token"
        aria-expanded={showToken}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"/>
        </svg>
        {#if hasToken}<span class="token-active-dot"></span>{/if}
        <span class="token-label">API Token</span>
      </button>
    </div>
  </div>

  <!-- Token panel -->
  {#if showToken}
    <div class="token-panel container fade-up">
      <p class="token-desc">
        Add a <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Personal Access Token</a>
        (no scopes needed) to raise rate limits from 60 → 5,000 req/hr. Stored in session memory only — never sent anywhere.
      </p>
      <div class="token-row">
        <input
          id="token-input"
          type="password"
          class="input"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          bind:value={tokenInput}
          autocomplete="off"
          spellcheck="false"
        />
        <button class="btn-primary" onclick={saveToken}>Save</button>
        {#if tokenInput}
          <button class="btn-ghost" onclick={clearToken}>Clear</button>
        {/if}
      </div>
    </div>
  {/if}
</header>

<!-- ─── Main ───────────────────────────────────────────────────── -->
<main>
  <!-- Hero (shown when no results) -->
  {#if !result && !loading}
    <section class="hero container">
      <h1 class="hero-title">GitHub Activity<br/>Intelligence</h1>
      <p class="hero-sub">
        Analyze any developer's coding behavior, contribution patterns, language skills, and repository insights — in seconds.
      </p>

      <div class="hero-search">
        <SearchDropdown
          placeholder="Search by username, full name, or email…"
          onSelect={(u) => analyze(u)}
        />
        <button
          id="analyze-btn"
          class="btn-primary"
          onclick={() => {
            const el = document.querySelector('.search-autocomplete input');
            analyze(el?.value || '');
          }}
          aria-label="Analyze GitHub profile"
        >
          Analyze
        </button>
      </div>

      {#if error}
        <div style="margin-top:var(--space-4)">
          <ErrorBanner {error} />
        </div>
      {/if}

      <div class="examples">
        <span class="label">Try:</span>
        {#each ['torvalds', 'gaearon', 'sindresorhus', 'getify'] as ex}
          <button class="example-btn" onclick={() => analyze(ex)}>@{ex}</button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Loading skeleton -->
  {#if loading}
    <section class="results container" id="results" aria-live="polite" aria-busy="true">
      <SkeletonLoader />
    </section>
  {/if}

  <!-- Results -->
  {#if result && !loading}
    <!-- Sticky search bar -->
    <div class="sticky-bar">
      <div class="container sticky-inner">
        <div class="sticky-search">
          <SearchDropdown
            placeholder="Search another user…"
            onSelect={(u) => analyze(u)}
          />
          <button
            class="btn-primary sticky-analyze-btn"
            onclick={() => {
              const inputs = document.querySelectorAll('.search-autocomplete input');
              const val = inputs[inputs.length - 1]?.value || '';
              analyze(val);
            }}
          >
            Analyze
          </button>
        </div>
      </div>
    </div>

    <section class="results container" id="results" aria-live="polite">
      {#if error}<ErrorBanner {error} />{/if}

      <!-- Summary always first -->
      <SummaryBox summary={result.insights.summary} username={result.profile.username} />

      <!-- Profile -->
      <ProfileCard profile={result.profile} />

      <!-- Heatmap — shows when phase 2 done -->
      {#if heatmap}
        <ActivityHeatmap {heatmap} />
      {:else if phase2Loading}
        <div class="card skeleton-heatmap fade-up">
          <div class="skeleton" style="width:160px;height:11px;margin-bottom:20px"></div>
          <div class="skeleton" style="width:100%;height:72px;border-radius:var(--radius-sm)"></div>
        </div>
      {/if}

      <!-- Two-column layout for main cards -->
      <div class="grid-2">
        <!-- Left col -->
        <div class="col">
          <RepoInsights repoInsights={result.repoInsights} stats={result.stats} />
          <ContributionStats stats={result.stats} />
        </div>
        <!-- Right col -->
        <div class="col">
          <!-- Language skills — phase 2 -->
          {#if langData}
            <LanguageSkillsCard
              languages={langData}
              skills={skillDomains}
              locStats={locStats}
            />
          {:else if phase2Loading}
            <div class="card fade-up">
              <div class="skeleton" style="width:140px;height:11px;margin-bottom:20px"></div>
              {#each [1,2,3,4,5] as _}
                <div style="margin-bottom:12px">
                  <div class="skeleton" style="width:100%;height:5px;border-radius:100px"></div>
                </div>
              {/each}
            </div>
          {/if}
          <MetricsDashboard insights={result.insights} />
          {#if locStats && locStats.length > 0}
            <ContributedRepos locStats={locStats} />
          {/if}
        </div>
      </div>

      <!-- ─── Prominent "Analyze Another" CTA ─── -->
      <div class="analyze-another-section">
        <div class="analyze-another-inner">
          <div class="analyze-another-text">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
            </svg>
            <span>Analyze another developer</span>
          </div>
          <div class="analyze-another-search">
            <SearchDropdown
              placeholder="Search by username, name, or email…"
              onSelect={(u) => { analyze(u); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              openUpwards={true}
            />
            <button
              class="btn-primary"
              onclick={() => {
                const inputs = document.querySelectorAll('.analyze-another-section .search-autocomplete input');
                const val = inputs[0]?.value || '';
                analyze(val);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>

<!-- ─── Footer ─────────────────────────────────────────────────── -->
<footer class="footer">
  <div class="container footer-inner">
    <span>GitInsight — GitHub activity intelligence</span>
    <span>Data from the GitHub REST API · Not affiliated with GitHub, Inc.</span>
  </div>
</footer>

<style>
  /* ── Header ─────────────────────────────────────────────────── */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: color-mix(in oklch, var(--color-bg) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: 12px;
    gap: var(--space-4);
  }

  .wordmark {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
    text-decoration: none;
    cursor: pointer;
  }

  .logo-icon { color: var(--color-accent); }

  .header-right { display: flex; align-items: center; gap: var(--space-2); }

  .token-btn { position: relative; gap: 5px; }

  .token-active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
    flex-shrink: 0;
  }

  .token-label { font-size: 13px; }

  .token-panel {
    padding-block: var(--space-4);
    border-top: 1px solid var(--color-border-subtle);
    animation: fadeUp 150ms ease;
  }

  .token-desc {
    font-size: 13px;
    color: var(--color-text-2);
    line-height: 1.5;
    margin-bottom: var(--space-3);
  }

  .token-desc a { color: var(--color-accent); text-decoration: underline; }

  .token-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  /* ── Hero ────────────────────────────────────────────────────── */
  .hero {
    padding-top: clamp(48px, 10vw, 88px);
    padding-bottom: clamp(48px, 10vw, 72px);
    max-width: 620px;
  }

  .hero-title {
    font-size: clamp(32px, 6vw, 52px);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1.1;
    margin-bottom: var(--space-5);
  }

  .hero-sub {
    font-size: 16px;
    color: var(--color-text-2);
    line-height: 1.6;
    margin-bottom: var(--space-8);
    max-width: 480px;
  }

  .hero-search {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .hero-search :global(.search-autocomplete) { flex: 1; min-width: 200px; }
  .hero-search :global(.search-input) { font-size: 15px; min-height: 48px; }

  .examples {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-6);
  }

  .example-btn {
    font-size: 13px;
    color: var(--color-text-2);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    transition: background var(--transition), color var(--transition);
    font-family: var(--font-mono);
    min-height: 32px;
  }

  .example-btn:hover { background: var(--color-surface-2); color: var(--color-text); }

  /* ── Sticky bar ──────────────────────────────────────────────── */
  .sticky-bar {
    position: sticky;
    top: 54px; /* below header */
    z-index: 90;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-block: var(--space-3);
    background: color-mix(in oklch, var(--color-bg) 93%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .sticky-inner {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .sticky-search {
    display: flex;
    gap: var(--space-2);
    flex: 1;
    align-items: center;
  }

  .sticky-search :global(.search-autocomplete) { flex: 1; }
  .sticky-search :global(.search-input) { font-size: 14px; min-height: 40px; }

  .sticky-analyze-btn {
    font-size: 13px;
    padding: 8px 16px;
    min-height: 40px;
    flex-shrink: 0;
  }

  /* ── Results ─────────────────────────────────────────────────── */
  .results {
    padding-block: var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .skeleton-heatmap {
    min-height: 120px;
  }

  /* ── Analyze Another CTA ─────────────────────────────────────── */
  .analyze-another-section {
    position: relative;
    z-index: 50;
    margin-top: var(--space-4);
    padding: var(--space-6);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .analyze-another-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .analyze-another-text {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
  }

  .analyze-another-text svg { color: var(--color-accent); flex-shrink: 0; }

  .analyze-another-search {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .analyze-another-search :global(.search-autocomplete) { flex: 1; min-width: 200px; }
  .analyze-another-search :global(.search-input) { min-height: 46px; font-size: 14px; }
  .analyze-another-search :global(.btn-primary) { min-height: 46px; }

  /* ── Footer ──────────────────────────────────────────────────── */
  .footer {
    border-top: 1px solid var(--color-border-subtle);
    padding-block: var(--space-6);
    margin-top: var(--space-6);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-size: 12px;
    color: var(--color-muted);
  }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 639px) {
    .hero-search { flex-direction: column; }
    .hero-search :global(.btn-primary) { width: 100%; }
    .token-label { display: none; }
    .footer-inner { flex-direction: column; text-align: center; }
  }
</style>
