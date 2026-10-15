import type { ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Tile de ícone — o quadrado tingido que ancora um indicador.
 *
 * Serve a duas coisas ao mesmo tempo. A primeira é reconhecimento: numa faixa
 * de quatro números, o glifo é lido antes do rótulo e diz de que assunto o
 * card trata sem exigir a leitura do texto em caixa alta. A segunda é peso
 * visual: um card com rótulo pequeno e número grande fica com o canto superior
 * direito vazio, e a composição pende para a esquerda; o tile equilibra.
 *
 * A tinta vem do mesmo tom do indicador, não de uma cor decorativa. Assim o
 * verde do "ativos" e o âmbar do "score abaixo da meta" aparecem duas vezes —
 * no número e no tile — em vez de a cor ser um enfeite paralelo ao dado.
 *
 * O ícone nunca é a única pista: todo tile acompanha um rótulo em texto.
 */
export type TomTile = "marca" | "ok" | "atencao" | "perigo" | "info" | "neutro";

/*
 * Tinta a 14% e anel a 25%: o suficiente para o quadrado existir sobre o
 * vidro sem virar um botão. Acima disso o tile compete com o número, que é o
 * que a pessoa veio ler.
 */
const TONS: Record<TomTile, string> = {
  marca: "bg-brand-500/14 text-brand-700 ring-brand-400/25",
  ok: "bg-ok/14 text-ok ring-ok/25",
  atencao: "bg-warn/14 text-warn ring-warn/25",
  perigo: "bg-danger/14 text-danger ring-danger/25",
  info: "bg-info/14 text-info ring-info/25",
  neutro: "bg-ink/6 text-ink-muted ring-ink/12",
};

export function TileIcone({
  children,
  tom = "neutro",
  tamanho = "md",
  className,
}: {
  children: ReactNode;
  tom?: TomTile;
  /** `sm` para linhas de lista e legendas; `md` para cards de indicador. */
  tamanho?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        "grid shrink-0 place-items-center ring-1 ring-inset",
        /* Raio menor que o do card (2xl) para as curvas ficarem concêntricas
           em vez de brigarem entre si. */
        tamanho === "sm" ? "size-8 rounded-lg [&>svg]:size-4" : "size-10 rounded-xl [&>svg]:size-5",
        /* Sobe junto com o card quando ele é clicável — o `.group` mora no
           Holofote que embrulha o Kpi. */
        "transition-transform duration-300 ease-fluida group-hover:-translate-y-0.5",
        TONS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
