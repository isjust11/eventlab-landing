'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LOGIN_URL, SIGN_UP_URL, startWithTemplateUrl } from '@/lib/config';
import Logo from './Logo';

const NAV = [
  { href: '/mau-thiep', label: 'Mẫu thiệp' },
  { href: '/#tinh-nang', label: 'Tính năng' },
  { href: '/#cach-tao', label: 'Cách tạo' },
  { href: '/#hoi-dap', label: 'Hỏi đáp' },
];

export default function Header() {
  const pathname = usePathname();
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [promo, setPromo] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || !overHero || open;

  return (
    <>
      {promo ? (
        <div className="relative z-50 bg-wine-800 text-[13px] text-wine-50">
          <div className="container-x flex items-center justify-center gap-3 py-2 pr-10 text-center">
            <span>
              <strong className="font-semibold text-gold-300">Miễn phí</strong> mẫu cơ bản trọn đời — tạo thiệp đầu tiên chỉ trong 10 phút
            </span>
            <a
              href={SIGN_UP_URL}
              className="hidden shrink-0 rounded-full bg-gold-300 px-3 py-0.5 text-xs font-semibold text-wine-900 transition hover:bg-gold-200 sm:inline-block"
            >
              Đăng ký ngay →
            </a>
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setPromo(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-wine-100/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          solid ? 'border-b border-wine-900/5 bg-cream/90 text-ink backdrop-blur-md' : 'bg-transparent text-white'
        } ${overHero && !solid ? '-mb-[68px]' : ''}`}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-6">
          <Logo light={!solid} />

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="opacity-80 transition hover:opacity-100">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href={LOGIN_URL} className="text-sm font-medium opacity-80 transition hover:opacity-100">
              Đăng nhập
            </a>
            <a href={startWithTemplateUrl()} className="btn-primary px-5 py-2.5">
              Tạo thiệp
            </a>
          </div>

          <button
            type="button"
            className="rounded-full p-2 md:hidden"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-wine-900/5 bg-cream md:hidden">
            <nav className="container-x flex flex-col py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-wine-900/5 py-3.5 text-base font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 py-4">
                <a href={LOGIN_URL} className="btn-outline flex-1">
                  Đăng nhập
                </a>
                <a href={startWithTemplateUrl()} className="btn-primary flex-1">
                  Tạo thiệp
                </a>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
