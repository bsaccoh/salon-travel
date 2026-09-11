import crypto from 'crypto';

/**
 * Convert a string to a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Generate a unique slug by checking an existence predicate.
 * If collision occurs, appends a short alphanumeric suffix.
 */
export async function generateUniqueSlug(
  baseName: string,
  isSlugTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugify(baseName) || 'item';
  let slug = baseSlug;

  const exists = await isSlugTaken(slug);
  if (!exists) {
    return slug;
  }

  // Collision detected — append random 4-char suffix
  let attempts = 0;
  while (attempts < 5) {
    const suffix = crypto.randomBytes(2).toString('hex');
    slug = `${baseSlug}-${suffix}`;
    const taken = await isSlugTaken(slug);
    if (!taken) {
      return slug;
    }
    attempts++;
  }

  // Fallback: timestamp suffix
  return `${baseSlug}-${Date.now().toString(36)}`;
}
