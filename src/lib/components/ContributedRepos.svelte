<script>
  import { slide } from 'svelte/transition';
  import InfoTooltip from './InfoTooltip.svelte';

  let { locStats } = $props();

  // locStats is an array of {repo, additions, deletions, commits}
  // Sort primarily by (additions + deletions) descending, then by commits
  let sortedRepos = $derived(
    [...(locStats || [])].sort((a, b) => {
      const changesA = a.additions + a.deletions;
      const changesB = b.additions + b.deletions;
      if (changesB !== changesA) return changesB - changesA;
      return b.commits - a.commits;
    })
  );

  let limit = $state(5);
  let isExpanded = $state(false);

  let displayedRepos = $derived(isExpanded ? sortedRepos : sortedRepos.slice(0, limit));
  let hasMore = $derived(sortedRepos.length > limit);

  function fmtLoc(n) {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  }
</script>

{#if sortedRepos.length > 0}
<div class="card fade-up" style="animation-delay:140ms">
  <div class="header-row">
    <p class="section-title">Top Contributed Repositories</p>
    <InfoTooltip text="Repositories ranked by the volume of code changed (additions + deletions) based on available API data." />
  </div>

  <div class="repo-list">
    <div class="repo-list-header">
      <span class="col-name">Repository</span>
      <span class="col-stat changes-col">Changes</span>
      <span class="col-stat">Commits</span>
    </div>

    <div class="repo-items">
      {#each displayedRepos as item (item.repo)}
        <a 
          href={`https://github.com/${item.repo}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          class="repo-item"
          transition:slide={{duration: 300}}
        >
          <div class="col-name">
            <span class="repo-name">{item.repo}</span>
          </div>
          <div class="col-stat changes-col">
            <div class="change-bar-wrap" title={`+${item.additions} / -${item.deletions}`}>
              <span class="changes-total">{fmtLoc(item.additions + item.deletions)}</span>
              <div class="change-bar">
                {#if item.additions + item.deletions > 0}
                  <div class="add-bar" style="width: {(item.additions / (item.additions + item.deletions)) * 100}%"></div>
                  <div class="del-bar" style="width: {(item.deletions / (item.additions + item.deletions)) * 100}%"></div>
                {/if}
              </div>
            </div>
          </div>
          <div class="col-stat">
            <span class="commit-count">{fmtLoc(item.commits)}</span>
          </div>
        </a>
      {/each}
    </div>
  </div>

  {#if hasMore}
    <button class="expand-btn" onclick={() => isExpanded = !isExpanded}>
      {isExpanded ? 'Show Less' : `Show All (${sortedRepos.length})`}
      <svg class="chevron" class:flipped={isExpanded} width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  {/if}
</div>
{/if}

<style>
  .header-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .repo-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .repo-list-header {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-2);
    border-bottom: 1px solid var(--color-border-subtle);
    font-size: 11px;
    font-weight: 600;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .repo-items {
    display: flex;
    flex-direction: column;
  }

  .repo-item {
    display: flex;
    align-items: center;
    padding: var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
    text-decoration: none;
    transition: background var(--transition);
  }

  .repo-item:last-child {
    border-bottom: none;
  }

  .repo-item:hover {
    background: var(--color-surface-2);
  }

  .col-name {
    flex: 2;
    min-width: 0;
    padding-right: var(--space-2);
  }

  .col-stat {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    text-align: right;
  }

  .changes-col {
    flex: 1.5;
  }

  .repo-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    font-family: var(--font-mono);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .change-bar-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    width: 100%;
    max-width: 100px;
  }

  .changes-total {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-2);
    font-variant-numeric: tabular-nums;
  }

  .change-bar {
    display: flex;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background: var(--color-surface-3);
  }

  .add-bar {
    background: var(--color-success);
    height: 100%;
  }

  .del-bar {
    background: var(--color-danger);
    height: 100%;
  }

  .commit-count {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-2);
    font-variant-numeric: tabular-nums;
  }

  .expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    margin-top: var(--space-4);
    padding: var(--space-2);
    background: transparent;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    color: var(--color-text-2);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
  }

  .expand-btn:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .chevron {
    transition: transform var(--transition);
  }

  .chevron.flipped {
    transform: rotate(180deg);
  }
</style>
