import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, Crown, ExternalLink } from 'lucide-react';
import PhoneFrame, { ScaledIframe } from '@/components/PhoneFrame';
import TemplateCarousel from '@/components/TemplateCarousel';
import { demoUrl, startWithTemplateUrl } from '@/lib/config';
import { getTemplate, getTemplateCategories, getTemplates, typeLabel } from '@/lib/templates';

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [template, categories] = await Promise.all([getTemplate(slug), getTemplateCategories()]);
  if (!template) return { title: 'Không tìm thấy mẫu' };
  return {
    title: `${template.name} — ${typeLabel(template.type, categories)} online`,
    description: template.description || `Xem thử mẫu ${template.name} và tạo thiệp của bạn trong vài phút.`,
    openGraph: template.thumbnailUrl ? { images: [template.thumbnailUrl] } : undefined,
  };
}

const INCLUDED = [
  'Hiệu ứng mở thiệp và nhạc nền riêng',
  'Album ảnh, video và lời mời cá nhân hoá',
  'Bản đồ chỉ đường tới nơi tổ chức',
  'Xác nhận tham dự (RSVP) và sổ lời chúc',
  'Hộp mừng cưới với số tài khoản / QR',
  'Gửi link kèm tên riêng từng khách mời',
];

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [template, all, categories] = await Promise.all([
    getTemplate(slug),
    getTemplates(),
    getTemplateCategories(),
  ]);
  if (!template) notFound();
  const related = all.filter((t) => t.slug !== slug && t.type === template.type).slice(0, 8);

  return (
    <>
      <section className="bg-gradient-to-b from-wine-50 to-cream py-12 lg:py-20">
        <div className="container-x">
          <Link href="/mau-thiep" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-wine-700">
            <ArrowLeft size={16} /> Tất cả mẫu
          </Link>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div className="mx-auto w-[300px] sm:w-[340px]">
              <PhoneFrame>
                <ScaledIframe src={demoUrl(template.slug)} title={template.name} />
              </PhoneFrame>
            </div>

            <div>
              <p className="eyebrow">{typeLabel(template.type, categories)}</p>
              <h1 className="mt-3 flex flex-wrap items-center gap-3 font-serif text-4xl font-semibold sm:text-5xl">
                {template.name}
                {template.isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-300 px-3 py-1 font-sans text-xs font-semibold text-wine-900">
                    <Crown size={13} /> Premium
                  </span>
                ) : null}
              </h1>
              {template.description ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">{template.description}</p> : null}

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={17} className="mt-0.5 shrink-0 text-gold-500" /> {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href={startWithTemplateUrl(template.slug)} className="btn-primary px-8 py-4 text-base">
                  Dùng mẫu này
                </a>
                <a href={demoUrl(template.slug)} target="_blank" rel="noreferrer" className="btn-outline px-8 py-4 text-base">
                  Mở toàn màn hình <ExternalLink size={16} />
                </a>
              </div>
              <p className="mt-4 text-sm text-ink/50">Khung bên cạnh là thiệp thật — bạn có thể cuộn, mở thiệp và bấm thử.</p>
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="py-20">
          <div className="container-x">
            <h2 className="font-serif text-3xl font-semibold">Mẫu cùng loại</h2>
            <div className="mt-8">
              <TemplateCarousel templates={related} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
