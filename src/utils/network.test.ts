import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIP,
  formatASN,
  formatCoordinates,
  extractClientIPFromHeaders,
  getCountryFlag,
  determineDualStack,
} from './network.ts';

test('validateIP correctly identifies IPv4 addresses', () => {
  const publicV4 = validateIP('8.8.8.8');
  assert.equal(publicV4.valid, true);
  assert.equal(publicV4.version, 'IPv4');
  assert.equal(publicV4.isPrivate, false);
  assert.equal(publicV4.isLoopback, false);

  const loopbackV4 = validateIP('127.0.0.1');
  assert.equal(loopbackV4.valid, true);
  assert.equal(loopbackV4.version, 'IPv4');
  assert.equal(loopbackV4.isLoopback, true);

  const privateV4 = validateIP('192.168.1.1');
  assert.equal(privateV4.valid, true);
  assert.equal(privateV4.version, 'IPv4');
  assert.equal(privateV4.isPrivate, true);

  const invalidV4 = validateIP('999.1.2.3');
  assert.equal(invalidV4.valid, false);
});

test('validateIP correctly identifies IPv6 addresses', () => {
  const v6 = validateIP('2001:4860:4860::8888');
  assert.equal(v6.valid, true);
  assert.equal(v6.version, 'IPv6');
  assert.equal(v6.isLoopback, false);

  const loopbackV6 = validateIP('::1');
  assert.equal(loopbackV6.valid, true);
  assert.equal(loopbackV6.version, 'IPv6');
  assert.equal(loopbackV6.isLoopback, true);

  const invalid = validateIP('invalid:ip::address::extra');
  assert.equal(invalid.valid, false);
});

test('formatASN parses raw ASN text correctly', () => {
  const parsed = formatASN('AS15169 Google LLC');
  assert.equal(parsed.asn, 'AS15169');
  assert.equal(parsed.org, 'Google LLC');

  const numberOnly = formatASN('13335');
  assert.equal(numberOnly.asn, 'AS13335');

  const empty = formatASN(undefined);
  assert.equal(empty.asn, 'Unknown ASN');
});

test('formatCoordinates formats lat and lon with cardinal directions', () => {
  const formatted = formatCoordinates(37.7749, -122.4194);
  assert.equal(formatted, '37.7749° N, 122.4194° W');

  const southEast = formatCoordinates(-33.8688, 151.2093);
  assert.equal(southEast, '33.8688° S, 151.2093° E');
});

test('extractClientIPFromHeaders prioritizes CF-Connecting-IP and X-Forwarded-For', () => {
  const cfHeaders = {
    'cf-connecting-ip': '1.1.1.1',
    'x-forwarded-for': '2.2.2.2, 3.3.3.3',
  };
  assert.equal(extractClientIPFromHeaders(cfHeaders), '1.1.1.1');

  const xffHeaders = {
    'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
  };
  assert.equal(extractClientIPFromHeaders(xffHeaders), '203.0.113.195');

  const fallback = extractClientIPFromHeaders({}, '::ffff:198.51.100.1');
  assert.equal(fallback, '198.51.100.1');
});

test('getCountryFlag outputs appropriate unicode flag emojis', () => {
  assert.equal(getCountryFlag('US'), '🇺🇸');
  assert.equal(getCountryFlag('DE'), '🇩🇪');
  assert.equal(getCountryFlag('JP'), '🇯🇵');
  assert.equal(getCountryFlag(''), '🌐');
});

test('determineDualStack correctly identifies IPv4 and IPv6 pairs', () => {
  const result1 = determineDualStack('8.8.8.8', null, '2001:4860:4860::8888');
  assert.equal(result1.ipv4, '8.8.8.8');
  assert.equal(result1.ipv6, '2001:4860:4860::8888');

  const result2 = determineDualStack('2606:4700:4700::1111', '1.1.1.1', null);
  assert.equal(result2.ipv4, '1.1.1.1');
  assert.equal(result2.ipv6, '2606:4700:4700::1111');

  const v4Only = determineDualStack('192.168.1.1', null, null);
  assert.equal(v4Only.ipv4, '192.168.1.1');
  assert.equal(v4Only.ipv6, null);
});
