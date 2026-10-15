"use client";

import Image from "next/image";
import { useRef } from "react";
import { concluirIntro, gsap, useGSAP } from "./gsap";
import { lenisAtual } from "./rolagem-suave";

const CHAVE = "leedfly.intro-vista";

/*
 * Decidido uma vez por carregamento da página. Em dev o StrictMode monta o
 * efeito duas vezes: lendo e gravando o sessionStorage a cada montagem, a
 * segunda já achava a intro "vista" e pulava a abertura.
 */
let introJaVista: boolean | null = null;
function lerIntroVista() {
  if (introJaVista !== null) return introJaVista;
  try {
    introJaVista = sessionStorage.getItem(CHAVE) === "1";
    sessionStorage.setItem(CHAVE, "1");
  } catch {
    introJaVista = false;
  }
  return introJaVista;
}

/**
 * Abertura: o logo nasce, um contador vai de 000 a 100 e duas cortinas
 * (superfície e marca, defasadas) sobem revelando o hero.
 *
 * Roda inteira só na primeira visita da sessão — rever a mesma abertura a
 * cada recarga cansa. Nas outras, a cortina só esmaece. Com movimento
 * reduzido, some na hora.
 *
 * Renderiza no servidor de propósito: é o que impede o hero de piscar
 * antes da cortina existir.
 */
export function Intro() {
  const raiz = useRef<HTMLDivElement>(null);
  const numero = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const no = raiz.current!;
      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const vista = lerIntroVista();

      const terminar = () => {
        no.style.display = "none";
        document.documentElement.style.removeProperty("overflow");
        lenisAtual()?.start();
        concluirIntro();
      };

      if (reduzido) {
        terminar();
        return;
      }

      document.documentElement.style.overflow = "hidden";
      lenisAtual()?.stop();
      window.scrollTo(0, 0);

      if (vista) {
        gsap.to(no, { autoAlpha: 0, duration: 0.45, ease: "power2.out", onComplete: terminar });
        return;
      }

      const contador = { v: 0 };
      const tl = gsap.timeline({ onComplete: terminar });
      tl.from("[data-intro-logo]", { scale: 0.4, rotate: -25, autoAlpha: 0, filter: "blur(12px)", duration: 1, ease: "back.out(1.6)" })
        .to(
          contador,
          {
            v: 100,
            duration: 1.5,
            ease: "power3.inOut",
            onUpdate: () => {
              if (numero.current) numero.current.textContent = String(Math.round(contador.v)).padStart(3, "0");
            },
          },
          0.15,
        )
        .from("[data-intro-barra]", { scaleX: 0, duration: 1.5, ease: "power3.inOut" }, 0.15)
        .to("[data-intro-conteudo]", { yPercent: -60, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, "+=0.1")
        .to("[data-intro-cortina='base']", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "<0.2")
        .to("[data-intro-cortina='marca']", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "<0.14")
        // O hero começa a entrar enquanto a última cortina ainda sobe.
        .call(concluirIntro, [], "<0.45");
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} aria-hidden className="intro fixed inset-0" style={{ zIndex: "calc(var(--z-textura) + 1)" }}>
      {/* A de marca fica atrás: aparece por um instante entre a base e o hero. */}
      <div data-intro-cortina="marca" className="absolute inset-0 bg-linear-to-br from-brand-600 to-brand-400" />
      <div data-intro-cortina="base" className="absolute inset-0 bg-surface-muted" />

      <div data-intro-conteudo className="absolute inset-0 flex flex-col items-center justify-center gap-8">
        <div data-intro-logo className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-brand-500/40 blur-3xl" />
          <Image src="/logo-icon-mark.png" alt="" width={228} height={307} priority className="relative h-20 w-auto" />
        </div>
        <div className="flex w-72 flex-col items-center gap-3">
          <span ref={numero} className="font-mono text-5xl font-bold tracking-tight text-ink tabular-nums">
            000
          </span>
          <span className="h-px w-full overflow-hidden bg-line">
            <span data-intro-barra className="block h-full origin-left bg-brand-500" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.35em] whitespace-nowrap text-ink-muted uppercase">
            Encontre · Organize · Converta
          </span>
        </div>
      </div>
    </div>
  );
}
