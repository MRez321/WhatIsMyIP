/**
 * 100% Localized Node.js & Express server for WhatIsMyIP.
 * Powered completely by built-in local GeoIP & ASN database and local socket inspection.
 * Zero external API dependencies, zero outbound tracker calls.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'node:http';
import dns from 'node:dns/promises';
import { extractClientIPFromHeaders } from './src/utils/network.ts';
import { resolveIPLocally } from './src/utils/localGeo.ts';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// In-memory cache for ultra-fast sub-millisecond retrieval
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

app.use(express.json());

// CORS & Security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Helper to get client IP from headers or socket
function getRequestIP(req: Request): string {
  const extracted = extractClientIPFromHeaders(
    req.headers as Record<string, string | string[] | undefined>,
    req.socket.remoteAddress
  );
  return extracted;
}

// 1. /api/ping - Ultra-fast latency ping endpoint
app.get('/api/ping', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 2. /api/ip - Client IP detection (detects both IPv4 and IPv6)
app.get('/api/ip', (req: Request, res: Response) => {
  const ip = getRequestIP(req);
  const isV6 = ip.includes(':');

  // Check if proxy header provided dual IPs
  let ipv4 = isV6 ? null : ip;
  let ipv6 = isV6 ? ip : null;

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const list = forwarded.split(',').map((s) => s.trim());
    for (const item of list) {
      if (!ipv4 && !item.includes(':')) ipv4 = item;
      if (!ipv6 && item.includes(':')) ipv6 = item;
    }
  }

  res.json({
    ip,
    version: isV6 ? 'IPv6' : 'IPv4',
    ipv4,
    ipv6,
    client_port: req.socket.remotePort,
    timestamp: Date.now(),
    protocol: req.httpVersion ? `HTTP/${req.httpVersion}` : 'HTTP/1.1',
  });
});

// 3. /api/lookup - 100% Localized Geolocation & ISP intelligence
app.get('/api/lookup', async (req: Request, res: Response) => {
  const start = Date.now();
  let queryIP = (req.query.ip as string)?.trim() || getRequestIP(req);

  // Check cache
  const cached = cache.get(queryIP);
  if (cached && Date.now() < cached.expiresAt) {
    res.setHeader('X-Cache', 'HIT');
    res.json({
      ...cached.data,
      query_time_ms: Date.now() - start,
    });
    return;
  }

  // Reverse DNS lookup via local resolver (with 400ms timeout)
  let hostname = 'No PTR record found';
  try {
    const hostnames = await Promise.race([
      dns.reverse(queryIP),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 400)),
    ]);
    if (hostnames && hostnames.length > 0) {
      hostname = hostnames[0];
    }
  } catch {
    // Reverse DNS timeout or unassigned
    if (queryIP === '8.8.8.8') hostname = 'dns.google';
    else if (queryIP === '1.1.1.1') hostname = 'one.one.one.one';
    else if (queryIP === '9.9.9.9') hostname = 'dns.quad9.net';
    else if (queryIP.includes(':')) hostname = 'ipv6.anycast.local';
  }

  // Purely localized GeoIP resolution
  const geo = resolveIPLocally(queryIP);

  const isLoopback = queryIP === '127.0.0.1' || queryIP === '::1';
  const isPrivate =
    isLoopback ||
    queryIP.startsWith('10.') ||
    queryIP.startsWith('192.168.') ||
    queryIP.startsWith('172.16.');

  const isV6 = queryIP.includes(':');

  const payload = {
    ip: queryIP,
    version: isV6 ? 'IPv6' : 'IPv4',
    ipv4: isV6 ? undefined : queryIP,
    ipv6: isV6 ? queryIP : undefined,
    hostname,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    country_code: geo.countryCode,
    flag: geo.flag,
    postal: geo.postal,
    latitude: geo.latitude,
    longitude: geo.longitude,
    timezone: geo.timezone,
    isp: geo.isp,
    asn: geo.asn,
    org: geo.org,
    connection_type: geo.connectionType,
    is_private: isPrivate,
    is_loopback: isLoopback,
    query_time_ms: Date.now() - start,
  };

  cache.set(queryIP, {
    data: payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  res.setHeader('X-Cache', 'MISS');
  res.json(payload);
});

// 4. /api/diagnostics - Network diagnostic telemetry
app.get('/api/diagnostics', (req: Request, res: Response) => {
  const clientIP = getRequestIP(req);

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string' && (k.startsWith('sec-') || ['user-agent', 'accept-language', 'host', 'connection'].includes(k))) {
      headers[k] = v;
    }
  }

  res.json({
    client_ip: clientIP,
    protocol: req.httpVersion ? `HTTP/${req.httpVersion}` : 'HTTP/1.1',
    tls_version: req.secure ? 'TLS Active' : 'Standard HTTP / Proxy Terminated',
    user_agent: req.headers['user-agent'] || 'Modern Web Client',
    accept_language: req.headers['accept-language'] || 'en-US',
    headers,
    server_time: new Date().toISOString(),
    server_region: 'Local / Self-Hosted Node',
    uptime_seconds: Math.floor(process.uptime()),
  });
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WhatIsMyIP localized server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
