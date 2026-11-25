import { API_URL } from './config';

export type TemplateType = string;

export type TemplateCardData = {
  name: string;
  slug: string;
  type: TemplateType;
  description: string;
  thumbnailUrl: string;
  isPremium: boolean;
  category: string;
  createdAt?: string;
};

export type TemplateCategory = {
  id: number;
  code: string;
  name: string;
  nameEN?: string;
  color?: string;
  image?: string;
  sortOrder?: number;
};

/** Fallback when category API is empty / unreachable. */
export const DEFAULT_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 1, code: 'WEDDING', name: 'Thiệp cưới', sortOrder: 1 },
  { id: 2, code: 'EVENT', name: 'Sự kiện', sortOrder: 2 },
  { id: 3, code: 'BIRTHDAY', name: 'Sinh nhật', sortOrder: 3 },
  { id: 4, code: 'OTHER', name: 'Khác', sortOrder: 4 },
];

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_TEMPLATE_CATEGORIES.map((c) => [c.code, c.name]),
);

export function typeLabel(code: string | undefined, categories?: TemplateCategory[]) {
  if (!code) return 'Mẫu thiệp';
  const fromApi = categories?.find((c) => c.code === code)?.name;
  return fromApi || TYPE_LABELS[code] || code;
}

export function labelsFromCategories(categories: TemplateCategory[]): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.code, c.name]));
}

/** Active TEMPLATE_TYPE categories from admin API. */
export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    const res = await fetch(`${API_URL}/public/categories/TEMPLATE_TYPE`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULT_TEMPLATE_CATEGORIES;
    const body = await res.json();
    const list = (Array.isArray(body) ? body : body?.data || []) as TemplateCategory[];
    const active = list.filter((c) => c?.code && c?.name);
    return active.length ? active : DEFAULT_TEMPLATE_CATEGORIES;
  } catch {
    return DEFAULT_TEMPLATE_CATEGORIES;
  }
}

/** Published templates from the admin API, newest first. */
export async function getTemplates(): Promise<TemplateCardData[]> {
  let remote: TemplateCardData[] = [];
  try {
    const res = await fetch(`${API_URL}/public/templates`, { next: { revalidate: 60 } });
    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body)) remote = body as TemplateCardData[];
    }
  } catch {
    remote = [];
  }
  return remote;
}

export async function getTemplate(slug: string): Promise<TemplateCardData | null> {
  const all = await getTemplates();
  return all.find((t) => t.slug === slug) ?? null;
}
