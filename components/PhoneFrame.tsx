'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Templates are designed for a 390 × 844 phone; the iframe renders at that size and scales to the frame. */
export const PHONE_W = 390;
export const PHONE_H = 844;

export function ScaledIframe({
  src,
  title,
  interactive = true,
  onLoad,
}: {
  src: string;
  title: string;
  interactive?: boolean;
  onLoad?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PHONE_W));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {scale > 0 ? (
        <iframe
          src={src}
          title={title}
          onLoad={onLoad}
          tabIndex={interactive ? 0 : -1}
          scrolling={interactive ? undefined : 'no'}
          aria-hidden={interactive ? undefined : true}
          className="absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{
            width: PHONE_W,
            height: PHONE_H,
            transform: `scale(${scale})`,
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      ) : null}
    </div>
  );
}

/** Device shell; children fill the screen area. */
export default function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2.6rem] bg-ink p-[10px] shadow-phone ring-1 ring-white/10 ${className}`}
      style={{ aspectRatio: `${PHONE_W + 20} / ${PHONE_H + 20}` }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
        {children}
        <span className="pointer-events-none absolute left-1/2 top-2 z-10 h-[22px] w-[30%] -translate-x-1/2 rounded-full bg-ink" />
      </div>
    </div>
  );
}
