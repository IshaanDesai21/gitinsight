<script>
  let { error = '' } = $props();
</script>

<div class="error-banner fade-up" role="alert">
  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
  </svg>
  <span>{error}</span>
</div>

<style>
  .error-banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: rgba(245, 101, 101, 0.08);
    border: 1px solid rgba(245, 101, 101, 0.25);
    border-radius: var(--radius);
    color: var(--color-danger);
    font-size: 14px;
    font-weight: 500;
  }

  svg { flex-shrink: 0; }
</style>
