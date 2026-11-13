import Link from 'next/link';

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="EventLab — trang chủ">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-wine-600 to-wine-800 font-serif text-lg font-semibold text-gold-200 shadow-[0_6px_14px_-6px_rgba(107,31,48,0.9)]">
        E
      </span>
      <span className={`font-serif text-xl font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        EventLab
      </span>
    </Link>
  );
}
