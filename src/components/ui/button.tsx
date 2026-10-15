import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

type Variante = "primaria" | "secundaria" | "fantasma" | "perigo";
type Tamanho = "sm" | "md";

/*
 * Todo botão tem peso físico: afunda 2% ao ser pressionado, sobe 1px no hover
 * e devolve um reflexo diagonal atravessando a superfície. A curva é a mesma
 * do resto da interface (`--ease-fluida`) — nada de `ease-in-out`.
 */
/*
 * Controles em cápsula, como manda o material: a pílula é a forma que o vidro
 * assume quando é um botão. O raio total também deixa o reflexo diagonal
 * percorrer a peça inteira sem quinas cortando a luz.
 */
const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all duration-media ease-fluida " +
  "will-change-transform active:scale-[0.975] active:duration-75 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const variantes: Record<Variante, string> = {
  // A primária é o único elemento opaco da tela — é ela que ancora o olhar
  // quando tudo em volta é translúcido.
  primaria:
    "reflexo bg-brand-600 text-white shadow-[0_1px_0_oklch(1_0_0/0.28)_inset,0_-1px_0_oklch(0_0_0/0.15)_inset,0_6px_18px_-6px_var(--color-brand-600)] " +
    "hover:-translate-y-px hover:bg-brand-500 hover:shadow-[0_1px_0_oklch(1_0_0/0.32)_inset,0_-1px_0_oklch(0_0_0/0.15)_inset,0_12px_26px_-8px_var(--color-brand-500)]",
  secundaria:
    "vidro text-ink hover:-translate-y-px hover:border-brand-400/40 hover:shadow-elevado",
  fantasma: "text-ink-muted hover:bg-ink/8 hover:text-ink",
  perigo:
    "border border-danger/30 bg-danger-soft text-danger hover:-translate-y-px hover:border-danger/50 hover:bg-danger/10",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function buttonClasses(variante: Variante = "primaria", tamanho: Tamanho = "md") {
  return cx(base, variantes[variante], tamanhos[tamanho]);
}

/**
 * Ícone final em cápsula própria — nunca solto ao lado do texto. Ele desliza
 * na diagonal quando o botão recebe hover, criando tensão dentro do controle.
 */
function IconeFinal({ children, tamanho }: { children: ReactNode; tamanho: Tamanho }) {
  return (
    <span
      aria-hidden
      className={cx(
        "-mr-1 grid place-items-center rounded-full bg-current/15 transition-transform duration-300 ease-fluida",
        "group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105",
        tamanho === "sm" ? "size-5 text-[10px]" : "size-6 text-xs",
      )}
    >
      {children}
    </span>
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  /** Glifo do ícone final; vem embrulhado na cápsula. */
  icone?: ReactNode;
}

export function Button({
  variante = "primaria",
  tamanho = "md",
  carregando,
  icone,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(buttonClasses(variante, tamanho), className)}
      disabled={disabled || carregando}
      data-carregando={carregando ? "" : undefined}
      {...props}
    >
      {carregando && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
      {icone && !carregando && <IconeFinal tamanho={tamanho}>{icone}</IconeFinal>}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: ReactNode;
  children: ReactNode;
}

export function ButtonLink({
  variante = "primaria",
  tamanho = "md",
  icone,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cx(buttonClasses(variante, tamanho), className)} {...props}>
      {children}
      {icone && <IconeFinal tamanho={tamanho}>{icone}</IconeFinal>}
    </Link>
  );
}
