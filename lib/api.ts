'use client';

import { PUBLIC_API_URL } from './config';

const ACCESS_KEY = 'el_access';
const REFRESH_KEY = 'el_refresh';
const USER_KEY = 'el_user';

export type SessionUser = {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  picture?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const session = {
  get access() {
    return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY);
  },
  get user(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(tokens: { accessToken: string; refreshToken: string; user?: SessionUser }) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    if (tokens.user) localStorage.setItem(USER_KEY, JSON.stringify(pickUser(tokens.user)));
    window.dispatchEvent(new Event('el-session'));
  },
  clear() {
    [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event('el-session'));
  },
};

function pickUser(user: SessionUser): SessionUser {
  const { id, username, email, fullName, picture } = user;
  return { id, username, email, fullName, picture };
}

function messageOf(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const msg = (body as { message?: unknown }).message;
  if (Array.isArray(msg)) return msg.join(', ');
  return typeof msg === 'string' && msg ? msg : fallback;
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = session.refresh;
  if (!refreshToken) return false;
  refreshing ??= fetch(`${PUBLIC_API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      session.save(await res.json());
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

export async function api<T = unknown>(path: string, { body, auth = true, headers, ...init }: Options = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const send = () =>
    fetch(`${PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        'Accept-Language': 'vi',
        ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(auth && session.access ? { Authorization: `Bearer ${session.access}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && auth && (await refreshTokens())) res = await send();
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.', 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    if (res.status === 401 && auth) session.clear();
    throw new ApiError(messageOf(data, 'Có lỗi xảy ra, bạn thử lại sau nhé.'), res.status);
  }
  return data as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const media = await api<{ url?: string; publicRelativePath?: string }>('/media/upload', { method: 'POST', body: form });
  return media.url || media.publicRelativePath || '';
}
