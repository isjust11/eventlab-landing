const trim = (url: string) => url.replace(/\/$/, '');

export const API_URL = trim(process.env.EVENTLAB_API_URL || 'http://localhost:4000');
export const INVITE_HOST_URL = trim(process.env.NEXT_PUBLIC_INVITE_HOST_URL || 'http://localhost:3000');
export const ADMIN_URL = trim(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3200');

export const BRAND = 'EventLab';

export function demoUrl(slug: string) {
  return `${INVITE_HOST_URL}/template/${encodeURIComponent(slug)}`;
}

export function startWithTemplateUrl(slug?: string) {
  const base = `${ADMIN_URL}/manager/events/create`;
  return slug ? `${base}?template=${encodeURIComponent(slug)}` : base;
}

export const SIGN_UP_URL = `${ADMIN_URL}/register`;
export const LOGIN_URL = `${ADMIN_URL}/login`;
