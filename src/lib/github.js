/**
 * GitHub REST API — called directly from the browser.
 * Uses sessionStorage-persisted PAT if available.
 */

const BASE = 'https://api.github.com';

function getHeaders() {
  const token = typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('gh_token')
    : null;
  
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Parse username from URL or bare username */
export function parseUsername(input) {
  const trimmed = input.trim().replace(/\/$/, '');
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(trimmed)) return trimmed;
  return null;
}

async function ghFetch(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const full = qs ? `${url}?${qs}` : url;
  const res = await fetch(full, { headers: getHeaders() });
  if (!res.ok) {
    const err = new Error(`GitHub API error ${res.status}`);
    err.status = res.status;
    err.response = res;
    throw err;
  }
  return { data: await res.json(), headers: res.headers };
}

export async function getProfile(username) {
  const { data } = await ghFetch(`${BASE}/users/${username}`);
  return data;
}

export async function getRepos(username) {
  const allRepos = [];
  let page = 1;
  while (true) {
    const { data } = await ghFetch(`${BASE}/users/${username}/repos`, {
      per_page: 100, sort: 'updated', direction: 'desc', page,
    });
    allRepos.push(...data);
    if (data.length < 100 || allRepos.length >= 300) break;
    page++;
  }
  return allRepos;
}

/** Commit count via Link header trick — 1 fetch per repo */
export async function getCommitCount(owner, repo) {
  try {
    const url = `${BASE}/repos/${owner}/${repo}/commits`;
    const qs = new URLSearchParams({ per_page: 1 }).toString();
    const res = await fetch(`${url}?${qs}`, { headers: getHeaders() });
    if (!res.ok) return 0;
    const link = res.headers.get('link');
    if (!link) {
      const data = await res.json();
      return data.length;
    }
    const match = link.match(/[?&]page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : 1;
  } catch {
    return 0;
  }
}

export async function getCommitCounts(username, repos, limit = 10) {
  const top = repos.slice(0, limit);
  const counts = await Promise.all(top.map((r) => getCommitCount(username, r.name)));
  return top.map((r, i) => ({ name: r.name, commits: counts[i] }));
}

/** Search GitHub users by username, full name, or public email */
export async function searchUsers(query, limit = 7) {
  if (!query || query.trim().length < 2) return [];
  try {
    const { data } = await ghFetch(`${BASE}/search/users`, {
      q: query.trim(), per_page: limit,
    });
    return (data.items || []).map((u) => ({
      login: u.login, avatar: u.avatar_url, type: u.type,
    }));
  } catch { return []; }
}

/** Fetch user's recent public events (up to 200 events ≈ 90 days) */
export async function getEvents(username) {
  try {
    const [p1, p2] = await Promise.all([
      ghFetch(`${BASE}/users/${username}/events`, { per_page: 100, page: 1 }).then(r => r.data).catch(() => []),
      ghFetch(`${BASE}/users/${username}/events`, { per_page: 100, page: 2 }).then(r => r.data).catch(() => []),
    ]);
    return [...p1, ...p2];
  } catch { return []; }
}

/** Fetch language byte counts from top non-fork repos */
export async function getLanguageBreakdown(username, repos, limit = 8) {
  const ownRepos = repos.filter(r => !r.fork).slice(0, limit);
  const results = await Promise.all(
    ownRepos.map(repo =>
      ghFetch(`${BASE}/repos/${username}/${repo.name}/languages`)
        .then(r => r.data).catch(() => ({}))
    )
  );
  const totals = {};
  for (const langMap of results) {
    for (const [lang, bytes] of Object.entries(langMap)) {
      totals[lang] = (totals[lang] || 0) + bytes;
    }
  }
  const totalBytes = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([language, bytes]) => ({
      language, bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
    }));
}

/** Fetch per-user additions/deletions from contributor stats (top repos) */
export async function getContributorStats(username, repos, limit = 4) {
  const ownRepos = repos.filter(r => !r.fork).slice(0, limit);

  async function fetchWithRetry(repoName) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(
          `${BASE}/repos/${username}/${repoName}/stats/contributors`,
          { headers: getHeaders() }
        );
        if (res.status === 202) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data)) return null;
        const entry = data.find(c =>
          c.author?.login?.toLowerCase() === username.toLowerCase()
        );
        if (!entry) return null;
        return {
          repo: repoName,
          additions: entry.weeks.reduce((s, w) => s + (w.a || 0), 0),
          deletions: entry.weeks.reduce((s, w) => s + (w.d || 0), 0),
          commits: entry.total,
        };
      } catch { return null; }
    }
    return null;
  }

  const results = await Promise.all(ownRepos.map(r => fetchWithRetry(r.name)));
  return results.filter(Boolean);
}
