<script>
  let { heatmap } = $props();
  // heatmap: { flat, weeks, max, monthLabels, totalCommits }

  function intensity(count, max) {
    if (count === 0) return 0;
    const ratio = count / max;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5)  return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  }

  const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
</script>

<div class="card heatmap-card fade-up" style="animation-delay:80ms">
  <div class="heatmap-header">
    <p class="section-title" style="margin-bottom:0">Activity Heatmap</p>
    <div class="heatmap-meta">
      <span class="heatmap-total">{heatmap.totalCommits} pushes in 91 days</span>
      <div class="legend">
        <span class="legend-label">Less</span>
        {#each [0,1,2,3,4] as lvl}
          <span class="legend-cell" data-level={lvl}></span>
        {/each}
        <span class="legend-label">More</span>
      </div>
    </div>
  </div>

  <div class="heatmap-scroll">
    <div class="heatmap-grid-wrap">
      <!-- Day labels -->
      <div class="day-labels" aria-hidden="true">
        {#each DAY_LABELS as label}
          <span class="day-label">{label}</span>
        {/each}
      </div>

      <!-- Month labels + week columns -->
      <div class="grid-area">
        <!-- Month labels row -->
        <div class="month-row" style="grid-template-columns: repeat({heatmap.weeks.length}, 1fr)">
          {#each heatmap.weeks as _, wi}
            <span class="month-label">
              {heatmap.monthLabels.find(m => m.weekIdx === wi)?.label ?? ''}
            </span>
          {/each}
        </div>

        <!-- Heatmap cells -->
        <div class="cells-grid" style="grid-template-columns: repeat({heatmap.weeks.length}, var(--cell-size))">
          {#each heatmap.weeks as week}
            <div class="week-col">
              {#each week as day}
                {#if day === null}
                  <span class="cell empty"></span>
                {:else}
                  <span
                    class="cell"
                    data-level={intensity(day.count, heatmap.max)}
                    title="{day.count} push{day.count !== 1 ? 'es' : ''} on {day.date}"
                    aria-label="{day.count} contributions on {day.date}"
                  ></span>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :root { --cell-size: 12px; --cell-gap: 3px; }

  .heatmap-card { overflow: hidden; }

  .heatmap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
  }

  .heatmap-meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .heatmap-total {
    font-size: 12px;
    color: var(--color-muted);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .legend-label {
    font-size: 10px;
    color: var(--color-muted);
  }

  .legend-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--color-surface-3);
  }

  .legend-cell[data-level="0"] { background: var(--color-surface-3); }
  .legend-cell[data-level="1"] { background: color-mix(in oklch, var(--color-accent) 25%, var(--color-surface-3)); }
  .legend-cell[data-level="2"] { background: color-mix(in oklch, var(--color-accent) 50%, var(--color-surface-3)); }
  .legend-cell[data-level="3"] { background: color-mix(in oklch, var(--color-accent) 75%, var(--color-surface-3)); }
  .legend-cell[data-level="4"] { background: var(--color-accent); }

  /* Scroll wrapper for mobile */
  .heatmap-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  .heatmap-grid-wrap {
    display: flex;
    gap: var(--cell-gap);
    min-width: max-content;
  }

  .day-labels {
    display: flex;
    flex-direction: column;
    gap: var(--cell-gap);
    padding-top: 18px; /* align with cells, below month row */
    margin-right: 2px;
  }

  .day-label {
    height: var(--cell-size);
    font-size: 9px;
    color: var(--color-muted);
    line-height: var(--cell-size);
    width: 24px;
    text-align: right;
  }

  .grid-area { display: flex; flex-direction: column; gap: 2px; }

  .month-row {
    display: grid;
    gap: var(--cell-gap);
    height: 16px;
    margin-bottom: 2px;
  }

  .month-label {
    font-size: 9px;
    color: var(--color-muted);
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
  }

  .cells-grid {
    display: grid;
    gap: var(--cell-gap);
    align-items: start;
  }

  .week-col {
    display: flex;
    flex-direction: column;
    gap: var(--cell-gap);
  }

  .cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border-radius: 2px;
    background: var(--color-surface-3);
    transition: opacity 120ms;
    cursor: default;
  }

  .cell:hover { opacity: 0.75; }
  .cell.empty { background: transparent; }

  .cell[data-level="0"] { background: var(--color-surface-3); }
  .cell[data-level="1"] { background: color-mix(in oklch, var(--color-accent) 25%, var(--color-surface-3)); }
  .cell[data-level="2"] { background: color-mix(in oklch, var(--color-accent) 50%, var(--color-surface-3)); }
  .cell[data-level="3"] { background: color-mix(in oklch, var(--color-accent) 75%, var(--color-surface-3)); }
  .cell[data-level="4"] { background: var(--color-accent); }
</style>
