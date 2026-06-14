/** GitHub language → color mapping (subset of github-linguist palette) */
export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Lua: '#000080',
  R: '#198CE7',
  MATLAB: '#e16737',
  Vim: '#199f4b',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dockerfile: '#384d54',
  Makefile: '#427819',
};

export function getLangColor(lang) {
  return LANGUAGE_COLORS[lang] || '#8b8b8b';
}

/** Format a date as "X days/months/years ago" */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/** Format account age from days */
export function formatAge(days) {
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months <= 1 ? '1 month' : `${months} months`;
  }
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (months === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${years}y ${months}m`;
}

/** Format large numbers: 1200 → 1.2k */
export function formatNum(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Trend badge color */
export function trendColor(trend) {
  if (trend === 'Active') return 'var(--color-success)';
  if (trend === 'Declining') return 'var(--color-warning)';
  return 'var(--color-muted)';
}

/** OSS level color */
export function ossColor(level) {
  if (level === 'High') return 'var(--color-success)';
  if (level === 'Medium') return 'var(--color-accent)';
  if (level === 'Low') return 'var(--color-warning)';
  return 'var(--color-muted)';
}
