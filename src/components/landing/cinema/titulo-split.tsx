"use client";

import { useRef, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { aoConcluirIntro, COM_MOVIMENTO, gsap, SplitText, useGSAP } from "./gsap";

/**
 * Título que entra letra por letra: cada caractere sobe de trás de uma
 * máscara girando no eixo X, como uma placa virando. O SplitText refaz a
 * divisão sozinho quando a fonte termina de carregar ou a largura muda
 * (`autoSplit`), então a quebra de linha nunca sai errada.
 *
 * Destaques: envolva as palavras em <em> no `children` — elas ganham a cor
 * da marca (sólida: degradê por letra viraria listras).
 *
 * `noHero` espera a intro terminar em vez de esperar o scroll.
 */
export function TituloSplit({
  children,
  como: Como = "h2",
  className,
  noHero,
  atraso = 0,
  classeLetra,
  semMascara,
}: {
  children: ReactNode;
  como?: "h1" | "h2" | "h3" | "p";
  className?: string;
  noHero?: boolean;
  atraso?: number;
  /** Classe de cada letra dividida — para estilos que precisam da letra (degradê). */
  classeLetra?: string;
  /**
   * Sem a máscara por linha: as letras sobem sem recorte. Necessário quando a
   * caixa da letra é esticada (degradê com `background-clip: text`) — a
   * máscara cortaria descendentes como o "q".
   */
  semMascara?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        let tween: gsap.core.Tween | null = null;
        let pronto = false;
        let liberar: () => void = () => {};

        const split = SplitText.create(ref.current!, {
          type: "lines,words,chars",
          charsClass: classeLetra,
          mask: semMascara ? undefined : "lines",
          autoSplit: true,
          aria: "auto",
          onSplit(self) {
            tween?.kill();
            tween = gsap.from(self.chars, {
              yPercent: 115,
              rotateX: -85,
              opacity: 0,
              transformOrigin: "50% 100% -20px",
              duration: 1.1,
              ease: "expo.out",
              stagger: { each: 0.022 },
              delay: atraso / 1000,
              paused: noHero && !pronto,
              scrollTrigger: noHero ? undefined : { trigger: ref.current, start: "top 86%", once: true },
            });
            if (noHero && pronto) tween.play();
            return tween;
          },
        });
        gsap.set(ref.current, { autoAlpha: 1 });

        if (noHero) {
          liberar = aoConcluirIntro(() => {
            pronto = true;
            tween?.play();
          });
        } else {
          // Fora do hero quem dá o play é o ScrollTrigger, na entrada.
          pronto = true;
        }

        return () => {
          liberar();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Como ref={ref} className={cx("titulo-split perspective-[600px]", className)}>
      {children}
    </Como>
  );
}
