'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Copy, ExternalLink, MapPin, MoreHorizontal, Pencil, Plus, Sparkles, Trash2, Users } from 'lucide-react';
import { ScaledIframe } from '@/components/PhoneFrame';
import { EmptyState, Spinner, copyText } from '@/components/ui';
import { toast } from '@/components/Toaster';
import { displayName, useSession } from '@/lib/auth';
import { inviteUrl } from '@/lib/config';
import { deleteEvent, listEvents, STATUS_LABELS, type EventItem } from '@/lib/events';
import { countdownLabel, formatEventDate } from '@/lib/format';

function StatusPill({ status }: { status: EventItem['status'] }) {
  const tone =
    status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : status === 'ARCHIVED' ? 'bg-ink/5 text-ink/50' : 'bg-gold-200/40 text-gold-500';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Cover({ event }: { event: EventItem }) {
  if (event.status === 'PUBLISHED' && event.slug) {
    return <ScaledIframe src={inviteUrl(event.slug)} title={event.title} interactive={false} />;
  }
  const image = event.coverImageUrl || (event.eventData?.coverImage as string | undefined) || event.template?.thumbnailUrl;
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-wine-100 via-cream to-gold-200/40 p-6 text-center">
      <p className="font-serif text-xl text-wine-800">{event.title}</p>
    </div>
  );
}

function EventCard({ event, onDeleted }: { event: EventItem; onDeleted: () => void }) {
  const [menu, setMenu] = useState(false);
  const countdown = countdownLabel(event.eventDate);
  const url = event.slug ? inviteUrl(event.slug) : '';

  const remove = async () => {
    setMenu(false);
    if (!window.confirm(`Xoá "${event.title}"? Khách mời và lời chúc của sự kiện này cũng sẽ bị xoá.`)) return;
    try {
      await deleteEvent(event.id);
      toast('Đã xoá sự kiện.');
      onDeleted();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Chưa xoá được, bạn thử lại nhé.', 'error');
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-wine-900/5 bg-white shadow-card transition hover:-translate-y-1">
      <Link href={`/su-kien/${event.id}`} className="relative block aspect-[4/3] overflow-hidden bg-wine-50">
        <Cover event={event} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        {countdown ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-wine-800 backdrop-blur">
            {countdown}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusPill status={event.status} />
          <div className="relative">
            <button
              type="button"
              aria-label="Thêm thao tác"
              onClick={() => setMenu((v) => !v)}
              className="-mr-2 -mt-1 rounded-full p-1.5 text-ink/45 hover:bg-wine-50 hover:text-wine-700"
            >
              <MoreHorizontal size={18} />
            </button>
            {menu ? (
              <div className="absolute right-0 top-8 z-20 w-52 overflow-hidden rounded-2xl border border-wine-900/5 bg-white py-1 shadow-card">
                {url ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-wine-50"
                      onClick={async () => {
                        setMenu(false);
                        toast((await copyText(url)) ? 'Đã sao chép link thiệp.' : 'Chưa sao chép được link.');
                      }}
                    >
                      <Copy size={15} /> Sao chép link
                    </button>
                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-wine-50">
                      <ExternalLink size={15} /> Mở thiệp
                    </a>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={remove}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={15} /> Xoá sự kiện
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <Link href={`/su-kien/${event.id}`} className="mt-3 font-serif text-xl font-semibold leading-snug hover:text-wine-700">
          {event.title}
        </Link>
        <div className="mt-3 space-y-1.5 text-sm text-ink/60">
          {event.eventDate ? (
            <p className="flex items-center gap-2 first-letter:uppercase">
              <CalendarDays size={15} className="shrink-0 text-wine-400" /> {formatEventDate(event.eventDate)}
            </p>
          ) : null}
          {event.venue ? (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-wine-400" /> <span className="truncate">{event.venue}</span>
            </p>
          ) : null}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/su-kien/${event.id}/chinh-sua`} className="btn-outline px-3 py-2.5">
            <Pencil size={15} /> Sửa thiệp
          </Link>
          <Link href={`/su-kien/${event.id}`} className="btn bg-wine-50 px-3 py-2.5 text-wine-700 hover:bg-wine-100">
            <Users size={15} /> Khách mời
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function MyEventsPage() {
  const user = useSession();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    listEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được danh sách sự kiện.'));
  }, []);

  useEffect(load, [load]);

  const firstName = displayName(user).split(/\s+/).pop();

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Sự kiện của tôi</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Chào {firstName || 'bạn'},</h1>
          <p className="mt-2 text-ink/60">Đây là những tấm thiệp bạn đã tạo. Chọn một thiệp để chỉnh sửa hoặc xem khách mời.</p>
        </div>
      </div>

      {error ? <p className="mt-8 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {events === null && !error ? (
        <div className="grid place-items-center py-24 text-wine-600">
          <Spinner size={28} />
        </div>
      ) : null}

      {events && events.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Sparkles size={26} />}
            title="Bạn chưa có tấm thiệp nào"
            text="Chọn một mẫu bạn thích, điền tên, ngày cưới và ảnh — thiệp sẽ sẵn sàng để gửi trong vài phút."
            action={
              <Link href="/tao-thiep" className="btn-primary px-7">
                <Plus size={16} /> Tạo thiệp đầu tiên
              </Link>
            }
          />
        </div>
      ) : null}

      {events && events.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/tao-thiep"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-wine-900/15 bg-white/50 p-6 text-center transition hover:border-wine-400 hover:bg-white"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-wine-700 text-white shadow-card">
              <Plus size={24} />
            </span>
            <span className="mt-4 font-serif text-xl font-semibold">Tạo thiệp mới</span>
            <span className="mt-1 text-sm text-ink/55">Chọn mẫu và bắt đầu</span>
          </Link>
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDeleted={load} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
