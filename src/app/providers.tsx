'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './components/ThemeProvider';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </ConvexProvider>
    </SessionProvider>
  );
}