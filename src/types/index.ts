export interface NetworkData {
  ip: string;
  version: 'IPv4' | 'IPv6';
  ipv4?: string;
  ipv6?: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  flag: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  asn: string;
  org: string;
  is_private: boolean;
  is_loopback: boolean;
  query_time_ms: number;
}

export interface DiagnosticsData {
  client_ip: string;
  protocol: string;
  tls_version?: string;
  user_agent: string;
  accept_language: string;
  headers: Record<string, string>;
  server_time: string;
  server_region: string;
  uptime_seconds: number;
}

export interface PingResult {
  latencyMs: number;
  timestamp: number;
  status: 'nominal' | 'slow' | 'offline';
}
