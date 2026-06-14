<script>
  import { getLangColor, formatNum, formatAge } from '$lib/utils.js';

  let { profile } = $props();
</script>

<div class="card profile-card fade-up">
  <div class="profile-top">
    <img class="avatar" src={profile.avatar} alt="{profile.username} avatar" width="72" height="72" />
    <div class="profile-identity">
      {#if profile.name}
        <h2 class="profile-name">{profile.name}</h2>
      {/if}
      <a class="profile-username" href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
        @{profile.username}
      </a>
      {#if profile.bio}
        <p class="profile-bio">{profile.bio}</p>
      {/if}
    </div>
  </div>

  <hr class="divider" />

  <div class="stats-row">
    <div class="stat-item">
      <span class="stat-value">{formatNum(profile.followers)}</span>
      <span class="label">Followers</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{formatNum(profile.following)}</span>
      <span class="label">Following</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{profile.repoCount}</span>
      <span class="label">Repos</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{formatAge(profile.accountAgeDays)}</span>
      <span class="label">Account age</span>
    </div>
  </div>

  {#if profile.topLanguages.length > 0}
    <hr class="divider" />
    <div class="lang-section">
      <p class="label" style="margin-bottom: 10px;">Top Languages</p>
      <div class="lang-pills">
        {#each profile.topLanguages as lang}
          <span class="pill">
            <span class="pill-dot" style="background:{getLangColor(lang.language)}"></span>
            {lang.language}
            <span style="color:var(--color-muted)">{lang.percentage}%</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}

  {#if profile.location || profile.blog}
    <div class="profile-meta">
      {#if profile.location}
        <span class="meta-item">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {profile.location}
        </span>
      {/if}
      {#if profile.blog}
        <a class="meta-item meta-link" href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
          </svg>
          {profile.blog.replace(/^https?:\/\//, '')}
        </a>
      {/if}
    </div>
  {/if}
</div>

<style>
  .profile-card { container-type: inline-size; }

  .profile-top {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    flex-shrink: 0;
    object-fit: cover;
  }

  .profile-identity {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-username {
    font-size: 14px;
    color: var(--color-accent);
    font-family: var(--font-mono);
  }

  .profile-username:hover { text-decoration: underline; }

  .profile-bio {
    margin-top: var(--space-2);
    font-size: 13px;
    color: var(--color-text-2);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  @container (max-width: 360px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .lang-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: var(--color-text-2);
  }

  .meta-link:hover { color: var(--color-accent); }
</style>
