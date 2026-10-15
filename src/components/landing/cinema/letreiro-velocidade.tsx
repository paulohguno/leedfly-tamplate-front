"use client";

import { useRef } from "react";
import { cx } from "@/lib/format";
import { COM_MOVIMENTO, gsap, ScrollTrigger, useGSAP } from "./gsap";

const LINHAS = [
  { palavras: ["Encontre.", "Converse.", "Organize.", "Converta."], sentido: -1 },
  {
    palavras: [
      "Leads validados",
      "Busca inteligente",
      "Perfil ideal",
      "Sem leads duplicados",
      "Dados organizados",
    ],
    sentido: 1,
  },
];

/**
 * Letreiro gigante que reage à rolagem: corre sozinho devagar, dispara na
 * direção do scroll quando você rola e entorta (skew) proporcional à
 * velocidade — a página parece ter massa.
 *
 * Uma linha em contorno, outra cheia, em sentidos opostos.
 */
export function LetreiroVelocidade() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const trilhas = gsap.utils.toArray<HTMLElement>("[data-trilha]", raiz.current);
        const posicoes = trilhas.map(() => 0);
        let velocidade = 0;
        let skewAtual = 0;
        let visivel = false;

        const st = ScrollTrigger.create({
          trigger: raiz.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (visivel = self.isActive),
          onUpdate: (self) => (velocidade = self.getVelocity()),
        });

        const setSkew = trilhas.map((t) => gsap.quickSetter(t, "skewX", "deg"));
        const setX = trilhas.map((t) => gsap.quickSetter(t, "xPercent"));

        const tique = (_t: number, delta: number) => {
          if (!visivel) return;
          velocidade *= 0.92; // a inércia decai mesmo sem novos eventos
          const impulso = gsap.utils.clamp(-6, 6, velocidade / 400);
          skewAtual += (gsap.utils.clamp(-14, 14, velocidade / -160) - skewAtual) * 0.12;
          trilhas.forEach((_, i) => {
            const sentido = LINHAS[i].sentido;
            posicoes[i] += (0.035 + Math.abs(impulso) * 0.08) * sentido * (delta / 16) * (impulso < 0 ? -1 : 1);
            // Duas cópias do conteúdo: andar entre -50% e 0 é um loop sem costura.
            posicoes[i] = gsap.utils.wrap(-50, 0, posicoes[i]);
            setX[i](posicoes[i]);
            setSkew[i](skewAtual);
          });
        };
        gsap.ticker.add(tique);

        return () => {
          gsap.ticker.remove(tique);
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-label="Destaques" className="relative overflow-x-clip py-16 sm:py-24">
      {LINHAS.map((linha, i) => (
        <div key={i} className="flex whitespace-nowrap">
          <div data-trilha className="flex shrink-0 will-change-transform">
            {[0, 1].map((copia) => (
              <div key={copia} aria-hidden={copia === 1} className="flex shrink-0 items-center">
                {linha.palavras.map((p) => (
                  <span
                    key={p}
                    className={cx(
                      "flex items-center gap-[0.35em] pr-[0.35em] text-[clamp(3.5rem,11vw,10rem)] leading-[1.02] font-bold tracking-[-0.04em]",
                      i === 0 ? "letreiro-contorno" : "text-ink",
                    )}
                  >
                    {p}
                    <span aria-hidden className="text-[0.5em] text-brand-500">
                      ✦
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
