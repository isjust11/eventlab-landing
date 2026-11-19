import { redirect, notFound } from 'next/navigation';
import { INVITE_HOST_URL, PUBLIC_API_URL } from '@/lib/config';

type Params = Promise<{ token: string }>;

/**
 * Legacy short links pointed at the landing origin (`/e/:token`).
 * Resolve guest via Nest and send them to the invite host.
 */
export default async function LegacyGuestLinkPage({ params }: { params: Params }) {
  const { token } = await params;
  if (!token?.trim()) notFound();

  try {
    const res = await fetch(`${PUBLIC_API_URL}/public/e/${encodeURIComponent(token)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const body = (await res.json().catch(() => null)) as {
      invitationUrl?: string;
      reactInviteUrl?: string;
      invitePayload?: { slug?: string };
      guest?: { name?: string };
      data?: {
        invitationUrl?: string;
        reactInviteUrl?: string;
        invitePayload?: { slug?: string };
        guest?: { name?: string };
      };
    } | null;

    if (!res.ok) notFound();

    const payload = body?.data && typeof body.data === 'object' ? body.data : body;
    if (payload?.invitationUrl?.startsWith('http')) {
      redirect(payload.invitationUrl);
    }

    const slug = payload?.invitePayload?.slug;
    const name = payload?.guest?.name?.trim();
    if (slug) {
      const qs = new URLSearchParams();
      if (name) qs.set('to', name);
      qs.set('token', token);
      redirect(`${INVITE_HOST_URL}/invite/${encodeURIComponent(slug)}?${qs.toString()}`);
    }

    // Fallback short path on invite host.
    redirect(`${INVITE_HOST_URL}/e/${encodeURIComponent(token)}`);
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
  }

  notFound();
}
