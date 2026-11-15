'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';

type Toast = { id: number; text: string; tone: 'success' | 'error' };

let nextId = 1;

export function toast(text: string, tone: Toast['tone'] = 'success') {
  window.dispatchEvent(new CustomEvent<Toast>('el-toast', { detail: { id: nextId++, text, tone } }));
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const item = (e as CustomEvent<Toast>).detail;
      setItems((list) => [...list.slice(-2), item]);
      window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== item.id)), 3600);
    };
    window.addEventListener('el-toast', onToast);
    return () => window.removeEventListener('el-toast', onToast);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-card"
          >
            {t.tone === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
            ) : (
              <CircleAlert size={18} className="shrink-0 text-rose-300" />
            )}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
