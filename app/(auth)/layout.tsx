import Logo from '@/components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-wine-900 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wine-900 via-wine-900/40 to-wine-900/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <div>
            <p className="max-w-md font-serif text-4xl leading-tight">
              Tấm thiệp đẹp nhất là tấm thiệp <span className="italic text-gold-300">kể đúng câu chuyện</span> của hai bạn.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Tạo thiệp, gửi link và theo dõi khách xác nhận tham dự — tất cả ở một nơi, ngay trên điện thoại.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex flex-col bg-cream">
        <div className="container-x flex h-[68px] items-center lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
