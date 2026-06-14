<script>
  import { getLangColor } from '$lib/utils.js';
  import InfoTooltip from './InfoTooltip.svelte';

  let { languages, skills, locStats } = $props();
  // languages: [{language, bytes, percentage}]
  // skills: [{name, icon, matches}]
  // locStats: [{repo, additions, deletions, commits}] | null

  let totalAdditions = $derived(locStats ? locStats.reduce((s, r) => s + r.additions, 0) : null);
  let totalDeletions = $derived(locStats ? locStats.reduce((s, r) => s + r.deletions, 0) : null);

  function fmtBytes(b) {
    if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)}M`;
    if (b >= 1_000) return `${(b / 1_000).toFixed(0)}K`;
    return String(b);
  }

  function fmtLoc(n) {
    if (!n) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  }
</script>

<div class="card lang-card fade-up" style="animation-delay:120ms">
  <p class="section-title">Language Skills</p>

  {#if languages && languages.length > 0}
    <!-- Top language highlight -->
    <div class="primary-lang">
      <span class="lang-dot" style="background:{getLangColor(languages[0].language)}"></span>
      <span class="primary-lang-name">{languages[0].language}</span>
      <span class="primary-lang-pct">{languages[0].percentage}% of codebase</span>
      <InfoTooltip text="Primary language by byte count across top repositories. Measured in actual code bytes, not file count." />
    </div>

    <!-- Stacked bar -->
    <div class="lang-stack" role="img" aria-label="Language distribution bar">
      {#each languages as lang}
        <div
          class="lang-stack-seg"
          style="width:{lang.percentage}%; background:{getLangColor(lang.language)}"
          title="{lang.language} {lang.percentage}%"
        ></div>
      {/each}
    </div>

    <!-- Language rows -->
    <div class="lang-rows">
      {#each languages as lang}
        <div class="lang-row">
          <div class="lang-row-left">
            <span class="lang-dot" style="background:{getLangColor(lang.language)}"></span>
            <span class="lang-name">{lang.language}</span>
          </div>
          <div class="lang-row-right">
            <span class="lang-bytes">{fmtBytes(lang.bytes)}B</span>
            <div class="lang-bar-track">
              <div class="lang-bar-fill" style="width:{lang.percentage}%; background:{getLangColor(lang.language)}"></div>
            </div>
            <span class="lang-pct">{lang.percentage}%</span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="no-data">No language data available for this account's public repositories.</p>
  {/if}

  <!-- Lines of code section -->
  {#if totalAdditions !== null}
    <hr class="divider" />
    <div class="loc-section">
      <div class="loc-header">
        <p class="label">Lines of Code Changed</p>
        <InfoTooltip text="Additions and deletions across top repositories where this user is a contributor. Computed from GitHub's contributor statistics endpoint." />
        <span class="loc-note">(top {locStats.length} repos)</span>
      </div>
      <div class="loc-stats">
        <div class="loc-stat">
          <span class="loc-num additions">+{fmtLoc(totalAdditions)}</span>
          <span class="label">Lines added</span>
        </div>
        <div class="loc-stat">
          <span class="loc-num deletions">−{fmtLoc(totalDeletions)}</span>
          <span class="label">Lines removed</span>
        </div>
        <div class="loc-stat">
          <span class="loc-num">{fmtLoc(totalAdditions + totalDeletions)}</span>
          <span class="label">Total changes</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Skill domains -->
  {#if skills && skills.length > 0}
    <hr class="divider" />
    <div class="skills-section">
      <div class="skills-header">
        <p class="label">Inferred Skill Domains</p>
        <InfoTooltip text="Domains are inferred from the languages used across all public repositories. Not exhaustive — only based on language presence, not library usage." />
      </div>
      <div class="skill-pills">
        {#each skills as skill}
          <span class="skill-pill">
            <span class="skill-icon" aria-hidden="true">{skill.icon}</span>
            {skill.name}
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .primary-lang {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .primary-lang-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text);
  }

  .primary-lang-pct {
    font-size: 13px;
    color: var(--color-muted);
  }

  .lang-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
  }

  /* Stacked bar */
  .lang-stack {
    display: flex;
    height: 8px;
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: var(--space-5);
    gap: 1px;
  }

  .lang-stack-seg { height: 100%; min-width: 2px; }

  /* Language rows */
  .lang-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .lang-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .lang-row-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 100px;
  }

  .lang-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-2);
  }

  .lang-row-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
    max-width: 220px;
  }

  .lang-bytes {
    font-size: 11px;
    color: var(--color-muted);
    font-family: var(--font-mono);
    width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

  .lang-bar-track {
    flex: 1;
    height: 5px;
    background: var(--color-surface-3);
    border-radius: 100px;
    overflow: hidden;
  }

  .lang-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 500ms cubic-bezier(0.16,1,0.3,1);
  }

  .lang-pct {
    font-size: 12px;
    color: var(--color-muted);
    width: 30px;
    text-align: right;
    flex-shrink: 0;
  }

  /* LOC section */
  .loc-section { }

  .loc-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .loc-note {
    font-size: 11px;
    color: var(--color-muted);
  }

  .loc-stats {
    display: flex;
    gap: var(--space-6);
    flex-wrap: wrap;
  }

  .loc-stat {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .loc-num {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .additions { color: var(--color-success); }
  .deletions { color: var(--color-danger); }

  /* Skills */
  .skills-section { }

  .skills-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .skill-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .skill-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-2);
  }

  .skill-icon { font-size: 13px; }

  .no-data { font-size: 13px; color: var(--color-muted); }
</style>
