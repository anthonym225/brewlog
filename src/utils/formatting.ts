// T04: Date and number formatting utilities

/**
 * Formats an ISO 8601 date string into a human-readable format.
 * Example: "2025-01-15T12:00:00.000Z" -> "Jan 15, 2025"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Formats a rating number to one decimal place, or returns a dash for null.
 * Example: 8.5 -> "8.5", 8 -> "8.0", null -> "\u2014"
 */
export function formatRating(rating: number | null): string {
  if (rating == null) {
    return '\u2014';
  }
  return rating.toFixed(1);
}

/**
 * Formats a rating as a fraction out of 10, or returns a dash for null.
 * Example: 8.5 -> "8.5/10", null -> "\u2014"
 */
export function formatRatingFraction(rating: number | null): string {
  if (rating == null) {
    return '\u2014';
  }
  return `${rating.toFixed(1)}/10`;
}
