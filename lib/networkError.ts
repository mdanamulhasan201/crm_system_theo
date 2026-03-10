/**
 * Detect if an error is a network/server unreachable error
 * (e.g. backend down, DNS failure, CORS, connection refused).
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; cause?: unknown };
  if (e.code === 'ERR_NETWORK' || e.code === 'ERR_NAME_NOT_RESOLVED') return true;
  if (typeof e.message === 'string' && /network error|failed to fetch|load failed/i.test(e.message)) return true;
  if (e.cause && typeof e.cause === 'object' && (e.cause as { code?: string }).code === 'ERR_NAME_NOT_RESOLVED') return true;
  return false;
}

export const SERVER_UNAVAILABLE_PATH = '/server-unavailable';
