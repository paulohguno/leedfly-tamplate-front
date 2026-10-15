"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Liga quando o elemento entra na viewport. Diferente do <Revelar>, devolve o
 * booleano — as cenas da landing precisam dele para *começar* uma sequência
 * (digitar, contar, traçar arcos), não só para trocar uma classe.
 *
 * `umaVez` desliga o observador depois do primeiro disparo; sem ele a cena
 * reinicia toda vez que volta à tela, que é o certo para loops de produto.
 */
export function useNaTela<T extends Element>(
  ref: RefObject<T | null>,
  { limiar = 0.25, umaVez = true }: { limiar?: number; umaVez?: boolean } = {},
) {
  const [naTela, setNaTela] = useState(false);

  useEffect(() => {
    const alvo = ref.current;
    if (!alvo) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setNaTela(true));
      return () => cancelAnimationFrame(id);
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setNaTela(true);
          if (umaVez) observador.disconnect();
        } else if (!umaVez) {
          setNaTela(false);
        }
      },
      { threshold: limiar },
    );

    observador.observe(alvo);
    return () => observador.disconnect();
  }, [ref, limiar, umaVez]);

  return naTela;
}

/**
 * Quanto de uma seção alta já passou pelo topo da viewport, de 0 a 1.
 *
 * É a régua das cenas "presas" (`sticky`): a seção tem várias telas de
 * altura, o palco fica grudado e o progresso decide o que aparece. Lê o
 * layout uma vez por quadro, nunca por evento de scroll.
 */
export function progressoDaSecao(secao: HTMLElement) {
  const caixa = secao.getBoundingClientRect();
  const percurso = caixa.height - window.innerHeight;
  if (percurso <= 0) return caixa.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -caixa.top / percurso));
}

/** Escuta o scroll com um quadro por vez. Devolve o desligamento. */
export function aoRolarPorQuadro(medir: () => void) {
  let quadro = 0;
  function aoRolar() {
    if (quadro) return;
    quadro = requestAnimationFrame(() => {
      quadro = 0;
      medir();
    });
  }
  medir();
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);
  return () => {
    window.removeEventListener("scroll", aoRolar);
    window.removeEventListener("resize", aoRolar);
    if (quadro) cancelAnimationFrame(quadro);
  };
}

/**
 * Sorteio determinístico (mulberry32). Estrelas e pontos do radar precisam
 * sair iguais no servidor e no cliente — `Math.random()` no render quebraria
 * a hidratação e a pureza do componente.
 */
export function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
