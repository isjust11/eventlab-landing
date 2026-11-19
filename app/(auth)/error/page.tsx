'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { LOGIN_URL } from '@/lib/config';

function OAuthError() {
  const router = useRouter();
  const params = useSearchParams();
  const message = params.get('message') || 'Đăng nhập chưa thành công.';

  useEffect(() => {
    const t = window.setTimeout(() => router.replace(LOGIN_URL), 2500);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="text-center">
      <h1 className="font-serif text-3xl font-semibold text-rose-700">Đăng nhập thất bại</h1>
      <p className="mt-3 text-sm text-ink/60">{message}</p>
      <p className="mt-2 text-xs text-ink/45">Đang đưa bạn về trang đăng nhập…</p>
      <Link href={LOGIN_URL} className="btn-outline mt-8 inline-flex">
        Về trang đăng nhập ngay
      </Link>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center py-16 text-wine-600">
          <Spinner size={28} />
        </div>
      }
    >
      <OAuthError />
    </Suspense>
  );
}