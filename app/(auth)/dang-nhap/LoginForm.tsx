'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field, Input, Spinner } from '@/components/ui';
import { login, safeNext } from '@/lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập chưa thành công.');
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Chào mừng trở lại</h1>
      <p className="mt-2 text-ink/60">Đăng nhập để tiếp tục chỉnh thiệp và xem khách mời.</p>

      {params.get('verified') ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Tài khoản đã được xác minh. Bạn đăng nhập để bắt đầu nhé!
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="text"
            inputMode="email"
            autoComplete="username"
            placeholder="ban@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Mật khẩu" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/45 hover:text-ink"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
          {busy ? <Spinner /> : null} Đăng nhập
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink/60">
        Chưa có tài khoản?{' '}
        <Link href={`/dang-ky?next=${encodeURIComponent(next)}`} className="font-semibold text-wine-700 hover:underline">
          Tạo tài khoản miễn phí
        </Link>
      </p>
    </div>
  );
}
