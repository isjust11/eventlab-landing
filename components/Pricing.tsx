'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PUBLIC_API_URL, SIGN_UP_URL, startWithTemplateUrl } from '@/lib/config';
import {
  DEFAULT_PLANS,
  effectivePrice,
  formatVnd,
  isFeaturedPlan,
  normalizePlans,
  periodLabel,
  type PricingPlan,
} from '@/lib/plans-shared';
import { useLocale } from './LocaleProvider';
import Reveal, { SectionHeading } from './Reveal';

async function fetchPlans(locale: 'vi' | 'en'): Promise<PricingPlan[]> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/public/subscription-plans?activeOnly=true&locale=${locale}`, {
      cache: 'no-store',
    });
    if (!res.ok) return DEFAULT_PLANS[locale];
    const body = await res.json();
    const list = (Array.isArray(body) ? body : body?.data || []) as PricingPlan[];
    return normalizePlans(list, locale);
  } catch {
    return DEFAULT_PLANS[locale];
  }
}

export default function Pricing({
  plans: initialPlans,
  id = 'bang-gia',
  compact = false,
}: {
  plans?: PricingPlan[];
  id?: string;
  compact?: boolean;
}) {
  const { locale, messages } = useLocale();
  const t = messages.pricing;
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans?.length ? initialPlans : DEFAULT_PLANS[locale]);

  useEffect(() => {
    let cancelled = false;
    fetchPlans(locale).then((list) => {
      if (!cancelled) setPlans(list);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!plans.length) return null;

  return (
    <section
      id={id}
      className={`scroll-mt-20 ${compact ? 'py-16' : 'py-24'} bg-gradient-to-b from-cream to-wine-50/40`}
    >
      <div className="container-x">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} text={t.text} />

        <div
          className={`mx-auto mt-14 grid gap-6 ${
            plans.length === 1
              ? 'max-w-md'
              : plans.length === 2
                ? 'max-w-3xl md:grid-cols-2'
                : plans.length === 3
                  ? 'max-w-5xl md:grid-cols-3'
                  : 'md:grid-cols-2 xl:grid-cols-4'
          }`}
        >
          {plans.map((plan, i) => {
            const featured = isFeaturedPlan(plan);
            const price = effectivePrice(plan);
            const listPrice = plan.price != null ? Number(plan.price) : null;
            const showStrike =
              listPrice != null && price != null && listPrice > 0 && price > 0 && price < listPrice;
            const period = periodLabel(plan, locale);
            const ctaHref = plan.code === 'FREE' ? startWithTemplateUrl() : SIGN_UP_URL;

            return (
              <Reveal key={`${locale}-${String(plan.id || plan.code)}`} delay={i * 0.06}>
                <article
                  className={`relative flex h-full flex-col rounded-[1.75rem] border p-7 shadow-card transition ${
                    featured
                      ? 'border-wine-400 bg-white ring-2 ring-wine-200'
                      : 'border-wine-900/5 bg-white/90 hover:border-wine-200'
                  }`}
                >
                  {featured ? (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-wine-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-200">
                      <Sparkles size={12} /> {t.popular}
                    </span>
                  ) : null}

                  <div className="min-h-[3.5rem]">
                    <h3 className="font-serif text-2xl font-semibold text-ink">{plan.name}</h3>
                    {plan.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-ink/60">{plan.description}</p>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-end gap-2">
                      <span className="font-serif text-4xl font-semibold text-wine-800">
                        {formatVnd(price, locale) ?? t.contact}
                      </span>
                      {period && price != null && Number(price) > 0 ? (
                        <span className="pb-1.5 text-sm text-ink/50">{period}</span>
                      ) : null}
                    </div>
                    {showStrike ? (
                      <p className="mt-1 text-sm text-ink/40 line-through">{formatVnd(listPrice, locale)}</p>
                    ) : null}
                  </div>

                  <ul className="mt-7 flex-1 space-y-3">
                    {(plan.features?.length ? plan.features : [plan.description].filter(Boolean) as string[]).map(
                      (f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-ink/75">
                          <Check size={16} className="mt-0.5 shrink-0 text-gold-500" />
                          <span>{f}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  <Link
                    href={ctaHref}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                      featured
                        ? 'bg-wine-700 text-white hover:bg-wine-800'
                        : 'border border-wine-900/10 bg-cream text-wine-800 hover:border-wine-400 hover:bg-wine-50'
                    }`}
                  >
                    {plan.code === 'FREE' || Number(price || 0) <= 0 ? t.freeCta : t.paidCta}
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink/50">{t.footnote}</p>
      </div>
    </section>
  );
}
