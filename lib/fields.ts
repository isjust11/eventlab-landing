/**
 * Turns a template's field schema (or plain sample values) into friendly form fields.
 * Admin-authored labels win; otherwise labels and input kinds are inferred from the key and sample value.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'datetime'
  | 'image'
  | 'gallery'
  | 'lines'
  | 'colors'
  | 'url'
  | 'video'
  | 'items';

export type GroupKey = 'couple' | 'time' | 'message' | 'media' | 'gift' | 'other';

export type ItemField = { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'url' };

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  group: GroupKey;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  itemFields?: ItemField[];
};

export const GROUPS: Array<{ key: GroupKey; title: string; text: string }> = [
  { key: 'couple', title: 'Cô dâu & chú rể', text: 'Tên, ảnh và vài lời giới thiệu về hai bạn.' },
  { key: 'time', title: 'Thời gian & địa điểm', text: 'Khách sẽ thấy lịch và nút chỉ đường từ đây.' },
  { key: 'message', title: 'Lời mời', text: 'Những dòng chữ khách đọc khi mở thiệp.' },
  { key: 'media', title: 'Ảnh & video', text: 'Ảnh bìa, album cưới và video kỷ niệm.' },
  { key: 'gift', title: 'Mừng cưới', text: 'Tài khoản nhận quà mừng — có thể để trống.' },
  { key: 'other', title: 'Thông tin khác', text: 'Các mục riêng của mẫu thiệp này.' },
];

const KNOWN: Record<
  string,
  { label: string; group: GroupKey; kind?: FieldKind; placeholder?: string; hint?: string; optional?: boolean }
> = {
  groomName: { label: 'Tên chú rể', group: 'couple', placeholder: 'VD: Trung Hiếu' },
  brideName: { label: 'Tên cô dâu', group: 'couple', placeholder: 'VD: Ngọc Ánh' },
  groomPhoto: { label: 'Ảnh chú rể', group: 'couple' },
  bridePhoto: { label: 'Ảnh cô dâu', group: 'couple' },
  groomParents: { label: 'Bố mẹ nhà trai', group: 'couple' },
  brideParents: { label: 'Bố mẹ nhà gái', group: 'couple' },
  coupleIntro: { label: 'Đôi lời về hai bạn', group: 'couple', kind: 'textarea' },
  eventDate: { label: 'Ngày giờ tổ chức', group: 'time', kind: 'datetime' },
  eventDateDisplay: {
    label: 'Cách ghi ngày trên thiệp',
    group: 'time',
    hint: 'Để trống để tự ghi theo ngày giờ ở trên.',
    placeholder: 'VD: Thứ Ba, ngày 24 tháng 11 năm 2026',
    optional: true,
  },
  city: { label: 'Thành phố', group: 'time', placeholder: 'VD: TP. Hồ Chí Minh' },
  hosts: { label: 'Gia đình đứng ra mời', group: 'couple', placeholder: 'VD: Gia đình hai họ Nguyễn & Trần' },
  scheduleIntro: { label: 'Giới thiệu lịch trình', group: 'time', kind: 'textarea' },
  schedule: { label: 'Lịch trình ngày cưới', group: 'time', kind: 'items' },
  eventNote: { label: 'Ghi chú cho khách', group: 'time', kind: 'textarea', placeholder: 'VD: Dress code, chỗ gửi xe…' },
  backgroundImage: { label: 'Ảnh nền', group: 'media', kind: 'image' },
  venue: { label: 'Nơi tổ chức', group: 'time', placeholder: 'VD: Nhà hàng tiệc cưới Forever' },
  address: { label: 'Địa chỉ', group: 'time', placeholder: 'Số nhà, đường, phường, quận…' },
  mapsUrl: { label: 'Link Google Maps', group: 'time', kind: 'url', hint: 'Mở Google Maps, bấm Chia sẻ rồi dán link vào đây.' },
  rsvpDeadline: { label: 'Hạn xác nhận tham dự', group: 'time', placeholder: 'VD: 15.11.2026' },
  greeting: { label: 'Lời chào', group: 'message' },
  welcomeLines: { label: 'Lời mời', group: 'message', kind: 'lines', hint: 'Mỗi dòng là một câu.' },
  invitation: { label: 'Lời mời', group: 'message', kind: 'textarea' },
  footerMessage: { label: 'Lời cảm ơn cuối thiệp', group: 'message', kind: 'textarea' },
  coverImage: { label: 'Ảnh bìa', group: 'media', kind: 'image' },
  album: { label: 'Album ảnh', group: 'media', kind: 'gallery' },
  gallery: { label: 'Album ảnh', group: 'media', kind: 'gallery' },
  videoUrl: { label: 'Video (YouTube)', group: 'media', kind: 'video', placeholder: 'https://www.youtube.com/watch?v=…' },
  gifts: { label: 'Tài khoản mừng cưới', group: 'gift', kind: 'items', hint: 'Có thể kèm ảnh mã QR chuyển khoản.' },
  story: { label: 'Chuyện tình', group: 'message', kind: 'items' },
  events: { label: 'Lịch trình ngày cưới', group: 'time', kind: 'items' },
  dressCodeNote: {
    label: 'Ghi chú trang phục',
    group: 'other',
    kind: 'textarea',
    placeholder: 'VD: Tông trung tính & đất — be, nâu mocha, xanh olive.',
  },
  dressCodeColors: {
    label: 'Màu trang phục',
    group: 'other',
    kind: 'colors',
    hint: 'Chọn bảng màu có sẵn hoặc bấm từng màu phổ biến.',
  },
};

const ITEM_LABELS: Record<string, string> = {
  owner: 'Chủ tài khoản',
  bank: 'Ngân hàng',
  bankName: 'Ngân hàng',
  accountNumber: 'Số tài khoản',
  qr: 'Mã QR',
  qrImage: 'Mã QR chuyển khoản',
  qrUrl: 'Mã QR',
  title: 'Tiêu đề',
  name: 'Tên',
  role: 'Vai trò',
  label: 'Tên sự kiện',
  time: 'Giờ',
  date: 'Thời điểm',
  dateDisplay: 'Ngày hiển thị',
  description: 'Mô tả',
  image: 'Ảnh',
  photo: 'Ảnh',
  url: 'Đường dẫn',
  caption: 'Chú thích',
  venue: 'Địa điểm',
  address: 'Địa chỉ',
  mapsUrl: 'Link Google Maps',
};

const HIDDEN = new Set(['theme', 'locale', 'slug', 'templateId', 'footerCredit']);

/** JSON-schema property from a template package's `slots.schema.json`. */
export type SlotProp = {
  type?: string;
  format?: string;
  slot?: string;
  items?: { type?: string; slot?: string; properties?: Record<string, SlotProp> };
};

export type PackageSchema = { properties: Record<string, SlotProp>; required: string[]; sample: Record<string, unknown> };

function emptyFor(prop: SlotProp): unknown {
  return prop.type === 'array' ? [] : '';
}

/**
 * Field order and kinds follow the package slot contract; admin-authored fields (labels, defaults) override it.
 * Returns a schema record in the same shape as the template `data` map.
 */
export function mergeSchema(adminData: Record<string, unknown>, pkg: PackageSchema | null) {
  const schema: Record<string, unknown> = {};
  const slots: Record<string, SlotProp> = {};
  for (const [key, prop] of Object.entries(pkg?.properties ?? {})) {
    if (prop.type === 'integer' || prop.type === 'number' || prop.type === 'boolean') continue;
    slots[key] = prop;
    schema[key] = pkg?.sample[key] ?? emptyFor(prop);
  }
  for (const [key, raw] of Object.entries(adminData)) {
    const adminValue = unwrap(raw);
    const blank = adminValue === undefined || adminValue === null || adminValue === '';
    if (key === 'theme' || !(key in schema) || !blank) schema[key] = raw;
    else if (isWrapped(raw)) schema[key] = { ...raw, value: schema[key] };
  }
  if (!('theme' in schema) && pkg?.sample.theme) schema.theme = pkg.sample.theme;
  return { schema, slots, required: new Set(pkg?.required ?? []) };
}

function kindFromSlot(prop: SlotProp | undefined): FieldKind | null {
  if (!prop) return null;
  const slot = prop.slot || '';
  if (prop.type === 'array') {
    const items = prop.items;
    if (items?.type === 'string') return slot.startsWith('image.') ? 'gallery' : 'lines';
    const props = Object.entries(items?.properties ?? {});
    if (props.length === 1 && props[0][1].slot?.startsWith('image.')) return 'gallery';
    return 'items';
  }
  if (prop.format === 'date-time' || slot.startsWith('datetime.')) return 'datetime';
  if (slot.startsWith('image.')) return 'image';
  if (slot === 'url.video') return 'video';
  if (slot.startsWith('url.')) return 'url';
  return null;
}

const IMAGE_KEY = /(photo|image|img|avatar|cover|banner|thumbnail|logo|qr)/i;
const IMAGE_URL = /\.(png|jpe?g|webp|gif|avif)(\?|$)|images\.unsplash\.com/i;
const GALLERY_KEY = /(album|gallery|photos|images)/i;
const LONG_KEY = /(intro|message|story|description|note|content|letter|quote)/i;

type Wrapped = { type?: string; labelVi?: string; placeHolder?: string; required?: boolean; itemSchema?: unknown; value?: unknown };

function isWrapped(v: unknown): v is Wrapped {
  return !!v && typeof v === 'object' && !Array.isArray(v) && ('value' in v || 'type' in v);
}

export function unwrap(v: unknown): unknown {
  if (!isWrapped(v)) return v;
  const val = v.value;
  if (typeof val === 'string' && (v.type === 'ARRAY' || v.type === 'TEXT_ARRAY' || v.type === 'RAW')) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function humanize(key: string) {
  const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

function isIsoDate(v: unknown) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
}

type ItemMeta = { key: string; label?: string; type?: string };

/** Admin stores itemSchema as a map; some seeds use an array. Slot props fill missing keys (e.g. qrImage). */
function itemFieldsOf(sample: unknown, schema: unknown, slotProps?: Record<string, SlotProp>): ItemField[] {
  const metas: ItemMeta[] = [];
  const seen = new Set<string>();

  const push = (key: string, label?: string, type?: string) => {
    if (!key || key === 'side' || seen.has(key)) return;
    seen.add(key);
    metas.push({ key, label, type });
  };

  if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
    for (const [key, sub] of Object.entries(schema as Record<string, { labelVi?: string; labelEn?: string; type?: string }>)) {
      push(key, sub?.labelVi || sub?.labelEn, sub?.type);
    }
  } else if (Array.isArray(schema)) {
    for (const s of schema as Array<{ key?: string; fieldKey?: string; labelVi?: string; type?: string }>) {
      push(String(s.key ?? s.fieldKey ?? ''), s.labelVi, s.type);
    }
  }

  for (const [key, prop] of Object.entries(slotProps ?? {})) {
    push(key, undefined, prop.slot?.startsWith('image.') ? 'IMAGE' : prop.format === 'uri' ? 'URL' : undefined);
  }

  if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
    for (const key of Object.keys(sample as object)) push(key);
  }

  return metas.map(({ key, label, type }) => {
    const t = String(type || '').toLowerCase();
    const kind: ItemField['kind'] =
      t === 'image' || IMAGE_KEY.test(key) || slotProps?.[key]?.slot?.startsWith('image.')
        ? 'image'
        : LONG_KEY.test(key) && key !== 'story'
          ? 'textarea'
          : /url|link|maps/i.test(key) || t === 'url'
            ? 'url'
            : 'text';
    return {
      key,
      label: label || ITEM_LABELS[key] || humanize(key),
      kind,
    };
  });
}

function kindFromType(type: string | undefined): FieldKind | null {
  switch ((type || '').toUpperCase()) {
    case 'IMAGE':
      return 'image';
    case 'DATE':
      return 'datetime';
    case 'URL':
      return 'url';
    case 'TEXT_ARRAY':
      return 'lines';
    case 'ARRAY':
      return 'items';
    default:
      return null;
  }
}

function inferKind(key: string, value: unknown): FieldKind {
  if (Array.isArray(value)) {
    if (value.length && typeof value[0] === 'object') return 'items';
    if (GALLERY_KEY.test(key) || value.some((v) => typeof v === 'string' && IMAGE_URL.test(v))) return 'gallery';
    if (/color|swatch|dresscode/i.test(key)) return 'colors';
    return 'lines';
  }
  if (/date|time/i.test(key) && isIsoDate(value)) return 'datetime';
  if (IMAGE_KEY.test(key) || (typeof value === 'string' && IMAGE_URL.test(value))) return 'image';
  if (/video|youtube/i.test(key)) return 'video';
  if (/url|link|maps/i.test(key)) return 'url';
  if (LONG_KEY.test(key) || (typeof value === 'string' && value.length > 90)) return 'textarea';
  return 'text';
}

function groupOf(key: string, kind: FieldKind): GroupKey {
  if (/groom|bride|couple|parent/i.test(key)) return 'couple';
  if (/date|time|venue|address|map|location|rsvp/i.test(key)) return 'time';
  if (/gift|bank|account/i.test(key)) return 'gift';
  if (kind === 'image' || kind === 'gallery' || kind === 'video') return 'media';
  if (kind === 'textarea' || kind === 'lines') return 'message';
  if (kind === 'colors' || /dresscode|color/i.test(key)) return 'other';
  return 'other';
}

export function buildFields(
  schema: Record<string, unknown>,
  slots: Record<string, SlotProp> = {},
  required: Set<string> = new Set(),
): FieldDef[] {
  return Object.entries(schema)
    .filter(([key, raw]) => !HIDDEN.has(key) && !key.startsWith('_') && !(isWrapped(raw) && /^(THEME|RAW)$/i.test(String(raw.type))))
    .map(([key, raw]) => {
      const meta = isWrapped(raw) ? raw : {};
      const value = unwrap(raw);
      const known = KNOWN[key];
      const slot = slots[key];
      const kind = known?.kind ?? kindFromType(meta.type) ?? kindFromSlot(slot) ?? inferKind(key, value);
      const finalKind: FieldKind =
        kind === 'colors'
          ? 'colors'
          : kind === 'items' && Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string')
            ? 'lines'
            : kind;
      const itemSample = Array.isArray(value) && value[0] && typeof value[0] === 'object' ? value[0] : slot?.items?.properties ?? null;
      return {
        key,
        label: meta.labelVi || known?.label || humanize(key),
        kind: finalKind,
        group: known?.group ?? groupOf(key, finalKind),
        placeholder: meta.placeHolder || known?.placeholder,
        hint: known?.hint,
        required: !known?.optional && (meta.required || required.has(key)),
        itemFields: finalKind === 'items' ? itemFieldsOf(itemSample, meta.itemSchema, slot?.items?.properties) : undefined,
      };
    });
}

/** Gallery values may be plain URLs or `{ url }` objects depending on the template. */
export function galleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as { url?: unknown }).url ?? '') : ''))
    .filter(Boolean);
}

export function galleryValue(urls: string[], previous: unknown): unknown[] {
  const objectShaped = Array.isArray(previous) && previous.some((v) => v && typeof v === 'object');
  return objectShaped ? urls.map((url) => ({ url })) : urls;
}

export function sampleValues(schema: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(schema)) if (key !== 'theme') out[key] = unwrap(raw);
  return out;
}

function flattenTheme(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return flattenTheme(JSON.parse(raw));
    } catch {
      return {};
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  if (obj.tokens && typeof obj.tokens === 'object') {
    const { tokens, ...rest } = obj;
    return { ...flattenTheme(tokens), ...rest };
  }
  if ((obj.type === 'THEME' || obj.type === 'RAW') && obj.value !== undefined) {
    const { type: _t, id: _i, value, ...rest } = obj;
    return { ...flattenTheme(value), ...rest };
  }
  const { type: _t, id: _i, ...rest } = obj;
  return rest;
}

export function templateTheme(schema: Record<string, unknown>) {
  return flattenTheme(schema.theme);
}

/**
 * Mirrors `@eventlab/effects` catalog defaults so preview theme always carries explicit flags.
 * (Landing does not depend on the effects package.)
 */
export const EFFECTS: Array<{ key: string; label: string; text: string; defaultOn: boolean }> = [
  { key: 'effectEnvelope', label: 'Phong bì mở thiệp', text: 'Khách chạm để mở phong bì trước khi xem thiệp.', defaultOn: true },
  { key: 'effectPetals', label: 'Cánh hoa rơi', text: 'Cánh hoa nhẹ nhàng rơi trên nền thiệp.', defaultOn: true },
  { key: 'effectHearts', label: 'Trái tim bay', text: 'Những trái tim nhỏ bay lên khi mở thiệp.', defaultOn: true },
  { key: 'effectConfetti', label: 'Pháo giấy', text: 'Pháo giấy chúc mừng lúc mở thiệp.', defaultOn: true },
  { key: 'autoScroll', label: 'Tự cuộn chậm', text: 'Thiệp tự cuộn từ từ để khách ngắm trọn.', defaultOn: false },
];

/** Fill missing effect keys from catalog defaults (does not override explicit false/true). */
export function withEffectDefaults(theme: Record<string, unknown>): Record<string, unknown> {
  const out = { ...theme };
  for (const effect of EFFECTS) {
    if (!(effect.key in out)) out[effect.key] = effect.defaultOn;
  }
  if (!('musicEnabled' in out)) out.musicEnabled = true;
  return out;
}

/** Switch / preview: missing key follows catalog default (not Boolean(undefined) === false). */
export function isEffectOn(theme: Record<string, unknown>, key: string, fallback = false): boolean {
  if (key in theme) {
    const v = theme[key];
    return v === true || v === 'true' || v === 1 || v === '1';
  }
  const effect = EFFECTS.find((e) => e.key === key);
  return effect ? effect.defaultOn : fallback;
}

/** Same shape the admin studio posts to the invite host's live preview. */
export function toPreviewData(
  values: Record<string, unknown>,
  schema: Record<string, unknown>,
  themeOverrides: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(schema)) {
    if (key === 'theme') continue;
    const value = values[key] ?? unwrap(raw);
    out[key] = isWrapped(raw) && raw.type ? { ...raw, value } : value;
  }
  for (const [key, value] of Object.entries(values)) if (!(key in out) && key !== 'theme') out[key] = value;
  out.theme = withEffectDefaults({ ...templateTheme(schema), ...themeOverrides });
  return out;
}
