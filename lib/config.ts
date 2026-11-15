const trim = (url: string) => url.replace(/\/$/, '');

export const API_URL = trim(process.env.EVENTLAB_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
export const PUBLIC_API_URL = trim(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
export const INVITE_HOST_URL = trim(process.env.NEXT_PUBLIC_INVITE_HOST_URL || 'http://localhost:3000');

export const BRAND = 'EventLab';

export function demoUrl(slug: string) {
  return `${INVITE_HOST_URL}/template/${encodeURIComponent(slug)}`;
}

export function inviteUrl(slug: string) {
  return `${INVITE_HOST_URL}/invite/${encodeURIComponent(slug)}`;
}

export const LIVE_PREVIEW_URL = `${INVITE_HOST_URL}/preview?bare`;

export function startWithTemplateUrl(slug?: string) {
  return slug ? `/tao-thiep/${encodeURIComponent(slug)}` : '/tao-thiep';
}

export const SIGN_UP_URL = '/dang-ky';
export const LOGIN_URL = '/dang-nhap';
export const DASHBOARD_URL = '/su-kien';
