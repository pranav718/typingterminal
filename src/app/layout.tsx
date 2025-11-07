import type { Metadata } from "next";
import { Providers } from './providers';
import "./globals.css";

export const metadata: Metadata = {
  title: "TerminalType",
  description: "Master typing with classic literature in a terminal-style interface",
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
        </Providers>
      </body>
    </html>
  );
}