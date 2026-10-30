// Shared helpers used across components.

// Normalises a skill name so "Vue.js", "VueJS" and "vuejs" all match,
// and "JavaScript" matches "Javascript".
export function normalizeSkill(skill) {
  return String(skill || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, '');
}

// Prepends Vite's BASE_URL (needed on GitHub Pages) to public asset paths.
export function getAssetPath(path) {
  if (!path) return '';
  const base = import.meta.env.BASE_URL || '';
  if (/^https?:\/\//i.test(path) || (base && path.startsWith(base))) return path;
  return base + (path.startsWith('/') ? path.slice(1) : path);
}

// Prefixes certificate images with the ImageKit CDN base when configured.
export function getImageKitPrefixed(path) {
  const base = import.meta.env.VITE_IMAGEKIT_BASE || '';
  if (!base || !path || /^https?:\/\//i.test(path)) return path;
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  return normalizedBase + (path.startsWith('/') ? path.slice(1) : path);
}

export function certImageUrl(path) {
  return getAssetPath(getImageKitPrefixed(path));
}

export function formatDuration(duration) {
  if (!duration) return '';
  const { start, end } = duration;
  if (start && end && start === end) return start;
  return [start, end].filter(Boolean).join(' — ');
}
