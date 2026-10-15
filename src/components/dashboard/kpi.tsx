"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { TileIcone, type TomTile } from "@/components/ui/tile";
import { Contador } from "@/components/motion/contador";
import { Holofote } from "@/components/motion/holofote";
import { cx, fmt } from "@/lib/format";

/**
 * Indicador da faixa do topo — o "stat tile".
 *
 * Contrato: ícone · rótulo · valor · pílula · rodapé. As duas últimas são o que
 * separa um indicador de um número solto: 180 não diz nada sem "27% a menos que
 * a semana passada" nem sem o formato do caminho até ali.
 *
 * A anatomia é a de sempre num painel denso — rótulo e número à esquerda, tile
 * de ícone no canto oposto —, e o motivo é de leitura: o olho entra pelo canto
 * superior esquerdo, então o texto que identifica o card fica lá e o glifo, que
 * é reconhecido perifericamente, pode ficar longe dele.
 *
 * `rodape` recebe sempre um elemento da mesma altura em todos os cards da faixa
 * (sparkline, medidor, barra). Não é decoração: quatro cards com rodapés de
 * alturas diferentes desalinham os números, e a faixa perde a leitura de linha.
 *
 * `heroi` marca o único número que a tela lidera — um degrau maior de corpo.
 * Exatamente um por view; se dois competem, nenhum é o principal.
 *
 * Os valores usam figuras proporcionais, não tabulares: largura fixa de dígito
 * é para colunas que precisam alinhar, e num número grande deixa o texto frouxo.
 */
export function Kpi({
  rotulo,
  valor,
  icone,
  pilula,
  rodape,
  nota,
  tom = "neutro",
  decimais = 0,
  href,
  heroi,
}: {
  rotulo: string;
  valor: number | ReactNode;
  /** Glifo do tile. Sem ele o card fica sem âncora visual na faixa. */
  icone?: ReactNode;
  /** Selo compacto abaixo do número — variação, percentual, estado. */
  pilula?: ReactNode;
  /** Faixa visual do rodapé: sparkline, medidor ou barra. Mesma altura em todos. */
  rodape?: ReactNode;
  /** Uma linha de texto explicando o rodapé. */
  nota?: ReactNode;
  tom?: TomTile;
  decimais?: number;
  href?: string;
  heroi?: boolean;
}) {
  const cor =
    tom === "marca"
      ? "text-brand-700"
      : tom === "ok"
        ? "text-ok"
        : tom === "atencao"
          ? "text-warn"
          : tom === "perigo"
            ? "text-danger"
            : tom === "info"
              ? "text-info"
              : "text-ink";

  const conteudo = (
    <Card interativo={Boolean(href)} className="flex h-full flex-col gap-4 p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs font-medium tracking-wider text-ink-muted uppercase">
            <span className="truncate">{rotulo}</span>
            {href && (
              <span
                aria-hidden
                className="shrink-0 text-brand-600 opacity-0 transition-[opacity,transform] duration-300 ease-fluida group-hover:translate-x-0.5 group-hover:opacity-100"
              >
                →
              </span>
            )}
          </p>

          <p
            className={cx(
              "mt-2 font-semibold tracking-tight",
              /* Num monitor grande o card cresce junto com a faixa; sem subir o
                 corpo do número, o que cresce é só o vazio em volta dele. */
              heroi ? "text-4xl leading-none 3xl:text-5xl" : "text-3xl leading-none 3xl:text-4xl",
              cor,
            )}
          >
            {typeof valor === "number" ? (
              <Contador
                valor={valor}
                decimais={decimais}
                formatar={(n) => (decimais > 0 ? n.toFixed(decimais) : fmt.numero(n))}
              />
            ) : (
              valor
            )}
          </p>
        </div>

        {icone && <TileIcone tom={tom}>{icone}</TileIcone>}
      </div>

      {pilula && <div className="-mt-0.5">{pilula}</div>}

      {/* `div`, não `p`: a nota recebe conteúdo arbitrário, e um `div` dentro
          de `p` quebra a hidratação. */}
      {nota && (
        <div className={cx("texto-bonito text-xs text-ink-muted leading-relaxed", !rodape && "mt-auto")}>
          {nota}
        </div>
      )}

      {/*
        O rodapé é sempre o último e leva o `mt-auto`: é ele que encosta na base
        do card. Como os cards da faixa esticam para a mesma altura, isso alinha
        as barras dos quatro numa linha só — e é essa linha que faz a faixa ser
        lida como uma faixa, e não como quatro cards que por acaso estão juntos.
      */}
      {rodape && <div className="mt-auto pt-1">{rodape}</div>}
    </Card>
  );

  const embrulhado = <Holofote className="group h-full">{conteudo}</Holofote>;

  if (!href) return embrulhado;

  return (
    <Link
      href={href}
      transitionTypes={["nav-adiante"]}
      className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      {embrulhado}
    </Link>
  );
}
