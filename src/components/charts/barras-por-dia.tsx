"use client";

import { useState } from "react";
import { cx, fmt, passo } from "@/lib/format";

/**
 * Leads capturados por dia. Série única — sem legenda, o título já a nomeia.
 * SVG não; são elementos, sem dependência de biblioteca.
 *
 * As marcas seguem as especificações da casa: barra com no máximo 24px (o
 * resto da banda é ar — barra que preenche a faixa inteira lê como bloco,
 * não como dado), topo arredondado em 4px com a base reta na linha zero, e
 * 2px de respiro entre vizinhas feito pelo fundo, nunca por contorno.
 *
 * O preenchimento é deliberadamente contido: saturação cheia fica reservada
 * para o realce sob o cursor. Um paredão de roxo saturado é o que faz um
 * gráfico parecer barulhento.
 */
export function BarrasPorDia({
  dados,
  altura = 180,
  preencher,
}: {
  dados: { data: string; quantidade: number }[];
  altura?: number;
  /**
   * Faz o plot ocupar a altura disponível em vez de uma altura fixa.
   *
   * No bento o bloco do gráfico é mais alto que a soma dos indicadores ao
   * lado; com altura fixa sobrava um vazio no topo do card.
   */
  preencher?: boolean;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);

  const maximo = Math.max(1, ...dados.map((d) => d.quantidade));
  const total = dados.reduce((soma, d) => soma + d.quantidade, 0);
  const media = dados.length ? total / dados.length : 0;
  const mostrarMedia = media > 0 && dados.length > 2;

  return (
    <div className={cx("relative flex flex-col", preencher && "h-full")}>
      <div
        className={cx("divisa relative flex items-end gap-[2px] border-b", preencher && "flex-1")}
        style={preencher ? { minHeight: altura } : { height: altura }}
      >
        {/*
          Régua da média. Hairline sólida e recessiva: tracejado carrega
          significado de projeção e vira ruído quando é só referência.
        */}
        {mostrarMedia && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-1 border-t border-ink-muted/25 transition-[bottom] duration-500 ease-fluida"
            style={{ bottom: `${(media / maximo) * 100}%` }}
          >
            <span className="superficie-solida absolute -top-2.5 right-0 rounded-full px-1.5 py-0.5 text-[10px] whitespace-nowrap text-ink-muted tabular-nums">
              média {media.toFixed(media >= 10 ? 0 : 1)}/dia
            </span>
          </div>
        )}

        {dados.map((ponto, i) => {
          const proporcao = (ponto.quantidade / maximo) * 100;
          const apagado = ativo !== null && ativo !== i;
          const ehPico = ponto.quantidade === maximo && maximo > 0;

          return (
            <button
              key={ponto.data}
              type="button"
              className="group relative flex h-full flex-1 cursor-default items-end justify-center"
              onMouseEnter={() => setAtivo(i)}
              onMouseLeave={() => setAtivo(null)}
              onFocus={() => setAtivo(i)}
              onBlur={() => setAtivo(null)}
              aria-label={`${fmt.dataCurta(ponto.data)}: ${ponto.quantidade} leads`}
            >
              <span
                className={cx(
                  "crescendo w-full rounded-t-[4px] bg-brand-500/70",
                  /*
                   * A espessura é limitada para a barra não preencher a banda
                   * e virar bloco. O teto sobe com a altura do plot: 24px num
                   * gráfico de 340px lê como palito, e a proporção da marca
                   * importa tanto quanto o número absoluto.
                   */
                  preencher ? "max-w-8" : "max-w-6",
                  "transition-[opacity,background-color,height] duration-500 ease-fluida",
                  apagado ? "opacity-35" : "opacity-100",
                  "group-hover:bg-brand-500 group-focus-visible:bg-brand-500",
                  ehPico && "bg-brand-500/85",
                )}
                style={{
                  ...passo(i),
                  height: `${Math.max(ponto.quantidade > 0 ? 2 : 0, proporcao)}%`,
                }}
              />

              {/*
                O balão fica sempre montado e só muda de opacidade — desmontar
                corta a saída pela metade. O deslocamento de centralização vive
                no invólucro porque a animação do filho reescreve o `transform`.
              */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2">
                <span
                  className={cx(
                    "superficie-solida block origin-bottom rounded-xl px-2.5 py-1.5 text-xs whitespace-nowrap",
                    "transition-[opacity,transform] duration-200 ease-mola",
                    ativo === i ? "scale-100 opacity-100" : "scale-90 opacity-0",
                  )}
                >
                  <span className="block font-medium text-ink tabular-nums">
                    {ponto.quantidade} leads
                  </span>
                  <span className="block text-ink-muted">{fmt.dataCurta(ponto.data)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Rótulos seletivos: primeiro, meio e último — nunca um por barra. */}
      <div className="mt-2 flex justify-between text-xs text-ink-muted">
        <span>{dados.length > 0 && fmt.dataCurta(dados[0].data)}</span>
        <span>{dados.length > 2 && fmt.dataCurta(dados[Math.floor(dados.length / 2)].data)}</span>
        <span>{dados.length > 1 && fmt.dataCurta(dados[dados.length - 1].data)}</span>
      </div>
    </div>
  );
}
