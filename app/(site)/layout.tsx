import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreviewProvider from '@/components/PreviewProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getRequestLocale } from '@/lib/plans';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  return (
    <LocaleProvider initialLocale={locale}>
      <PreviewProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </PreviewProvider>
    </LocaleProvider>
  );
}
