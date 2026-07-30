const CLOCK_SKEW_SECONDS = 60;

export type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string | string[];
  email?: string;
  [key: string]: unknown;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function getJwtExpiresInSeconds(accessToken: string): number | null {
  const payload = decodeJwtPayload(accessToken);
  if (typeof payload?.exp !== "number") {
    return null;
  }

  const seconds = payload.exp - Math.floor(Date.now() / 1000);
  return seconds > 0 ? seconds : null;
}

/**
 * Soft JWT validation for edge/proxy gates.
 * Checks structure + expiry only (no JWKS signature verify).
 */
export function isAccessTokenValid(
  accessToken: string,
  clockSkewSeconds = CLOCK_SKEW_SECONDS
): boolean {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return false;
  }

  if (typeof payload.exp !== "number") {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp + clockSkewSeconds > now;
}
