import Image from "next/image";
import { cx } from "@/lib/format";

/**
 * Assinatura da marca.
 *
 * O ícone é a arte real da Leedfly (`/logo-app-icon.png`, recortada da folha
 * de marca em `public/`): já vem com o próprio fundo arredondado e o
 * degradê roxo-azul, então funciona sozinho em qualquer tema, sem precisar
 * da caixa colorida que o rascunho anterior desenhava por baixo de um ícone
 * genérico.
 */
export function Marca({
  tamanho = "sm",
  className,
  comprimido,
}: {
  tamanho?: "sm" | "md";
  className?: string;
  /** Esconde o nome no desktop — usado pelo trilho recolhido, que só tem 64px. */
  comprimido?: boolean;
}) {
  const caixa = tamanho === "md" ? "size-7" : "size-6";
  const texto = tamanho === "md" ? "text-lg" : "text-sm";

  return (
    <span className={cx("group flex items-center gap-2", className)}>
      <Image
        src="/logo-app-icon.png"
        alt=""
        width={56}
        height={56}
        priority
        className={cx(
          "shrink-0 rounded-[22%] object-contain",
          "transition-transform duration-500 ease-fluida group-hover:scale-105",
          caixa,
        )}
      />
      <span
        className={cx(
          "font-semibold tracking-tight whitespace-nowrap",
          texto,
          /* Só some no desktop: no celular o painel é largo e o nome cabe. */
          "lg:transition-opacity lg:duration-300",
          comprimido && "lg:opacity-0",
        )}
      >
        <span className="text-ink">Leed</span>
        <span className="text-brand-500">fly</span>
      </span>
    </span>
  );
}
