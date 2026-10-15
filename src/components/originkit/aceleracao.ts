"use client";

import { useSyncExternalStore } from "react";

/**
 * Renderizadores por software conhecidos.
 *
 * Quando o Chrome não consegue usar a GPU — driver antigo, placa na lista de
 * bloqueio, máquina virtual, `--disable-gpu`, navegador headless — ele entrega
 * um contexto WebGL que funciona, mas desenha na CPU. A API é idêntica; o
 * desempenho não: um shader de tela cheia com marcha de raios sai de 60 quadros
 * por segundo para menos de um.
 */
const SOFTWARE = /swiftshader|llvmpipe|software|basic render|microsoft basic/i;

export type EstadoAceleracao = "verificando" | "disponivel" | "ausente";

/**
 * Descobre se vale a pena montar um shader pesado nesta máquina.
 *
 * Existe porque a checagem `if (!gl) return` não basta: o contexto vem, o
 * shader compila, e a página congela. Foi assim que a tela de entrada deixou de
 * carregar em 25 segundos no Chromium dos testes, que roda em SwiftShader — e o
 * mesmo aconteceria com quem abre o sistema numa VDI ou num notebook com a GPU
 * desligada.
 *
 * A verificação é feita uma vez, com um canvas descartável de 1x1, e o
 * resultado fica em cache no módulo — a capacidade da máquina não muda no meio
 * da sessão.
 *
 * `useSyncExternalStore` e não `useEffect` + `setState`: isto é a leitura de
 * uma fonte externa que nunca muda, exatamente o caso de uso dele. A assinatura
 * é uma função vazia porque não há nada a observar.
 */
let cache: EstadoAceleracao | null = null;

const naoObservar = () => () => {};
const lerCliente = (): EstadoAceleracao =>
  (cache ??= detectar() ? "disponivel" : "ausente");
const lerServidor = (): EstadoAceleracao => "verificando";

export function useAceleracao(): EstadoAceleracao {
  return useSyncExternalStore(naoObservar, lerCliente, lerServidor);
}

function detectar(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    );

    // Sem a extensão não dá para saber; nesse caso a aposta é otimista, porque
    // a maioria dos navegadores que a escondem faz isso por privacidade e tem
    // aceleração normal.
    return !SOFTWARE.test(renderer);
  } catch {
    return false;
  }
}
