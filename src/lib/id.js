export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
