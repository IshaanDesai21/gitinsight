<script>
  let { summary, username } = $props();
</script>

<div class="card summary-card fade-up" style="animation-delay:250ms">
  <div class="summary-header">
    <div class="summary-icon" aria-hidden="true">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>
      </svg>
    </div>
    <p class="label">Summary Report · @{username}</p>
  </div>
  <p class="summary-text">{summary}</p>
</div>

<style>
  .summary-card {
    border-color: var(--color-border);
    background: var(--color-surface-2);
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .summary-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--color-surface-3);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-2);
    flex-shrink: 0;
  }

  .summary-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-text-2);
  }
</style>
