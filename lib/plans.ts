import { cookies } from 'next/headers';
import { API_URL } from './config';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './i18n';
import { DEFAULT_PLANS, normalizePlans, type PricingPlan } from './plans-shared';

export * from './plans-shared';

export async function getRequestLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    const value = jar.get(LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function getPricingPlans(locale?: Locale): Promise<PricingPlan[]> {
  const lang = locale || (await getRequestLocale());
  try {
    const res = await fetch(`${API_URL}/public/subscription-plans?activeOnly=true&locale=${lang}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_PLANS[lang];
    const body = await res.json();
    const list = (Array.isArray(body) ? body : body?.data || []) as PricingPlan[];
    return normalizePlans(list, lang);
  } catch {
    return DEFAULT_PLANS[lang];
  }
}
