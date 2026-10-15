import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Superfície base — material de vidro.
 *
 * Não é uma cor chapada: a tinta é translúcida e o `backdrop-filter` recolhe o
 * ambiente por trás, então os halos do fundo atravessam o card como luz difusa.
 * A quina especular (`.vidro::after`) faz o papel do contorno, por isso não há
 * borda grossa aqui.
 *
 * O raio é generoso (`rounded-2xl`) e os elementos internos usam raios menores,
 * para as curvas ficarem concêntricas em vez de brigarem entre si.
 *
 * `interativo` liga a física de hover: sobe 2px, ganha sombra tingida de roxo
 * e volta ao ser pressionado. Use só onde o card inteiro é clicável.
 */
export function Card({
  children,
  className,
  interativo,
  style,
}: {
  children: ReactNode;
  className?: string;
  interativo?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section
      style={style}
      className={cx(
        "vidro card-shadow relative rounded-2xl",
        interativo && "elevar hover:border-brand-400/40",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <header className="divisa relative z-2 flex items-start justify-between gap-4 border-b px-6 py-5 sm:px-7 sm:py-5">
      <div className="min-w-0">
        <h2 className="texto-equilibrado text-sm font-semibold tracking-tight text-ink">{titulo}</h2>
        {descricao && (
          <p className="texto-bonito mt-1 text-xs text-ink-muted leading-relaxed">{descricao}</p>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </header>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("p-6 sm:p-7", className)}>{children}</div>;
}

/**
 * Cabeçalho de página. Entra em cascata (título e ação em tempos ligeiramente
 * diferentes) para a tela não montar tudo de uma vez.
 */
export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <header className="cascata flex flex-wrap items-end justify-between gap-4">
      <div style={{ "--i": 0 } as CSSProperties}>
        <h1 className="texto-equilibrado text-2xl font-bold tracking-tight text-ink">
          {titulo}
        </h1>
        {descricao && (
          <p className="texto-bonito mt-1.5 max-w-prose text-sm text-ink-muted leading-relaxed">
            {descricao}
          </p>
        )}
      </div>
      {acao && <div style={{ "--i": 1 } as CSSProperties}>{acao}</div>}
    </header>
  );
}
