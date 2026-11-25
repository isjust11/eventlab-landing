'use client';

import Link from 'next/link';
import { Crown, Eye } from 'lucide-react';
import { startWithTemplateUrl } from '@/lib/config';
import { typeLabel, type TemplateCardData, type TemplateCategory } from '@/lib/templates';
import { usePreview } from './PreviewProvider';
import TemplateThumb from './TemplateThumb';

export default function TemplateCard({
  template,
  rank,
  categories,
}: {
  template: TemplateCardData;
  rank?: number;
  categories?: TemplateCategory[];
}) {
  const preview = usePreview();

  return (
    <article className="group relative">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.6rem] border border-wine-900/5 bg-white shadow-card transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_50px_-24px_rgba(44,15,22,0.45)]">
        <TemplateThumb template={template} />

        {rank ? (
          <span className="absolute left-3 top-3 grid h-9 min-w-9 place-items-center rounded-full bg-wine-800/90 px-2 font-serif text-sm font-semibold text-gold-200 backdrop-blur">
            #{rank}
          </span>
        ) : null}
        {template.isPremium ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-300/95 px-2.5 py-1 text-[11px] font-semibold text-wine-900">
            <Crown size={12} /> Premium
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-wine-900/85 via-wine-900/40 to-transparent p-4 pt-16 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => preview(template)}
            className="btn w-full bg-white py-2.5 text-wine-800 hover:bg-cream"
            aria-label={`Xem thử mẫu ${template.name}`}
          >
            <Eye size={16} /> Xem thử
          </button>
          <a href={startWithTemplateUrl(template.slug)} className="btn w-full border border-white/40 py-2.5 text-white hover:bg-white/10">
            Dùng mẫu này
          </a>
        </div>
      </div>

      <div className="mt-4 px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500">{typeLabel(template.type, categories)}</p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-ink">
          <Link href={`/mau-thiep/${template.slug}`} className="hover:text-wine-700">
            {template.name}
          </Link>
        </h3>
      </div>
    </article>
  );
}
