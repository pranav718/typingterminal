'use client'

import { ConvexProvider, ConvexReactClient} from 'convex/react';
import { ThemeProvider } from './components/ThemeProvider';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: {children: React.ReactNode}){
    return(
        <ConvexProvider client = {convex}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </ConvexProvider>
    )
}