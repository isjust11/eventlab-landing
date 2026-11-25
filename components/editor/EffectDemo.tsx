'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';

const DEMO_MS = 2800;

type EffectKey = string;

function PetalsDemo() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-2.5 w-2 rounded-full bg-rose-300/90"
          style={{ left: `${8 + (i * 7) % 84}%`, top: -8 }}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          animate={{ y: 120, opacity: [0, 1, 1, 0], rotate: 180 + i * 20 }}
          transition={{ duration: 2.2, delay: i * 0.08, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

function HeartsDemo() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-sm"
          style={{ left: `${12 + i * 10}%`, bottom: 8 }}
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: -90, opacity: [0, 1, 1, 0], scale: 1 }}
          transition={{ duration: 2, delay: i * 0.12, ease: 'easeOut' }}
        >
          ♥
        </motion.span>
      ))}
    </>
  );
}

function ConfettiDemo() {
  const colors = ['#E11D48', '#F59E0B', '#10B981', '#3B82F6', '#A855F7', '#F472B6'];
  return (
    <>
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-2.5 rounded-[1px]"
          style={{
            left: '50%',
            top: '40%',
            background: colors[i % colors.length],
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: (i % 2 === 0 ? 1 : -1) * (20 + (i % 7) * 12),
            y: 40 + (i % 5) * 14,
            opacity: 0,
            rotate: 240 + i * 15,
          }}
          transition={{ duration: 1.6, delay: (i % 6) * 0.04, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function EnvelopeDemo() {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ perspective: 600 }}>
      <motion.div
        className="relative h-14 w-20 overflow-hidden rounded-md border border-wine-200 bg-wine-50 shadow-sm"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 origin-top border-b border-wine-200 bg-gradient-to-br from-wine-100 to-wine-200"
          style={{ height: '50%', clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformStyle: 'preserve-3d' }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -160 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute inset-x-2 bottom-2 top-6 rounded-sm bg-white"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        />
      </motion.div>
    </div>
  );
}

function AutoScrollDemo() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 overflow-hidden px-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-full rounded-full bg-wine-200/80"
          initial={{ y: 24, opacity: 0.3 }}
          animate={{ y: -24, opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, delay: i * 0.15, ease: 'linear', repeat: 0 }}
        />
      ))}
    </div>
  );
}

function DemoStage({ effectKey }: { effectKey: EffectKey }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-b from-cream to-wine-50">
      {effectKey === 'effectPetals' ? <PetalsDemo /> : null}
      {effectKey === 'effectHearts' ? (
        <div className="absolute inset-0 text-rose-500">
          <HeartsDemo />
        </div>
      ) : null}
      {effectKey === 'effectConfetti' ? <ConfettiDemo /> : null}
      {effectKey === 'effectEnvelope' ? <EnvelopeDemo /> : null}
      {effectKey === 'autoScroll' ? <AutoScrollDemo /> : null}
    </div>
  );
}

export default function EffectDemo({
  effectKey,
  label,
}: {
  effectKey: string;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setPlaying(false), DEMO_MS);
    return () => window.clearTimeout(t);
  }, [playing]);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPlaying(true);
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-wine-700 hover:underline"
      >
        <Play size={12} /> Xem thử {label.toLowerCase()}
      </button>
      <AnimatePresence>
        {playing ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2">
              <DemoStage effectKey={effectKey} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
