export function getInitials(name, fallback = '?') {
  return (name || fallback)
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
