import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Globe, ArrowRight, CornerDownLeft } from 'lucide-react';
import { validateIP } from '../utils/network.ts';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLookup: (ip: string) => void;
  currentIP: string;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  isOpen,
  onClose,
  onLookup,
  currentIP,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputVal('');
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError('Please enter a valid IP address or domain name');
      return;
    }

    // Check if it's IP or domain
    const ipCheck = validateIP(trimmed);
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!ipCheck.valid && !domainPattern.test(trimmed)) {
      setError('Please enter a valid IPv4, IPv6, or domain name');
      return;
    }

    setError(null);
    onLookup(trimmed);
    onClose();
  };

  const presets = [
    { label: 'Cloudflare DNS', ip: '1.1.1.1' },
    { label: 'Google Public DNS', ip: '8.8.8.8' },
    { label: 'Quad9 Privacy DNS', ip: '9.9.9.9' },
    { label: 'OpenDNS', ip: '208.67.222.222' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lookup-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#fbb12f]" />
            <h3 id="lookup-modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
              Lookup IP Address or Domain
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="ip-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Target IP Address or Hostname
            </label>
            <div className="relative">
              <input
                id="ip-input"
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 1.1.1.1 or 2606:4700:4700::1111"
                className="w-full px-3.5 py-2.5 font-mono text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbb12f]/30 focus:border-[#fbb12f]"
                autoFocus
              />
              <button
                type="submit"
                aria-label="Execute search"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#fbb12f] hover:bg-[#f5a518] text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
            {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">{error}</p>}
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Popular Anycast Nodes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.ip}
                  type="button"
                  onClick={() => {
                    onLookup(preset.ip);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <div>
                    <span className="block text-xs font-medium text-slate-900 dark:text-white">
                      {preset.label}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {preset.ip}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
