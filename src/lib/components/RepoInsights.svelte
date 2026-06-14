<script>
  import { getLangColor, timeAgo, formatNum } from '$lib/utils.js';

  let { repoInsights, stats } = $props();

  let tab = $state('stars'); // 'stars' | 'activity'

  let repos = $derived(tab === 'stars' ? repoInsights.topByStars : repoInsights.topByActivity);

  let oldVsRecent = $derived(repoInsights.oldVsRecent);
  let commitData = $derived(repoInsights.commitData);
  let total = $derived(oldVsRecent.recent + oldVsRecent.moderate + oldVsRecent.old || 1);
</script>

<div class="card fade-up" style="animation-delay:100ms">
  <p class="section-title">Repository Insights</p>

  <!-- Tab switcher -->
  <div class="tabs" role="tablist">
    <button
      role="tab"
      aria-selected={tab === 'stars'}
      class="tab-btn"
      class:active={tab === 'stars'}
      onclick={() => tab = 'stars'}
    >
      Top Starred
    </button>
    <button
      role="tab"
      aria-selected={tab === 'activity'}
      class="tab-btn"
      class:active={tab === 'activity'}
      onclick={() => tab = 'activity'}
    >
      Most Active
    </button>
  </div>

  <div class="repo-list">
    {#each repos as repo (repo.name)}
      <a class="repo-row" href={repo.url} target="_blank" rel="noopener noreferrer" aria-label="Open {repo.name} on GitHub">
        <div class="repo-row-left">
          <span class="repo-name">{repo.name}</span>
          <div class="repo-meta">
            {#if repo.language}
              <span class="pill">
                <span class="pill-dot" style="background:{getLangColor(repo.language)}"></span>
                {repo.language}
              </span>
            {/if}
            <span class="meta-stat">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
              </svg>
              {formatNum(repo.stars)}
            </span>
            <span class="meta-stat">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
              </svg>
              {formatNum(repo.forks)}
            </span>
            <span class="meta-stat updated">{timeAgo(repo.updatedAt)}</span>
          </div>
        </div>
        <svg class="arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
        </svg>
      </a>
    {/each}
  </div>

  <hr class="divider" />

  <!-- Activity split bar -->
  <div class="activity-split">
    <div class="split-header">
      <p class="label">Activity Distribution</p>
      <div class="split-legend">
        <span class="legend-item recent">Last 90d</span>
        <span class="legend-item moderate">90d–1yr</span>
        <span class="legend-item old">Older</span>
      </div>
    </div>
    <div class="split-bar" role="img" aria-label="Activity distribution: {oldVsRecent.recent} recent, {oldVsRecent.moderate} moderate, {oldVsRecent.old} old">
      {#if oldVsRecent.recent > 0}
        <div class="split-segment seg-recent" style="width:{(oldVsRecent.recent/total*100).toFixed(1)}%"
          title="{oldVsRecent.recent} repos updated in last 90 days">
        </div>
      {/if}
      {#if oldVsRecent.moderate > 0}
        <div class="split-segment seg-moderate" style="width:{(oldVsRecent.moderate/total*100).toFixed(1)}%"
          title="{oldVsRecent.moderate} repos updated 90 days–1 year ago">
        </div>
      {/if}
      {#if oldVsRecent.old > 0}
        <div class="split-segment seg-old" style="width:{(oldVsRecent.old/total*100).toFixed(1)}%"
          title="{oldVsRecent.old} repos not updated in over a year">
        </div>
      {/if}
    </div>
    <div class="split-counts">
      <span>{oldVsRecent.recent} recent</span>
      <span>{oldVsRecent.moderate} moderate</span>
      <span>{oldVsRecent.old} old</span>
    </div>
  </div>
</div>

<style>
  .tabs {
    display: flex;
    gap: var(--space-1);
    background: var(--color-surface-2);
    padding: 3px;
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-4);
    width: fit-content;
  }

  .tab-btn {
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: calc(var(--radius-sm) - 2px);
    color: var(--color-muted);
    transition: background var(--transition), color var(--transition);
    min-height: 32px;
  }

  .tab-btn.active {
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .tab-btn:hover:not(.active) { color: var(--color-text-2); }

  .repo-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .repo-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-2);
    border-radius: var(--radius-sm);
    transition: background var(--transition);
    gap: var(--space-3);
  }

  .repo-row:hover { background: var(--color-surface-2); }
  .repo-row:hover .arrow { opacity: 1; }

  .arrow {
    opacity: 0;
    color: var(--color-muted);
    flex-shrink: 0;
    transition: opacity var(--transition);
  }

  .repo-row-left {
    flex: 1;
    min-width: 0;
  }

  .repo-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    font-family: var(--font-mono);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .repo-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: 4px;
  }

  .meta-stat {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--color-muted);
  }

  .updated { font-size: 12px; color: var(--color-muted); }

  /* Activity split */
  .activity-split { }

  .split-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .split-legend {
    display: flex;
    gap: var(--space-3);
  }

  .legend-item {
    font-size: 11px;
    color: var(--color-muted);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .legend-item::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .legend-item.recent::before  { background: var(--color-success); }
  .legend-item.moderate::before { background: var(--color-warning); }
  .legend-item.old::before     { background: var(--color-surface-3); border: 1px solid var(--color-border); }

  .split-bar {
    display: flex;
    height: 8px;
    border-radius: 100px;
    overflow: hidden;
    background: var(--color-surface-3);
    gap: 2px;
  }

  .split-segment { height: 100%; transition: width 600ms cubic-bezier(0.16,1,0.3,1); }
  .seg-recent   { background: var(--color-success); }
  .seg-moderate { background: var(--color-warning); }
  .seg-old      { background: var(--color-surface-3); border: 1px solid var(--color-border); }

  .split-counts {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-2);
    font-size: 11px;
    color: var(--color-muted);
  }
</style>
