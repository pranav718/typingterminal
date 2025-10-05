import type { Metadata } from "next";
import {Providers} from './providers';
import "./globals.css";

export const metadata: Metadata = {
  title: "TerminalType",
  description: "Practice typing with your favorite books in a terminal-style interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-mono">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}