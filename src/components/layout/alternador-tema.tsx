"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useMovimentoReduzido } from "@/lib/movimento";

export const CHAVE_TEMA = "leedfly.tema";

/**
 * Script aplicado antes do primeiro paint, para não piscar o tema errado.
 * O padrão é o escuro: só o claro precisa ser marcado no elemento raiz.
 */
export const SCRIPT_TEMA = `(function(){try{if(localStorage.getItem("${CHAVE_TEMA}")==="light"){document.documentElement.dataset.theme="light"}}catch(e){}})()`;

type Tema = "dark" | "light";

/** Duração da revelação circular; casa com a regra de `[data-transicao]` no CSS. */
const DURACAO_REVELACAO = 560;

function inscreverTema(aoMudar: () => void) {
  const observador = new MutationObserver((mutacoes) => {
    for (const m of mutacoes) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        aoMudar();
      }
    }
  });

  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("storage", aoMudar);

  return () => {
    observador.disconnect();
    window.removeEventListener("storage", aoMudar);
  };
}

function obterSnapshotTema(): Tema {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function obterSnapshotServidorTema(): Tema {
  return "dark";
}

export function AlternadorTema({ compacto }: { compacto?: boolean }) {
  const tema = useSyncExternalStore(
    inscreverTema,
    obterSnapshotTema,
    obterSnapshotServidorTema,
  );
  const reduzido = useMovimentoReduzido();

  function aplicar(proximo: Tema) {
    if (proximo === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;

    try {
      window.localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      /* modo privado: o tema vale só para esta sessão */
    }
  }

  /**
   * O tema novo não aparece de uma vez: ele é revelado por um círculo que
   * cresce a partir do próprio botão, como se a luz se espalhasse pela tela.
   *
   * Depende da View Transitions API. Sem ela — ou com movimento reduzido — a
   * troca acontece direto, sem intermediários.
   */
  function alternar(evento: MouseEvent<HTMLButtonElement>) {
    const proximo: Tema = tema === "dark" ? "light" : "dark";
    const raiz = document.documentElement;

    if (reduzido || typeof document.startViewTransition !== "function") {
      aplicar(proximo);
      return;
    }

    const caixa = evento.currentTarget.getBoundingClientRect();
    const x = caixa.left + caixa.width / 2;
    const y = caixa.top + caixa.height / 2;
    // Raio até o canto mais distante: garante que o círculo cubra a viewport.
    const raio = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    raiz.dataset.transicao = "tema";
    const transicao = document.startViewTransition(() => {
      // Sem `flushSync` o React aplicaria a troca depois do snapshot.
      flushSync(() => aplicar(proximo));
    });

    transicao.ready
      .then(() => {
        raiz.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`],
          },
          {
            duration: DURACAO_REVELACAO,
            easing: "cubic-bezier(0.32, 0.72, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        /* transição cancelada (nova navegação): o tema já foi aplicado */
      });

    transicao.finished.finally(() => {
      delete raiz.dataset.transicao;
    });
  }

  const rotulo = tema === "dark" ? "Tema claro" : "Tema escuro";

  return (
    <Button
      variante={compacto ? "fantasma" : "secundaria"}
      tamanho="sm"
      onClick={alternar}
      aria-label={`Mudar para ${rotulo.toLowerCase()}`}
      title={rotulo}
    >
      <DiscoTema claro={tema === "light"} />
      {!compacto && rotulo}
    </Button>
  );
}

/**
 * Disco meio preenchido que gira 180° a cada troca — o sol-e-lua de sempre
 * é a escolha óbvia; aqui a própria rotação já conta a história.
 */
function DiscoTema({ claro }: { claro: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="size-3.5 transition-transform duration-500 ease-fluida"
      style={{ transform: `rotate(${claro ? 180 : 0}deg)` }}
    >
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
    </svg>
  );
}
