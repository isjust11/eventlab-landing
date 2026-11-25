export type Locale = 'vi' | 'en';

export const LOCALES: Locale[] = ['vi', 'en'];
export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'el_locale';

const MESSAGES = {
  vi: {
    nav: {
      templates: 'Mẫu thiệp',
      features: 'Tính năng',
      pricing: 'Bảng giá',
      how: 'Cách tạo',
      faq: 'Hỏi đáp',
      login: 'Đăng nhập',
      myEvents: 'Sự kiện của tôi',
      create: 'Tạo thiệp',
    },
    pricing: {
      eyebrow: 'Bảng giá',
      title: 'Chọn gói phù hợp ngày vui của bạn',
      text: 'Bắt đầu miễn phí với mẫu cơ bản. Nâng cấp khi cần Premium, nhạc và quản lý khách đầy đủ.',
      popular: 'Phổ biến',
      freeCta: 'Bắt đầu miễn phí',
      paidCta: 'Chọn gói này',
      contact: 'Liên hệ',
      free: 'Miễn phí',
      footnote:
        'Giá đã bao gồm cập nhật mẫu và hỗ trợ cơ bản. Bạn có thể đổi gói sau khi đăng ký trong trang quản lý sự kiện.',
      pageEyebrow: 'Minh bạch',
      pageTitle: 'Bảng giá EventLab',
      pageText: 'Chọn gói theo nhu cầu ngày vui — không khóa nội dung thiệp sau khi khách đã nhận link.',
    },
    period: {
      month: '/tháng',
      six_month: '/6 tháng',
      year: '/năm',
      lifetime: 'một lần',
    },
  },
  en: {
    nav: {
      templates: 'Templates',
      features: 'Features',
      pricing: 'Pricing',
      how: 'How it works',
      faq: 'FAQ',
      login: 'Sign in',
      myEvents: 'My events',
      create: 'Create invite',
    },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Pick a plan for your celebration',
      text: 'Start free with basic templates. Upgrade for Premium designs, music, and full guest tools.',
      popular: 'Popular',
      freeCta: 'Start for free',
      paidCta: 'Choose this plan',
      contact: 'Contact us',
      free: 'Free',
      footnote:
        'Prices include template updates and basic support. You can change plans later in your event dashboard.',
      pageEyebrow: 'Transparent',
      pageTitle: 'EventLab pricing',
      pageText: 'Choose what fits your celebration — guests keep access after they receive the invite link.',
    },
    period: {
      month: '/month',
      six_month: '/6 months',
      year: '/year',
      lifetime: 'one-time',
    },
  },
} as const;

export type Messages = (typeof MESSAGES)[Locale];

export function isLocale(value: unknown): value is Locale {
  return value === 'vi' || value === 'en';
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] || MESSAGES.vi;
}

export function periodLabelFor(locale: Locale, periodType: string, isLifetime?: boolean) {
  const key = (periodType || '').toLowerCase();
  if (isLifetime || key === 'lifetime') {
    return getMessages(locale).period.lifetime;
  }
  const map = getMessages(locale).period as Record<string, string>;
  return map[key] || '';
}
