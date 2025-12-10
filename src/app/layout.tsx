import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Providers } from './providers';
import "./globals.css";
export const metadata: Metadata = {
  title: "typingterminal",
  description: "a retro terminal-themed typing and competing practice platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="font-jetbrains">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}