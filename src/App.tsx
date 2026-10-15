/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { IPHero } from './components/IPHero.tsx';
import { GeoCard } from './components/GeoCard.tsx';
import { ISPCard } from './components/ISPCard.tsx';
import { DiagnosticsCard } from './components/DiagnosticsCard.tsx';
import { LookupModal } from './components/LookupModal.tsx';
import { ApiDockerModal } from './components/ApiDockerModal.tsx';
import { Footer } from './components/Footer.tsx';
import { NetworkData, DiagnosticsData, PingResult } from './types/index.ts';
import { fetchNetworkInfo, measurePing, fetchDiagnostics } from './services/api.ts';
import { Activity, ShieldCheck, Wifi, Terminal, ExternalLink, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatismyip_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'docker'>('overview');

  // Network data state
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsData | null>(null);
  const [pingResult, setPingResult] = useState<PingResult>({ latencyMs: -1, timestamp: 0, status: 'nominal' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<string | null>(null);

  // Modals
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState(false);

  // Sync dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('whatismyip_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('whatismyip_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // Measure Ping
  const handlePingTest = useCallback(async () => {
    setIsPinging(true);
    const result = await measurePing();
    setPingResult(result);
    setIsPinging(false);
  }, []);

  // Fetch all initial data
  const loadData = useCallback(async (target?: string) => {
    setIsLoading(true);
    try {
      const [info, diag] = await Promise.all([
        fetchNetworkInfo(target),
        fetchDiagnostics(),
      ]);
      setNetworkData(info);
      setDiagnosticsData(diag);
      await handlePingTest();
    } catch (err) {
      console.error('Failed to load network intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  }, [handlePingTest]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle custom lookup
  const handleLookup = (target: string) => {
    setCustomTarget(target);
    loadData(target);
  };

  const handleResetToMyIP = () => {
    setCustomTarget(null);
    loadData();
  };

  // Keyboard shortcut listener (⌘K for lookup, C to copy IP)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsLookupOpen(true);
      } else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && networkData?.ip) {
        navigator.clipboard.writeText(networkData.ip);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [networkData]);

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col justify-between bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased font-sans select-none">
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRefresh={() => loadData(customTarget || undefined)}
        isLoading={isLoading}
        onOpenLookup={() => setIsLookupOpen(true)}
        isCustomLookup={Boolean(customTarget)}
        onResetToMyIP={handleResetToMyIP}
      />

      {/* Main Single-Page Viewport Canvas */}
      <main className="flex-1 px-4 md:px-8 py-4 overflow-y-auto lg:overflow-hidden flex flex-col justify-center max-w-7xl mx-auto w-full">
        {isLoading && !networkData ? (
          /* Loading Skeleton */
          <div className="space-y-4 animate-pulse w-full">
            <div className="h-32 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
              <div className="bg-slate-200/80 dark:bg-slate-800/80 rounded-xl"></div>
              <div className="bg-slate-200/80 dark:bg-slate-800/80 rounded-xl"></div>
              <div className="bg-slate-200/80 dark:bg-slate-800/80 rounded-xl"></div>
            </div>
          </div>
        ) : networkData ? (
          activeTab === 'overview' ? (
            /* Standard IP, Geolocation & ISP Overview */
            <div className="space-y-4 w-full">
              {/* Hero: IP Address & Primary Status */}
              <IPHero
                data={networkData}
                ping={pingResult}
                onRetestPing={handlePingTest}
                isPinging={isPinging}
                isCustomLookup={Boolean(customTarget)}
              />

              {/* Core 3-Column Grid without scrolling on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GeoCard data={networkData} />
                <ISPCard data={networkData} />
                <DiagnosticsCard
                  diagnostics={diagnosticsData}
                  ping={pingResult}
                  onRetestPing={handlePingTest}
                  isPinging={isPinging}
                />
              </div>
            </div>
          ) : activeTab === 'diagnostics' ? (
            /* Live Diagnostics View */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#fbb12f]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edge Diagnostics & Client Telemetry</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Detailed socket parameters and client-server negotiation metrics</p>
                  </div>
                </div>
                <button
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Re-measure Latency</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
                    Latency (RTT)
                  </span>
                  <div className="font-mono text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
                    {pingResult.latencyMs >= 0 ? `${pingResult.latencyMs} ms` : 'Measuring...'}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Direct TCP handshake</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
                    HTTP Protocol
                  </span>
                  <div className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                    {diagnosticsData?.protocol || 'HTTP/1.1'}
                  </div>
                  <span className="text-[11px] text-slate-500">Multiplexed keep-alive</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
                    TLS Security
                  </span>
                  <div className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                    TLS 1.3 / AES
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Encrypted Transport</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
                    Server Egress Region
                  </span>
                  <div className="text-slate-900 dark:text-white font-medium truncate">
                    {diagnosticsData?.server_region || 'Global Cloud Edge'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Uptime: {diagnosticsData?.uptime_seconds || 120}s</span>
                </div>
              </div>

              {/* Client User-Agent & Headers list */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-medium text-slate-900 dark:text-white block mb-1">Connecting User-Agent</span>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200/80 dark:border-slate-800">
                  {diagnosticsData?.user_agent || navigator.userAgent}
                </p>
              </div>
            </div>
          ) : (
            /* API & Docker View */
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-[#fbb12f]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Go Backend & Container Architecture</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">100% localized, high-throughput binary with Docker Compose readiness</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDockerModalOpen(true)}
                  className="px-3 py-1.5 bg-[#fbb12f] text-slate-950 font-semibold rounded-lg text-xs hover:bg-[#f5a518] transition-colors cursor-pointer"
                >
                  View Deployment Snippets
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>High-Performance Go HTTP Service</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Built using Go 1.24 standard library (<code className="font-mono">net/http</code>, <code className="font-mono">net</code>) with zero external network dependencies. 100% self-hosted local GeoIP database and in-memory TTL caching.
                  </p>
                  <pre className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded overflow-x-auto">
                    <code>{`curl -s http://localhost:8080/api/ip\ncurl -s "http://localhost:8080/api/lookup?ip=8.8.8.8"`}</code>
                  </pre>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#fbb12f]"></span>
                    <span>Multi-Stage Ultra-Lean Docker</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Combines Vite React static compilation and a statically linked Go binary into an Alpine container image under 40MB with non-root security.
                  </p>
                  <pre className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded overflow-x-auto">
                    <code>{`docker compose up -d\n# Or manual build:\ndocker build -t whatismyip .\ndocker run -d -p 8080:8080 whatismyip`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">Failed to resolve network data.</p>
            <button
              onClick={() => loadData()}
              className="mt-3 px-4 py-2 bg-[#fbb12f] text-slate-950 font-semibold rounded-lg text-xs cursor-pointer hover:bg-[#f5a518]"
            >
              Retry Detection
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        data={networkData}
        onOpenDockerModal={() => setIsDockerModalOpen(true)}
        onOpenLookupModal={() => setIsLookupOpen(true)}
      />

      {/* Modals */}
      <LookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onLookup={handleLookup}
        currentIP={networkData?.ip || ''}
      />

      <ApiDockerModal
        isOpen={isDockerModalOpen}
        onClose={() => setIsDockerModalOpen(false)}
      />
    </div>
  );
}
