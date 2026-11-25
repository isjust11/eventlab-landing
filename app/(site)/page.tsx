import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import TemplateCarousel from '@/components/TemplateCarousel';
import TemplateGallery from '@/components/TemplateGallery';
import { Benefits, Features, Showcase, Steps } from '@/components/Features';
import { CtaBanner, Faq, Testimonials } from '@/components/Social';
import Pricing from '@/components/Pricing';
import { SectionHeading } from '@/components/Reveal';
import { getPricingPlans, getRequestLocale } from '@/lib/plans';
import { getTemplateCategories, getTemplates } from '@/lib/templates';

export const revalidate = 60;

export default async function HomePage() {
  const locale = await getRequestLocale();
  const [templates, categories, plans] = await Promise.all([
    getTemplates(),
    getTemplateCategories(),
    getPricingPlans(locale),
  ]);
  const featured = templates.slice(0, 10);
  const showcaseSlug = templates.find((t) => !t.thumbnailUrl)?.slug ?? templates[0]?.slug;

  return (
    <>
      <Hero />

      <section id="mau-noi-bat" className="scroll-mt-20 pt-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Được yêu thích" title="Mẫu thiệp nổi bật" />
            <Link href="/mau-thiep" className="btn-outline shrink-0 self-start sm:self-auto">
              Xem tất cả mẫu <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10">
            <TemplateCarousel templates={featured} ranked />
          </div>
        </div>
      </section>

      <Features />
      <Steps />
      <Showcase slug={showcaseSlug} />

      <section className="py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Mới cập nhật" title="Mẫu thiệp mới nhất" text="Lọc theo loại sự kiện và xem thử ngay trên khung điện thoại." />
          <div className="mt-12">
            <TemplateGallery templates={templates} categories={categories} limit={8} />
          </div>
          <div className="mt-12 text-center">
            <Link href="/mau-thiep" className="btn-primary px-8">
              Khám phá toàn bộ thư viện <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Benefits />
      <Pricing plans={plans} />
      <Faq />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
