import React, { useState } from 'react';
import { Copy, Check, Zap, Globe, Shield } from 'lucide-react';
import { NetworkData, PingResult } from '../types/index.ts';

interface IPHeroProps {
  data: NetworkData;
  ping: PingResult;
  onRetestPing: () => void;
  isPinging: boolean;
  isCustomLookup: boolean;
}

export const IPHero: React.FC<IPHeroProps> = ({
  data,
  ping,
  onRetestPing,
  isPinging,
  isCustomLookup,
}) => {
  const [copiedV4, setCopiedV4] = useState(false);
  const [copiedV6, setCopiedV6] = useState(false);
  const [copiedPrimary, setCopiedPrimary] = useState(false);

  // Derive IPv4 and IPv6 values
  const v4Address = data.ipv4 || (data.version === 'IPv4' ? data.ip : null);
  const v6Address = data.ipv6 || (data.version === 'IPv6' ? data.ip : null);

  const copyToClipboard = async (text: string, type: 'v4' | 'v6' | 'primary') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    if (type === 'v4') {
      setCopiedV4(true);
      setTimeout(() => setCopiedV4(false), 2000);
    } else if (type === 'v6') {
      setCopiedV6(true);
      setTimeout(() => setCopiedV6(false), 2000);
    } else {
      setCopiedPrimary(true);
      setTimeout(() => setCopiedPrimary(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 md:p-5 shadow-xs transition-colors space-y-3">
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#fbb12f]">
            {isCustomLookup ? 'Inspected Target Address' : 'Detected Network Addresses'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {v4Address && v6Address ? 'Dual-Stack Active (IPv4 + IPv6)' : `${data.version} Active`}
          </span>
          {data.is_loopback && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400">Local Loopback</span>
            </>
          )}
        </div>

        {/* Real-time Edge Ping & Hostname summary */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-800">
            <Zap className="w-3.5 h-3.5 text-[#fbb12f]" />
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Latency:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums text-xs">
              {ping.latencyMs >= 0 ? `${ping.latencyMs} ms` : 'Testing...'}
            </span>
            <button
              onClick={onRetestPing}
              disabled={isPinging}
              className="text-[11px] font-medium text-[#fbb12f] hover:underline cursor-pointer ml-1"
              title="Measure roundtrip ping now"
            >
              {isPinging ? 'Pinging...' : 'Re-test'}
            </button>
          </div>
        </div>
      </div>

      {/* Dual IPv4 and IPv6 Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* IPv4 Box */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fbb12f]/15 text-amber-800 dark:text-[#fbb12f]">
                IPv4
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Internet Protocol v4</span>
            </div>
            {v4Address && (
              <button
                onClick={() => copyToClipboard(v4Address, 'v4')}
                aria-label="Copy IPv4 address"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  copiedV4
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#fbb12f] hover:bg-[#f5a518] text-slate-950 active:scale-95'
                }`}
              >
                {copiedV4 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedV4 ? 'Copied' : 'Copy IPv4'}</span>
              </button>
            )}
          </div>

          <div className="py-0.5">
            <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white select-all break-all">
              {v4Address || 'Not Assigned / IPv6 Only'}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
            <span className="font-medium text-slate-600 dark:text-slate-300">Hostname:</span>{' '}
            <span className="font-mono truncate">{data.hostname || 'No PTR record found'}</span>
          </div>
        </div>

        {/* IPv6 Box */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fbb12f]/15 text-amber-800 dark:text-[#fbb12f]">
                IPv6
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Next-Gen Protocol v6</span>
            </div>
            {v6Address ? (
              <button
                onClick={() => copyToClipboard(v6Address, 'v6')}
                aria-label="Copy IPv6 address"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  copiedV6
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#fbb12f] hover:bg-[#f5a518] text-slate-950 active:scale-95'
                }`}
              >
                {copiedV6 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedV6 ? 'Copied' : 'Copy IPv6'}</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                ISP IPv4-Only
              </span>
            )}
          </div>

          <div className="py-0.5">
            {v6Address ? (
              <span className="font-mono text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white select-all break-all">
                {v6Address}
              </span>
            ) : (
              <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                No IPv6 route assigned by current ISP
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
            <span className="font-medium text-slate-600 dark:text-slate-300">Status:</span>{' '}
            <span>{v6Address ? 'Global Unicast Routing Active' : 'Dual-stack fallback to IPv4 active'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
