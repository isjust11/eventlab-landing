'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { api, session, type SessionUser } from './api';
import { DASHBOARD_URL, LOGIN_URL } from './config';

/** Only same-site paths are honoured as post-login redirects. */
export function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : DASHBOARD_URL;
}

function subscribe(onChange: () => void) {
  window.addEventListener('el-session', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('el-session', onChange);
    window.removeEventListener('storage', onChange);
  };
}

const readUser = () => localStorage.getItem('el_user');

/** `undefined` until hydrated, `null` when signed out. */
export function useSession(): SessionUser | null | undefined {
  const raw = useSyncExternalStore(subscribe, readUser, () => undefined);
  if (raw === undefined) return undefined;
  return raw && session.access ? session.user : null;
}

/** Sends visitors to the sign-in page and back here afterwards. */
export function useRequireAuth() {
  const user = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace(`${LOGIN_URL}?next=${encodeURIComponent(pathname + window.location.search)}`);
    else setReady(true);
  }, [user, router, pathname]);
  return ready ? user : null;
}

export function displayName(user: SessionUser | null | undefined) {
  return user?.fullName || user?.email || user?.username || '';
}

export async function login(username: string, password: string) {
  const tokens = await api<{ accessToken: string; refreshToken: string; user: SessionUser }>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { username: username.trim(), password, platform: 'web' },
  });
  session.save(tokens);
  return tokens.user;
}

const OAUTH_NEXT_KEY = 'el_oauth_next';

/** Remember where to send the user after Google/Facebook returns to `/success`. */
export function rememberOAuthNext(next: string) {
  try {
    sessionStorage.setItem(OAUTH_NEXT_KEY, safeNext(next));
  } catch {
    /* private mode */
  }
}

export function consumeOAuthNext() {
  try {
    const next = safeNext(sessionStorage.getItem(OAUTH_NEXT_KEY));
    sessionStorage.removeItem(OAUTH_NEXT_KEY);
    return next;
  } catch {
    return DASHBOARD_URL;
  }
}

/** Exchange the short-lived OAuth temp token for a normal session. */
export async function completeOAuth(tempToken: string) {
  const tokens = await api<{ accessToken: string; refreshToken: string; user: SessionUser }>(
    `/auth/token-info?token=${encodeURIComponent(tempToken)}`,
    { auth: false },
  );
  session.save(tokens);
  return tokens.user;
}

export type RegisterResult = { code: string; message: string };

/** Accounts use the email as username so people only remember one thing. */
export async function register(input: { fullName: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const res = await api<RegisterResult>('/auth/register', {
    method: 'POST',
    auth: false,
    body: { username: email, email, password: input.password, fullName: input.fullName.trim() },
  });
  return { code: res.code, message: res.message };
}

export const verifyPin = (email: string, pin: string) =>
  api('/auth/verify-pin', { method: 'POST', auth: false, body: { email: email.trim().toLowerCase(), pin: pin.trim() } });

export const resendPin = (email: string) =>
  api('/auth/resend-pin', { method: 'POST', auth: false, body: { email: email.trim().toLowerCase() } });

export async function logout() {
  const refreshToken = session.refresh;
  if (refreshToken) await api('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined);
  session.clear();
}
