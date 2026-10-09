/** Route params can arrive percent-encoded (e.g. Bangla slugs); decode them safely. */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
