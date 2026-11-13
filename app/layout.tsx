import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreviewProvider from '@/components/PreviewProvider';
import './globals.css';

const serif = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EventLab — Thiệp cưới online đẹp, có nhạc, RSVP & bản đồ',
    template: '%s | EventLab',
  },
  description:
    'Chọn mẫu thiệp cưới online, cá nhân hoá trong vài phút và gửi link qua Zalo, Messenger. Có nhạc nền, hiệu ứng mở thiệp, bản đồ, RSVP và hộp mừng cưới.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'EventLab',
  },
};

export const viewport: Viewport = {
  themeColor: '#2c0f16',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <PreviewProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </PreviewProvider>
      </body>
    </html>
  );
}
