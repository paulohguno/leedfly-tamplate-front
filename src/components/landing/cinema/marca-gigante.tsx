"use client";

import { useRef } from "react";
import { COM_MOVIMENTO, gsap, useGSAP } from "./gsap";

/**
 * "Leedfly" do tamanho da tela no pé da página. As letras sobem uma a uma
 * amarradas à rolagem, como se o nome emergisse do rodapé, e terminam de
 * subir quando a página chega ao fim — o nome fica inteiro e legível.
 */
export function MarcaGigante() {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.from("[data-letra]", {
          yPercent: 100,
          rotateX: -60,
          ease: "none",
          stagger: 0.08,
          // Termina 120px antes do fim da rolagem: no limite exato, a suavização do
          // scroll nunca chega a 100% e a última letra ficava pela metade.
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom+=120", scrub: 1 },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p
      ref={ref}
      aria-hidden
      className="mt-6 flex justify-center overflow-hidden pb-[0.2em] text-[22vw] leading-none font-bold tracking-tighter select-none perspective-[800px]"
    >
      {"Leedfly".split("").map((letra, i) => (
        <span key={i} data-letra className="rodape-gigante inline-block origin-bottom">
          {letra}
        </span>
      ))}
    </p>
  );
}
