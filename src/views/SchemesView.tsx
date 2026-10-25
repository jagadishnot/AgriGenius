import React, { useState } from 'react';
import {
  Landmark,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { GovernmentScheme } from '../types';

interface SchemesViewProps {
  schemes: GovernmentScheme[];
}

export const SchemesView: React.FC<SchemesViewProps> = ({ schemes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Landmark className="w-6 h-6 text-emerald-400" />
          <span>Government Schemes & Subsidies Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Verified central and state agricultural support schemes, micro-irrigation subsidies, and soil testing benefits.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search schemes by name, keyword, or subsidy type..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Irrigation">Irrigation & Drip</option>
            <option value="Soil">Soil Health</option>
            <option value="Insurance">Crop Insurance</option>
            <option value="Machinery">Machinery & Automation</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm hover:border-emerald-700/60 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 inline-block mb-1">
                    {scheme.category}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {scheme.title}
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-400 px-2 py-0.5 rounded bg-stone-950 border border-stone-800 shrink-0">
                  {scheme.jurisdiction}
                </span>
              </div>

              {/* Subsidy Highlight */}
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-200">
                <span className="text-stone-400 text-[10px] uppercase font-bold block mb-0.5">Financial Assistance / Subsidy:</span>
                <strong className="text-emerald-300 text-sm font-extrabold">{scheme.subsidy_percentage}</strong>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {scheme.description}
              </p>

              {/* Eligibility */}
              <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
                <strong className="text-white block text-[11px] uppercase tracking-wider">Eligibility Criteria:</strong>
                <p>{scheme.eligibility_summary}</p>
              </div>
            </div>

            {/* Bottom link */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">Updated: {scheme.update_date}</span>
              <a
                href={scheme.official_source_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          AgriGenius AI indexes verified government notifications for farmer awareness. Final eligibility verification, application approvals, and subsidy disbursements are administered directly by respective district agriculture departments (DAO) and authorized portals.
        </p>
      </div>
    </div>
  );
};
