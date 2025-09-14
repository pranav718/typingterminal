import type { Metadata } from "next";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
      <body suppressHydrationWarning>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}