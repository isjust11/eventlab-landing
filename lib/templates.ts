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

/** Packages the invite host can demo from their own sample content before admin publishes them. */
const BUILT_IN: TemplateCardData[] = [
  {
    name: 'Love Journey',
    slug: 'wedding-love-journey',
    type: 'WEDDING',
    description: 'Tông xanh sage, hoa dại trắng và bướm bay; có album, video, hộp mừng cưới và sổ lời chúc.',
    thumbnailUrl: '',
    isPremium: false,
    category: 'Botanical',
  },
  {
    name: 'Editorial Ivory',
    slug: 'wedding-invite-modern',
    type: 'WEDDING',
    description: 'Phong cách tạp chí ngà – mocha, cửa gỗ mở thiệp, hoa nhiều tầng chiều sâu.',
    thumbnailUrl: '',
    isPremium: true,
    category: 'Editorial',
  },
];

/** Published templates from the admin API, newest first; built-in demos fill in while the API is empty or offline. */
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
  const known = new Set(remote.map((t) => t.slug));
  return [...remote, ...BUILT_IN.filter((t) => !known.has(t.slug))];
}

export async function getTemplate(slug: string): Promise<TemplateCardData | null> {
  const all = await getTemplates();
  return all.find((t) => t.slug === slug) ?? null;
}
