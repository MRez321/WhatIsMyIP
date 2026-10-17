import React, { useState, useRef } from 'react';
import { Terminal, Copy, Check, X } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const copyCode = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const snippets = [
    {
      key: 'curl-ip',
      title: 'Fetch Client IP (JSON)',
      cmd: `curl -s ${baseUrl}/api/ip | jq .`,
      desc: 'Returns detected public client IP, version (IPv4/IPv6), and timestamp.',
    },
    {
      key: 'curl-lookup',
      title: 'Inspect Target IP or Hostname',
      cmd: `curl -s "${baseUrl}/api/lookup?ip=1.1.1.1" | jq .`,
      desc: 'Returns complete Geolocation, ISP, Autonomous System (ASN), and Reverse DNS PTR record.',
    },
    {
      key: 'curl-diag',
      title: 'Edge Network Diagnostics',
      cmd: `curl -s ${baseUrl}/api/diagnostics | jq .`,
      desc: 'Returns client socket protocol, TLS status, headers, and server region.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#fbb12f]" />
            </div>
            <div>
              <h3 id="api-modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                API Docs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                REST API endpoints with 100% localized GeoIP intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close API modal"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Architecture badges */}
          
          {snippets.map((snip) => (
            <div
              key={snip.key}
              className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-800/70"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 dark:text-white">{snip.title}</span>
                <button
                  onClick={() => copyCode(snip.key, snip.cmd)}
                  className="flex items-center gap-1 text-[11px] text-[#fbb12f] hover:underline cursor-pointer font-medium"
                  title="Copy command to clipboard"
                >
                  {copiedKey === snip.key ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{snip.desc}</p>
              <pre className="font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded-md overflow-x-auto whitespace-pre selection:bg-[#fbb12f]/30">
                <code>{snip.cmd}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
