'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { Field, Input, Spinner } from '@/components/ui';
import { toast } from '@/components/Toaster';
import { login, register, resendPin, safeNext, verifyPin } from '@/lib/auth';

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [step, setStep] = useState<'form' | 'pin'>('form');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, bạn thử lại nhé.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    run(async () => {
      const res = await register(form);
      if (res.code === 'ok') setStep('pin');
      else if (res.code === 'account_validated') {
        await login(form.email, form.password);
        router.replace(next);
      } else throw new Error(res.message || 'Email này đã được dùng cho một tài khoản khác.');
    });
  };

  const confirm = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await verifyPin(form.email, pin);
      await login(form.email, form.password);
      toast('Chào mừng bạn đến với EventLab!');
      router.replace(next);
    });
  };

  if (step === 'pin') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep('form')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-wine-700"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-wine-50 text-wine-600">
          <MailCheck size={26} />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold">Kiểm tra email của bạn</h1>
        <p className="mt-2 text-ink/60">
          Chúng mình vừa gửi mã xác minh tới <strong className="text-ink">{form.email}</strong>. Nhập mã để hoàn tất nhé.
        </p>
        <form onSubmit={confirm} className="mt-8 space-y-5">
          <Field label="Mã xác minh" htmlFor="pin">
            <Input
              id="pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\s/g, ''))}
              className="text-center text-2xl tracking-[0.5em]"
              autoFocus
              required
            />
          </Field>
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
            {busy ? <Spinner /> : null} Xác minh & bắt đầu
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/60">
          Chưa nhận được mã?{' '}
          <button
            type="button"
            className="font-semibold text-wine-700 hover:underline"
            onClick={() => run(async () => {
              await resendPin(form.email);
              toast('Đã gửi lại mã xác minh.');
            })}
          >
            Gửi lại
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Tạo tài khoản miễn phí</h1>
      <p className="mt-2 text-ink/60">Chỉ mất một phút — sau đó bạn có thể tạo thiệp ngay.</p>

      <div className="mt-8">
        <SocialLoginButtons next={next} />
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Tên của bạn" htmlFor="fullName">
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="VD: Ngọc Ánh"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </Field>
        <Field label="Email" htmlFor="email" hint="Dùng để đăng nhập và nhận mã xác minh.">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ban@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        <Field label="Mật khẩu" htmlFor="password" hint="Ít nhất 6 ký tự.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
          {busy ? <Spinner /> : null} Tạo tài khoản
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink/60">
        Đã có tài khoản?{' '}
        <Link href={`/dang-nhap?next=${encodeURIComponent(next)}`} className="font-semibold text-wine-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
