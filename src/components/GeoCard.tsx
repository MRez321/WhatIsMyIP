import React, { useEffect, useState } from 'react';
import { MapPin, Compass, Clock, Globe, Copy, Check } from 'lucide-react';
import { NetworkData } from '../types/index.ts';
import { formatCoordinates } from '../utils/network.ts';

interface GeoCardProps {
  data: NetworkData;
}

export const GeoCard: React.FC<GeoCardProps> = ({ data }) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [copiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: data.timezone || 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(now);
        setLocalTime(formatted);
      } catch {
        setLocalTime(new Date().toUTCString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [data.timezone]);

  const coordsString = formatCoordinates(data.latitude, data.longitude);

  const handleCopyCoords = async () => {
    try {
      await navigator.clipboard.writeText(`${data.latitude}, ${data.longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#fbb12f]" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Geolocation & Coordinates</h2>
          </div>
          <span className="text-xl" title={data.country}>{data.flag || '🌐'}</span>
        </div>

        {/* Primary Location */}
        <div className="mt-4">
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-baseline">
            <span>{data.city || 'Unknown City'}</span>
            {data.region && (
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                , {data.region}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data.country} ({data.country_code || 'XX'}) {data.postal && data.postal !== '—' ? `· Postal: ${data.postal}` : ''}
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Coordinates
            </span>
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-medium truncate" title={coordsString}>
                {coordsString}
              </span>
              <button
                onClick={handleCopyCoords}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 shrink-0"
                title="Copy coordinates"
              >
                {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Local Timezone
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate">
                {data.timezone || 'UTC'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Clock Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#fbb12f]" />
          <span>Local Clock:</span>
        </span>
        <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold tabular-nums">
          {localTime || 'Synchronizing...'}
        </span>
      </div>
    </div>
  );
};
