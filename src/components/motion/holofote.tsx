"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Borda que se ilumina sob o cursor.
 *
 * A posição vai para as variáveis CSS `--mx`/`--my` escritas direto no nó —
 * passar por estado React re-renderizaria a árvore a cada movimento do mouse.
 * O gradiente em si mora na utilitária `.holofote` (globals.css).
 *
 * `pointer` cobre mouse e caneta; no toque o evento não dispara e o card
 * simplesmente fica sem o efeito, que é o certo.
 */
export function Holofote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function aoMover(evento: PointerEvent<HTMLDivElement>) {
    const no = ref.current;
    if (!no || evento.pointerType === "touch") return;

    const caixa = no.getBoundingClientRect();
    no.style.setProperty("--mx", `${evento.clientX - caixa.left}px`);
    no.style.setProperty("--my", `${evento.clientY - caixa.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={aoMover} className={cx("holofote", className)}>
      {children}
    </div>
  );
}
