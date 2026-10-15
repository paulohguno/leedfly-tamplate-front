"use client";

import Image from "next/image";
import { useMemo, useRef, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CampoEstrelas, Magnetico } from "./efeitos";
import { TituloSplit } from "./cinema/titulo-split";
import { sorteio, useNaTela } from "./movimento";

/**
 * Fecho da página: o logo nasce de uma explosão de raios, como no fim dos
 * vídeos da marca, e a frase-assinatura sobe por baixo dele.
 */
export function FinalMarca() {
  const raiz = useRef<HTMLElement>(null);
  const naTela = useNaTela(raiz, { limiar: 0.35 });

  const raios = useMemo(() => {
    const rnd = sorteio(11);
    return Array.from({ length: 28 }, (_, i) => ({
      angulo: (i / 28) * 360 + rnd() * 8,
      comprimento: 90 + rnd() * 140,
      inicio: 70 + rnd() * 40,
      atraso: rnd() * 180,
    }));
  }, []);

  return (
    <section ref={raiz} data-ativo={naTela} className="final-marca relative isolate overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,transparent,black_30%)]">
        <CampoEstrelas quantidade={120} semente={3} className="opacity-70" />
        <div className="absolute top-1/2 left-1/2 size-160 -translate-1/2 rounded-full bg-brand-500/25 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <div aria-hidden className="relative grid size-64 place-items-center">
          <svg viewBox="-260 -260 520 520" className="final-raios absolute size-128 max-w-none overflow-visible">
            {raios.map((r, i) => (
              // Giro no <g>: o CSS anima o traço da linha e não pode
              // sobrescrever o `transform` que a posiciona.
              <g key={i} transform={`rotate(${r.angulo})`}>
                <line
                  x1={0}
                  y1={-r.inicio}
                  x2={0}
                  y2={-(r.inicio + r.comprimento)}
                  pathLength={1}
                  stroke="var(--color-brand-500)"
                  strokeWidth={i % 3 === 0 ? 1.6 : 0.9}
                  strokeLinecap="round"
                  className="final-raio"
                  style={{ "--atraso": `${r.atraso}ms` } as CSSProperties}
                />
              </g>
            ))}
          </svg>
          <div className="final-logo relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-brand-500/50 blur-3xl" />
            <Image
              src="/logo-icon-mark.png"
              alt=""
              width={228}
              height={307}
              className="relative h-28 w-auto drop-shadow-[0_10px_40px_var(--color-brand-600)]"
            />
          </div>
        </div>

        <TituloSplit
          atraso={300}
          className="-mt-6 text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.04em] text-ink"
        >
          O CRM que acha <em>leads pra você.</em>
        </TituloSplit>
        <p className="final-assinatura mt-7 font-mono text-[11px] font-semibold tracking-[0.45em] text-brand-500 uppercase">
          Encontre · Organize · Converta
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetico forca={12}>
            <ButtonLink href="/em-desenvolvimento" icone="→" className="h-12 px-6 text-base">
              Criar conta gratuita
            </ButtonLink>
          </Magnetico>
          <Magnetico forca={8}>
            <ButtonLink href="/em-desenvolvimento" variante="secundaria" className="h-12 px-6 text-base">
              Já tenho conta
            </ButtonLink>
          </Magnetico>
        </div>
      </div>
    </section>
  );
}
