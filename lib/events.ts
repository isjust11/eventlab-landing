'use client';

import { api } from './api';
import { INVITE_HOST_URL } from './config';
import { mergeSchema, type PackageSchema } from './fields';
import type { TemplateType } from './templates';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'DECLINED' | 'MAYBE';
export type WishStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type EventItem = {
  id: string;
  title: string;
  slug?: string | null;
  type?: TemplateType;
  status: EventStatus;
  eventDate?: string | null;
  venue?: string | null;
  coverImageUrl?: string | null;
  eventData?: Record<string, unknown> | null;
  templateId?: string | null;
  template?: { id: string; slug?: string; name?: string; thumbnailUrl?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventInput = {
  title: string;
  type?: TemplateType;
  templateId?: string;
  eventDate?: string;
  venue?: string;
  coverImageUrl?: string;
  eventData: Record<string, unknown>;
  status?: EventStatus;
};

export type Guest = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  group?: string | null;
  rsvpStatus: RsvpStatus;
  rsvpNote?: string | null;
  plusOnes?: number;
  viewedAt?: string | null;
  invitationUrl?: string;
};

export type Wish = { id: string; name: string; message: string; status: WishStatus; createdAt: string };

export type RsvpStats = Record<RsvpStatus, number> & { total: number };

type Page<T> = { data: T[]; total: number; page: number; size: number; totalPages: number };

export const listEvents = () => api<Page<EventItem>>('/events?page=1&size=100');
export const getEvent = (id: string) => api<EventItem>(`/events/${id}`);
export const createEvent = (input: EventInput) => api<EventItem>('/events', { method: 'POST', body: input });
export const updateEvent = (id: string, input: Partial<EventInput>) => api<EventItem>(`/events/${id}`, { method: 'PUT', body: input });
export const deleteEvent = (id: string) => api(`/events/${id}`, { method: 'DELETE' });
export const publishEvent = (id: string) => api<EventItem>(`/events/${id}/publish`, { method: 'POST' });
export const unpublishEvent = (id: string) => updateEvent(id, { status: 'DRAFT' });

export const listGuests = (id: string) => api<Page<Guest>>(`/events/${id}/guests?page=1&size=500`);
export const addGuest = (id: string, guest: Pick<Guest, 'name'> & Partial<Pick<Guest, 'phone' | 'email' | 'group'>>) =>
  api<Guest>(`/events/${id}/guests`, { method: 'POST', body: { ...guest, source: 'MANUAL' } });
export const importGuests = (id: string, guests: Array<Pick<Guest, 'name'> & Partial<Pick<Guest, 'phone' | 'group'>>>) =>
  api(`/events/${id}/guests/import`, { method: 'POST', body: { guests } });
export const deleteGuest = (id: string, guestId: string) => api(`/events/${id}/guests/${guestId}`, { method: 'DELETE' });
export const getRsvpStats = (id: string) => api<RsvpStats>(`/events/${id}/rsvp-stats`);

export const listWishes = (id: string) => api<Wish[] | Page<Wish>>(`/events/${id}/wishes`).then((r) => (Array.isArray(r) ? r : r.data));
export const approveWish = (id: string, wishId: string) => api(`/events/${id}/wishes/${wishId}/approve`, { method: 'POST' });
export const rejectWish = (id: string, wishId: string) => api(`/events/${id}/wishes/${wishId}/reject`, { method: 'POST' });

/** The editor schema: template fields with their sample values, from the public demo endpoint. */
export async function getTemplateSchema(slug: string) {
  return api<{ templateId: string; title: string; data: Record<string, unknown> }>(
    `/public/templates/slug/${encodeURIComponent(slug)}/demo`,
    { auth: false },
  );
}

/** Package slot contract from the invite host, merged with whatever the admin configured for the template. */
export async function loadEditorSchema(slug: string) {
  const [demo, pkg] = await Promise.all([
    getTemplateSchema(slug).catch(() => null),
    fetch(`${INVITE_HOST_URL}/api/template-schema/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? (r.json() as Promise<PackageSchema>) : null))
      .catch(() => null),
  ]);
  if (!demo && !pkg) return null;
  return { title: demo?.title || '', ...mergeSchema(demo?.data ?? {}, pkg) };
}

type CatalogRow = { id: string; slug: string; name: string; type: TemplateType };

/** Events reference templates by id; the public catalog only knows slugs. */
export async function catalogTemplate(slug: string): Promise<CatalogRow | null> {
  const res = await api<Page<CatalogRow> | CatalogRow[]>(`/templates/catalog?page=1&size=200`);
  const rows = Array.isArray(res) ? res : res.data;
  return rows.find((t) => t.slug === slug) ?? null;
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang chia sẻ',
  ARCHIVED: 'Đã lưu trữ',
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  PENDING: 'Chưa trả lời',
  ATTENDING: 'Sẽ tham dự',
  DECLINED: 'Không tham dự',
  MAYBE: 'Chưa chắc',
};
