'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarHeart, LayoutGrid, LogOut, Plus } from 'lucide-react';
import Logo from '@/components/Logo';
import { displayName, logout, useSession } from '@/lib/auth';
import AuthGate from './AuthGate';

const NAV = [
  { href: '/su-kien', label: 'Sự kiện của tôi', icon: CalendarHeart },
  { href: '/mau-thiep', label: 'Mẫu thiệp', icon: LayoutGrid },
];

function UserMenu() {
  const user = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const name = displayName(user);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Tài khoản"
        className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-wine-500 to-wine-800 font-serif text-base text-gold-200 ring-2 ring-white"
      >
        {name.charAt(0).toUpperCase() || 'E'}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-wine-900/5 bg-white shadow-card">
          <div className="border-b border-wine-900/5 px-4 py-3.5">
            <p className="truncate font-medium">{user?.fullName || 'Tài khoản của bạn'}</p>
            <p className="truncate text-xs text-ink/50">{user?.email || user?.username}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace('/');
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink/75 hover:bg-wine-50 hover:text-wine-700"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGate>
      <div className="min-h-[100svh] bg-cream">
        <header className="sticky top-0 z-40 border-b border-wine-900/5 bg-cream/90 backdrop-blur-md">
          <div className="container-x flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <Logo />
              <nav className="hidden items-center gap-1 sm:flex">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        active ? 'bg-wine-50 text-wine-700' : 'text-ink/65 hover:text-ink'
                      }`}
                    >
                      <Icon size={16} /> {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tao-thiep" className="btn-primary px-4 py-2.5">
                <Plus size={16} /> <span className="hidden sm:inline">Tạo thiệp</span>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="pb-24 sm:pb-12">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-wine-900/5 bg-white/95 backdrop-blur sm:hidden">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                pathname.startsWith(href) ? 'text-wine-700' : 'text-ink/50'
              }`}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
        </nav>
      </div>
    </AuthGate>
  );
}
