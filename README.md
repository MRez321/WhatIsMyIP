# TraceIP - Network & Geolocation Intelligence Service

TraceIP is a high-performance, 100% localized IP detection, geolocation mapping, and network intelligence platform. It features an ultra-lean Go backend, a modern React single-page dashboard styled in `#fbb12f` (warm golden amber) with dark/light theme switching, and sub-millisecond edge lookups with zero external API dependencies.

## Key Highlights

- **100% Localized & Self-Contained**: Operates completely offline/air-gapped without relying on third-party web services (`ipapi.co`, `ip-api.com`, `ipify`, etc.). All IP range lookups, ASN mappings, reverse DNS, and geolocation metrics are computed locally.
- **Dual-Stack IP Detection**: Prominently detects and displays both **IPv4** and **IPv6** addresses side-by-side, complete with individual one-click copy buttons and routing status.
- **#fbb12f Theme**: Modern dark/light interface with `#fbb12f` brand accents, high-contrast typography, and zero-scroll single-page layout.
- **Geolocation & Coordinates**: Country with flag, City, Region, Postal Code, coordinates (Latitude/Longitude with copy feature), Timezone, and live local clock.
- **ISP & Autonomous System Intelligence**: Internet Service Provider, ASN, AS Organization, and Connection Classification.
- **Real-Time Network Diagnostics**: Edge socket roundtrip latency meter (ping), HTTP protocol version, TLS encryption status, and client platform detection.
- **High-Performance Go Backend**: Pure Go standard library HTTP server (`net/http`) with in-memory TTL caching and zero external runtime dependencies.
- **Containerized Deployment**: Multi-stage Dockerfile producing a hardened, non-root Alpine container under 25MB, with Docker Compose readiness.

---

## Quick Start with Docker & Docker Compose

### 1. Using Docker Compose (Recommended)

```bash
docker compose up -d
```

The application will be live at `http://localhost:8080`.

To view container logs or stop the service:

```bash
docker compose logs -f
docker compose down
```

### 2. Manual Multi-Stage Docker Build

```bash
# Build the hardened multi-stage image (< 25MB)
docker build -t traceip:latest .

# Run the container
docker run -d -p 8080:8080 --name traceip traceip:latest
```

---

## Local Development Setup

TraceIP supports development with both Node.js/Express dev server (with Vite) and native Go:

### Option A: Node.js / Vite Development

```bash
# 1. Install dependencies
npm install

# 2. Run pure logic unit tests
node --test src/utils/network.test.ts

# 3. Start dev server on port 3000
npm run dev
```

### Option B: Native Go Backend

```bash
# 1. Build React frontend
npm run build

# 2. Run the high-performance Go backend
go run main.go
```

The Go server serves the static frontend from `./dist` and powers the REST API on port `8080` (or the port specified by `$PORT`).

---

## REST API Reference

TraceIP exposes clean, JSON-based REST endpoints with zero external calls:

### 1. Detect Client IP (IPv4 & IPv6)

```http
GET /api/ip
```

**Example Response:**
```json
{
  "ip": "34.34.246.218",
  "version": "IPv4",
  "ipv4": "34.34.246.218",
  "ipv6": null,
  "client_port": "54218",
  "timestamp": 1739578120000,
  "protocol": "HTTP/1.1"
}
```

---

### 2. Full Geolocation & ISP Lookup

```http
GET /api/lookup?ip={optional_target_ip}
```

**Example Response:**
```json
{
  "ip": "8.8.8.8",
  "version": "IPv4",
  "ipv4": "8.8.8.8",
  "ipv6": null,
  "hostname": "dns.google",
  "city": "Mountain View",
  "region": "California",
  "country": "United States",
  "country_code": "US",
  "flag": "🇺🇸",
  "postal": "94043",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "timezone": "America/Los_Angeles",
  "isp": "Google LLC",
  "asn": "AS15169",
  "org": "Google Public Anycast DNS",
  "connection_type": "Datacenter",
  "is_private": false,
  "is_loopback": false,
  "query_time_ms": 1
}
```

---

### 3. Edge Latency Ping

```http
GET /api/ping
```

---

### 4. Edge Diagnostics Snapshot

```http
GET /api/diagnostics
```

---

## Testing

```bash
node --test src/utils/network.test.ts
```

All tests execute in milliseconds using Node.js's native test runner with zero external dependencies.

---

## License

Apache-2.0
