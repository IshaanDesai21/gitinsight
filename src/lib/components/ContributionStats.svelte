<script>
  import { ossColor, formatNum } from '$lib/utils.js';
  let { stats } = $props();
</script>

<div class="card fade-up" style="animation-delay:150ms">
  <p class="section-title">Contribution Analysis</p>

  <div class="stats-grid">
    <div class="stat-block">
      <span class="stat-number">{formatNum(stats.totalEstimatedCommits)}</span>
      <span class="label">Est. Commits (top 10 repos)</span>
    </div>
    <div class="stat-block">
      <span class="stat-number">{stats.avgCommitsPerRepo}</span>
      <span class="label">Avg Commits / Repo</span>
    </div>
    <div class="stat-block">
      <span class="stat-number">{stats.concentrationScore}</span>
      <span class="label">Spread Score</span>
    </div>
  </div>

  <hr class="divider" />

  <div class="badge-row">
    <div class="badge-item">
      <span class="label">Activity Trend</span>
      <span
        class="trend-pill pill"
        class:trend-active={stats.activityTrend === 'Active'}
        class:trend-declining={stats.activityTrend === 'Declining'}
        class:trend-inactive={stats.activityTrend === 'Inactive'}
      >
        <span class="trend-dot"></span>
        {stats.activityTrend}
      </span>
    </div>
    <div class="badge-item">
      <span class="label">OSS Engagement</span>
      <span class="oss-pill pill" style="color:{ossColor(stats.ossLevel)}; background: color-mix(in oklch, {ossColor(stats.ossLevel)} 12%, transparent)">
        {stats.ossLevel}
      </span>
    </div>
  </div>

  <hr class="divider" />

  <!-- Concentration indicator -->
  <div>
    <div class="conc-header">
      <span class="label">Contribution Spread</span>
      <span class="conc-desc">
        {#if stats.concentrationScore >= 70}
          Well distributed across repos
        {:else if stats.concentrationScore >= 40}
          Moderately concentrated
        {:else}
          Highly concentrated in few repos
        {/if}
      </span>
    </div>
    <div class="score-bar-track" role="progressbar" aria-valuenow={stats.concentrationScore} aria-valuemin="0" aria-valuemax="100">
      <div class="score-bar-fill" style="width:{stats.concentrationScore}%; background: var(--color-accent)"></div>
    </div>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .stat-number {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .badge-row {
    display: flex;
    gap: var(--space-8);
    flex-wrap: wrap;
  }

  .badge-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .trend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .conc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .conc-desc {
    font-size: 12px;
    color: var(--color-muted);
  }
</style>
