"use client";

import { useId, type CSSProperties } from "react";
import { cx } from "@/lib/format";

/**
 * Sparkline: a série inteira dentro do card do indicador.
 *
 * Um número sozinho não diz se 180 leads é muito ou pouco, nem se está subindo.
 * A linha responde isso no mesmo golpe de vista, sem ocupar um card próprio.
 *
 * Sem eixos, sem grade e sem rótulos de propósito — é forma, não leitura
 * precisa; para ler valor exato existe o gráfico grande logo abaixo.
 */
export function MiniGrafico({
  serie,
  className,
  tom = "marca",
  alto,
}: {
  serie: number[];
  className?: string;
  tom?: "marca" | "ok" | "atencao";
  /** Versão do card herói, com mais altura para a forma respirar. */
  alto?: boolean;
}) {
  // Um id por instância: com um id fixo, dois sparklines de tons diferentes na
  // mesma página dividem o gradiente do primeiro que montar.
  const idGradiente = useId();

  if (serie.length < 2) return null;

  const largura = 100;
  const altura = alto ? 44 : 28;
  const maximo = Math.max(...serie);
  const minimo = Math.min(...serie);
  const amplitude = maximo - minimo || 1;

  const pontos = serie.map((valor, i) => {
    const x = (i / (serie.length - 1)) * largura;
    // 2px de folga em cima e embaixo: sem isso o traço encosta na borda e
    // parece cortado nos extremos da série.
    const y = altura - 2 - ((valor - minimo) / amplitude) * (altura - 4);
    return [x, y] as const;
  });

  const linha = pontos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area = `${linha} L${largura} ${altura} L0 ${altura} Z`;

  const cor =
    tom === "ok"
      ? "var(--color-ok)"
      : tom === "atencao"
        ? "var(--color-warn)"
        : "var(--color-brand-400)";

  const [ultimoX, ultimoY] = pontos[pontos.length - 1];

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cx("w-full overflow-visible", alto ? "h-14" : "h-7", className)}
      style={{ "--cor-serie": cor } as CSSProperties}
    >
      <defs>
        <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill={`url(#${idGradiente})`} />
      <path
        d={linha}
        fill="none"
        stroke={cor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Ponto no valor mais recente: mostra onde a série termina. */}
      <circle cx={ultimoX} cy={ultimoY} r="2" fill={cor} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
