import { getMessages, periodLabelFor, type Locale } from './i18n';

export type PlanPeriod = 'month' | 'six_month' | 'year' | 'lifetime' | string;

export type PricingPlan = {
  id: string | number;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number | null;
  discountPrice?: number | null;
  periodType: PlanPeriod;
  isLifetime?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  features: string[];
};

/** Fallback when API is empty — keeps pricing section usable offline. */
export const DEFAULT_PLANS: Record<Locale, PricingPlan[]> = {
  vi: [
    {
      id: 'free',
      code: 'FREE',
      name: 'Miễn phí',
      description: 'Bắt đầu tạo thiệp ngay, không cần thẻ.',
      price: 0,
      periodType: 'lifetime',
      isLifetime: true,
      sortOrder: 0,
      features: ['Mẫu cơ bản', '1 sự kiện đang hoạt động', 'RSVP & lời chúc', 'Link gửi Zalo / Messenger'],
    },
    {
      id: 'pro-month',
      code: 'PRO_MONTHLY',
      name: 'Pro Tháng',
      description: 'Đủ dùng cho một mùa cưới — linh hoạt theo tháng.',
      price: 99000,
      periodType: 'month',
      sortOrder: 1,
      features: ['Mẫu Premium', 'Nhạc & hiệu ứng nâng cao', 'Quản lý khách không giới hạn', 'Hỗ trợ ưu tiên'],
    },
    {
      id: 'pro-year',
      code: 'PRO_YEAR',
      name: 'Pro Năm',
      description: 'Tiết kiệm hơn khi dùng cả năm cho nhiều sự kiện.',
      price: 799000,
      discountPrice: 599000,
      periodType: 'year',
      isPopular: true,
      sortOrder: 2,
      features: ['Tất cả quyền lợi Pro', 'Nhiều sự kiện song song', 'Ưu đãi gia hạn', 'Hỗ trợ nhanh'],
    },
  ],
  en: [
    {
      id: 'free',
      code: 'FREE',
      name: 'Free',
      description: 'Start creating invites — no card required.',
      price: 0,
      periodType: 'lifetime',
      isLifetime: true,
      sortOrder: 0,
      features: ['Basic templates', '1 active event', 'RSVP & wishes', 'Share via Zalo / Messenger'],
    },
    {
      id: 'pro-month',
      code: 'PRO_MONTHLY',
      name: 'Pro Monthly',
      description: 'Flexible monthly plan for your wedding season.',
      price: 99000,
      periodType: 'month',
      sortOrder: 1,
      features: ['Premium templates', 'Music & advanced effects', 'Unlimited guest management', 'Priority support'],
    },
    {
      id: 'pro-year',
      code: 'PRO_YEAR',
      name: 'Pro Year',
      description: 'Best value when you host multiple events in a year.',
      price: 799000,
      discountPrice: 599000,
      periodType: 'year',
      isPopular: true,
      sortOrder: 2,
      features: ['All Pro benefits', 'Multiple concurrent events', 'Renewal discount', 'Faster support'],
    },
  ],
};

export function formatVnd(amount: number | null | undefined, locale: Locale = 'vi') {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const n = Number(amount);
  if (n <= 0) return getMessages(locale).pricing.free;
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
}

export function periodLabel(plan: PricingPlan, locale: Locale = 'vi') {
  if (plan.isLifetime || plan.periodType === 'lifetime' || plan.periodType === 'LIFETIME') {
    return plan.price && Number(plan.price) > 0 ? periodLabelFor(locale, 'lifetime', true) : '';
  }
  return periodLabelFor(locale, plan.periodType, plan.isLifetime);
}

export function effectivePrice(plan: PricingPlan) {
  const discount = plan.discountPrice != null ? Number(plan.discountPrice) : null;
  const price = plan.price != null ? Number(plan.price) : null;
  if (discount != null && discount > 0 && price != null && discount < price) return discount;
  return price;
}

export function isFeaturedPlan(plan: PricingPlan) {
  if (plan.isPopular) return true;
  return plan.code === 'PRO_YEAR' || plan.code === 'ULTRA';
}

export function normalizePlans(list: PricingPlan[], locale: Locale): PricingPlan[] {
  const active = list
    .filter((p) => p && p.isActive !== false && p.name)
    .map((p) => ({
      ...p,
      price: p.price != null ? Number(p.price) : null,
      discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
      features: Array.isArray(p.features) ? p.features.filter(Boolean) : [],
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return active.length ? active : DEFAULT_PLANS[locale];
}
