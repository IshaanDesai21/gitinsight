/** All deterministic scoring — no ML, pure heuristics */

const MS_PER_DAY = 86_400_000;
const now = () => Date.now();

function daysSince(dateStr) {
  return Math.floor((now() - new Date(dateStr).getTime()) / MS_PER_DAY);
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function computeTopLanguages(repos) {
  const counts = {};
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100),
    }));
}

export function computeActivityTrend(repos) {
  if (!repos.length) return 'Inactive';
  const recent = repos.filter((r) => daysSince(r.updated_at) <= 90).length;
  const moderate = repos.filter((r) => daysSince(r.updated_at) > 90 && daysSince(r.updated_at) <= 365).length;
  if (recent / repos.length >= 0.25) return 'Active';
  if (moderate > 0 || recent > 0) return 'Declining';
  return 'Inactive';
}

export function computeActivityScore(repos, commitData) {
  const totalCommits = commitData.reduce((s, r) => s + r.commits, 0);
  const commitScore = clamp((totalCommits / 2000) * 100);
  const recent = repos.filter((r) => daysSince(r.updated_at) <= 90).length;
  const recencyScore = clamp((recent / Math.max(repos.length, 1)) * 100);
  const breadthScore = clamp((Math.log10(repos.length + 1) / Math.log10(51)) * 100);
  return clamp(commitScore * 0.4 + recencyScore * 0.3 + breadthScore * 0.3);
}

export function computeConsistencyScore(commitData) {
  if (!commitData.length) return 0;
  const counts = commitData.map((r) => r.commits);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  if (mean === 0) return 0;
  const variance = counts.reduce((s, c) => s + (c - mean) ** 2, 0) / counts.length;
  const cv = Math.sqrt(variance) / mean;
  return clamp((1 / (1 + cv)) * 100);
}

export function computeDiversityScore(repos) {
  const withLang = repos.filter((r) => r.language);
  const uniqueLangs = new Set(withLang.map((r) => r.language)).size;
  const langScore = clamp((uniqueLangs / 12) * 100);
  const coverageScore = clamp((withLang.length / Math.max(repos.length, 1)) * 100);
  return clamp(langScore * 0.6 + coverageScore * 0.4);
}

export function computeConcentrationScore(commitData) {
  if (!commitData.length) return 0;
  const total = commitData.reduce((s, r) => s + r.commits, 0);
  if (total === 0) return 50;
  const top1 = Math.max(...commitData.map((r) => r.commits));
  return clamp((1 - (top1 / total) ** 2) * 100);
}

export function computeOSSLevel(repos) {
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);
  const score = stars + forks * 2;
  if (score >= 500) return 'High';
  if (score >= 100) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Minimal';
}

export function generateSummary({ activityScore, diversityScore, trend, repoCount, topLanguages, ossLevel }) {
  const parts = [];

  if (activityScore >= 75) parts.push('This developer shows high activity');
  else if (activityScore >= 45) parts.push('This developer shows moderate activity');
  else parts.push('This developer shows low recent activity');

  if (repoCount <= 5) parts[0] += ' focused in a small set of repositories';
  else if (repoCount <= 25) parts[0] += ' across a moderate number of repositories';
  else parts[0] += ' spread across a large portfolio of repositories';

  if (trend === 'Active') parts.push('with strong recent contributions');
  else if (trend === 'Declining') parts.push('with contribution activity declining in recent months');
  else parts.push('with little to no recent contribution activity');

  if (diversityScore >= 60 && topLanguages.length >= 3) {
    parts.push(`and a diverse skill set spanning ${topLanguages.slice(0, 3).map((l) => l.language).join(', ')}`);
  } else if (topLanguages.length > 0) {
    parts.push(`primarily working in ${topLanguages[0].language}`);
  }

  if (ossLevel === 'High' || ossLevel === 'Medium') {
    parts.push('Open source engagement is notable based on community stars and forks');
  }

  return parts.join(', ') + '.';
}

export function buildAnalysis(profile, repos, commitData) {
  const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / MS_PER_DAY);
  const topLanguages = computeTopLanguages(repos);
  const trend = computeActivityTrend(repos);
  const activityScore = computeActivityScore(repos, commitData);
  const consistencyScore = computeConsistencyScore(commitData);
  const diversityScore = computeDiversityScore(repos);
  const concentrationScore = computeConcentrationScore(commitData);
  const ossLevel = computeOSSLevel(repos);
  const totalEstimatedCommits = commitData.reduce((s, r) => s + r.commits, 0);
  const avgCommitsPerRepo = commitData.length ? Math.round(totalEstimatedCommits / commitData.length) : 0;

  const n = Date.now();
  const oldVsRecent = {
    recent: repos.filter((r) => n - new Date(r.updated_at).getTime() <= 90 * MS_PER_DAY).length,
    moderate: repos.filter((r) => {
      const age = n - new Date(r.updated_at).getTime();
      return age > 90 * MS_PER_DAY && age <= 365 * MS_PER_DAY;
    }).length,
    old: repos.filter((r) => n - new Date(r.updated_at).getTime() > 365 * MS_PER_DAY).length,
  };

  return {
    profile: {
      username: profile.login,
      name: profile.name || null,
      avatar: profile.avatar_url,
      bio: profile.bio || null,
      followers: profile.followers,
      following: profile.following,
      repoCount: profile.public_repos,
      accountAgeDays,
      location: profile.location || null,
      blog: profile.blog || null,
      topLanguages,
      profileUrl: profile.html_url,
    },
    repos: repos.slice(0, 30).map((r) => ({
      name: r.name,
      description: r.description || null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language || null,
      updatedAt: r.updated_at,
      url: r.html_url,
      isForked: r.fork,
    })),
    repoInsights: {
      topByStars: [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5).map((r) => ({
        name: r.name, stars: r.stargazers_count, forks: r.forks_count,
        language: r.language || null, updatedAt: r.updated_at, url: r.html_url,
      })),
      topByActivity: [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5).map((r) => ({
        name: r.name, stars: r.stargazers_count, forks: r.forks_count,
        language: r.language || null, updatedAt: r.updated_at, url: r.html_url,
      })),
      oldVsRecent,
      commitData,
    },
    stats: {
      totalEstimatedCommits,
      avgCommitsPerRepo,
      activityTrend: trend,
      concentrationScore,
      ossLevel,
    },
    insights: {
      activityScore,
      consistencyScore,
      diversityScore,
      summary: generateSummary({ activityScore, diversityScore, trend, repoCount: repos.length, topLanguages, ossLevel }),
    },
  };
}

/**
 * Build 91-day heatmap grid from GitHub PushEvents.
 * Returns a flat array of {date, count, intensity} for 91 days oldest→newest,
 * plus week-grouped structure for rendering.
 */
export function buildHeatmapData(events) {
  const DAYS = 91;
  const nowMs = Date.now();
  const startMs = nowMs - DAYS * MS_PER_DAY;

  const countByDay = {};
  for (const event of events) {
    if (event.type !== 'PushEvent') continue;
    const eventMs = new Date(event.created_at).getTime();
    if (eventMs < startMs) continue;
    // Use local date string to avoid timezone drift
    const d = new Date(event.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const commits = event.payload?.commits?.length || 1;
    countByDay[key] = (countByDay[key] || 0) + commits;
  }

  // Build flat day array oldest→newest
  const flat = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(nowMs - i * MS_PER_DAY);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    flat.push({ date: key, count: countByDay[key] || 0, dow: d.getDay(), month: d.getMonth(), day: d.getDate() });
  }

  const max = Math.max(...flat.map(d => d.count), 1);

  // Group into weeks (Mon-based columns). Pad start with nulls.
  const firstDow = flat[0].dow; // 0=Sun
  const padCount = (firstDow + 6) % 7; // shift so Mon=0
  const padded = [...Array(padCount).fill(null), ...flat];
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month label positions: find first day of each month in flat array
  const monthLabels = [];
  let lastMonth = -1;
  flat.forEach((d, i) => {
    if (d.day === 1 || (i === 0 && d.month !== lastMonth)) {
      const weekIdx = Math.floor((i + padCount) / 7);
      if (weekIdx !== monthLabels[monthLabels.length - 1]?.weekIdx) {
        monthLabels.push({ weekIdx, label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month] });
      }
      lastMonth = d.month;
    }
  });

  return { flat, weeks, max, monthLabels, totalCommits: flat.reduce((s, d) => s + d.count, 0) };
}

/** Infer skill domains from a language breakdown array [{language, percentage}] */
export function inferSkillDomains(languages) {
  const langSet = new Set(languages.map(l => l.language));
  const DOMAINS = [
    { name: 'Frontend', icon: '🌐', langs: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'Sass', 'Less', 'CoffeeScript', 'Elm'] },
    { name: 'Backend', icon: '⚙️', langs: ['Python', 'Ruby', 'PHP', 'Java', 'Go', 'Rust', 'C#', 'Elixir', 'Scala', 'Haskell', 'Erlang', 'Perl', 'Lua'] },
    { name: 'Systems', icon: '🔧', langs: ['C', 'C++', 'Rust', 'Assembly', 'Zig', 'Fortran', 'Ada'] },
    { name: 'Mobile', icon: '📱', langs: ['Swift', 'Kotlin', 'Dart', 'Objective-C'] },
    { name: 'Data & ML', icon: '🧪', langs: ['Python', 'R', 'Julia', 'MATLAB', 'Jupyter Notebook', 'Roff'] },
    { name: 'DevOps', icon: '🚀', langs: ['Shell', 'Dockerfile', 'HCL', 'Makefile', 'PowerShell', 'Nix', 'Bash'] },
    { name: 'JVM', icon: '☕', langs: ['Java', 'Kotlin', 'Scala', 'Groovy', 'Clojure'] },
  ];

  return DOMAINS
    .map(domain => {
      const matches = domain.langs.filter(l => langSet.has(l));
      return { ...domain, matches, score: matches.length };
    })
    .filter(d => d.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
