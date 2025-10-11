'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ThemeProvider } from './components/ThemeProvider';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}