import { CheckCircle2, Gift, Leaf, Mail, MapPin, Music2, Palette, Wand2, type LucideIcon } from 'lucide-react';
import { BENEFITS, FEATURES, HIGHLIGHTS, STEPS } from '@/lib/content';
import { demoUrl, startWithTemplateUrl } from '@/lib/config';
import Reveal, { SectionHeading } from './Reveal';
import PhoneFrame, { ScaledIframe } from './PhoneFrame';

const ICONS: Record<string, LucideIcon> = {
  palette: Palette,
  music: Music2,
  wand: Wand2,
  leaf: Leaf,
  mail: Mail,
  map: MapPin,
  check: CheckCircle2,
  gift: Gift,
};

export function Features() {
  return (
    <section id="tinh-nang" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Vì sao chọn EventLab"
          title="Một tấm thiệp, đủ cả cảm xúc lẫn tiện lợi"
          text="Mọi thứ khách mời cần — lời mời, thời gian, đường đi, xác nhận tham dự — gói gọn trong một đường link đẹp."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon];
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-wine-900/5 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-wine-50 text-wine-700">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-semibold">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section id="cach-tao" className="scroll-mt-20 bg-white py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Đơn giản" title="Ba bước để có thiệp cưới online" />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent md:block"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative text-center">
              <li className="list-none">
                <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-wine-600 to-wine-800 font-serif text-2xl text-gold-200 shadow-card ring-8 ring-white">
                  {i + 1}
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink/65">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-14 text-center">
          <a href={startWithTemplateUrl()} className="btn-primary px-8 py-3.5">
            Bắt đầu ngay
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/** Live demo in a phone with the guest-facing highlights around it. */
export function Showcase({ slug }: { slug?: string }) {
  return (
    <section className="relative overflow-hidden bg-wine-900 py-24 text-white">
      <div
        aria-hidden="true"
        className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-wine-600/30 blur-3xl"
      />
      <div aria-hidden="true" className="absolute -right-40 bottom-0 h-[380px] w-[380px] rounded-full bg-gold-500/15 blur-3xl" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr]">
        <div className="lg:text-right">
          <SectionHeading
            align="left"
            light
            eyebrow="Trải nghiệm khách mời"
            title={
              <>
                Đẹp như một thước phim, <span className="italic text-gold-300">nhẹ như một tin nhắn</span>
              </>
            }
            text="Từ khoảnh khắc mở phong bì đến lúc khách bấm xác nhận tham dự — mọi chi tiết đều được chăm chút."
          />
        </div>

        {slug ? (
          <Reveal className="mx-auto w-[280px] sm:w-[310px]">
            <PhoneFrame>
              <ScaledIframe src={demoUrl(slug)} title="Thiệp mẫu" />
            </PhoneFrame>
            <p className="mt-4 text-center text-xs text-white/50">Thiệp thật — hãy chạm và cuộn thử</p>
          </Reveal>
        ) : null}

        <ul className="grid gap-4">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = ICONS[h.icon];
            return (
              <Reveal key={h.title} delay={i * 0.08}>
                <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-300/15 text-gold-300">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{h.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">{h.text}</p>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Benefits() {
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Thiệp cưới online"
            title="Vì sao ngày càng nhiều cặp đôi chọn thiệp online?"
            text="Thiệp online là một trang web nhỏ dành riêng cho ngày cưới của bạn. Khách mở bằng điện thoại, xem ảnh, nghe nhạc, xem đường đi và trả lời ngay trên thiệp — còn bạn tiết kiệm chi phí in ấn và thời gian đi phát thiệp."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <h3 className="flex items-center gap-2 font-semibold text-wine-700">
                  <CheckCircle2 size={18} className="text-gold-500" /> {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=75"
              alt="Cô dâu chú rể trong ngày cưới"
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-wine-900/80 to-transparent p-8 pt-24 text-white">
              <p className="font-serif text-2xl">Tạo thiệp trong vài phút</p>
              <p className="mt-2 text-sm text-white/75">Một đường link cho lời mời, bản đồ, RSVP và câu chuyện của hai bạn.</p>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white px-5 py-4 shadow-card sm:block">
            <p className="text-xs text-ink/55">Khách đã xác nhận</p>
            <p className="font-serif text-2xl font-semibold text-wine-700">126 / 150</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
