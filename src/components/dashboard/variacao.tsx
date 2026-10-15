import type { ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Pílula de indicador — o selo compacto que acompanha um número.
 *
 * A forma importa: um percentual escrito solto ao lado do valor é lido como
 * parte do número ("180 27%"), enquanto o mesmo texto dentro de uma cápsula
 * tingida é lido como um comentário sobre ele. É a diferença entre dois dados
 * concorrendo e um dado com uma nota.
 *
 * A cor é a do significado, nunca a do sinal aritmético — ver `Variacao`.
 */
export type TomPilula = "ok" | "perigo" | "atencao" | "marca" | "info" | "neutro";

const TONS: Record<TomPilula, string> = {
  ok: "bg-ok/14 text-ok ring-ok/25",
  perigo: "bg-danger/14 text-danger ring-danger/25",
  atencao: "bg-warn/14 text-warn ring-warn/25",
  marca: "bg-brand-500/16 text-brand-700 ring-brand-400/30",
  info: "bg-info/14 text-info ring-info/25",
  neutro: "bg-ink/7 text-ink-muted ring-ink/12",
};

export function Pilula({
  children,
  tom = "neutro",
  icone,
  title,
  className,
}: {
  children: ReactNode;
  tom?: TomPilula;
  /** Glifo curto à esquerda do valor (seta, ponto). Decorativo. */
  icone?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        "text-xs font-semibold ring-1 ring-inset tabular-nums",
        TONS[tom],
        className,
      )}
    >
      {icone && <span aria-hidden>{icone}</span>}
      {children}
    </span>
  );
}

/**
 * Variação percentual contra o período anterior.
 *
 * Um indicador sem comparação não é um indicador — é um número. Quem olha
 * precisa saber se 180 leads é melhor ou pior que a semana passada, e é isso
 * que este selo responde.
 *
 * `inverso` existe porque nem toda alta é boa: em descartes ou falhas, subir é
 * o problema. A cor segue o significado, não o sinal.
 *
 * A seta acompanha a cor de propósito: cor sozinha não é canal suficiente, e
 * quem não distingue verde de vermelho lê a direção no glifo.
 */
export function Variacao({
  atual,
  anterior,
  rotulo = "vs. período anterior",
  inverso,
  baseComparacao,
}: {
  atual: number;
  anterior: number;
  rotulo?: string;
  inverso?: boolean;
  /**
   * O que exatamente está sendo comparado, com os dois números reais —
   * ex.: "18 nos últimos 7 dias, contra 42 nos 7 dias anteriores". Sem
   * isto, um "-74%" sozinho é assustador sem dizer a régua: pode ser uma
   * queda real ou só o efeito normal de picos de captura em lote (um dia
   * de 20 contra dias de 0 já derruba a semana inteira em 70%+ mesmo sem
   * nada de errado acontecendo). O `title` do selo é o lugar natural pra
   * essa explicação — visível ao passar o mouse, sem competir por espaço
   * com o número.
   */
  baseComparacao?: string;
}) {
  // Sem base de comparação, uma porcentagem seria inventada.
  if (anterior === 0) {
    return (
      <span className="text-xs text-ink-muted">
        {atual > 0 ? "primeiro período com dados" : "sem dados anteriores"}
      </span>
    );
  }

  const variacao = ((atual - anterior) / anterior) * 100;
  const arredondada = Math.round(variacao);
  const estavel = Math.abs(variacao) < 1;
  const bom = inverso ? variacao < 0 : variacao > 0;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
      <Pilula
        tom={estavel ? "neutro" : bom ? "ok" : "perigo"}
        icone={estavel ? "→" : variacao > 0 ? "↑" : "↓"}
        title={baseComparacao ?? `${fmtSinal(arredondada)}% ${rotulo}`}
      >
        {estavel ? "estável" : `${Math.abs(arredondada)}%`}
      </Pilula>
      <span className="text-ink-muted">{rotulo}</span>
    </span>
  );
}

function fmtSinal(valor: number) {
  return valor > 0 ? `+${valor}` : String(valor);
}
