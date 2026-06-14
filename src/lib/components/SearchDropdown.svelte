<script>
  import { searchUsers } from '$lib/github.js';

  let { onSelect, placeholder = 'Enter GitHub username, name, or email' } = $props();

  let query = $state('');
  let results = $state([]);
  let loading = $state(false);
  let open = $state(false);
  let activeIdx = $state(-1);
  let debounceTimer = null;
  let containerEl;

  function debounce(fn, ms) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  async function handleInput(e) {
    query = e.target.value;
    activeIdx = -1;
    if (query.trim().length < 2) {
      results = [];
      open = false;
      return;
    }
    loading = true;
    open = true;
    debounce(async () => {
      results = await searchUsers(query);
      loading = false;
    }, 320);
  }

  function select(user) {
    query = user.login;
    results = [];
    open = false;
    activeIdx = -1;
    onSelect(user.login);
  }

  function handleKeydown(e) {
    if (!open || !results.length) {
      if (e.key === 'Enter') onSelect(query.trim());
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) select(results[activeIdx]);
      else onSelect(query.trim());
    } else if (e.key === 'Escape') {
      open = false;
      activeIdx = -1;
    }
  }

  function handleBlur(e) {
    // Only close if focus leaves the whole container
    setTimeout(() => {
      if (!containerEl?.contains(document.activeElement)) {
        open = false;
        activeIdx = -1;
      }
    }, 150);
  }

  export function getValue() { return query; }
  export function setValue(v) { query = v; }
  export function clear() { query = ''; results = []; open = false; }
</script>

<div class="search-autocomplete" bind:this={containerEl}>
  <div class="search-input-wrap">
    <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
    </svg>
    <input
      class="input search-input"
      type="text"
      {placeholder}
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={handleBlur}
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
      autocomplete="off"
      aria-label="Search GitHub users by username, name, or email"
      aria-expanded={open}
      aria-autocomplete="list"
      role="combobox"
    />
    {#if loading}
      <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    {/if}
  </div>

  {#if open && (results.length > 0 || loading)}
    <ul class="dropdown" role="listbox" aria-label="GitHub user suggestions">
      {#if loading && results.length === 0}
        <li class="dropdown-loading">
          <span>Searching…</span>
        </li>
      {/if}
      {#each results as user, i}
        <li
          class="dropdown-item"
          class:active={i === activeIdx}
          role="option"
          aria-selected={i === activeIdx}
          onmousedown={() => select(user)}
        >
          <img class="user-avatar" src={user.avatar} alt="" width="28" height="28" loading="lazy" />
          <div class="user-info">
            <span class="user-login">{user.login}</span>
          </div>
          {#if user.type === 'Organization'}
            <span class="user-type">Org</span>
          {/if}
        </li>
      {/each}
      {#if !loading && results.length === 0}
        <li class="dropdown-empty">No users found for "<strong>{query}</strong>"</li>
      {/if}
    </ul>
  {/if}
</div>

<style>
  .search-autocomplete {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--color-muted);
    pointer-events: none;
    flex-shrink: 0;
  }

  .search-input {
    padding-left: 38px !important;
    padding-right: 36px !important;
    width: 100%;
  }

  .spinner {
    position: absolute;
    right: 12px;
    color: var(--color-muted);
    animation: spin 800ms linear infinite;
    pointer-events: none;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 300;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    list-style: none;
    overflow: hidden;
    animation: dropIn 120ms ease;
    max-height: 320px;
    overflow-y: auto;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 10px 14px;
    cursor: pointer;
    transition: background var(--transition);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .dropdown-item:last-child { border-bottom: none; }
  .dropdown-item:hover,
  .dropdown-item.active { background: var(--color-surface-2); }

  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
    object-fit: cover;
  }

  .user-info { flex: 1; min-width: 0; }

  .user-login {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    font-family: var(--font-mono);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-type {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-muted);
    background: var(--color-surface-3);
    border: 1px solid var(--color-border);
    padding: 1px 6px;
    border-radius: 100px;
    flex-shrink: 0;
  }

  .dropdown-loading,
  .dropdown-empty {
    padding: 12px 14px;
    font-size: 13px;
    color: var(--color-muted);
  }
</style>
