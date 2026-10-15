"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/*
 * Ponto único de registro do GSAP. Toda peça cinematográfica importa daqui,
 * para os plugins serem registrados uma vez só e nunca no servidor.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Curvas da casa, com nome: as mesmas intenções do `--ease-fluida`/`--ease-mola`.
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

/** Consulta de movimento padrão: tudo que anima mora dentro dela. */
export const COM_MOVIMENTO = "(prefers-reduced-motion: no-preference)";
export const SEM_MOVIMENTO = "(prefers-reduced-motion: reduce)";

/* ---- Sinal de "intro concluída" ----
 * O hero só começa a falar depois que a cortina da intro sobe. Um evento de
 * módulo simples: quem chega atrasado (intro já acabou) é chamado na hora. */
let introConcluida = false;
const ouvintes = new Set<() => void>();

export function concluirIntro() {
  if (introConcluida) return;
  introConcluida = true;
  ouvintes.forEach((fn) => fn());
  ouvintes.clear();
}

export function aoConcluirIntro(fn: () => void) {
  if (introConcluida) {
    fn();
    return () => {};
  }
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
