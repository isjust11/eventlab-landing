import type { Metadata } from 'next';
import TemplateGallery from '@/components/TemplateGallery';
import { getTemplates, type TemplateType } from '@/lib/templates';

export const metadata: Metadata = {
  title: 'Mẫu thiệp online',
  description: 'Thư viện mẫu thiệp cưới, sinh nhật và sự kiện online — xem thử trực tiếp trên khung điện thoại.',
};

export const revalidate = 60;

const TYPES: TemplateType[] = ['WEDDING', 'BIRTHDAY', 'EVENT', 'OTHER'];

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ loai?: string }> }) {
  const [templates, { loai }] = await Promise.all([getTemplates(), searchParams]);
  const initial = TYPES.includes(loai as TemplateType) ? (loai as TemplateType) : 'ALL';

  return (
    <>
      <section className="bg-gradient-to-b from-wine-50 to-cream pb-12 pt-16">
        <div className="container-x text-center">
          <p className="eyebrow">Thư viện</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Mẫu thiệp online</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/65">
            {templates.length} mẫu sẵn sàng — bấm <strong className="text-wine-700">Xem thử</strong> để trải nghiệm như khách mời, rồi
            chọn mẫu bạn ưng để bắt đầu.
          </p>
        </div>
      </section>
      <section className="pb-24 pt-6">
        <div className="container-x">
          <TemplateGallery key={initial} templates={templates} searchable initialFilter={initial} />
        </div>
      </section>
    </>
  );
}
