import type { Metadata } from "next";
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
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}