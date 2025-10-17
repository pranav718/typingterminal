'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeProvider( {children}: {children: React.ReactNode}) {
    const [mounted, setMounted] = useState(false);

    useEffect( ()=> {
        setMounted(true);
    },[]);

    if(!mounted) {
        return <>{children}</>
    }

    return (
        <NextThemesProvider attribute="class" 
        defaultTheme='matrix' 
        themes={['matrix', 'paper', 'ocean', 'sunset', 'sakura']}
        enableSystem = {false}
        storageKey='terminaltype-theme'
        >

            {children}
        </NextThemesProvider>
    )
}