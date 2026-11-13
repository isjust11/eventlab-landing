'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TemplateCardData } from '@/lib/templates';
import TemplateCard from './TemplateCard';

export default function TemplateCarousel({ templates, ranked = false }: { templates: TemplateCardData[]; ranked?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-6 pt-2 sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {templates.map((template, i) => (
          <div key={template.slug} className="w-[62%] shrink-0 snap-start sm:w-[38%] md:w-[28%] lg:w-[22%]">
            <TemplateCard template={template} rank={ranked ? i + 1 : undefined} />
          </div>
        ))}
      </div>
      {templates.length > 3 ? (
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" aria-label="Mẫu trước" onClick={() => scroll(-1)} className="btn-outline h-11 w-11 p-0">
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Mẫu tiếp theo" onClick={() => scroll(1)} className="btn-outline h-11 w-11 p-0">
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
