import type { Metadata } from 'next';
import PreviewProvider from '@/components/PreviewProvider';
import TemplateGallery from '@/components/TemplateGallery';
import { getTemplateCategories, getTemplates } from '@/lib/templates';

export const metadata: Metadata = { title: 'Chọn mẫu thiệp' };

export const revalidate = 60;

export default async function ChooseTemplatePage() {
  const [templates, categories] = await Promise.all([getTemplates(), getTemplateCategories()]);
  return (
    <PreviewProvider>
      <div className="container-x py-10">
        <ol className="flex items-center gap-3 text-sm font-medium">
          <li className="flex items-center gap-2 text-wine-700">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-wine-700 text-xs text-white">1</span> Chọn mẫu
          </li>
          <li className="h-px w-8 bg-wine-900/15" />
          <li className="flex items-center gap-2 text-ink/40">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/15 text-xs">2</span> Điền nội dung
          </li>
          <li className="hidden h-px w-8 bg-wine-900/15 sm:block" />
          <li className="hidden items-center gap-2 text-ink/40 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/15 text-xs">3</span> Gửi thiệp
          </li>
        </ol>
        <h1 className="mt-8 font-serif text-3xl font-semibold sm:text-4xl">Bạn thích phong cách nào?</h1>
        <p className="mt-2 max-w-xl text-ink/60">
          Bấm <strong className="text-wine-700">Xem thử</strong> để trải nghiệm như khách mời. Sau khi chọn, bạn vẫn có thể đổi ảnh, chữ,
          nhạc và hiệu ứng thoải mái.
        </p>
        <div className="mt-10">
          <TemplateGallery templates={templates} categories={categories} searchable />
        </div>
      </div>
    </PreviewProvider>
  );
}
