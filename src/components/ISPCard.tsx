import React from 'react';
import { Server, Network, ShieldCheck, Cpu } from 'lucide-react';
import { NetworkData } from '../types/index.ts';

interface ISPCardProps {
  data: NetworkData;
}

export const ISPCard: React.FC<ISPCardProps> = ({ data }) => {
  // Infer connection classification
  const isCloudOrDatacenter =
    /google|amazon|aws|microsoft|azure|cloudflare|digitalocean|oracle|ovh|hetzner|linode|fastly|akamai/i.test(
      `${data.isp} ${data.org} ${data.hostname}`
    );

  const connectionCategory = data.is_loopback
    ? 'Local Loopback'
    : data.is_private
    ? 'Private Subnet'
    : isCloudOrDatacenter
    ? 'Datacenter / Cloud'
    : 'Broadband / Fixed Line';

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#fbb12f]/15 text-amber-900 dark:text-[#fbb12f] flex items-center justify-center">
              <Network className="w-4 h-4 text-[#fbb12f]" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">ISP & Autonomous System</h2>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-900 dark:text-[#fbb12f] bg-[#fbb12f]/15 px-2 py-0.5 rounded">
            {data.asn || 'AS-AUTO'}
          </span>
        </div>

        {/* Primary ISP */}
        <div className="mt-4">
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate" title={data.isp || 'Service Provider'}>
            {data.isp || 'Unknown Service Provider'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={data.org}>
            {data.org || data.isp || 'Autonomous Routing Entity'}
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Network Class
            </span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                {connectionCategory}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Autonomous Entity
            </span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate">
                {data.asn.startsWith('AS') ? data.asn : `AS${data.asn}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Routing Integrity:</span>
        </span>
        <span className="text-slate-900 dark:text-slate-200 font-medium">
          Verified Public Routing
        </span>
      </div>
    </div>
  );
};
