<script>
  let { text } = $props();
  let visible = $state(false);

  function show() { visible = true; }
  function hide() { visible = false; }
</script>

<span class="tooltip-wrap">
  <button
    class="info-btn"
    type="button"
    aria-label="More information"
    onmouseenter={show}
    onmouseleave={hide}
    onfocus={show}
    onblur={hide}
    tabindex="0"
  >
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path stroke-linecap="round" d="M12 16v-4"/>
      <path stroke-linecap="round" d="M12 8h.01"/>
    </svg>
  </button>

  {#if visible}
    <div class="tooltip-box" role="tooltip">
      {text}
    </div>
  {/if}
</span>

<style>
  .tooltip-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .info-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-muted);
    padding: 2px;
    border-radius: 50%;
    transition: color var(--transition);
    line-height: 1;
    cursor: default;
  }

  .info-btn:hover,
  .info-btn:focus-visible {
    color: var(--color-text-2);
    outline: none;
  }

  .tooltip-box {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    background: var(--color-surface-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-2);
    white-space: normal;
    width: 220px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    pointer-events: none;
    animation: tooltipIn 100ms ease;
  }

  /* Arrow */
  .tooltip-box::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--color-border);
  }

  /* Prevent overflow on left edge */
  @media (max-width: 480px) {
    .tooltip-box {
      left: auto;
      right: 0;
      transform: none;
    }
    .tooltip-box::after {
      left: auto;
      right: 10px;
      transform: none;
    }
  }

  @keyframes tooltipIn {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
