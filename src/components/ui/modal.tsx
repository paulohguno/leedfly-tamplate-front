"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Diálogo com entrada e saída animadas.
 *
 * O detalhe que faz diferença é a saída: desmontar na hora corta o movimento
 * pela metade. Aqui o componente segue montado enquanto a animação de fecho
 * roda (`fechando`), e só então some.
 *
 * O véu usa desfoque de fundo — permitido porque é um elemento fixo, não um
 * container que rola.
 */
const DURACAO_FECHO = 180;

export interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children?: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}

export function Modal({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = "max-w-lg",
}: ModalProps) {
  const [montado, setMontado] = useState(aberto);
  const [fechando, setFechando] = useState(false);
  const [anteriorAberto, setAnteriorAberto] = useState(aberto);
  const painelRef = useRef<HTMLDivElement>(null);
  const aoFecharRef = useRef(aoFechar);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  });

  // Ajuste de estado durante o render: sincroniza abertura e fecho imediato
  // quando a prop `aberto` muda, eliminando re-renders em cascata do useEffect.
  if (aberto !== anteriorAberto) {
    setAnteriorAberto(aberto);
    if (aberto) {
      setMontado(true);
      setFechando(false);
    } else if (montado) {
      setFechando(true);
    }
  }

  // Quando o modal entra em fechamento animado, aguarda o término da transição CSS (180ms)
  useEffect(() => {
    if (!fechando) return;

    const id = setTimeout(() => {
      setMontado(false);
      setFechando(false);
    }, DURACAO_FECHO);
    return () => clearTimeout(id);
  }, [fechando]);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFecharRef.current();
    };
    document.addEventListener("keydown", aoTeclar);

    // Trava o scroll de fundo: rolar a página atrás do diálogo desorienta.
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // O foco entra no painel para o teclado não continuar na página de trás —
    // e volta para quem abriu o diálogo quando ele fecha.
    const focoAnterior = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus?.();
    };
  }, [aberto]);

  if (!montado) return null;

  return (
    <div
      className={cx(
        "fixed inset-0 flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-sm",
        "transition-opacity duration-200 ease-fluida",
        fechando ? "opacity-0" : "animate-aparecer",
      )}
      style={{ zIndex: "var(--z-modal)" }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={aoFechar}
    >
      <div
        ref={painelRef}
        tabIndex={-1}
        className={cx(
          "vidro-denso w-full rounded-2xl shadow-flutuante outline-none",
          largura,
          "transition-[transform,opacity] duration-200 ease-fluida",
          fechando ? "translate-y-1 scale-[0.98] opacity-0" : "animate-surgir",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="divisa relative z-2 border-b px-6 py-5 sm:px-8 sm:py-6">
          <h2 className="texto-equilibrado text-base font-semibold tracking-tight text-ink">{titulo}</h2>
          {descricao && (
            <p className="texto-bonito mt-1 text-xs text-ink-muted leading-relaxed">{descricao}</p>
          )}
        </header>
        {children && <div className="relative z-2 px-6 py-6 sm:px-8 sm:py-7">{children}</div>}
        {rodape && (
          <footer className="divisa relative z-2 flex justify-end gap-3 border-t px-6 py-4 sm:px-8 sm:py-5">
            {rodape}
          </footer>
        )}
      </div>
    </div>
  );
}
