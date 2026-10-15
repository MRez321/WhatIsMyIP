import React from 'react';
import { Sun, Moon, RefreshCw, Search, Terminal, Activity, Globe } from 'lucide-react';
import logoWebp from '../assets/logo.webp';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  activeTab: 'overview' | 'diagnostics' | 'docker';
  onSelectTab: (tab: 'overview' | 'diagnostics' | 'docker') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenLookup: () => void;
  isCustomLookup: boolean;
  onResetToMyIP: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  activeTab,
  onSelectTab,
  onRefresh,
  isLoading,
  onOpenLookup,
  isCustomLookup,
  onResetToMyIP,
}) => {
  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c121e]/70 backdrop-blur-md shrink-0 transition-colors">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onResetToMyIP();
            onSelectTab('overview');
          }}
          className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <img
            src={logoWebp}
            alt="WhatIsMyIP Logo"
            className="w-8 h-8 rounded-lg shadow-xs object-cover"
          />
          <span className="font-bold">WhatIsMyIP</span>
        </a>
        {isCustomLookup && (
          <button
            onClick={onResetToMyIP}
            className="hidden sm:inline-flex items-center text-xs text-[#fbb12f] hover:underline ml-2 font-medium cursor-pointer"
          >
            ← Return to My IP
          </button>
        )}
      </div>

      {/* Zone 2: Navigation & Diagnostic Mode tabs */}
      <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg">
        <button
          onClick={() => onSelectTab('overview')}
          aria-label="IP & Geolocation Overview"
          className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#fbb12f] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">IP & Geolocation</span>
        </button>

        <button
          onClick={() => onSelectTab('diagnostics')}
          aria-label="Network Diagnostics"
          className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-[#fbb12f] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Diagnostics</span>
        </button>

        <button
          onClick={() => onSelectTab('docker')}
          aria-label="API & Docker Guide"
          className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'docker'
              ? 'bg-[#fbb12f] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">API & Docker</span>
        </button>
      </nav>

      {/* Zone 3: Interactive Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenLookup}
          aria-label="Lookup another IP or host"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#fbb12f]" />
          <span className="hidden md:inline">Lookup IP</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh network data"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Re-detect network information"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#fbb12f]' : ''}`} />
        </button>

        <button
          onClick={onToggleTheme}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#fbb12f]" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
