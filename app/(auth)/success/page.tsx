'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/ui';
import { completeOAuth, consumeOAuthNext } from '@/lib/auth';
import { LOGIN_URL } from '@/lib/config';

function OAuthSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = params.get('token');
      if (!token) {
        setError('Thiếu mã đăng nhập. Bạn thử lại nhé.');
        return;
      }
      try {
        await completeOAuth(token);
        if (cancelled) return;
        router.replace(consumeOAuthNext());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Đăng nhập chưa thành công.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (error) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-rose-700">Đăng nhập chưa thành công</h1>
        <p className="mt-3 text-sm text-ink/60">{error}</p>
        <Link href={LOGIN_URL} className="btn-primary mt-8 inline-flex">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Spinner size={28} className="mx-auto text-wine-600" />
      <h1 className="mt-6 font-serif text-3xl font-semibold">Đang hoàn tất đăng nhập…</h1>
      <p className="mt-2 text-sm text-ink/60">Chỉ mất vài giây thôi.</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center py-16 text-wine-600">
          <Spinner size={28} />
        </div>
      }
    >
      <OAuthSuccess />
    </Suspense>
  );
}
