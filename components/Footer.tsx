import Link from 'next/link';
import { Facebook, Mail, Phone, Youtube } from 'lucide-react';
import { LOGIN_URL, SIGN_UP_URL } from '@/lib/config';
import { getTemplateCategories } from '@/lib/templates';
import Logo from './Logo';

export default async function Footer() {
  const categories = await getTemplateCategories();
  const columns = [
    {
      title: 'Mẫu thiệp',
      links: [
        { label: 'Tất cả mẫu', href: '/mau-thiep' },
        ...categories
          .filter((c) => c.code !== 'OTHER')
          .slice(0, 4)
          .map((c) => ({
            label: c.name,
            href: `/mau-thiep?loai=${encodeURIComponent(c.code)}`,
          })),
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Bảng giá', href: '/bang-gia' },
        { label: 'Cách tạo thiệp', href: '/#cach-tao' },
        { label: 'Câu hỏi thường gặp', href: '/#hoi-dap' },
        { label: 'Đăng nhập', href: LOGIN_URL },
        { label: 'Đăng ký', href: SIGN_UP_URL },
      ],
    },
  ];

  return (
    <footer className="border-t border-wine-900/10 bg-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
            Nền tảng tạo thiệp mời online — gửi lời mời đẹp, nhanh và quản lý khách mời nhẹ nhàng.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/70">
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-wine-500" /> hello@eventlab.app
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-wine-500" /> 1900 0000
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            {[Facebook, Youtube].map((Icon, i) => (
              <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-wine-50 text-wine-700">
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-serif text-lg font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/65">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-wine-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-wine-900/5 py-6 text-center text-xs text-ink/45">
        © {new Date().getFullYear()} EventLab. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
