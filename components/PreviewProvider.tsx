'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ExternalLink, Loader2, X } from 'lucide-react';
import { demoUrl, startWithTemplateUrl } from '@/lib/config';
import { typeLabel, type TemplateCardData } from '@/lib/templates';
import PhoneFrame, { ScaledIframe } from './PhoneFrame';

const PreviewContext = createContext<(template: TemplateCardData) => void>(() => {});

export function usePreview() {
  return useContext(PreviewContext);
}

function PreviewModal({ template, onClose }: { template: TemplateCardData; onClose: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-wine-900/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Xem thử mẫu ${template.name}`}
    >
      <motion.div
        className="relative flex max-h-full w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:items-center md:justify-center md:gap-12"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <PhoneFrame className="h-[min(78vh,760px)] shrink-0">
          <ScaledIframe src={demoUrl(template.slug)} title={template.name} onLoad={() => setLoading(false)} />
          {loading ? (
            <div className="absolute inset-0 grid place-items-center bg-cream">
              <Loader2 className="animate-spin text-wine-500" />
            </div>
          ) : null}
        </PhoneFrame>

        <div className="hidden max-w-xs text-white md:block">
          <p className="eyebrow">{typeLabel(template.type)}</p>
          <h3 className="mt-3 font-serif text-4xl">{template.name}</h3>
          {template.description ? <p className="mt-4 leading-relaxed text-white/75">{template.description}</p> : null}
          <p className="mt-4 text-sm text-white/55">Cuộn và chạm trong khung để trải nghiệm như khách mời.</p>
          <div className="mt-8 flex flex-col gap-3">
            <a href={startWithTemplateUrl(template.slug)} className="btn-primary bg-gold-400 text-wine-900 hover:bg-gold-300">
              Dùng mẫu này
            </a>
            <Link href={`/mau-thiep/${template.slug}`} onClick={onClose} className="btn-ghost-light">
              Chi tiết mẫu
            </Link>
            <a href={demoUrl(template.slug)} target="_blank" rel="noreferrer" className="btn-ghost-light">
              Mở toàn màn hình <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <a
          href={startWithTemplateUrl(template.slug)}
          className="btn-primary w-full max-w-[360px] bg-gold-400 text-wine-900 hover:bg-gold-300 md:hidden"
        >
          Dùng mẫu {template.name}
        </a>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute -top-2 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 md:-right-4 md:top-0"
        >
          <X size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** One preview modal for the whole site; any card calls `usePreview()(template)`. */
export default function PreviewProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TemplateCardData | null>(null);
  const open = useCallback((template: TemplateCardData) => setActive(template), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <PreviewContext.Provider value={open}>
      {children}
      <AnimatePresence>{active ? <PreviewModal key={active.slug} template={active} onClose={close} /> : null}</AnimatePresence>
    </PreviewContext.Provider>
  );
}
