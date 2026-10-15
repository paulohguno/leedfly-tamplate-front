"use client";

import { useRef, useState, type ReactNode } from "react";
import { Holofote } from "@/components/motion/holofote";
import { cx } from "@/lib/format";
import {
  AgendaAutomatica,
  CapturaAutomatica,
  FichaCompleta,
  NotaExplicada,
  PainelVivo,
  PerfilAutomatico,
  QuadroAutomatico,
  VisitantesAutomatico,
} from "./bento-motion";
import { Inclinavel } from "../efeitos";
import { gsap, useGSAP } from "./gsap";
import { TituloSplit } from "./titulo-split";

/*
 * "Na prática" como apresentação, na ordem em que o Leedfly é usado: perfil
 * da empresa → captura → leads → funil e agenda → links do time → painel.
 */
const QUADROS: {
  titulo: string;
  texto: string;
  notas: string[];
  conteudo: ReactNode;
}[] = [
  {
    titulo: "Descreva seu negócio",
    texto: "Preencha as informações para iniciar sua primeira busca.",
    notas: [],
    conteudo: (
      <Moldura>
        <PerfilAutomatico />
      </Moldura>
    ),
  },
  {
    titulo: "Peça leads sob medida",
    texto: "Inicie uma captura de leads.",
    notas: [],
    conteudo: (
      <Moldura>
        <CapturaAutomatica />
      </Moldura>
    ),
  },
  {
    titulo: "Receba leads completos",
    texto: "Receba leads selecionados de acordo com o perfil da sua empresa e o cliente que você procura.",
    notas: [],
    conteudo: (
      <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-2">
        <Moldura>
          <FichaCompleta />
        </Moldura>
        <Moldura>
          <NotaExplicada />
        </Moldura>
      </div>
    ),
  },
  {
    titulo: "Organize",
    texto: "Acompanhe cada lead no quadro e na agenda, do primeiro contato ao fechamento.",
    notas: [],
    conteudo: (
      <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Moldura>
          <QuadroAutomatico />
        </Moldura>
        <Moldura>
          <AgendaAutomatica />
        </Moldura>
      </div>
    ),
  },
  {
    titulo: "Compartilhe com sua equipe",
    texto: "Envie um acesso para cada pessoa da equipe acompanhar.",
    notas: [],
    conteudo: (
      <Moldura>
        <VisitantesAutomatico />
      </Moldura>
    ),
  },
  {
    titulo: "Dashboard",
    texto: "Visualize todas as suas informações em um só lugar.",
    notas: [],
    conteudo: (
      <Moldura>
        <PainelVivo />
      </Moldura>
    ),
  },
];

/** Unidades de timeline entre a entrada de um quadro e a do próximo. */
const PASSO = 2.8;
const INICIO = 1.1;

// Onde cada luz do fundo pousa em cada quadro: elas trocam de lugar a cada passo.
const LUZ_A = [
  { x: "0vw", y: "0vh", scale: 1 },
  { x: "48vw", y: "-6vh", scale: 1.15 },
  { x: "18vw", y: "38vh", scale: 0.9 },
  { x: "58vw", y: "32vh", scale: 1.2 },
  { x: "6vw", y: "22vh", scale: 1 },
  { x: "36vw", y: "6vh", scale: 1.3 },
];
const LUZ_B = [
  { x: "0vw", y: "0vh", scale: 1 },
  { x: "-46vw", y: "-30vh", scale: 1.1 },
  { x: "-8vw", y: "-42vh", scale: 1.25 },
  { x: "-54vw", y: "-10vh", scale: 0.9 },
  { x: "-30vw", y: "-36vh", scale: 1.15 },
  { x: "-12vw", y: "-20vh", scale: 1.3 },
];

// Só em tela larga: no celular e com movimento reduzido os quadros ficam em lista.
const APRESENTACAO = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * A seção fica presa enquanto rola: primeiro o título, centralizado; depois
 * cada quadro entra por baixo e pela direita, os títulos dele aparecem, e ele
 * sai pela esquerda quando o próximo chega.
 */
export function BentoPratica() {
  const raiz = useRef<HTMLElement>(null);
  // Quantas vezes cada quadro entrou: remonta o conteúdo para o roteiro começar do zero.
  const [entradas, setEntradas] = useState(() => QUADROS.map(() => 0));
  const atual = useRef(-1);

  useGSAP(
    () => {
      const no = raiz.current!;
      const mm = gsap.matchMedia();
      mm.add(APRESENTACAO, () => {
        const quadros = gsap.utils.toArray<HTMLElement>("[data-quadro]", no);
        gsap.set(quadros, {
          autoAlpha: 0,
          xPercent: 45,
          yPercent: 35,
          rotation: 5,
          scale: 0.86,
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (st) => {
              const tempo = st.progress * tl.duration();
              let i = -1;
              QUADROS.forEach((_, k) => {
                if (tempo >= INICIO + k * PASSO - 0.2) i = k;
              });
              if (i === atual.current) return;
              atual.current = i;
              if (i >= 0) setEntradas((e) => e.map((v, k) => (k === i ? v + 1 : v)));
            },
          },
        });

        tl.to(
          "[data-abertura]",
          {
            yPercent: -40,
            scale: 0.85,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.in",
          },
          0.4,
        );

        quadros.forEach((q, i) => {
          const t = INICIO + i * PASSO;
          tl.to(
            q,
            {
              autoAlpha: 1,
              xPercent: 0,
              yPercent: 0,
              rotation: 0,
              scale: 1,
              duration: 1,
            },
            t,
          )
            .from(
              q.querySelectorAll("[data-texto]"),
              { y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.6 },
              t + 0.45,
            )
            .from(
              q.querySelectorAll("[data-nota]"),
              {
                scale: 0.6,
                autoAlpha: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "back.out(2)",
              },
              t + 0.8,
            );
          // O fundo acompanha: as luzes migram e o número gigante do quadro sobe.
          tl.to("[data-luz='a']", { ...LUZ_A[i], duration: 1.4, ease: "power2.inOut" }, t - 0.2)
            .to("[data-luz='b']", { ...LUZ_B[i], duration: 1.4, ease: "power2.inOut" }, t - 0.2)
            .from(q.querySelector("[data-numero]"), { yPercent: 35, autoAlpha: 0, duration: 1 }, t + 0.3);
          if (i < quadros.length - 1) {
            tl.to(
              q,
              {
                xPercent: -60,
                yPercent: -6,
                rotation: -4,
                scale: 0.9,
                autoAlpha: 0,
                duration: 0.9,
                ease: "power2.in",
              },
              t + 2.3,
            );
          }
        });
        tl.to({}, { duration: 0.8 }); // respiro no painel antes de soltar a seção
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      id="pratica"
      className="relative py-28 sm:py-36 lg:motion-safe:h-[1300vh] lg:motion-safe:py-0"
    >
      <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:isolate lg:motion-safe:h-svh lg:motion-safe:overflow-hidden">
        {/* Fundo vivo: grade de pontos à deriva e duas luzes que mudam de lugar a cada quadro.
            Transparente no topo e no pé, para emendar com as seções vizinhas sem linha. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 hidden mask-[linear-gradient(to_bottom,transparent,black_30%,black_50%,transparent_95%)] lg:motion-safe:block"
        >
          <div className="fundo-pontos absolute inset-0" />
          <div
            data-luz="a"
            className="absolute top-[8%] left-[-12%] size-[42rem] rounded-full bg-brand-500/22 blur-[150px]"
          />
          <div
            data-luz="b"
            className="absolute right-[-10%] bottom-[-12%] size-[36rem] rounded-full bg-indigo/18 blur-[150px]"
          />
        </div>
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-24 px-4 sm:px-6 lg:motion-safe:place-items-center lg:motion-safe:gap-0 lg:motion-safe:pt-16">
          <div data-abertura className="mx-auto max-w-4xl text-center lg:motion-safe:[grid-area:1/1]">
            <TituloSplit className="text-[clamp(2.75rem,6.5vw,5.75rem)] leading-[0.96] font-bold tracking-[-0.04em] text-ink">
              Componentes que <em>trabalham por você.</em>
            </TituloSplit>
          </div>

          {QUADROS.map((q, i) => (
            <article
              key={q.titulo}
              data-quadro
              className="w-full lg:motion-safe:invisible lg:motion-safe:[grid-area:1/1]"
            >
              <div className="relative mb-8">
                {/* Número gigante, só contorno, no espaço livre à direita do título. */}
                <span
                  aria-hidden
                  data-numero
                  className="numero-fantasma pointer-events-none absolute -top-8 right-0 hidden text-[11rem] leading-none font-bold tracking-[-0.06em] select-none lg:block"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3
                    data-texto
                    className="text-[clamp(1.875rem,3.4vw,3rem)] leading-[1.02] font-bold tracking-[-0.03em] text-ink"
                  >
                    {q.titulo}
                  </h3>
                </div>
                <div className="mt-3 max-w-xl">
                  <p data-texto className="texto-bonito text-base text-ink-muted sm:text-lg">
                    {q.texto}
                  </p>
                  {q.notas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.notas.map((n) => (
                        <span
                          key={n}
                          data-nota
                          className="rounded-full bg-brand-500/12 px-3 py-1 text-xs font-medium text-ink ring-1 ring-brand-500/35"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div key={entradas[i]}>{q.conteudo}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A moldura de vidro dos componentes, com leve inclinação ao passar o mouse. */
function Moldura({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Inclinavel intensidade={3} className={cx("h-full rounded-[1.75rem]", className)}>
      <Holofote className="vidro card-shadow h-full rounded-[1.75rem] p-3 sm:p-4">
        <div className="h-full overflow-hidden rounded-2xl bg-surface/45 ring-1 ring-line/40">{children}</div>
      </Holofote>
    </Inclinavel>
  );
}
