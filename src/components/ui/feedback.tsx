import type { CSSProperties, ReactNode } from "react";
import { cx, passo } from "@/lib/format";

export function Progress({
  valor,
  meta,
  tom,
}: {
  valor: number;
  /** Marca opcional no trilho — usada para os 80% da RN09. */
  meta?: number;
  tom?: "marca" | "ok" | "atencao";
}) {
  const cor = tom === "ok" ? "bg-ok" : tom === "atencao" ? "bg-warn" : "bg-brand-500";
  // O trilho é um passo claro da mesma cor do preenchimento, não um cinza
  // neutro: assim o estado (bom, atenção, crítico) se lê na barra inteira.
  const trilho = tom === "ok" ? "bg-ok/15" : tom === "atencao" ? "bg-warn/15" : "bg-brand-500/15";
  const largura = Math.min(100, Math.max(0, valor));

  return (
    <div className={cx("relative h-2 w-full overflow-hidden rounded-[4px]", trilho)}>
      {/*
       * Dois movimentos combinados: `preencher` estica a barra da esquerda na
       * primeira montagem (via transform, sem custo de layout) e a transição
       * de largura cuida das mudanças de valor depois disso.
       */}
      <div
        className={cx(
          "preencher h-full rounded-r-[4px] transition-[width] duration-700 ease-fluida",
          cor,
        )}
        style={{ width: `${largura}%` }}
      />
      {meta !== undefined && (
        <div
          className="absolute inset-y-0 w-px bg-ink/45"
          style={{ left: `${meta}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}

type TomAlerta = "info" | "ok" | "atencao" | "perigo";

const alertaTons: Record<TomAlerta, string> = {
  info: "border-brand-200 bg-brand-50 text-brand-900",
  ok: "border-ok/25 bg-ok-soft text-ink",
  atencao: "border-warn/30 bg-warn-soft text-ink",
  perigo: "border-danger/25 bg-danger-soft text-ink",
};

/** Alertas entram com um leve salto — quem aparece do nada precisa ser notado. */
export function Alerta({
  tom = "info",
  titulo,
  children,
  acao,
}: {
  tom?: TomAlerta;
  titulo?: ReactNode;
  children?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div
      role={tom === "perigo" ? "alert" : undefined}
      className={cx(
        "animate-surgir flex items-start justify-between gap-4 rounded-xl border p-4 sm:p-5",
        alertaTons[tom],
      )}
    >
      <div className="min-w-0 text-sm">
        {titulo && <p className="texto-equilibrado font-semibold tracking-tight">{titulo}</p>}
        {children && (
          <div className={cx(titulo ? "mt-1.5" : null, "texto-bonito text-sm leading-relaxed")}>
            {children}
          </div>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

/**
 * Estado vazio composto: uma marca d'água pontilhada com um anel pulsando ao
 * centro. Espaço vazio contando que algo vai aparecer ali, em vez de nada.
 */
export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden px-6 py-16 text-center">
      <div
        aria-hidden
        className="grade-pontos pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(18rem_10rem_at_center,black,transparent)]"
      />

      <span aria-hidden className="relative mb-2 grid size-10 place-items-center">
        <span className="animate-orbita absolute inset-0 rounded-full border border-brand-300" />
        <span className="size-2.5 rounded-full bg-brand-400" />
      </span>

      <p className="texto-equilibrado relative text-base font-semibold tracking-tight text-ink">{titulo}</p>
      {descricao && (
        <p className="texto-bonito relative max-w-md text-sm text-ink-muted leading-relaxed">{descricao}</p>
      )}
      {acao && <div className="relative mt-3">{acao}</div>}
    </div>
  );
}

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={cx("esqueleto rounded-md", className)} style={style} />;
}

/**
 * Esqueleto da página inteira. Os blocos entram escalonados para o
 * carregamento ter direção, e a forma imita o layout que vai substituí-lo.
 */
export function CarregandoPagina() {
  return (
    <div className="cascata space-y-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-8 w-56" />
      <div className="cascata grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={passo(1)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" style={passo(i + 1)} />
        ))}
      </div>
      <Skeleton className="h-64" style={passo(3)} />
    </div>
  );
}
