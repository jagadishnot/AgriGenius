import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { MarketPrice } from '../types';

interface MarketViewProps {
  marketPrices: MarketPrice[];
}

export const MarketView: React.FC<MarketViewProps> = ({ marketPrices }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrices = marketPrices.filter(
    (m) =>
      m.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>APMC Mandi & Commodity Market Rates</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Official daily arrival rates and Minimum Support Prices (MSP) from e-NAM and agricultural market committees.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Source: e-NAM & CACP Portals</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by commodity, mandi name, or state..."
          className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-emerald-600"
        />
      </div>

      {/* Price Table / Cards */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="px-5 py-3.5 font-bold">Commodity</th>
                <th className="px-5 py-3.5 font-bold">Mandi / Market</th>
                <th className="px-5 py-3.5 font-bold">Price / Quintal</th>
                <th className="px-5 py-3.5 font-bold">Weekly Trend</th>
                <th className="px-5 py-3.5 font-bold">Data Source</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredPrices.map((item) => (
                <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="px-5 py-4 font-bold text-white">
                    {item.commodity}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.market}, {item.state}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-base font-extrabold text-emerald-400">
                      Rs. {item.price_per_quintal.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-stone-400 block">{item.unit}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.price_trend.startsWith('+') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      item.price_trend.startsWith('-') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      'bg-stone-800 text-stone-300'
                    }`}>
                      {item.price_trend}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-stone-400">
                    <p className="line-clamp-1">{item.source}</p>
                    <p className="text-[10px] text-stone-500">{item.price_date}</p>
                  </td>
                  <td className="px-5 py-4">
                    {item.is_demo ? (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        DEMO — NOT LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED APMC
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
