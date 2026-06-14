<script>
  // Skeleton for loading states — mirrors the results layout
</script>

<div class="skeleton-wrap fade-up">
  <!-- Profile skeleton -->
  <div class="card">
    <div class="sk-profile-top">
      <div class="skeleton sk-avatar"></div>
      <div class="sk-identity">
        <div class="skeleton sk-line" style="width:140px;height:20px"></div>
        <div class="skeleton sk-line" style="width:100px;height:14px;margin-top:6px"></div>
        <div class="skeleton sk-line" style="width:200px;height:13px;margin-top:8px"></div>
      </div>
    </div>
    <hr class="divider" />
    <div style="display:flex;gap:24px">
      {#each [80, 60, 55, 90] as w}
        <div>
          <div class="skeleton sk-line" style="width:{w}px;height:22px"></div>
          <div class="skeleton sk-line" style="width:50px;height:10px;margin-top:6px"></div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Repo skeleton -->
  <div class="card">
    <div class="skeleton sk-line" style="width:140px;height:11px;margin-bottom:20px"></div>
    {#each [1,2,3,4,5] as _}
      <div class="sk-repo-row">
        <div class="skeleton sk-line" style="width:60%;height:14px"></div>
        <div class="skeleton sk-line" style="width:80px;height:11px;margin-top:5px"></div>
      </div>
    {/each}
  </div>

  <!-- Stats skeleton -->
  <div class="card">
    <div class="skeleton sk-line" style="width:160px;height:11px;margin-bottom:20px"></div>
    <div style="display:flex;gap:24px">
      {#each [1,2,3] as _}
        <div>
          <div class="skeleton sk-line" style="width:60px;height:26px"></div>
          <div class="skeleton sk-line" style="width:80px;height:10px;margin-top:6px"></div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Metrics skeleton -->
  <div class="card">
    <div class="skeleton sk-line" style="width:150px;height:11px;margin-bottom:20px"></div>
    {#each [1,2,3] as _}
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <div class="skeleton sk-line" style="width:120px;height:13px"></div>
          <div class="skeleton sk-line" style="width:40px;height:13px"></div>
        </div>
        <div class="skeleton sk-line" style="width:100%;height:6px;border-radius:100px"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  .skeleton-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .sk-profile-top {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .sk-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sk-identity { flex: 1; }

  .sk-line { border-radius: var(--radius-sm); }

  .sk-repo-row {
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .sk-repo-row:last-child { border-bottom: none; }
</style>
