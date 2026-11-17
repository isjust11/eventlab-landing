'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Music2, Plus, Trash2, Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import type { ItemField } from '@/lib/fields';
import { Input, Spinner, Textarea } from '@/components/ui';
import { toast } from '@/components/Toaster';

const MAX_MB = 10;

function useUpload(accept: 'image' | 'audio') {
  const [busy, setBusy] = useState(false);
  const run = async (files: FileList | null, onDone: (urls: string[]) => void) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith(`${accept}/`));
    if (!list.length) return;
    const tooBig = list.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      toast(`"${tooBig.name}" lớn hơn ${MAX_MB}MB, bạn chọn file nhỏ hơn nhé.`, 'error');
      return;
    }
    setBusy(true);
    try {
      const urls = [];
      for (const file of list) urls.push(await uploadFile(file));
      onDone(urls.filter(Boolean));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Tải lên chưa thành công.', 'error');
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function ImageInput({
  value,
  onChange,
  compact = false,
  label = 'Chọn ảnh',
}: {
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload('image');
  const pick = () => input.current?.click();

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        run(e.dataTransfer.files, ([url]) => onChange(url));
      }}
      className={`group relative overflow-hidden rounded-2xl border border-dashed border-wine-900/15 bg-wine-50/40 ${
        compact ? 'aspect-square w-24' : 'aspect-[16/10] w-full max-w-sm'
      }`}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          run(e.target.files, ([url]) => onChange(url));
          e.target.value = '';
        }}
      />
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button type="button" onClick={pick} className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow">
              Đổi ảnh
            </button>
            <button
              type="button"
              aria-label="Xoá ảnh"
              onClick={() => onChange('')}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-rose-600 shadow"
            >
              <X size={14} />
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/50 transition hover:bg-wine-50 hover:text-wine-700"
        >
          <ImagePlus size={compact ? 20 : 26} />
          {compact ? null : (
            <>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-ink/40">hoặc kéo thả ảnh vào đây</span>
            </>
          )}
        </button>
      )}
      {busy ? (
        <div className="absolute inset-0 grid place-items-center bg-white/70 text-wine-600">
          <Spinner size={22} />
        </div>
      ) : null}
    </div>
  );
}

export function GalleryInput({ urls, onChange }: { urls: string[]; onChange: (urls: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload('image');

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-wine-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Xoá ảnh ${i + 1}`}
              onClick={() => onChange(urls.filter((_, j) => j !== i))}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-rose-600 shadow transition sm:opacity-0 sm:group-hover:opacity-100"
            >
              <X size={14} />
            </button>
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/45 px-2 text-[11px] font-medium text-white">{i + 1}</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-wine-900/20 text-ink/50 transition hover:border-wine-400 hover:bg-wine-50 hover:text-wine-700"
        >
          {busy ? <Spinner /> : <Plus size={22} />}
          <span className="text-xs font-medium">{busy ? 'Đang tải…' : 'Thêm ảnh'}</span>
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          run(e.target.files, (added) => onChange([...urls, ...added]));
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function LinesInput({
  id,
  lines,
  onChange,
  placeholder,
}: {
  id?: string;
  lines: string[];
  onChange: (lines: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Textarea
      id={id}
      rows={Math.max(3, lines.length + 1)}
      value={lines.join('\n')}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.split('\n'))}
      onBlur={(e) => onChange(e.target.value.split('\n').filter((l) => l.trim()))}
    />
  );
}

type Item = Record<string, unknown>;

export function ItemsInput({
  items,
  fields,
  onChange,
  addLabel = 'Thêm mục',
}: {
  items: Item[];
  fields: ItemField[];
  onChange: (items: Item[]) => void;
  addLabel?: string;
}) {
  const set = (i: number, key: string, value: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, '']));

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-2xl border border-wine-900/10 bg-cream/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">Mục {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} /> Xoá
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const raw = item[f.key];
              const value =
                typeof raw === 'string'
                  ? raw
                  : raw && typeof raw === 'object' && 'url' in (raw as object)
                    ? String((raw as { url?: unknown }).url ?? '')
                    : String(raw ?? '');
              const isQr = /qr/i.test(f.key);

              if (f.kind === 'image') {
                return (
                  <div key={f.key} className={isQr ? '' : 'sm:col-span-2'}>
                    <p className="mb-1.5 text-xs font-medium text-ink/60">{f.label}</p>
                    <ImageInput
                      compact={isQr}
                      value={value}
                      onChange={(url) => set(i, f.key, url)}
                      label={isQr ? 'Tải ảnh QR' : 'Chọn ảnh'}
                    />
                    {isQr ? (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-ink/45">
                        Ảnh mã QR ngân hàng — khách quét để chuyển khoản.
                      </p>
                    ) : null}
                  </div>
                );
              }
              if (f.kind === 'textarea') {
                return (
                  <label key={f.key} className="sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-ink/60">{f.label}</span>
                    <Textarea rows={3} value={value} onChange={(e) => set(i, f.key, e.target.value)} />
                  </label>
                );
              }
              if (f.kind === 'url') {
                return (
                  <label key={f.key} className="sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-ink/60">{f.label}</span>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      value={value}
                      onChange={(e) => set(i, f.key, e.target.value)}
                    />
                  </label>
                );
              }
              return (
                <label key={f.key}>
                  <span className="mb-1.5 block text-xs font-medium text-ink/60">{f.label}</span>
                  <Input value={value} onChange={(e) => set(i, f.key, e.target.value)} />
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, blank()])}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-wine-900/20 py-3 text-sm font-medium text-wine-700 transition hover:border-wine-400 hover:bg-wine-50"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

export function AudioInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload('audio');
  const name = value ? decodeURIComponent(value.split('/').pop()?.split('?')[0] || 'Bài hát') : '';

  return (
    <div className="rounded-2xl border border-wine-900/10 bg-white p-4">
      <input
        ref={input}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          run(e.target.files, ([url]) => onChange(url));
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600">
              <Music2 size={18} />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
            <button type="button" onClick={() => input.current?.click()} className="text-xs font-semibold text-wine-700 hover:underline">
              Đổi bài
            </button>
            <button type="button" aria-label="Xoá nhạc" onClick={() => onChange('')} className="rounded-full p-1 text-rose-600 hover:bg-rose-50">
              <X size={16} />
            </button>
          </div>
          <audio src={value} controls className="h-9 w-full" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex w-full items-center gap-3 text-left text-sm text-ink/60 hover:text-wine-700"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600">
            {busy ? <Spinner /> : <Upload size={18} />}
          </span>
          <span>
            <span className="block font-medium text-ink">{busy ? 'Đang tải nhạc lên…' : 'Tải bài hát của hai bạn'}</span>
            <span className="text-xs text-ink/45">File MP3, tối đa {MAX_MB}MB</span>
          </span>
        </button>
      )}
    </div>
  );
}
