"use client";

import { BarrasHorizontais } from "./barras-horizontais";

/**
 * Segmentos com mais leads — wrapper fino sobre o ranking de barras.
 *
 * Foi rosca por um tempo, pela lógica de "como o ciclo se reparte entre
 * eles" — mas com só 3-5 segmentos, e frequentemente quase empatados (tipo
 * 35%/33%/32%), uma rosca não comunica muito mais do que a própria legenda
 * escrita ao lado dela já dizia; fatias quase do mesmo tamanho são as mais
 * difíceis de comparar visualmente num círculo. Um ranking de barras (voltou
 * a ser o que era antes da rosca) responde "qual é o maior" de forma direta
 * e ocupa bem menos altura vertical no card.
 */
export function RankingSegmentos({
  dados,
}: {
  dados: { segmento: string; quantidade: number }[];
}) {
  const total = dados.reduce((soma, d) => soma + d.quantidade, 0);

  return (
    <BarrasHorizontais
      dados={dados.map((d) => ({
        rotulo: d.segmento,
        valor: d.quantidade,
        nota: total ? `${Math.round((d.quantidade / total) * 100)}%` : undefined,
      }))}
      preencher
    />
  );
}
