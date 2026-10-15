import type { Metadata } from "next";
import type { ReactNode } from "react";
import { THEME_SCRIPT } from "@/components/theme-toggler";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leedfly — captação de leads",
  description: "Plataforma de captação e validação de leads por IA.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
