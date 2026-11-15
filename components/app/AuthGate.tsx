'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui';

export default function AuthGate({ children }: { children: ReactNode }) {
  const user = useRequireAuth();
  if (!user) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-cream text-wine-600">
        <Spinner size={28} />
      </div>
    );
  }
  return <>{children}</>;
}
