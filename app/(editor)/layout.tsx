import AuthGate from '@/components/app/AuthGate';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
