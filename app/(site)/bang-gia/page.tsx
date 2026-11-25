import type { Metadata } from 'next';
import Pricing from '@/components/Pricing';
import PricingHero from '@/components/PricingHero';
import { CtaBanner, Faq } from '@/components/Social';
import { getPricingPlans, getRequestLocale } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Bảng giá',
  description: 'Gói EventLab — bắt đầu miễn phí, nâng cấp Premium khi cần mẫu, nhạc và quản lý khách đầy đủ.',
};

export const revalidate = 60;

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const plans = await getPricingPlans(locale);

  return (
    <>
      <PricingHero />
      <Pricing plans={plans} />
      <Faq />
      <CtaBanner />
    </>
  );
}
