'use client';

import { useEffect, useRef, useState } from 'react';
import { LIVE_PREVIEW_URL } from '@/lib/config';
import { PHONE_H, PHONE_W } from '@/components/PhoneFrame';
import { Spinner } from '@/components/ui';

export type PreviewPayload = { templateId: string; title: string; data: Record<string, unknown> };

const HOST_ORIGIN = new URL(LIVE_PREVIEW_URL).origin;

/** Invite host `/preview` page, fed drafts over postMessage (same contract as the admin studio). */
export default function LivePreview({ payload }: { payload: PreviewPayload }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  /** Bumped on every host handshake so a reloaded frame gets the current draft again. */
  const [readyAt, setReadyAt] = useState(0);
  const ready = readyAt > 0;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PHONE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== HOST_ORIGIN || e.source !== frame.current?.contentWindow) return;
      const msg = e.data as { source?: string; type?: string } | null;
      if (msg?.source === 'eventlab-host' && msg.type === 'eventlab:preview-ready') setReadyAt(Date.now());
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      frame.current?.contentWindow?.postMessage(
        { source: 'eventlab-admin', type: 'eventlab:live-preview', payload: { ...payload, slug: 'preview' } },
        HOST_ORIGIN,
      );
    }, 250);
    return () => window.clearTimeout(t);
  }, [ready, readyAt, payload]);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {scale > 0 ? (
        <iframe
          ref={frame}
          src={LIVE_PREVIEW_URL}
          title="Xem trước thiệp"
          className="absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}
        />
      ) : null}
      {!ready ? (
        <div className="absolute inset-0 grid place-items-center bg-cream text-wine-600">
          <Spinner size={24} />
        </div>
      ) : null}
    </div>
  );
}
