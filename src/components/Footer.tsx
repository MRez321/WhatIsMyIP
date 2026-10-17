import React, { useState } from 'react';
import { Terminal, Check, Copy, Copyright } from 'lucide-react';
import { NetworkData } from '../types/index.ts';
import logoWebp from '../assets/logo.webp';

interface FooterProps {
  data: NetworkData | null;
  onOpenDockerModal: () => void;
  onOpenLookupModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  data,
  onOpenDockerModal,
  onOpenLookupModal,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleExportJSON = async () => {
    if (!data) return;
    try {
      const formatted = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(formatted);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <footer className="px-4 md:px-8 py-2.5 sm:py-0 sm:h-12 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#0c121e]/50 backdrop-blur-md text-xs text-slate-500 dark:text-slate-400 shrink-0">
      {/* Left zone: System status */}
      <div className="relative flex items-center gap-2">
        <img
          src={logoWebp}
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-8 h-8 opacity-[0.09] dark:opacity-[0.14] pointer-events-none"
        />
        <span className="relative font-medium text-slate-700 dark:text-slate-300">WhatIsMyIP</span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1">
          <Copyright className="w-3 h-3" />
          <span>All rights reserved</span>
        </span>
      </div>

      {/* Middle zone: Keyboard hints */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">ctrl+K</kbd> to lookup</span>
      </div>

      {/* Right zone: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportJSON}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title="Copy full JSON report to clipboard"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Report Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Report</span>
            </>
          )}
        </button>

        <span aria-hidden="true">·</span>

        <button
          onClick={onOpenDockerModal}
          className="text-[#fbb12f] hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>API / Docker Docs</span>
        </button>
      </div>
    </footer>
  );
};
