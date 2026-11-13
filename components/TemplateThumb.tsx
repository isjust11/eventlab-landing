'use client';

import { useEffect, useRef, useState } from 'react';
import { demoUrl } from '@/lib/config';
import type { TemplateCardData } from '@/lib/templates';
import { ScaledIframe } from './PhoneFrame';

/**
 * Card artwork: the uploaded thumbnail, or a non-interactive live render of the demo
 * once the card scrolls near the viewport.
 */
export default function TemplateThumb({ template }: { template: TemplateCardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (template.thumbnailUrl) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [template.thumbnailUrl]);

  return (
    <div ref={ref} className="absolute inset-0 bg-gradient-to-b from-wine-50 to-cream">
      {template.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.thumbnailUrl}
          alt={template.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <>
          {near ? (
            <ScaledIframe src={demoUrl(template.slug)} title={template.name} interactive={false} onLoad={() => setLoaded(true)} />
          ) : null}
          {!loaded ? (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-serif text-2xl italic text-wine-700/70">{template.name}</p>
                <span className="mx-auto mt-3 block h-1 w-16 animate-pulse rounded-full bg-wine-100" />
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
