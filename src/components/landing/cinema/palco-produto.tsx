"use client";

import { useRef, useState, type CSSProperties } from "react";
import { cx } from "@/lib/format";
import { COM_MOVIMENTO, gsap, useGSAP } from "./gsap";
import { TELA, TelaCaptura, TelaConversa, TelaFunil, TelaNegocio } from "./telas";

const ETAPAS = [
  {
    verbo: "Encontre",
    titulo: "Leads que combinam com seu negócio.",
    texto: "Descubra novos clientes sem perder horas procurando.",
    notas: [
      { texto: "Raio de 10 km", x: 8, y: 84 },
      { texto: "38 empresas", x: 58, y: 8 },
    ],
  },
  {
    verbo: "Converse",
    titulo: "Encontre quem realmente faz sentido para você.",
    texto: "Tenha as informações necessárias para começar uma boa conversa.",
    notas: [
      { texto: "Reunião marcada", x: 60, y: 8 },
    ],
  },
  {
    verbo: "Organize",
    titulo: "Mantenha tudo no lugar.",
    texto: "Acompanhe seus leads e saiba exatamente em que ponto está cada conversa.",
    notas: [
      { texto: "Filtro por score", x: 46, y: 8 },
      { texto: "Validação com IA", x: 64, y: 86 },
    ],
  },
  {
    verbo: "Converta",
    titulo: "Leve as melhores oportunidades até o fim.",
    texto: "Transforme bons contatos em clientes.",
    notas: [
      { texto: "R$ 4.800", x: 72, y: 86 },
    ],
  },
] as const;

/** Pose do aparelho em cada etapa — ele "vira" para mostrar a próxima tela. */
const POSES = [
  { rotationY: -18, rotationX: 9, x: "2%" },
  { rotationY: 14, rotationX: 5, x: "-2%" },
  { rotationY: -10, rotationX: 7, x: "1%" },
  { rotationY: 0, rotationX: 0, x: "0%" },
];

/**
 * Capítulo do produto, preso no scroll (≈5 telas de altura).
 *
 * A rolagem dirige uma timeline única: o aparelho gira entre poses, cada
 * tela nova corta a anterior por máscara (clip-path) enquanto a velha recua
 * desfocada. O índice da etapa vem do mesmo ScrollTrigger e liga as
 * animações internas da tela (contadores, anéis, mensagens) e as anotações.
 */
export function PalcoProduto() {
  const secao = useRef<HTMLElement>(null);
  const [etapa, setEtapa] = useState(0);

  useGSAP(
    () => {
      const no = secao.current!;
      const tela = no.querySelector<HTMLElement>("[data-tela-area]")!;
      const ajustar = () => no.style.setProperty("--escala-tela", String(tela.clientWidth / TELA.largura));
      ajustar();
      const vigia = new ResizeObserver(ajustar);
      vigia.observe(tela);

      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const telas = gsap.utils.toArray<HTMLElement>("[data-tela]", no);
        gsap.set(telas.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set("[data-aparelho]", POSES[0]);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (st) => {
              no.style.setProperty("--p", String(st.progress));
              setEtapa(Math.min(ETAPAS.length - 1, Math.floor(st.progress * ETAPAS.length * 0.999)));
            },
          },
        });

        // Entrada: o aparelho sobe e cresce no começo do capítulo.
        tl.from("[data-aparelho]", { scale: 0.82, yPercent: 12, duration: 0.6, ease: "power3.out" }, 0);
        for (let i = 1; i < telas.length; i++) {
          const t = i; // cada etapa ocupa 1 unidade de tempo
          tl.to("[data-aparelho]", { ...POSES[i], duration: 0.55 }, t - 0.3)
            .to(telas[i - 1], { scale: 0.92, filter: "blur(6px)", autoAlpha: 0.2, duration: 0.5 }, t - 0.25)
            .to(telas[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5 }, t - 0.25)
            .from(telas[i], { scale: 1.08, duration: 0.5 }, t - 0.25);
        }
        tl.to({}, { duration: 0.6 }); // respiro final na última etapa
      });

      return () => {
        mm.revert();
        vigia.disconnect();
      };
    },
    { scope: secao },
  );


  return (
    <section
      ref={secao}
      id="produto"
      className="palco relative h-[520vh] motion-reduce:h-auto"
      style={{ "--etapas": ETAPAS.length } as CSSProperties}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        {/* O brilho surge e se desfaz longe das bordas: sem isso, o corte da caixa vira uma reta na troca de seção. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,transparent,black_25%,black_45%,transparent_92%)]"
        >
          <div className="absolute top-1/2 right-[10%] size-[44rem] -translate-y-1/2 rounded-full bg-brand-500/18 blur-[140px]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pt-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:pt-0">
          {/* Texto */}
          <div className="relative">
            {/* Contador "odômetro": a coluna de números rola até a etapa. */}
            <span className="relative block h-[1em] overflow-hidden font-mono text-[clamp(3.5rem,7vw,6rem)] leading-none font-bold tracking-tighter text-brand-500 tabular-nums">
              <span
                className="flex flex-col transition-transform duration-700 ease-fluida"
                style={{ transform: `translateY(-${etapa}em)` }}
              >
                {ETAPAS.map((_, i) => (
                  <span key={i} className="h-[1em]">
                    0{i + 1}
                  </span>
                ))}
              </span>
            </span>

            {/*
              As etapas ficam empilhadas na mesma célula da grade: a caixa
              assume a altura da etapa mais alta, e nenhum texto vaza por cima
              do trilho — com altura fixa, título de duas linhas mais parágrafo
              transbordava.
            */}
            <div className="mt-8 grid">
              {ETAPAS.map((e, i) => (
                <div
                  key={e.verbo}
                  aria-hidden={i !== etapa}
                  className={cx(
                    "[grid-area:1/1] transition-all duration-700 ease-fluida",
                    i === etapa ? "translate-y-0 opacity-100 blur-0" : i < etapa ? "-translate-y-6 opacity-0 blur-sm" : "translate-y-6 opacity-0 blur-sm",
                  )}
                >
                  <h2 className="texto-equilibrado text-3xl leading-[1.05] font-bold tracking-tight text-ink sm:text-5xl">
                    {e.titulo}
                  </h2>
                  <p className="texto-bonito mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
                    {e.texto}
                  </p>
                </div>
              ))}
            </div>

            {/* Trilho de etapas */}
            <ol className="mt-12 flex max-w-md gap-2" aria-label="Etapas">
              {ETAPAS.map((e, i) => (
                <li key={e.verbo} className="flex-1">
                  <span className="block h-1 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full origin-left rounded-full bg-brand-500"
                      style={{ transform: `scaleX(clamp(0, calc(var(--p, 0) * ${ETAPAS.length} - ${i}), 1))` }}
                    />
                  </span>
                  <span className={cx("mt-2 block text-[11px] font-medium transition-colors", i === etapa ? "text-ink" : "text-ink-muted")}>
                    {e.verbo}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Aparelho */}
          <div aria-hidden className="relative perspective-[1800px]">
            <div data-aparelho className="relative transform-3d">
              <div className="vidro-denso rounded-[1.75rem] p-2.5 shadow-[0_60px_120px_-40px_color-mix(in_oklch,var(--color-brand-600)_60%,transparent)] ring-1 ring-ink/10 sm:p-3">
                <div className="mb-2 flex items-center gap-1.5 px-2">
                  <span className="size-2 rounded-full bg-danger/70" />
                  <span className="size-2 rounded-full bg-warn/70" />
                  <span className="size-2 rounded-full bg-ok/70" />
                  <span className="ml-3 h-4 flex-1 rounded-full bg-ink/6" />
                </div>
                <div
                  data-tela-area
                  className="relative aspect-[8/5] overflow-hidden rounded-[1.1rem] bg-surface"
                >
                  {[TelaCaptura, TelaConversa, TelaFunil, TelaNegocio].map((Tela, i) => (
                    <div
                      key={i}
                      data-tela
                      // Sem movimento não há troca de tela: fica só a primeira, que casa com o texto.
                      className={cx("tela absolute inset-0 origin-center", i > 0 && "motion-reduce:hidden")}
                      style={{ zIndex: i }}
                    >
                      <div
                        className="origin-top-left"
                        style={{ width: TELA.largura, height: TELA.altura, transform: "scale(var(--escala-tela, 1))" }}
                      >
                        <Tela ativo={etapa === i} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anotações que apontam para a interface */}
              {ETAPAS.map((e, i) =>
                e.notas.map((n) => (
                  <span
                    key={n.texto}
                    data-ativo={i === etapa}
                    className="nota-palco absolute hidden items-center gap-2 lg:flex"
                    style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translateZ(80px)" }}
                  >
                    <span className="nota-traco size-2 rounded-full bg-brand-500 shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-brand-500)_30%,transparent)]" />
                    <span className="vidro-denso rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink shadow-elevado">
                      {n.texto}
                    </span>
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
