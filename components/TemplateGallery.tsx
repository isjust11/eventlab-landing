'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { TYPE_LABELS, type TemplateCardData, type TemplateType } from '@/lib/templates';
import TemplateCard from './TemplateCard';

type Filter = 'ALL' | TemplateType;

export default function TemplateGallery({
  templates,
  searchable = false,
  limit,
  initialFilter = 'ALL',
}: {
  templates: TemplateCardData[];
  searchable?: boolean;
  limit?: number;
  initialFilter?: Filter;
}) {
  const tabs = useMemo(() => {
    const present = new Set(templates.map((t) => t.type));
    return (['ALL', 'WEDDING', 'BIRTHDAY', 'EVENT', 'OTHER'] as Filter[]).filter((f) => f === 'ALL' || present.has(f));
  }, [templates]);

  const [filter, setFilter] = useState<Filter>(tabs.includes(initialFilter) ? initialFilter : 'ALL');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = templates.filter(
      (t) =>
        (filter === 'ALL' || t.type === filter) &&
        (!q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
    );
    return limit ? list.slice(0, limit) : list;
  }, [templates, filter, query, limit]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {tabs.length > 2 ? (
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                onClick={() => setFilter(tab)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === tab ? 'bg-wine-700 text-white' : 'bg-white text-ink/70 ring-1 ring-wine-900/10 hover:text-wine-700'
                }`}
              >
                {tab === 'ALL' ? 'Tất cả' : TYPE_LABELS[tab]}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        {searchable ? (
          <label className="relative block sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc phong cách…"
              className="w-full rounded-full border border-wine-900/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-wine-500 focus:ring-2 focus:ring-wine-100"
            />
          </label>
        ) : null}
      </div>

      {shown.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-ink/55">Chưa có mẫu phù hợp — thử từ khoá khác nhé.</p>
      )}
    </div>
  );
}
