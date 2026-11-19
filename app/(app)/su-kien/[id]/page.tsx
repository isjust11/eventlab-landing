'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  EyeOff,
  ExternalLink,
  Heart,
  Link2,
  ListPlus,
  MapPin,
  MessageCircleHeart,
  Pencil,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { EmptyState, Input, Spinner, Textarea, copyText } from '@/components/ui';
import { toast } from '@/components/Toaster';
import { inviteUrl } from '@/lib/config';
import {
  addGuest,
  approveWish,
  deleteEvent,
  deleteGuest,
  getEvent,
  getRsvpStats,
  importGuests,
  listGuests,
  listWishes,
  publishEvent,
  rejectWish,
  RSVP_LABELS,
  STATUS_LABELS,
  unpublishEvent,
  type EventItem,
  type Guest,
  type RsvpStats,
  type RsvpStatus,
  type Wish,
} from '@/lib/events';
import { countdownLabel, formatEventDate } from '@/lib/format';

function formatGuestWhen(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function guestPartySize(g: Guest) {
  if (g.rsvpStatus === 'DECLINED' || g.rsvpStatus === 'PENDING') return null;
  return 1 + Math.max(0, g.plusOnes || 0);
}

function guestSourceLabel(g: Guest) {
  if (g.extraData?.via === 'public_rsvp_form') return 'RSVP từ thiệp';
  if (g.source === 'IMPORT') return 'Import';
  if (g.source === 'MANUAL') return 'Thêm tay';
  return g.source || '';
}

const RSVP_TONE: Record<RsvpStatus, string> = {
  ATTENDING: 'bg-emerald-50 text-emerald-700',
  DECLINED: 'bg-rose-50 text-rose-700',
  MAYBE: 'bg-gold-200/40 text-gold-500',
  PENDING: 'bg-ink/5 text-ink/55',
};

const GROUP_SUGGESTIONS = ['Nhà trai', 'Nhà gái', 'Bạn bè', 'Đồng nghiệp', 'Gia đình'];

function ShareCard({ event, onChanged }: { event: EventItem; onChanged: (e: Partial<EventItem>) => void }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const published = event.status === 'PUBLISHED' && event.slug;
  const url = event.slug ? inviteUrl(event.slug) : '';

  const toggle = async () => {
    setBusy(true);
    try {
      if (published) {
        if (!window.confirm('Tạm ẩn thiệp? Khách mở link sẽ không xem được cho tới khi bạn chia sẻ lại.')) return;
        await unpublishEvent(event.id);
        onChanged({ status: 'DRAFT' });
        toast('Đã tạm ẩn thiệp.');
      } else {
        const res = await publishEvent(event.id);
        onChanged({ status: 'PUBLISHED', slug: res.slug ?? event.slug });
        toast('Thiệp đã được chia sẻ!');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Chưa thực hiện được, bạn thử lại nhé.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!published) {
    return (
      <div className="rounded-3xl border border-gold-300/60 bg-gradient-to-br from-gold-200/30 to-white p-6">
        <h2 className="font-serif text-xl font-semibold">Thiệp đang là bản nháp</h2>
        <p className="mt-1 text-sm text-ink/60">Chỉ bạn nhìn thấy thiệp lúc này. Khi đã ưng ý, bấm chia sẻ để nhận link gửi khách.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={toggle} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Spinner size={16} /> : <Send size={16} />} Chia sẻ thiệp
          </button>
          <Link href={`/su-kien/${event.id}/chinh-sua`} className="btn-outline">
            <Pencil size={16} /> Chỉnh sửa trước
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-wine-700 to-wine-900 p-6 text-white shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Link2 size={18} className="text-gold-300" /> Link thiệp của bạn
        </h2>
        <button type="button" onClick={toggle} disabled={busy} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <EyeOff size={14} /> Tạm ẩn
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 p-2 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm text-white/85">{url}</span>
        <button
          type="button"
          onClick={async () => {
            setCopied(await copyText(url));
            window.setTimeout(() => setCopied(false), 2000);
          }}
          className="btn shrink-0 bg-gold-300 px-4 py-2 text-xs text-wine-900 hover:bg-gold-200"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã chép' : 'Sao chép'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={url} target="_blank" rel="noreferrer" className="btn-ghost-light px-4 py-2 text-xs">
          <ExternalLink size={14} /> Mở thiệp
        </a>
        <button
          type="button"
          className="btn-ghost-light px-4 py-2 text-xs"
          onClick={async () => {
            if (navigator.share) await navigator.share({ title: event.title, url }).catch(() => undefined);
            else toast((await copyText(url)) ? 'Đã sao chép link — dán vào Zalo hoặc Messenger nhé.' : 'Chưa sao chép được link.');
          }}
        >
          <Send size={14} /> Gửi qua Zalo, Messenger…
        </button>
      </div>
    </div>
  );
}

function Stats({ stats, wishes }: { stats: RsvpStats | null; wishes: number }) {
  const tiles = [
    { label: 'Khách mời', value: stats?.total ?? 0, tone: 'text-ink' },
    { label: 'Sẽ tham dự', value: stats?.ATTENDING ?? 0, tone: 'text-emerald-600' },
    { label: 'Không tham dự', value: stats?.DECLINED ?? 0, tone: 'text-rose-600' },
    { label: 'Chưa trả lời', value: (stats?.PENDING ?? 0) + (stats?.MAYBE ?? 0), tone: 'text-gold-500' },
    { label: 'Lời chúc mới', value: wishes, tone: 'text-wine-600' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-wine-900/5 bg-white p-4 shadow-card">
          <p className={`font-serif text-3xl font-semibold ${t.tone}`}>{t.value}</p>
          <p className="mt-1 text-xs font-medium text-ink/55">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

function AddGuests({ eventId, onAdded }: { eventId: string; onAdded: () => void }) {
  const [mode, setMode] = useState<'one' | 'many'>('one');
  const [guest, setGuest] = useState({ name: '', phone: '', group: '' });
  const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'one') {
        if (!guest.name.trim()) return;
        await addGuest(eventId, { name: guest.name.trim(), phone: guest.phone.trim() || undefined, group: guest.group.trim() || undefined });
        toast(`Đã thêm ${guest.name.trim()}.`);
        setGuest({ name: '', phone: '', group: guest.group });
      } else {
        const rows = bulk
          .split('\n')
          .map((line) => line.split(/[,;\t]/).map((s) => s.trim()))
          .filter(([name]) => name)
          .map(([name, phone, group]) => ({ name, phone: phone || undefined, group: group || undefined }));
        if (!rows.length) return;
        await importGuests(eventId, rows);
        toast(`Đã thêm ${rows.length} khách mời.`);
        setBulk('');
      }
      onAdded();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Chưa thêm được khách, bạn thử lại nhé.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-wine-900/5 bg-white p-5 shadow-card">
      <div className="flex gap-1 rounded-full bg-cream p-1 text-sm font-medium">
        {(
          [
            ['one', 'Thêm từng người', UserPlus],
            ['many', 'Dán cả danh sách', ListPlus],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 transition ${
              mode === key ? 'bg-white text-wine-700 shadow' : 'text-ink/55'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {mode === 'one' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
          <Input placeholder="Tên khách *" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} required />
          <Input placeholder="Số điện thoại" inputMode="tel" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
          <Input placeholder="Nhóm (VD: Nhà trai)" list="guest-groups" value={guest.group} onChange={(e) => setGuest({ ...guest, group: e.target.value })} />
          <datalist id="guest-groups">
            {GROUP_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Spinner size={16} /> : <UserPlus size={16} />} Thêm
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Textarea
            rows={5}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'Mỗi dòng một khách: Tên, Số điện thoại, Nhóm\nVD:\nCô Lan, 0901234567, Nhà gái\nAnh Minh, , Bạn bè'}
          />
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Spinner size={16} /> : <ListPlus size={16} />} Thêm danh sách
          </button>
        </div>
      )}
    </form>
  );
}

function GuestList({ eventId, guests, onChanged }: { eventId: string; guests: Guest[]; onChanged: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | RsvpStatus>('ALL');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter !== 'ALL' && g.rsvpStatus !== filter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.phone || '').includes(q) ||
        (g.email || '').toLowerCase().includes(q) ||
        (g.group || '').toLowerCase().includes(q) ||
        (g.rsvpNote || '').toLowerCase().includes(q)
      );
    });
  }, [guests, query, filter]);

  if (!guests.length) {
    return (
      <EmptyState
        icon={<Users size={26} />}
        title="Chưa có khách mời"
        text="Thêm khách để gửi link có tên riêng từng người và theo dõi ai sẽ tham dự."
      />
    );
  }

  return (
    <div className="rounded-3xl border border-wine-900/5 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-wine-900/5 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email, nhóm, lời nhắn…"
            className="pl-11"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {(['ALL', 'ATTENDING', 'DECLINED', 'PENDING', 'MAYBE'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                filter === key ? 'bg-wine-700 text-white' : 'bg-cream text-ink/60 hover:text-ink'
              }`}
            >
              {key === 'ALL' ? `Tất cả (${guests.length})` : RSVP_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-wine-900/5">
        {shown.map((g) => {
          const party = guestPartySize(g);
          const source = guestSourceLabel(g);
          const meta = [g.group, g.phone, g.email].filter(Boolean);
          return (
            <li key={g.id} className="flex items-start gap-3 px-4 py-4 sm:px-5">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wine-50 font-serif text-wine-700">
                {g.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{g.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${RSVP_TONE[g.rsvpStatus]}`}>
                    {RSVP_LABELS[g.rsvpStatus]}
                  </span>
                  {party != null ? (
                    <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[11px] font-semibold text-ink/65">
                      {party} khách
                      {g.plusOnes ? ` (+${g.plusOnes})` : ''}
                    </span>
                  ) : null}
                  {source ? (
                    <span className="rounded-full bg-wine-50 px-2.5 py-0.5 text-[11px] font-medium text-wine-700/80">
                      {source}
                    </span>
                  ) : null}
                </div>
                {meta.length ? (
                  <p className="truncate text-xs text-ink/50">{meta.join(' · ')}</p>
                ) : (
                  <p className="text-xs text-ink/40">Chưa có SĐT / email / nhóm</p>
                )}
                {g.rsvpNote ? (
                  <p className="rounded-2xl bg-cream/80 px-3 py-2 text-sm leading-relaxed text-ink/75">
                    <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      Lời nhắn
                    </span>
                    {g.rsvpNote}
                  </p>
                ) : null}
                <p className="text-[11px] text-ink/40">
                  {[
                    g.respondedAt ? `Phản hồi ${formatGuestWhen(g.respondedAt)}` : null,
                    g.viewedAt ? `Đã xem ${formatGuestWhen(g.viewedAt)}` : null,
                    !g.respondedAt && !g.viewedAt ? 'Chưa mở / chưa phản hồi' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {g.invitationUrl ? (
                  <button
                    type="button"
                    title="Sao chép link mời riêng"
                    aria-label={`Sao chép link mời riêng cho ${g.name}`}
                    onClick={async () =>
                      toast(
                        (await copyText(g.invitationUrl!))
                          ? `Đã chép link mời cho ${g.name}.`
                          : 'Chưa sao chép được.',
                      )
                    }
                    className="rounded-full p-2 text-ink/45 hover:bg-wine-50 hover:text-wine-700"
                  >
                    <Copy size={16} />
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label={`Xoá ${g.name}`}
                  onClick={async () => {
                    if (!window.confirm(`Xoá ${g.name} khỏi danh sách khách mời?`)) return;
                    try {
                      await deleteGuest(eventId, g.id);
                      onChanged();
                    } catch (err) {
                      toast(err instanceof Error ? err.message : 'Chưa xoá được.', 'error');
                    }
                  }}
                  className="rounded-full p-2 text-ink/35 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
        {!shown.length ? <li className="px-5 py-10 text-center text-sm text-ink/50">Không có khách phù hợp.</li> : null}
      </ul>
    </div>
  );
}

function WishList({ eventId, wishes, onChanged }: { eventId: string; wishes: Wish[]; onChanged: () => void }) {
  if (!wishes.length) {
    return (
      <EmptyState
        icon={<MessageCircleHeart size={26} />}
        title="Chưa có lời chúc nào"
        text="Khi khách gửi lời chúc trên thiệp, bạn sẽ thấy ở đây và chọn lời chúc nào được hiển thị."
      />
    );
  }
  const act = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      toast(message);
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Chưa thực hiện được.', 'error');
    }
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {wishes.map((w) => (
        <figure key={w.id} className="flex flex-col rounded-3xl border border-wine-900/5 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <figcaption className="font-serif text-lg font-semibold text-wine-700">{w.name || 'Khách ẩn danh'}</figcaption>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                w.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : w.status === 'REJECTED' ? 'bg-ink/5 text-ink/45' : 'bg-gold-200/40 text-gold-500'
              }`}
            >
              {w.status === 'APPROVED' ? 'Đang hiển thị' : w.status === 'REJECTED' ? 'Đã ẩn' : 'Chờ duyệt'}
            </span>
          </div>
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">{w.message}</blockquote>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-wine-900/5 pt-3">
            <span className="text-xs text-ink/40">{new Date(w.createdAt).toLocaleDateString('vi-VN')}</span>
            <div className="flex gap-1.5">
              {w.status !== 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => act(() => approveWish(eventId, w.id), 'Lời chúc đã hiển thị trên thiệp.')}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Heart size={13} /> Hiển thị
                </button>
              ) : null}
              {w.status !== 'REJECTED' ? (
                <button
                  type="button"
                  onClick={() => act(() => rejectWish(eventId, w.id), 'Đã ẩn lời chúc.')}
                  className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink/60 hover:text-ink"
                >
                  <EyeOff size={13} /> Ẩn
                </button>
              ) : null}
            </div>
          </div>
        </figure>
      ))}
    </div>
  );
}

export default function ManageEventPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [tab, setTab] = useState<'guests' | 'wishes'>('guests');
  const [error, setError] = useState('');

  const loadGuests = useCallback(() => {
    listGuests(id).then((r) => setGuests(r.data)).catch(() => undefined);
    getRsvpStats(id).then(setStats).catch(() => undefined);
  }, [id]);
  const loadWishes = useCallback(() => {
    listWishes(id).then(setWishes).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được sự kiện.'));
    loadGuests();
    loadWishes();
  }, [id, loadGuests, loadWishes]);

  if (error) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-ink/60">{error}</p>
        <Link href="/su-kien" className="btn-primary mt-6">
          Về sự kiện của tôi
        </Link>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="grid place-items-center py-32 text-wine-600">
        <Spinner size={28} />
      </div>
    );
  }

  const pendingWishes = wishes.filter((w) => w.status === 'PENDING').length;
  const countdown = countdownLabel(event.eventDate);

  return (
    <div className="container-x py-8">
      <Link href="/su-kien" className="inline-flex items-center gap-2 text-sm text-ink/55 hover:text-wine-700">
        <ArrowLeft size={16} /> Sự kiện của tôi
      </Link>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-wine-50 px-3 py-1 text-xs font-semibold text-wine-700">{STATUS_LABELS[event.status]}</span>
            {countdown ? <span className="rounded-full bg-gold-200/40 px-3 py-1 text-xs font-semibold text-gold-500">{countdown}</span> : null}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink/60">
            {event.eventDate ? (
              <span className="flex items-center gap-1.5 first-letter:uppercase">
                <CalendarDays size={15} className="text-wine-400" /> {formatEventDate(event.eventDate)}
              </span>
            ) : null}
            {event.venue ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-wine-400" /> {event.venue}
              </span>
            ) : null}
          </div>
        </div>
        <Link href={`/su-kien/${event.id}/chinh-sua`} className="btn-primary self-start px-6 lg:self-auto">
          <Pencil size={16} /> Chỉnh sửa thiệp
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <ShareCard event={event} onChanged={(patch) => setEvent({ ...event, ...patch })} />
        <Stats stats={stats} wishes={pendingWishes} />
      </div>

      <div className="mt-10 flex gap-6 border-b border-wine-900/10">
        {(
          [
            ['guests', `Khách mời (${guests.length})`],
            ['wishes', `Lời chúc (${wishes.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
              tab === key ? 'border-wine-700 text-wine-700' : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {label}
            {key === 'wishes' && pendingWishes ? (
              <span className="ml-2 rounded-full bg-wine-600 px-1.5 py-0.5 text-[10px] text-white">{pendingWishes}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {tab === 'guests' ? (
          <>
            <AddGuests eventId={event.id} onAdded={loadGuests} />
            <GuestList eventId={event.id} guests={guests} onChanged={loadGuests} />
          </>
        ) : (
          <WishList eventId={event.id} wishes={wishes} onChanged={loadWishes} />
        )}
      </div>

      <div className="mt-16 rounded-3xl border border-rose-200 p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-rose-700">Xoá sự kiện</h2>
          <p className="mt-1 text-sm text-ink/55">Thiệp, khách mời và lời chúc sẽ bị xoá vĩnh viễn.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm(`Xoá vĩnh viễn "${event.title}"?`)) return;
            try {
              await deleteEvent(event.id);
              toast('Đã xoá sự kiện.');
              router.replace('/su-kien');
            } catch (err) {
              toast(err instanceof Error ? err.message : 'Chưa xoá được.', 'error');
            }
          }}
          className="btn mt-4 border border-rose-200 text-rose-600 hover:bg-rose-50 sm:mt-0"
        >
          <Trash2 size={16} /> Xoá sự kiện
        </button>
      </div>
    </div>
  );
}
