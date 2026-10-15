"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";

/**
 * Cursor da landing: um ponto preciso e um anel que chega atrasado, com
 * inércia. Sobre links e botões o anel cresce; sobre qualquer elemento com
 * `data-cursor="texto"` ele vira uma pílula com o rótulo ("Arraste", "Ver").
 *
 * Tamanho e cores de cada estado moram no CSS (`.cursor-site`), não no GSAP:
 * ele não sabe interpolar `var()`/`color-mix`/`oklch` e, no meio da animação,
 * soltava cores erradas — o anel piscava vermelho.
 *
 * É um complemento, não um substituto — o cursor nativo continua lá. Só
 * existe com mouse de verdade (`pointer: fine`) e sem movimento reduzido.
 */
export function Cursor() {
  const anel = useRef<HTMLDivElement>(null);
  const ponto = useRef<HTMLDivElement>(null);
  const rotulo = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const a = anel.current!;
      const p = ponto.current!;
      gsap.set([a, p], { autoAlpha: 0, xPercent: -50, yPercent: -50 });

      const ax = gsap.quickTo(a, "x", { duration: 0.55, ease: "power3" });
      const ay = gsap.quickTo(a, "y", { duration: 0.55, ease: "power3" });
      const px = gsap.quickTo(p, "x", { duration: 0.08, ease: "none" });
      const py = gsap.quickTo(p, "y", { duration: 0.08, ease: "none" });

      let visivel = false;
      function mover(e: PointerEvent) {
        if (e.pointerType !== "mouse") return;
        if (!visivel) {
          visivel = true;
          gsap.to([a, p], { autoAlpha: 1, duration: 0.3 });
        }
        ax(e.clientX);
        ay(e.clientY);
        px(e.clientX);
        py(e.clientY);
      }

      function sobre(e: PointerEvent) {
        const alvo = (e.target as Element).closest<HTMLElement>("[data-cursor], a, button, input[type=range]");
        const texto = alvo?.dataset.cursor;
        if (texto) {
          rotulo.current!.textContent = texto;
          a.dataset.estado = "texto";
          gsap.to(rotulo.current, { autoAlpha: 1, scale: 1, duration: 0.3 });
          gsap.to(p, { scale: 0, duration: 0.2 });
        } else if (alvo) {
          a.dataset.estado = "alvo";
          gsap.to(rotulo.current, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
          gsap.to(p, { scale: 0.5, duration: 0.2 });
        } else {
          delete a.dataset.estado;
          gsap.to(rotulo.current, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
          gsap.to(p, { scale: 1, duration: 0.2 });
        }
      }

      function sair() {
        visivel = false;
        gsap.to([a, p], { autoAlpha: 0, duration: 0.3 });
      }

      window.addEventListener("pointermove", mover, { passive: true });
      window.addEventListener("pointerover", sobre, { passive: true });
      document.documentElement.addEventListener("pointerleave", sair);
      return () => {
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerover", sobre);
        document.documentElement.removeEventListener("pointerleave", sair);
      };
    });
    return () => mm.revert();
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: "var(--z-textura)" }}>
      <div
        ref={anel}
        className="cursor-site invisible fixed top-0 left-0 grid place-items-center rounded-full"
      >
        <span
          ref={rotulo}
          className="invisible scale-60 font-mono text-[10px] font-semibold tracking-[0.18em] text-white uppercase"
        />
      </div>
      <div ref={ponto} className="invisible fixed top-0 left-0 size-1.5 rounded-full bg-brand-500" />
    </div>
  );
}
