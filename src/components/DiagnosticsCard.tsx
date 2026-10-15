import React from 'react';
import { Activity, ShieldCheck, Wifi, Radio, Laptop } from 'lucide-react';
import { DiagnosticsData, PingResult } from '../types/index.ts';

interface DiagnosticsCardProps {
  diagnostics: DiagnosticsData | null;
  ping: PingResult;
  onRetestPing: () => void;
  isPinging: boolean;
}

export const DiagnosticsCard: React.FC<DiagnosticsCardProps> = ({
  diagnostics,
  ping,
  onRetestPing,
  isPinging,
}) => {
  // Infer browser and OS from userAgent
  const ua = diagnostics?.user_agent || navigator.userAgent || '';
  let browser = 'Modern Web Client';
  if (/chrome|chromium|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';

  let os = 'Desktop OS';
  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

  const latencyRating =
    ping.latencyMs < 0
      ? 'Pending'
      : ping.latencyMs <= 40
      ? 'Optimal (<40ms)'
      : ping.latencyMs <= 100
      ? 'Normal (<100ms)'
      : 'Elevated (>100ms)';

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#fbb12f]" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Network Diagnostics</h2>
          </div>
          <button
            onClick={onRetestPing}
            disabled={isPinging}
            className="text-xs text-[#fbb12f] hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <Radio className={`w-3.5 h-3.5 ${isPinging ? 'animate-pulse text-[#fbb12f]' : 'text-[#fbb12f]'}`} />
            <span>{isPinging ? 'Measuring...' : 'Run Probe'}</span>
          </button>
        </div>

        {/* Primary Latency Status */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {ping.latencyMs >= 0 ? `${ping.latencyMs} ms` : 'Measuring...'}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              · {latencyRating}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Round-trip edge socket latency to nearest gateway
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Protocol & TLS
            </span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate">
                {diagnostics?.protocol || 'HTTP/1.1'} · TLS
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Client Platform
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                {browser} ({os})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Socket Health Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Socket Health:</span>
        </span>
        <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
          Edge Connected · Keep-Alive
        </span>
      </div>
    </div>
  );
};
