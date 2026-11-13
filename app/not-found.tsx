import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center px-6 py-24 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-4 text-ink/60">Mẫu thiệp này có thể đã được gỡ hoặc đổi tên.</p>
        <Link href="/mau-thiep" className="btn-primary mt-8">
          Xem các mẫu khác
        </Link>
      </div>
    </section>
  );
}
