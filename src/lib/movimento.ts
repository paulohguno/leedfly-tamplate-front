"use client";

import { useSyncExternalStore } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function inscrever(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA);
  consulta.addEventListener("change", aoMudar);
  return () => consulta.removeEventListener("change", aoMudar);
}

/**
 * `prefers-reduced-motion` como estado React.
 *
 * O CSS já zera durações globalmente (ver globals.css); este hook existe para
 * o movimento que vive em JavaScript — contadores, revelação circular do tema
 * e qualquer coisa que precise pular direto para o estado final em vez de
 * interpolar.
 *
 * Usa `useSyncExternalStore` porque é exatamente o caso de uso dele: uma
 * fonte de verdade fora do React. Ler no `useEffect` com `setState` causaria
 * um render em cascata a cada montagem. No servidor o valor é `false`, para
 * casar com o HTML entregue.
 */
export function useMovimentoReduzido() {
  return useSyncExternalStore(
    inscrever,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}

/** Desaceleração exponencial: rápida no começo, longa no fim. */
export function saidaExponencial(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
