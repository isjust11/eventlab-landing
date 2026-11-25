'use client';

import { useEffect, useRef, useState } from 'react';
import { FolderOpen, ImagePlus, Library, Music2, Pause, Play, Plus, Trash2, Upload, X } from 'lucide-react';
import { listMyMedia, mediaPublicUrl, uploadFile, type MediaItem } from '@/lib/api';
import type { ItemField } from '@/lib/fields';
import {
  DEFAULT_MUSIC_LIBRARY,
  fetchMusicLibrary,
  matchMusicTrackId,
  musicTrackLabel,
  type MusicTrack,
} from '@/lib/music-library';
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

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHex(value: string) {
  const raw = value.trim();
  if (!HEX.test(raw)) return null;
  if (raw.length === 4) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
  }
  return raw.toLowerCase();
}

/** Popular wedding dress-code palettes + singles for quick pick. */
export const DRESS_CODE_PALETTES: Array<{ id: string; name: string; colors: string[] }> = [
  {
    id: 'earthy',
    name: 'Trung tính đất',
    colors: ['#efe6da', '#c9b29b', '#8b5e45', '#5f6b4e', '#2b2724'],
  },
  {
    id: 'champagne',
    name: 'Champagne',
    colors: ['#f7efe0', '#e8d5a3', '#c9a227', '#8b7355', '#4a3f2f'],
  },
  {
    id: 'blush',
    name: 'Hồng blush',
    colors: ['#faf0f0', '#f2c4c4', '#d4a5a5', '#c97b84', '#7a3d48'],
  },
  {
    id: 'sage',
    name: 'Xanh sage',
    colors: ['#eef3eb', '#c5d5c0', '#8fa88a', '#5f6b4e', '#2f3a2c'],
  },
  {
    id: 'navy',
    name: 'Navy cổ điển',
    colors: ['#eef2f7', '#a8b8c8', '#5a6f8a', '#2c3e50', '#121820'],
  },
  {
    id: 'burgundy',
    name: 'Đỏ burgundy',
    colors: ['#f6ecee', '#d4a0a8', '#9b3a4a', '#5c1a28', '#2a1014'],
  },
];

export const POPULAR_DRESS_COLORS = Array.from(
  new Set(DRESS_CODE_PALETTES.flatMap((p) => p.colors).map((c) => c.toLowerCase())),
);

export function ColorsInput({
  id,
  colors,
  onChange,
}: {
  id?: string;
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  const selected = colors.map((c) => normalizeHex(c) || c.trim()).filter(Boolean);
  const selectedSet = new Set(selected.map((c) => c.toLowerCase()));

  const toggle = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    if (selectedSet.has(next)) {
      onChange(selected.filter((c) => c.toLowerCase() !== next));
      return;
    }
    onChange([...selected, next]);
  };

  const applyPalette = (palette: string[]) => {
    onChange(palette.map((c) => normalizeHex(c) || c));
  };

  const addCustom = (raw: string) => {
    const next = normalizeHex(raw);
    if (!next) {
      toast('Mã màu không hợp lệ. Dùng dạng #RRGGBB.', 'error');
      return;
    }
    if (selectedSet.has(next)) return;
    onChange([...selected, next]);
  };

  const activePalette = DRESS_CODE_PALETTES.find(
    (p) =>
      p.colors.length === selected.length &&
      p.colors.every((c, i) => c.toLowerCase() === selected[i]?.toLowerCase()),
  );

  return (
    <div id={id} className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-ink/55">Bảng màu phổ biến</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DRESS_CODE_PALETTES.map((palette) => {
            const active = activePalette?.id === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => applyPalette(palette.colors)}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-wine-400 bg-wine-50 ring-1 ring-wine-200'
                    : 'border-wine-900/10 bg-white hover:border-wine-300 hover:bg-wine-50/60'
                }`}
              >
                <span className="flex -space-x-1.5">
                  {palette.colors.map((c) => (
                    <span
                      key={c}
                      className="h-6 w-6 rounded-full border border-white shadow-sm ring-1 ring-black/5"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{palette.name}</span>
                  <span className="block text-[11px] text-ink/45">{palette.colors.length} màu</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink/55">Chọn từng màu</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DRESS_COLORS.map((hex) => {
            const on = selectedSet.has(hex);
            return (
              <button
                key={hex}
                type="button"
                title={hex}
                aria-pressed={on}
                onClick={() => toggle(hex)}
                className={`relative h-9 w-9 rounded-full transition ${
                  on
                    ? 'scale-105 ring-2 ring-wine-700 ring-offset-2 ring-offset-cream shadow-md'
                    : 'ring-1 ring-black/10 hover:scale-105'
                }`}
                style={{ background: hex }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-ink/55">Đã chọn ({selected.length})</p>
          {selected.length ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Xoá hết
            </button>
          ) : null}
        </div>
        {selected.length === 0 ? (
          <p className="rounded-xl border border-dashed border-wine-900/15 bg-cream/50 px-3 py-4 text-center text-xs text-ink/45">
            Chưa chọn màu — bấm bảng màu hoặc từng ô màu phía trên.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => toggle(hex)}
                className="group inline-flex items-center gap-2 rounded-full border border-wine-900/10 bg-white py-1 pl-1 pr-2.5 text-xs font-medium text-ink shadow-sm transition hover:border-rose-200"
                title="Bỏ màu này"
              >
                <span className="h-6 w-6 rounded-full border border-black/5" style={{ background: hex }} />
                <span className="font-mono text-[11px] text-ink/60">{hex}</span>
                <X size={12} className="text-ink/35 group-hover:text-rose-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      <label className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-ink/55">Thêm màu tùy chỉnh</span>
        <input
          type="color"
          className="h-9 w-12 cursor-pointer rounded-lg border border-wine-900/10 bg-white p-1"
          defaultValue="#c9b29b"
          onChange={(e) => addCustom(e.target.value)}
          aria-label="Chọn màu tùy chỉnh"
        />
        <Input
          className="max-w-[9rem] font-mono text-sm"
          placeholder="#RRGGBB"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            addCustom((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = '';
          }}
        />
      </label>
    </div>
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

function audioLabel(item: MediaItem | string) {
  if (typeof item === 'string') return musicTrackLabel(item);
  return item.originalName || item.filename || 'Bài hát';
}

export function AudioInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const { busy, run } = useUpload('audio');
  const [tab, setTab] = useState<'catalog' | 'mine'>('catalog');
  const [catalog, setCatalog] = useState<MusicTrack[]>(DEFAULT_MUSIC_LIBRARY);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const selectedCatalogId = matchMusicTrackId(value, catalog);

  const loadCatalog = async () => {
    setLoadingCatalog(true);
    try {
      setCatalog(await fetchMusicLibrary(true));
    } catch {
      setCatalog(DEFAULT_MUSIC_LIBRARY);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const loadLibrary = async () => {
    setLoadingLibrary(true);
    try {
      setLibrary(await listMyMedia('audio'));
    } catch {
      setLibrary([]);
      toast('Chưa lấy được kho nhạc. Bạn thử tải lên file mới nhé.', 'error');
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (tab !== 'mine') return;
    void loadLibrary();
  }, [tab]);

  useEffect(() => {
    return () => {
      previewRef.current?.pause();
      previewRef.current = null;
    };
  }, []);

  const stopPreview = () => {
    previewRef.current?.pause();
    previewRef.current = null;
    setPreviewId(null);
  };

  const togglePreview = async (id: string, url: string) => {
    if (previewId === id) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = new Audio(url);
    previewRef.current = audio;
    setPreviewId(id);
    try {
      await audio.play();
      audio.onended = () => setPreviewId(null);
    } catch {
      setPreviewId(null);
      toast('Chưa phát được bản xem thử.', 'error');
    }
  };

  const pickFromLibrary = (item: MediaItem) => {
    const url = mediaPublicUrl(item);
    if (!url) return;
    stopPreview();
    onChange(url);
  };

  const uploadAndSelect = (files: FileList | null) => {
    run(files, async ([url]) => {
      stopPreview();
      onChange(url);
      setTab('mine');
      try {
        setLibrary(await listMyMedia('audio'));
      } catch {
        /* ignore */
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-wine-900/10 bg-white p-4">
        <input
          ref={input}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            uploadAndSelect(e.target.files);
            e.target.value = '';
          }}
        />
        {value ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600">
                <Music2 size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{musicTrackLabel(value, catalog)}</p>
                {selectedCatalogId ? (
                  <p className="text-xs text-ink/45">Thư viện EventLab</p>
                ) : null}
              </div>
              <button type="button" onClick={() => input.current?.click()} className="text-xs font-semibold text-wine-700 hover:underline">
                Tải bài khác
              </button>
              <button type="button" aria-label="Xoá nhạc" onClick={() => onChange('')} className="rounded-full p-1 text-rose-600 hover:bg-rose-50">
                <X size={16} />
              </button>
            </div>
            <audio src={value} controls className="h-9 w-full" />
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTab('catalog')}
              className="flex items-center gap-3 rounded-xl border border-wine-900/10 px-3 py-3 text-left text-sm transition hover:border-wine-400 hover:bg-wine-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600">
                <Library size={18} />
              </span>
              <span>
                <span className="block font-medium text-ink">Thư viện EventLab</span>
                <span className="text-xs text-ink/45">{catalog.length} bài có sẵn</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="flex items-center gap-3 rounded-xl border border-wine-900/10 px-3 py-3 text-left text-sm transition hover:border-wine-400 hover:bg-wine-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600">
                {busy ? <Spinner /> : <Upload size={18} />}
              </span>
              <span>
                <span className="block font-medium text-ink">{busy ? 'Đang tải nhạc lên…' : 'Tải bài của bạn'}</span>
                <span className="text-xs text-ink/45">MP3, tối đa {MAX_MB}MB</span>
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            tab === 'catalog' ? 'bg-wine-100 text-wine-800' : 'bg-white text-ink/60 ring-1 ring-wine-900/10 hover:text-wine-700'
          }`}
        >
          Thư viện mặc định
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            tab === 'mine' ? 'bg-wine-100 text-wine-800' : 'bg-white text-ink/60 ring-1 ring-wine-900/10 hover:text-wine-700'
          }`}
        >
          Kho lưu trữ
        </button>
      </div>

      {tab === 'catalog' ? (
        <div className="rounded-2xl border border-wine-900/10 bg-cream/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink/80">Chọn nhạc nền có sẵn</p>
            <button type="button" onClick={() => void loadCatalog()} className="text-xs font-semibold text-wine-700 hover:underline">
              Làm mới
            </button>
          </div>
          {loadingCatalog ? (
            <div className="grid place-items-center py-8 text-wine-600">
              <Spinner size={22} />
            </div>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {catalog.map((track) => {
                const selected = selectedCatalogId === track.id;
                const previewing = previewId === track.id;
                return (
                  <li key={track.id}>
                    <div
                      className={`flex items-center gap-2 rounded-xl px-2 py-2 transition ${
                        selected ? 'bg-wine-100 text-wine-800' : 'bg-white hover:bg-wine-50'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={previewing ? 'Dừng xem thử' : 'Nghe thử'}
                        onClick={() => void togglePreview(track.id, track.url)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-wine-50 text-wine-700"
                      >
                        {previewing ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopPreview();
                          onChange(track.url);
                        }}
                        className="min-w-0 flex-1 py-1 text-left"
                      >
                        <span className="block truncate text-sm font-medium">{track.name}</span>
                        <span className="block text-xs text-ink/45">{track.mood}</span>
                      </button>
                      {selected ? <span className="pr-2 text-xs font-semibold">Đang dùng</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-wine-900/10 bg-cream/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink/80">Kho nhạc của bạn</p>
            <button type="button" onClick={() => void loadLibrary()} className="text-xs font-semibold text-wine-700 hover:underline">
              Làm mới
            </button>
          </div>
          {loadingLibrary ? (
            <div className="grid place-items-center py-8 text-wine-600">
              <Spinner size={22} />
            </div>
          ) : library.length === 0 ? (
            <div className="rounded-xl bg-white px-4 py-6 text-center text-sm text-ink/55">
              <FolderOpen className="mx-auto mb-2 text-wine-400" size={22} />
              Chưa có bài nào trong kho. Tải lên file MP3 để dùng lại sau này.
            </div>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {library.map((item) => {
                const url = mediaPublicUrl(item);
                const selected = Boolean(url && url === value);
                return (
                  <li key={item.id || url}>
                    <button
                      type="button"
                      disabled={!url}
                      onClick={() => pickFromLibrary(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        selected ? 'bg-wine-100 text-wine-800' : 'bg-white hover:bg-wine-50'
                      }`}
                    >
                      <Music2 size={16} className="shrink-0 text-wine-600" />
                      <span className="min-w-0 flex-1 truncate font-medium">{audioLabel(item)}</span>
                      {selected ? <span className="text-xs font-semibold">Đang dùng</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
