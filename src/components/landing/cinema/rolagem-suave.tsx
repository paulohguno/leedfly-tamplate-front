"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./gsap";

let instancia: Lenis | null = null;

/** A instância ativa (ou nula com movimento reduzido / fora da landing). */
export function lenisAtual() {
  return instancia;
}

/**
 * Rolagem com inércia (Lenis) dirigida pelo relógio do GSAP.
 *
 * Um relógio só para os dois é o que impede o ScrollTrigger de ler uma
 * posição e o Lenis de pintar outra no mesmo quadro — o tremido clássico
 * das páginas que juntam as duas bibliotecas sem sincronizar.
 *
 * Com `prefers-reduced-motion` não monta nada: a rolagem nativa é a certa.
 */
export function RolagemSuave() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      anchors: { offset: -24 },
    });
    instancia = lenis;
    // Só em dev: os testes visuais precisam rolar pelo Lenis, não por fora dele.
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);
    const tique = (tempo: number) => lenis.raf(tempo * 1000);
    gsap.ticker.add(tique);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tique);
      lenis.destroy();
      instancia = null;
    };
  }, []);

  return null;
}
