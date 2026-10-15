"use client";

import { useEffect, useRef, useState } from "react";
import { saidaExponencial, useMovimentoReduzido } from "@/lib/movimento";

/**
 * Número que sobe até o valor final em vez de aparecer pronto.
 *
 * Roda em requestAnimationFrame e é interrompido se o valor mudar no meio —
 * a próxima animação parte de onde a anterior estava, não do zero.
 *
 * Com `prefers-reduced-motion` o valor final aparece direto.
 */
export function Contador({
  valor,
  duracao = 900,
  formatar = (n) => String(n),
  decimais = 0,
}: {
  valor: number;
  duracao?: number;
  formatar?: (n: number) => string;
  /** Casas decimais durante a contagem — score médio usa 1, contagens usam 0. */
  decimais?: number;
}) {
  const reduzido = useMovimentoReduzido();
  const [atual, setAtual] = useState(valor);
  const [correndo, setCorrendo] = useState(false);
  const partidaRef = useRef(valor);

  useEffect(() => {
    if (reduzido) {
      partidaRef.current = valor;
      return;
    }

    const partida = partidaRef.current;
    const distancia = valor - partida;
    if (distancia === 0) return;

    let quadro = 0;
    let inicio: number | null = null;
    setCorrendo(true);

    const passo = (agora: number) => {
      inicio ??= agora;
      const progresso = Math.min(1, (agora - inicio) / duracao);
      const corrente = partida + distancia * saidaExponencial(progresso);

      partidaRef.current = corrente;
      setAtual(corrente);

      if (progresso < 1) {
        quadro = requestAnimationFrame(passo);
      } else {
        partidaRef.current = valor;
        setCorrendo(false);
      }
    };

    quadro = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(quadro);
      setCorrendo(false);
    };
  }, [valor, duracao, reduzido]);

  const fator = 10 ** decimais;
  // Quando prefers-reduced-motion está ativo, exibe o valor final diretamente sem animação rAF
  const exibido = reduzido ? valor : atual;

  /*
   * Largura fixa de dígito só enquanto conta.
   *
   * Sem ela os dígitos mudam de largura a cada quadro e o número treme. Com
   * ela para sempre, um valor grande fica frouxo — `tabular-nums` dá a todo
   * dígito a largura do `0`, o que é certo em colunas e errado num número de
   * destaque. Então: trava durante a animação, solta no fim.
   */
  return (
    <span className={correndo ? "tabular-nums" : undefined}>
      {formatar(Math.round(exibido * fator) / fator)}
    </span>
  );
}
