import { API_URL } from './config';

export type TemplateType = 'WEDDING' | 'EVENT' | 'BIRTHDAY' | 'OTHER';

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

export const TYPE_LABELS: Record<TemplateType, string> = {
  WEDDING: 'Thiệp cưới',
  BIRTHDAY: 'Sinh nhật',
  EVENT: 'Sự kiện',
  OTHER: 'Khác',
};

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
