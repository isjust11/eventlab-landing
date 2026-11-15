import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreviewProvider from '@/components/PreviewProvider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PreviewProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </PreviewProvider>
  );
}
