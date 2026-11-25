'use client';

import { useLocale } from './LocaleProvider';

export default function PricingHero() {
  const { messages } = useLocale();
  const t = messages.pricing;
  return (
    <section className="bg-gradient-to-b from-wine-50 to-cream pb-6 pt-16">
      <div className="container-x text-center">
        <p className="eyebrow">{t.pageEyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">{t.pageTitle}</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/65">{t.pageText}</p>
      </div>
    </section>
  );
}
