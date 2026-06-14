<script>
  import InfoTooltip from './InfoTooltip.svelte';

  let { insights } = $props();

  const SCORE_META = [
    {
      label: 'Activity Score',
      color: 'var(--color-accent)',
      tooltip: 'Measures overall coding output. Combines estimated commit volume in top repos (40%), how recently repos were updated (30%), and total repository count (30%).',
    },
    {
      label: 'Consistency Score',
      color: 'var(--color-success)',
      tooltip: 'Measures how evenly contributions are spread across projects. A high score means commits are distributed across many repos rather than spiking in one. Computed from the coefficient of variation in per-repo commit counts.',
    },
    {
      label: 'Diversity Score',
      color: 'var(--color-warning)',
      tooltip: 'Reflects the breadth of languages and technologies used across all public repositories. Considers both the number of unique languages and how widely they appear across different repos.',
    },
  ];

  let scores = $derived([
    { ...SCORE_META[0], value: insights.activityScore },
    { ...SCORE_META[1], value: insights.consistencyScore },
    { ...SCORE_META[2], value: insights.diversityScore },
  ]);

  function scoreLabel(v) {
    if (v >= 80) return 'Excellent';
    if (v >= 60) return 'Good';
    if (v >= 40) return 'Moderate';
    if (v >= 20) return 'Low';
    return 'Minimal';
  }
</script>

<div class="card fade-up" style="animation-delay:200ms">
  <p class="section-title">Metrics Dashboard</p>

  <div class="scores">
    {#each scores as score}
      <div class="score-row">
        <div class="score-meta">
          <span class="score-label-wrap">
            <span class="score-label">{score.label}</span>
            <InfoTooltip text={score.tooltip} />
          </span>
          <div class="score-right">
            <span class="score-badge" style="color:{score.color}">{scoreLabel(score.value)}</span>
            <span class="score-num">{score.value}<span class="score-max">/100</span></span>
          </div>
        </div>
        <div class="score-bar-track" role="progressbar" aria-label="{score.label}: {score.value} out of 100" aria-valuenow={score.value} aria-valuemin="0" aria-valuemax="100">
          <div class="score-bar-fill" style="width:{score.value}%; background:{score.color}"></div>
        </div>
      </div>
    {/each}
  </div>

  <hr class="divider" />

  <div class="radar-row">
    {#each scores as score}
      <div class="radar-cell">
        <div class="donut-wrap">
          <svg class="donut" viewBox="0 0 36 36" aria-hidden="true">
            <circle class="donut-track" cx="18" cy="18" r="15.9155" />
            <circle
              class="donut-arc"
              cx="18" cy="18" r="15.9155"
              stroke={score.color}
              stroke-dasharray="{score.value} {100 - score.value}"
              stroke-dashoffset="25"
            />
          </svg>
          <span class="donut-label">{score.value}</span>
        </div>
        <span class="radar-name">{score.label.replace(' Score', '')}</span>
      </div>
    {/each}
  </div>
</div>


<style>
  .scores {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .score-row { display: flex; flex-direction: column; gap: var(--space-2); }

  .score-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .score-label-wrap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .score-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-2);
  }

  .score-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .score-badge {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .score-num {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }

  .score-max {
    font-size: 11px;
    font-weight: 400;
    color: var(--color-muted);
  }

  /* Donut charts */
  .radar-row {
    display: flex;
    justify-content: space-around;
    gap: var(--space-4);
  }

  .radar-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .donut-wrap {
    position: relative;
    width: 64px;
    height: 64px;
  }

  .donut { width: 100%; height: 100%; transform: rotate(-90deg); }

  .donut-track {
    fill: none;
    stroke: var(--color-surface-3);
    stroke-width: 3.5;
  }

  .donut-arc {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
    transition: stroke-dasharray 600ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .donut-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text);
  }

  .radar-name {
    font-size: 11px;
    color: var(--color-muted);
    text-align: center;
    font-weight: 500;
  }
</style>
