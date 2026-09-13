const NET_ID_RE = /^[a-z]{2}\d{4}$/;

export function normalizeNetId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidNetId(raw: string): boolean {
  return NET_ID_RE.test(normalizeNetId(raw));
}
