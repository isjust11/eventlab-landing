'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Quote } from 'lucide-react';
import { FAQS, TESTIMONIALS } from '@/lib/content';
import { startWithTemplateUrl } from '@/lib/config';
import Reveal, { SectionHeading } from './Reveal';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="hoi-dap" className="scroll-mt-20 bg-white py-24">
      <div className="container-x max-w-3xl">
        <SectionHeading eyebrow="Hỏi đáp" title="Câu hỏi thường gặp" />
        <div className="mt-12 divide-y divide-wine-900/10 border-y border-wine-900/10">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left font-medium transition hover:text-wine-700"
                  >
                    {item.q}
                    <Plus
                      size={20}
                      className={`shrink-0 text-wine-500 transition duration-300 ${isOpen ? 'rotate-45' : ''}`}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-sm leading-relaxed text-ink/65">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Cảm nhận" title="Các cặp đôi nói gì về EventLab" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-wine-900/5 bg-white p-8 shadow-card">
                <Quote className="text-gold-400" size={28} />
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink/75">{t.quote}</blockquote>
                <figcaption className="mt-6 border-t border-wine-900/5 pt-5">
                  <p className="font-serif text-lg font-semibold text-wine-700">{t.name}</p>
                  <p className="text-sm text-ink/50">{t.date}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-24 max-w-3xl text-center">
          <p className="font-serif text-2xl italic leading-relaxed text-wine-800 sm:text-3xl">
            “Tấm thiệp không chỉ báo tin vui — nó là trang đầu tiên trong cuốn album cưới của hai bạn.”
          </p>
          <p className="mt-4 text-sm tracking-[0.2em] text-gold-500">— ĐỘI NGŨ EVENTLAB</p>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="pb-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-wine-700 via-wine-800 to-wine-900 px-6 py-16 text-center text-white sm:px-16">
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-wine-500/40 blur-3xl" />
            <h2 className="relative font-serif text-3xl font-semibold sm:text-5xl">Sẵn sàng cho ngày trọng đại?</h2>
            <p className="relative mx-auto mt-5 max-w-xl text-white/75">
              Tạo tấm thiệp đầu tiên ngay hôm nay — miễn phí, không cần kỹ năng thiết kế.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={startWithTemplateUrl()} className="btn bg-gold-300 px-8 py-4 text-base text-wine-900 hover:bg-gold-200">
                Tạo thiệp miễn phí
              </a>
              <a href="/mau-thiep" className="btn-ghost-light px-8 py-4 text-base">
                Xem tất cả mẫu
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
