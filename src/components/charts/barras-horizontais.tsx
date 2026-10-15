"use client";

import { cx, fmt, passo } from "@/lib/format";

export interface ItemBarra {
  rotulo: string;
  valor: number;
  /** Texto opcional à direita do valor (ex.: "32%"). */
  nota?: string;
}

/**
 * Ranking por magnitude: série única, valor direto na ponta, sem legenda.
 *
 * As barras se estendem da esquerda em sequência, do maior para o menor —
 * a ordem da animação reforça a ordem do ranking.
 */
export function BarrasHorizontais({
  dados,
  sufixo,
  preencher,
}: {
  dados: ItemBarra[];
  sufixo?: string;
  /**
   * Distribui as linhas na altura disponível em vez de empilhá-las no topo.
   *
   * Num monitor largo o card vizinho (uma tabela) define a altura da faixa, e
   * cinco barras agarradas ao topo deixavam um palmo de vazio no rodapé.
   *
   * Só a partir de `lg`, que é onde existe um vizinho para esticar o card: em
   * coluna única a altura é a do próprio conteúdo e não há o que distribuir.
   */
  preencher?: boolean;
}) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <ul
      className={cx(
        "space-y-3",
        preencher && "lg:flex lg:h-full lg:flex-col lg:justify-between lg:gap-3 lg:space-y-0",
      )}
    >
      {dados.map((item, i) => (
        <li key={item.rotulo} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            {/*
              `min-w-0` é o que faz o `truncate` valer: sem ele o item de flex
              não encolhe abaixo do próprio texto (que é `nowrap`), o mínimo
              intrínseco sobe pela árvore e, num grid de coluna `auto` — o caso
              do celular —, o card estica além da tela em vez de cortar o rótulo.
            */}
            <span className="min-w-0 truncate text-sm text-ink transition-colors duration-200 ease-fluida">
              {item.rotulo}
            </span>
            <span className="shrink-0 text-sm font-medium text-ink-muted tabular-nums">
              {fmt.numero(item.valor)}
              {sufixo}
              {item.nota && <span className="ml-2 text-xs text-ink-muted">{item.nota}</span>}
            </span>
          </div>
          {/*
            Uma cor para todas as barras. Escurecer conforme o valor pareceria
            informativo, mas só repetiria o comprimento em outro canal — e
            gastaria a cor, que aqui não precisa dizer nada.
            Ponta arredondada em 4px, base reta na linha zero.
          */}
          <div className="h-2 overflow-hidden rounded-[4px] bg-brand-500/12">
            <div
              className="crescendo-h h-full rounded-r-[4px] bg-brand-500/75 transition-[background-color,width] duration-500 ease-fluida group-hover:bg-brand-500"
              style={{ ...passo(i), width: `${(item.valor / maximo) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
