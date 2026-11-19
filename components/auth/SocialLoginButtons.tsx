'use client';

import { PUBLIC_API_URL } from '@/lib/config';
import { rememberOAuthNext } from '@/lib/auth';

function startOAuth(provider: 'google' | 'facebook', next: string) {
  rememberOAuthNext(next);
  const redirect = encodeURIComponent(window.location.origin);
  window.location.href = `${PUBLIC_API_URL}/auth/${provider}?redirect=${redirect}`;
}

export default function SocialLoginButtons({ next }: { next: string }) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => startOAuth('google', next)}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-wine-900/10 bg-white px-4 py-3 text-sm font-medium text-ink/80 transition hover:border-wine-300 hover:bg-wine-50"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => startOAuth('facebook', next)}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-wine-900/10 bg-white px-4 py-3 text-sm font-medium text-ink/80 transition hover:border-wine-300 hover:bg-wine-50"
        >
          <FacebookIcon />
          Facebook
        </button>
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-wine-900/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-cream px-3 text-ink/45">hoặc tiếp tục với email</span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.8 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.89v2.26h3.34l-.53 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07z"
      />
    </svg>
  );
}
