"use client";

import { useRef } from "react";
import { FluxoCetim } from "@/components/originkit/fluxo-cetim";
import { CampoEstrelas } from "../efeitos";
import { aoConcluirIntro, COM_MOVIMENTO, gsap, useGSAP } from "./gsap";
import { Painel3D, PRANCHETA } from "./painel-3d";
import { TituloSplit } from "./titulo-split";

/** Pose inicial do "mundo": deitado e girado, como uma maquete vista de cima. */
const POSE_EXPLODIDA = { rotationX: 58, rotationZ: -24, yPercent: 60, scale: 0.84 };

/**
 * Hero em três tempos:
 *
 * 1. Entrada (depois da intro): só o texto. Do dashboard não aparece nada —
 *    o primeiro quadro é a frase, sem concorrência.
 * 2. Rolagem (seção presa, 320vh): o texto sai e as peças do dashboard
 *    chegam de longe, uma de cada vez — casco, filtros, KPIs, gráficos —, e
 *    se encaixam no lugar enquanto a maquete se levanta até ficar de frente.
 *    O produto se monta na sua frente, no ritmo de quem rola.
 * 3. Ocioso: o mundo inclina seguindo o mouse — dá para "olhar em volta".
 *
 * Com movimento reduzido: sem prender a seção, dashboard já montado.
 */
export function HeroCinematico() {
  const secao = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = secao.current!;

      // A prancheta tem tamanho fixo; a escala acompanha a viewport.
      const ajustarEscala = () => {
        // Cabe abaixo da barra do topo e acima da legenda, com respiro dos lados.
        const escala = Math.min(
          1,
          (window.innerWidth - 96) / PRANCHETA.largura,
          (window.innerHeight - 190) / PRANCHETA.altura,
        );
        no.style.setProperty("--escala", String(Math.max(0.28, escala)));
      };
      ajustarEscala();
      window.addEventListener("resize", ajustarEscala);

      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const camadas = gsap.utils.toArray<HTMLElement>("[data-camada]", no);
        // Cada peça parte de longe, na direção do seu "estado explodido" mas
        // bem além dele, e invisível: no primeiro quadro não há nada da
        // maquete na tela.
        const longe = (el: HTMLElement) => ({
          x: Number(el.dataset.ex) * 2.4,
          y: Number(el.dataset.ey) * 2.4 + 420,
          z: Number(el.dataset.ez) * 1.6 + 700,
          rotation: Number(el.dataset.erot) * 2.5,
          autoAlpha: 0,
        });

        gsap.set("[data-mundo]", POSE_EXPLODIDA);
        camadas.forEach((el) => gsap.set(el, longe(el)));
        // O palco nasce escondido no CSS (sem flash antes do JS); agora que
        // as peças estão fora de cena, ele pode existir.
        gsap.set("[data-palco-3d]", { autoAlpha: 1 });
        gsap.set("[data-hero-frase]", { autoAlpha: 0, x: -140, filter: "blur(8px)" });

        // 1. Entrada: só o texto.
        const entrada = gsap.timeline({ paused: true });
        // O subtítulo espera o título quase terminar de virar e entra da
        // esquerda até o centro, uma frase depois da outra.
        entrada.to(
          "[data-hero-frase]",
          {
            autoAlpha: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1.4,
            stagger: 0.22,
            ease: "expo.out",
            clearProps: "filter",
          },
          1.05,
        );
        const liberar = aoConcluirIntro(() => entrada.play());

        // 3. Paralaxe do mouse (só antes de a montagem terminar)
        const rx = gsap.quickTo("[data-paralaxe]", "rotationX", { duration: 1.2, ease: "power3" });
        const ry = gsap.quickTo("[data-paralaxe]", "rotationY", { duration: 1.2, ease: "power3" });
        let progresso = 0;
        const mover = (e: PointerEvent) => {
          const f = 1 - Math.min(1, progresso * 3);
          ry(((e.clientX / window.innerWidth) - 0.5) * 10 * f);
          rx(((e.clientY / window.innerHeight) - 0.5) * -7 * f);
        };
        window.addEventListener("pointermove", mover, { passive: true });

        // 2. Montagem amarrada à rolagem
        const montagem = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
            onUpdate: (st) => (progresso = st.progress),
          },
          defaults: { ease: "none" },
        });
        montagem
          .to("[data-hero-texto]", { yPercent: -45, autoAlpha: 0, scale: 0.92, filter: "blur(10px)", duration: 0.26 }, 0)
          .to("[data-mundo]", { rotationX: 0, rotationZ: 0, yPercent: 0, scale: 1, duration: 0.8, ease: "power2.inOut" }, 0.08)
          // Uma peça de cada vez: chega rápido e assenta devagar — o
          // "encaixe" é o fim longo da curva.
          .to(camadas, { x: 0, y: 0, z: 0, rotation: 0, autoAlpha: 1, duration: 0.36, ease: "power3.out", stagger: 0.055 }, 0.1);

        return () => {
          liberar();
          window.removeEventListener("pointermove", mover);
        };
      });

      return () => {
        mm.revert();
        window.removeEventListener("resize", ajustarEscala);
      };
    },
    { scope: secao },
  );

  return (
    <section ref={secao} className="hero-cinema relative h-[320vh] motion-reduce:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* Ambiente. Some antes da borda de baixo: o brilho roxo encostado no pé
            era cortado pela caixa e virava uma reta na entrada do letreiro. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,black_65%,transparent)]"
        >
          <FluxoCetim
            interativo={false}
            escala={16}
            velocidade={180}
            granulado={22}
            className="opacity-55 mask-[linear-gradient(to_bottom,black_10%,transparent_75%)]"
          />
          <CampoEstrelas className="absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_100%,color-mix(in_oklch,var(--color-brand-500)_22%,transparent),transparent)]" />
        </div>

        {/* Texto */}
        <div
          data-hero-texto
          className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 pt-16 pb-6 text-center motion-reduce:h-auto motion-reduce:pt-32 motion-reduce:pb-12"
        >
          {/* Véu atrás do texto: a maquete passa por baixo sem roubar a leitura. */}
          <div
            aria-hidden
            className="absolute inset-x-0 -top-10 -bottom-16 -z-10 bg-[radial-gradient(55%_60%_at_50%_45%,color-mix(in_oklch,var(--color-surface-muted)_88%,transparent),transparent_75%)]"
          />
          <TituloSplit
            como="h1"
            noHero
            atraso={80}
            classeLetra="letra"
            semMascara
            // O destaque sempre começa numa linha nova: "Seu próximo cliente" /
            // "a um clique de você." — a quebra não fica por conta da largura.
            className="hero-titulo text-[clamp(2.75rem,8.4vw,7.75rem)] leading-[0.92] font-bold tracking-[-0.045em] text-ink [&_em]:block"
          >
            {/* O ponto num span: dividido por letra, o par "ê." perde o kerning da
                fonte e o ponto descola — o span devolve o encaixe. */}
            Seu próximo cliente <em>a um clique de você<span className="ponto">.</span></em>
          </TituloSplit>
          {/* Uma frase por linha a partir do tablet: a segunda não quebra no meio. */}
          <p className="texto-bonito mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
            {/* `inline-block` para o deslize funcionar também no celular, onde as
                duas frases correm na mesma linha. */}
            <span data-hero-frase className="inline-block sm:block">
              Encontre empresas que precisam do que você oferece.
            </span>{" "}
            <span data-hero-frase className="inline-block sm:block">
              Personalize seus leads conforme seu negócio.
            </span>
          </p>
        </div>

        {/* Dashboard em 3D */}
        <div
          aria-hidden
          inert
          data-palco-3d
          className="pointer-events-none invisible absolute inset-0 flex items-center justify-center pt-12 motion-reduce:visible motion-reduce:relative motion-reduce:inset-auto motion-reduce:pb-20"
        >
          {/*
            Cadeia 3D: perspectiva → tamanho → escala → mundo (pose da rolagem)
            → paralaxe (mouse) → camadas. Todo elo intermediário preserva o 3D,
            senão a perspectiva do topo não chega às camadas.
          */}
          <div className="perspective-[2400px]">
            <div
              className="relative transform-3d"
              style={{
                width: `calc(${PRANCHETA.largura}px * var(--escala, 1))`,
                height: `calc(${PRANCHETA.altura}px * var(--escala, 1))`,
              }}
            >
              <div
                className="absolute top-0 left-0 origin-top-left transform-3d"
                style={{
                  width: PRANCHETA.largura,
                  height: PRANCHETA.altura,
                  transform: "scale(var(--escala, 1))",
                }}
              >
                <div data-mundo className="size-full transform-3d">
                  <div data-paralaxe className="relative size-full transform-3d">
                    <Painel3D />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
