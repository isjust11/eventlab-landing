'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Eye, PartyPopper, Save, Send, Users, X } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Field, Input, Spinner, Switch, Textarea, copyText } from '@/components/ui';
import { toast } from '@/components/Toaster';
import { inviteUrl } from '@/lib/config';
import {
  catalogTemplate,
  createEvent,
  getEvent,
  loadEditorSchema,
  publishEvent,
  STATUS_LABELS,
  updateEvent,
  type EventStatus,
} from '@/lib/events';
import {
  buildFields,
  EFFECTS,
  galleryUrls,
  galleryValue,
  GROUPS,
  isEffectOn,
  sampleValues,
  templateTheme,
  toPreviewData,
  withEffectDefaults,
  type FieldDef,
} from '@/lib/fields';
import { fromLocalInput, toLocalInput } from '@/lib/format';
import {
  matchThemePresetId,
  THEME_COLOR_KEYS,
  THEME_COLOR_PRESETS,
  type ThemeColorTokens,
} from '@/lib/theme-presets';
import EffectDemo from './EffectDemo';
import { AudioInput, ColorsInput, GalleryInput, ImageInput, ItemsInput, LinesInput } from './inputs';
import LivePreview from './LivePreview';

type Mode = { kind: 'new'; slug: string } | { kind: 'edit'; id: string };

type Loaded = {
  templateSlug: string;
  templateName: string;
  schema: Record<string, unknown>;
  fields: FieldDef[];
  sample: Record<string, unknown>;
  baseTheme: Record<string, unknown>;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');

const isEmpty = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);

const WIDE = new Set<FieldDef['kind']>(['textarea', 'image', 'gallery', 'lines', 'colors', 'items']);

function FieldInput({
  field,
  value,
  sample,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  sample: unknown;
  onChange: (v: unknown) => void;
}) {
  const placeholder = field.placeholder || (typeof sample === 'string' ? sample : undefined);
  switch (field.kind) {
    case 'textarea':
      return <Textarea id={field.key} value={str(value)} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
    case 'datetime':
      return (
        <Input
          id={field.key}
          type="datetime-local"
          value={toLocalInput(value)}
          onChange={(e) => onChange(fromLocalInput(e.target.value))}
        />
      );
    case 'image':
      return <ImageInput value={str(value)} onChange={onChange} />;
    case 'gallery':
      return <GalleryInput urls={galleryUrls(value)} onChange={(urls) => onChange(galleryValue(urls, Array.isArray(value) && value.length ? value : sample))} />;
    case 'lines':
      return (
        <LinesInput
          id={field.key}
          lines={Array.isArray(value) ? value.map(String) : []}
          placeholder={Array.isArray(sample) ? sample.map(String).join('\n') : undefined}
          onChange={onChange}
        />
      );
    case 'colors':
      return (
        <ColorsInput
          id={field.key}
          colors={Array.isArray(value) ? value.map(String) : []}
          onChange={onChange}
        />
      );
    case 'items':
      return (
        <ItemsInput
          items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
          fields={field.itemFields ?? []}
          onChange={onChange}
          addLabel={
            field.key === 'gifts'
              ? 'Thêm tài khoản'
              : field.key === 'story'
                ? 'Thêm cột mốc'
                : field.key === 'events'
                  ? 'Thêm sự kiện'
                  : 'Thêm mục'
          }
        />
      );
    case 'url':
    case 'video':
      return (
        <Input id={field.key} type="url" inputMode="url" value={str(value)} placeholder={placeholder || 'https://'} onChange={(e) => onChange(e.target.value)} />
      );
    default:
      return <Input id={field.key} value={str(value)} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

function PublishedDialog({ url, eventId, onClose }: { url: string; eventId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Thiệp mời', url }).catch(() => undefined);
      return;
    }
    setCopied(await copyText(url));
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="published-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-card sm:p-9"
      >
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 rounded-full p-2 text-ink/40 hover:bg-wine-50">
          <X size={18} />
        </button>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-wine-900">
          <PartyPopper size={28} />
        </span>
        <h2 id="published-title" className="mt-5 font-serif text-3xl font-semibold">
          Thiệp đã sẵn sàng!
        </h2>
        <p className="mt-2 text-sm text-ink/60">Gửi link này qua Zalo, Messenger hay tin nhắn để mời mọi người nhé.</p>
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-wine-900/10 bg-cream p-2 pl-4">
          <span className="min-w-0 flex-1 truncate text-left text-sm text-ink/70">{url}</span>
          <button
            type="button"
            onClick={async () => setCopied(await copyText(url))}
            className="btn-primary shrink-0 px-4 py-2 text-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={share} className="btn-outline px-3 py-3">
            <Send size={15} /> Chia sẻ
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="btn-outline px-3 py-3">
            <ExternalLink size={15} /> Mở thiệp
          </a>
        </div>
        <Link href={`/su-kien/${eventId}`} className="btn mt-3 w-full bg-wine-50 py-3 text-wine-700 hover:bg-wine-100">
          <Users size={15} /> Thêm khách mời & theo dõi RSVP
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function EventEditor({ mode }: { mode: Mode }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState('');
  const [eventId, setEventId] = useState<string | null>(mode.kind === 'edit' ? mode.id : null);
  const [status, setStatus] = useState<EventStatus>('DRAFT');
  const [title, setTitle] = useState('');
  const [savedTitle, setSavedTitle] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [theme, setTheme] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobilePreview, setMobilePreview] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let templateSlug: string;
        let initialValues: Record<string, unknown> | null = null;
        let initialTheme: Record<string, unknown> = {};
        if (mode.kind === 'edit') {
          const event = await getEvent(mode.id);
          templateSlug = event.template?.slug || '';
          if (!templateSlug) throw new Error('Sự kiện này chưa gắn mẫu thiệp.');
          const { theme: savedTheme, ...rest } = (event.eventData || {}) as Record<string, unknown>;
          initialValues = rest;
          initialTheme = savedTheme && typeof savedTheme === 'object' ? (savedTheme as Record<string, unknown>) : {};
          if (cancelled) return;
          setTitle(event.title);
          setSavedTitle(event.title);
          setStatus(event.status);
        } else {
          templateSlug = mode.slug;
        }

        const schema = await loadEditorSchema(templateSlug);
        if (!schema) throw new Error('Không tìm thấy mẫu thiệp này.');
        const fields = buildFields(schema.schema, schema.slots, schema.required);
        const sample = sampleValues(schema.schema);
        if (!initialValues) {
          const visible = new Set(fields.map((f) => f.key));
          initialValues = Object.fromEntries(Object.entries(sample).filter(([key, v]) => visible.has(key) || !isEmpty(v)));
          for (const f of fields) if (f.group === 'gift') initialValues[f.key] = f.kind === 'items' ? [] : '';
        }
        if (cancelled) return;
        setLoaded({
          templateSlug,
          templateName: schema.title || 'Mẫu thiệp',
          schema: schema.schema,
          fields,
          sample,
          baseTheme: withEffectDefaults(templateTheme(schema.schema)),
        });
        setValues(initialValues);
        setTheme(initialTheme);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Không mở được thiệp.');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.kind === 'edit' ? mode.id : mode.slug]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _gone, ...rest } = prev;
      return rest;
    });
    setDirty(true);
  }, []);

  const themeValue = (key: string) => theme[key] ?? loaded?.baseTheme[key];
  const setThemeValue = (key: string, value: unknown) => {
    setTheme((prev) => {
      const next = { ...prev };
      if (JSON.stringify(value) === JSON.stringify(loaded?.baseTheme[key])) delete next[key];
      else next[key] = value;
      return next;
    });
    setDirty(true);
  };

  const applyColorTokens = (colors: ThemeColorTokens) => {
    setTheme((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(colors) as Array<keyof ThemeColorTokens>) {
        const value = colors[key];
        if (JSON.stringify(value) === JSON.stringify(loaded?.baseTheme[key])) delete next[key];
        else next[key] = value;
      }
      return next;
    });
    setDirty(true);
  };

  const resetColorTokens = () => {
    setTheme((prev) => {
      const next = { ...prev };
      for (const { key } of THEME_COLOR_KEYS) delete next[key];
      return next;
    });
    setDirty(true);
  };

  const groom = str(values.groomName).trim();
  const bride = str(values.brideName).trim();
  const isWedding = loaded?.templateSlug.startsWith('wedding') ?? false;
  const autoTitle =
    groom && bride ? `Lễ cưới ${groom} & ${bride}` : isWedding ? 'Thiệp cưới của chúng mình' : 'Sự kiện của tôi';
  const finalTitle = title.trim() || autoTitle;

  const payload = useMemo(
    () =>
      loaded
        ? { templateId: loaded.templateSlug, title: finalTitle, data: toPreviewData(values, loaded.schema, theme) }
        : null,
    [loaded, finalTitle, values, theme],
  );

  const persist = async () => {
    if (!loaded) throw new Error('Thiệp chưa tải xong.');
    const visible = new Set(loaded.fields.map((f) => f.key));
    const kept = Object.fromEntries(Object.entries(values).filter(([key, v]) => visible.has(key) || !isEmpty(v)));
    const eventData = { ...kept, ...(Object.keys(theme).length ? { theme } : {}) };
    const common = {
      eventDate: str(values.eventDate) || undefined,
      venue: str(values.venue) || undefined,
      coverImageUrl: str(values.coverImage) || undefined,
      eventData,
    };
    if (!eventId) {
      const template = await catalogTemplate(loaded.templateSlug);
      if (!template) throw new Error('Mẫu này chưa mở để tạo thiệp. Bạn chọn mẫu khác giúp mình nhé.');
      const created = await createEvent({ title: finalTitle, type: template.type, templateId: template.id, ...common });
      setEventId(created.id);
      setSavedTitle(finalTitle);
      setTitle(finalTitle);
      window.history.replaceState(null, '', `/su-kien/${created.id}/chinh-sua`);
      return created.id;
    }
    await updateEvent(eventId, { ...common, ...(finalTitle !== savedTitle ? { title: finalTitle } : {}) });
    setSavedTitle(finalTitle);
    return eventId;
  };

  const run = async (kind: 'draft' | 'publish') => {
    if (kind === 'publish') {
      const missing = (loaded?.fields ?? []).filter((f) => f.required && isEmpty(values[f.key]));
      if (missing.length) {
        setErrors(Object.fromEntries(missing.map((f) => [f.key, 'Bạn điền giúp mình mục này nhé.'])));
        document.getElementById(`field-${missing[0].key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast(`Còn thiếu: ${missing.map((f) => f.label.toLowerCase()).join(', ')}`, 'error');
        return;
      }
    }
    setSaving(kind);
    try {
      const id = await persist();
      setDirty(false);
      setSavedAt(new Date());
      if (kind === 'publish' && status !== 'PUBLISHED') {
        const published = await publishEvent(id);
        setStatus('PUBLISHED');
        if (published.slug) setSharedUrl(inviteUrl(published.slug));
      } else {
        toast(status === 'PUBLISHED' ? 'Đã cập nhật — khách sẽ thấy thay đổi ngay.' : 'Đã lưu bản nháp.');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Chưa lưu được, bạn thử lại nhé.', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loadError) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-cream px-6 text-center">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Chưa mở được thiệp</h1>
          <p className="mt-2 text-ink/60">{loadError}</p>
          <Link href="/su-kien" className="btn-primary mt-6">
            Về sự kiện của tôi
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded || !payload) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-cream text-wine-600">
        <Spinner size={28} />
      </div>
    );
  }

  const groups = GROUPS.filter((g) => loaded.fields.some((f) => f.group === g.key));
  const themeResolved = { ...loaded.baseTheme, ...theme };
  const saveState = saving
    ? 'Đang lưu…'
    : dirty
      ? 'Có thay đổi chưa lưu'
      : savedAt
        ? `Đã lưu lúc ${savedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
        : eventId
          ? STATUS_LABELS[status]
          : 'Chưa lưu';
  const titleChangesLink = status === 'PUBLISHED' && finalTitle !== savedTitle;

  return (
    <div className="min-h-[100svh] bg-cream">
      <header className="sticky top-0 z-40 border-b border-wine-900/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Link
            href={eventId ? `/su-kien/${eventId}` : '/tao-thiep'}
            aria-label="Quay lại"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-wine-50 hover:text-wine-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              value={title}
              placeholder={autoTitle}
              aria-label="Tên sự kiện"
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              className="w-full truncate rounded-lg bg-transparent font-serif text-base font-semibold outline-none placeholder:text-ink/70 focus:bg-wine-50/60 sm:text-lg"
            />
            <p className="truncate text-xs text-ink/45">
              Mẫu {loaded.templateName} · <span className={dirty ? 'text-gold-500' : ''}>{saveState}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobilePreview(true)}
            className="btn-outline px-3 py-2.5 lg:hidden"
            aria-label="Xem thiệp"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => run('draft')}
            disabled={!!saving}
            className="btn-outline px-3 py-2.5 disabled:opacity-60 sm:px-5"
            aria-label="Lưu"
          >
            {saving === 'draft' ? <Spinner size={16} /> : <Save size={16} />}
            <span className="hidden sm:inline">Lưu</span>
          </button>
          <button type="button" onClick={() => run('publish')} disabled={!!saving} className="btn-primary px-4 py-2.5 disabled:opacity-60 sm:px-5">
            {saving === 'publish' ? <Spinner size={16} /> : <Send size={16} />}
            {status === 'PUBLISHED' ? 'Cập nhật' : 'Xuất bản'}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-8">
        <div className="min-w-0">
          {titleChangesLink ? (
            <p className="mb-4 rounded-2xl bg-gold-200/40 px-4 py-3 text-sm text-ink/75">
              Đổi tên sự kiện sẽ tạo link thiệp mới — link cũ bạn đã gửi sẽ không mở được nữa.
            </p>
          ) : null}

          <nav className="no-scrollbar sticky top-16 z-30 -mx-4 flex gap-2 overflow-x-auto bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            {[
              ...groups.map((g) => ({ key: g.key, title: g.title })),
              { key: 'colors', title: 'Màu sắc' },
              { key: 'music', title: 'Nhạc & hiệu ứng' },
            ].map((g) => (
              <a
                key={g.key}
                href={`#sec-${g.key}`}
                className="shrink-0 rounded-full border border-wine-900/10 bg-white px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-wine-400 hover:text-wine-700"
              >
                {g.title}
              </a>
            ))}
          </nav>

          <div className="mt-3 space-y-6">
            {groups.map((group) => (
              <section key={group.key} id={`sec-${group.key}`} className="scroll-mt-36 rounded-3xl border border-wine-900/5 bg-white p-5 shadow-card sm:p-7">
                <h2 className="font-serif text-2xl font-semibold">{group.title}</h2>
                <p className="mt-1 text-sm text-ink/55">{group.text}</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {loaded.fields
                    .filter((f) => f.group === group.key)
                    .map((field) => (
                      <div key={field.key} id={`field-${field.key}`} className={`scroll-mt-40 ${WIDE.has(field.kind) ? 'sm:col-span-2' : ''}`}>
                        <Field label={field.label} hint={field.hint} error={errors[field.key]} required={field.required} htmlFor={field.key}>
                          <FieldInput
                            field={field}
                            value={values[field.key]}
                            sample={loaded.sample[field.key]}
                            onChange={(v) => setValue(field.key, v)}
                          />
                        </Field>
                      </div>
                    ))}
                </div>
              </section>
            ))}

            <section id="sec-colors" className="scroll-mt-36 rounded-3xl border border-wine-900/5 bg-white p-5 shadow-card sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">Màu sắc</h2>
                  <p className="mt-1 text-sm text-ink/55">Chọn bảng màu có sẵn hoặc tinh chỉnh từng tông.</p>
                </div>
                <button type="button" onClick={resetColorTokens} className="text-xs font-semibold text-wine-700 hover:underline">
                  Về màu mẫu gốc
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {THEME_COLOR_PRESETS.map((preset) => {
                  const active = matchThemePresetId(themeResolved) === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyColorTokens(preset.colors)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        active ? 'border-wine-500 bg-wine-50 ring-2 ring-wine-400/40' : 'border-wine-900/10 hover:border-wine-300'
                      }`}
                    >
                      <span className="flex gap-1">
                        {[preset.colors.accent, preset.colors.accentSoft, preset.colors.bg, preset.colors.ink].map((c) => (
                          <span key={c} className="h-5 w-5 rounded-full border border-black/5" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="mt-2 block text-sm font-medium">{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {THEME_COLOR_KEYS.map(({ key, label }) => {
                  const hex = str(themeValue(key)) || '#000000';
                  return (
                    <label key={key} className="flex items-center gap-3 rounded-2xl border border-wine-900/10 bg-cream/40 px-3 py-2.5">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'}
                        onChange={(e) => setThemeValue(key, e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        aria-label={label}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{label}</span>
                        <span className="font-mono text-xs text-ink/45">{hex}</span>
                      </span>
                      <Input
                        type="text"
                        value={hex}
                        onChange={(e) => setThemeValue(key, e.target.value)}
                        className="w-[5.5rem] font-mono text-xs"
                        aria-label={`${label} hex`}
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            <section id="sec-music" className="scroll-mt-36 rounded-3xl border border-wine-900/5 bg-white p-5 shadow-card sm:p-7">
              <h2 className="font-serif text-2xl font-semibold">Nhạc & hiệu ứng</h2>
              <p className="mt-1 text-sm text-ink/55">Chọn nhạc có sẵn, tải bài của bạn, và xem thử hiệu ứng trước khi bật.</p>
              <div className="mt-6 space-y-3">
                <AudioInput
                  value={str(themeValue('musicUrl'))}
                  onChange={(url) => {
                    setThemeValue('musicUrl', url);
                    setThemeValue('musicEnabled', Boolean(url));
                  }}
                />
                <Switch
                  checked={Boolean(themeValue('musicEnabled'))}
                  onChange={(v) => setThemeValue('musicEnabled', v)}
                  label="Phát nhạc nền"
                  text="Nhạc bắt đầu khi khách chạm mở thiệp."
                />
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-ink/80">Hiệu ứng</h3>
                  <p className="mt-0.5 text-xs text-ink/50">Bật/tắt từng hiệu ứng — nhấn “Xem thử” để xem demo ngay tại đây.</p>
                </div>
                {EFFECTS.map((effect) => (
                  <div key={effect.key}>
                    <Switch
                      checked={isEffectOn(themeResolved, effect.key)}
                      onChange={(v) => setThemeValue(effect.key, v)}
                      label={effect.label}
                      text={effect.text}
                    />
                    <div className="px-1">
                      <EffectDemo effectKey={effect.key} label={effect.label} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside
          className={
            mobilePreview
              ? 'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/85 p-5 backdrop-blur-sm'
              : 'hidden lg:block'
          }
        >
          <div className={mobilePreview ? 'w-[min(78vw,340px)]' : 'sticky top-24 mx-auto w-[320px]'}>
            <PhoneFrame>
              <LivePreview payload={payload} />
            </PhoneFrame>
            {mobilePreview ? null : (
              <p className="mt-4 text-center text-xs text-ink/45">Xem trước cập nhật ngay khi bạn sửa — chạm vào thiệp để thử.</p>
            )}
          </div>
          {mobilePreview ? (
            <button type="button" onClick={() => setMobilePreview(false)} className="btn bg-white px-6 text-ink">
              <X size={16} /> Tiếp tục chỉnh sửa
            </button>
          ) : null}
        </aside>
      </div>

      <AnimatePresence>
        {sharedUrl && eventId ? <PublishedDialog url={sharedUrl} eventId={eventId} onClose={() => setSharedUrl(null)} /> : null}
      </AnimatePresence>
    </div>
  );
}
