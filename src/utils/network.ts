/**
 * Pure network utility functions for IP validation, ASN formatting,
 * coordinate formatting, and diagnostic calculations.
 */

export interface IPValidationResult {
  valid: boolean;
  version?: 'IPv4' | 'IPv6';
  isPrivate?: boolean;
  isLoopback?: boolean;
}

/**
 * Validates if a string is a valid IPv4 or IPv6 address.
 */
export function validateIP(rawIp: string): IPValidationResult {
  if (!rawIp || typeof rawIp !== 'string') {
    return { valid: false };
  }

  const trimmed = rawIp.trim();

  // IPv4 regex (0.0.0.0 to 255.255.255.255)
  const ipv4Pattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  if (ipv4Pattern.test(trimmed)) {
    const parts = trimmed.split('.').map(Number);
    if (parts.length !== 4) return { valid: false };

    // Check for loopback (127.0.0.0/8)
    const isLoopback = parts[0] === 127;

    // Check for RFC 1918 private ranges:
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const isPrivate =
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168);

    return {
      valid: true,
      version: 'IPv4',
      isPrivate,
      isLoopback,
    };
  }

  // IPv6 regex
  const ipv6Pattern =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  if (ipv6Pattern.test(trimmed)) {
    const isLoopback = trimmed === '::1';
    const isPrivate =
      trimmed.toLowerCase().startsWith('fc') ||
      trimmed.toLowerCase().startsWith('fd') ||
      trimmed.toLowerCase().startsWith('fe80');

    return {
      valid: true,
      version: 'IPv6',
      isPrivate,
      isLoopback,
    };
  }

  return { valid: false };
}

/**
 * Normalizes and formats ASN information.
 * E.g. "AS15169 Google LLC" -> { asn: "AS15169", org: "Google LLC" }
 */
export function formatASN(rawASN: string | undefined): { asn: string; org: string } {
  if (!rawASN) {
    return { asn: 'Unknown ASN', org: 'Unknown Organization' };
  }

  const trimmed = rawASN.trim();
  const match = trimmed.match(/^(AS\d+)\s*(.*)$/i);
  if (match) {
    const asn = match[1].toUpperCase();
    const org = match[2].trim() || 'Autonomous System';
    return { asn, org };
  }

  if (/^\d+$/.test(trimmed)) {
    return { asn: `AS${trimmed}`, org: 'Autonomous System' };
  }

  return { asn: 'AS-N/A', org: trimmed };
}

/**
 * Formats latitude and longitude coordinates into a human-readable string.
 */
export function formatCoordinates(lat: number | undefined, lon: number | undefined): string {
  if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
    return '0.0000° N, 0.0000° E';
  }

  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

/**
 * Extracts client IP from HTTP proxy request headers (e.g. X-Forwarded-For, CF-Connecting-IP).
 */
export function extractClientIPFromHeaders(
  headers: Record<string, string | string[] | undefined>,
  remoteAddress?: string
): string {
  // Cloudflare header
  const cfIp = headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }

  // True-Client-IP header
  const trueClientIp = headers['true-client-ip'];
  if (typeof trueClientIp === 'string' && trueClientIp.trim()) {
    return trueClientIp.trim();
  }

  // Standard X-Forwarded-For header (comma separated)
  const forwardedFor = headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    const clientCandidate = forwardedFor.split(',')[0].trim();
    if (clientCandidate) {
      return clientCandidate;
    }
  } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    const candidate = forwardedFor[0].split(',')[0].trim();
    if (candidate) return candidate;
  }

  // X-Real-IP header
  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  if (remoteAddress) {
    // Strip IPv6 prefix if mapped IPv4 (e.g. ::ffff:192.168.1.1)
    if (remoteAddress.startsWith('::ffff:')) {
      return remoteAddress.slice(7);
    }
    return remoteAddress;
  }

  return '127.0.0.1';
}

/**
 * Generates flag emoji from 2-letter ISO country code.
 */
export function getCountryFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Resolves dual-stack IPv4 and IPv6 pairing given primary and secondary candidates.
 */
export function determineDualStack(
  primaryIp: string,
  extraV4?: string | null,
  extraV6?: string | null
): { ipv4: string | null; ipv6: string | null } {
  let ipv4: string | null = null;
  let ipv6: string | null = null;

  const primaryValidation = validateIP(primaryIp);
  if (primaryValidation.valid) {
    if (primaryValidation.version === 'IPv4') {
      ipv4 = primaryIp.trim();
    } else {
      ipv6 = primaryIp.trim();
    }
  }

  if (extraV4 && !ipv4) {
    const v4Val = validateIP(extraV4);
    if (v4Val.valid && v4Val.version === 'IPv4') {
      ipv4 = extraV4.trim();
    }
  }

  if (extraV6 && !ipv6) {
    const v6Val = validateIP(extraV6);
    if (v6Val.valid && v6Val.version === 'IPv6') {
      ipv6 = extraV6.trim();
    }
  }

  return { ipv4, ipv6 };
}

