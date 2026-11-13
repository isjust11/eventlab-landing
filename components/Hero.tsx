'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Heart, Star } from 'lucide-react';
import { startWithTemplateUrl } from '@/lib/config';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-wine-900 pb-24 pt-32 text-white">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=2000&q=70)' }}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3.2, ease: EASE }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(130,40,60,0.55),transparent_60%),linear-gradient(180deg,rgba(44,15,22,0.82)_0%,rgba(44,15,22,0.72)_45%,rgba(44,15,22,0.96)_100%)]"
      />

      <div className="container-x text-center">
        <motion.p
          {...rise(0.1)}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-white/5 px-4 py-1.5 text-sm text-gold-200 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-300" /> Thiệp mời trọn vẹn trên điện thoại
        </motion.p>

        <motion.h1 {...rise(0.25)} className="mx-auto mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.15] sm:text-6xl">
          Thiệp cưới online thật đẹp
          <span className="mt-1 block font-normal italic text-gold-300">gửi đi chỉ trong vài phút</span>
        </motion.h1>

        <motion.p {...rise(0.4)} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          Chọn mẫu, điền thông tin, thêm ảnh và nhạc — EventLab tạo cho bạn một tấm thiệp có hiệu ứng mở thiệp, bản đồ, xác nhận
          tham dự và hộp mừng cưới, gửi qua Zalo hay Messenger bằng một đường link.
        </motion.p>

        <motion.div {...rise(0.55)} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={startWithTemplateUrl()} className="btn-primary w-full px-8 py-4 text-base sm:w-auto">
            Tạo thiệp miễn phí <ArrowRight size={18} />
          </a>
          <Link href="/mau-thiep" className="btn-ghost-light w-full px-8 py-4 text-base sm:w-auto">
            <Heart size={18} className="text-gold-300" /> Xem mẫu thiệp
          </Link>
        </motion.div>

        <motion.ul {...rise(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/65">
          <li>✓ Không cần biết thiết kế</li>
          <li className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" aria-hidden="true" />
          <li className="flex items-center gap-1.5">
            <span className="flex text-gold-300">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            <strong className="font-semibold text-white">4.9/5</strong> từ các cặp đôi
          </li>
          <li className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" aria-hidden="true" />
          <li>Bắt đầu miễn phí</li>
        </motion.ul>
      </div>

      <a
        href="#mau-noi-bat"
        aria-label="Cuộn xuống phần tiếp theo"
        className="absolute bottom-8 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10"
      >
        <ChevronDown className="animate-bounce" size={20} />
      </a>
    </section>
  );
}
