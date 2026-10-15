import type { Metadata } from "next";
import { SCRIPT_TEMA } from "@/components/layout/alternador-tema";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leedfly — captação de leads",
  description: "Plataforma de captação e validação de leads por IA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      /*
       * O `scroll-behavior: smooth` do CSS vale para âncoras, não para troca de
       * rota: sem este atributo o Next avisa que a rolagem suave atrapalha o
       * reposicionamento entre páginas. Declará-lo aqui deixa o framework
       * cuidar da rolagem de navegação e mantém a suavidade nas âncoras.
       */
      data-scroll-behavior="smooth"
      /*
       * O `SCRIPT_TEMA` escreve `data-theme` no <html> antes da hidratação, de
       * propósito (é o que evita o flash). Sem esta flag o React acusa a
       * diferença em relação ao HTML do servidor a cada visita no tema claro.
       * Vale só para os atributos deste elemento, não para os filhos.
       */
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        {/*
         * Tipografia resiliente da plataforma:
         * Desacoplada do build do Next.js/Turbopack para permitir compilação
         * 100% offline e em ambientes restritos (CI/sandbox).
         * O carregamento via preconnect e stylesheet no navegador é não-bloqueante
         * e degrada perfeitamente para a pilha de fontes do sistema se offline.
         */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
        />
        {/* Roda antes do paint: evita o flash de tema em quem escolheu o claro. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        {/*
         * As revelações de scroll começam invisíveis e são liberadas por
         * JavaScript. Sem JS, este estilo devolve tudo ao estado final — a
         * página perde o movimento, nunca o conteúdo.
         */}
        <noscript>
          <style>{`.revelar,.cinetico-palavra{opacity:1!important;transform:none!important;filter:none!important}.titulo-split{visibility:visible!important}.intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
