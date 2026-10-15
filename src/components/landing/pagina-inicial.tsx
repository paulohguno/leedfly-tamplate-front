"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlternadorTema } from "@/components/layout/alternador-tema";
import { Marca } from "@/components/layout/marca";
import { ModalTermos } from "@/components/layout/modal-termos";
import { ButtonLink } from "@/components/ui/button";
import { cx, fmt } from "@/lib/format";
import { Inclinavel } from "./efeitos";
import { GaleriaCards } from "./galeria-cards";
import { FinalMarca } from "./final-marca";
import { BentoPratica } from "./cinema/bento";
import { COM_MOVIMENTO, gsap, useGSAP } from "./cinema/gsap";
import { Cursor } from "./cinema/cursor";
import { HeroCinematico } from "./cinema/hero-cinematico";
import { Intro } from "./cinema/intro";
import { LetreiroVelocidade } from "./cinema/letreiro-velocidade";
import { MarcaGigante } from "./cinema/marca-gigante";
import { PalcoProduto } from "./cinema/palco-produto";
import { RolagemSuave } from "./cinema/rolagem-suave";

// `trimestral`: valor por mês no plano trimestral (10% de desconto, cobrado a cada 3 meses).
const PLANOS = [
  {
    nome: "Start",
    preco: 297,
    trimestral: 267,
    destaque: false,
    itens: ["150 leads por ciclo", "2 administradores", "2 visitantes", "Validação por IA"],
  },
  {
    nome: "Pro",
    preco: 697,
    trimestral: 627,
    destaque: true,
    itens: [
      "500 leads por ciclo",
      "5 administradores",
      "5 visitantes",
      "Triangulação por grafos",
      "Exportação do dashboard",
    ],
  },
  {
    nome: "Scale",
    preco: 1497,
    trimestral: 1347,
    destaque: false,
    itens: [
      "1.500 leads por ciclo",
      "15 administradores",
      "15 visitantes",
      "Métodos de busca dedicados",
    ],
  },
] as const;

/**
 * Progresso de leitura, 0 a 100. Um só listener de scroll pro topo (a barra
 * fina) e o cabeçalho lerem — dois `useEffect` de scroll independentes
 * custariam dois recálculos de layout por quadro à toa.
 */
function useProgressoDeScroll() {
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let quadro = 0;
    function medir() {
      const alturaRolavel = document.documentElement.scrollHeight - window.innerHeight;
      setProgresso(alturaRolavel > 0 ? Math.min(100, (window.scrollY / alturaRolavel) * 100) : 0);
      quadro = 0;
    }
    function aoRolar() {
      if (quadro) return;
      quadro = requestAnimationFrame(medir);
    }
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  return progresso;
}

/**
 * Qual seção da barra do topo está sob a linha de leitura (40% da altura da
 * tela). Medido no scroll, em rAF, porque as seções fixadas (`300svh`) não se
 * dão bem com IntersectionObserver por limiar.
 */
function useSecaoAtiva(ids: readonly string[]) {
  const [ativa, setAtiva] = useState<string | null>(null);

  useEffect(() => {
    let quadro = 0;
    function medir() {
      const linha = window.innerHeight * 0.4;
      let encontrada: string | null = null;
      for (const id of ids) {
        const caixa = document.getElementById(id)?.getBoundingClientRect();
        if (caixa && caixa.top <= linha && caixa.bottom > linha) encontrada = id;
      }
      setAtiva(encontrada);
      quadro = 0;
    }
    function aoRolar() {
      if (quadro) return;
      quadro = requestAnimationFrame(medir);
    }
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [ids]);

  return ativa;
}

const LINKS_TOPO = [
  { id: "produto", rotulo: "Produto" },
  { id: "pratica", rotulo: "Na prática" },
  { id: "recursos", rotulo: "Recursos" },
  { id: "planos", rotulo: "Planos" },
] as const;

const IDS_TOPO = LINKS_TOPO.map((l) => l.id);

export function PaginaInicial() {
  const progresso = useProgressoDeScroll();

  return (
    // Sem `overflow-x-hidden` aqui de propósito: ele promove `overflow-y`
    // para `auto` (regra do CSS pra combinações de overflow), e isso muda o
    // "containing block" de scroll do `<header>` — o cabeçalho `sticky`
    // parava de grudar no topo assim que a rolagem começava. Quem precisa
    // conter transbordo lateral usa `overflow-x-clip`, que não cria rolagem.
    <div className="relative">
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-0.5 bg-linear-to-r from-brand-400 via-brand-500 to-brand-600 shadow-[0_0_12px_var(--color-brand-500)] transition-[width] duration-150 ease-out"
        style={{ width: `${progresso}%`, zIndex: "calc(var(--z-nav) + 1)" }}
      />

      {/* Ordem importa: o Lenis precisa existir antes de a intro pará-lo. */}
      <RolagemSuave />
      <Intro />
      <Cursor />

      <BarraTopo rolado={progresso > 0.5} />
      <HeroCinematico />
      <LetreiroVelocidade />
      <PalcoProduto />
      <BentoPratica />
      <GaleriaCards />
      <Planos />
      <FinalMarca />
      <Rodape />
    </div>
  );
}

function BarraTopo({ rolado }: { rolado: boolean }) {
  const ativa = useSecaoAtiva(IDS_TOPO);

  return (
    <header
      className="sticky top-0 px-3 pt-3 sm:px-4"
      style={{ zIndex: "var(--z-nav)", marginBottom: "-4.75rem" }}
    >
      {/* A barra encolhe para uma pílula de vidro ao rolar — de faixa larga a ilha flutuante. */}
      <div
        className={cx(
          "mx-auto flex items-center justify-between gap-4 rounded-full border px-4 transition-all duration-500 ease-fluida",
          rolado
            ? "vidro-denso h-14 max-w-5xl shadow-elevado"
            : "h-16 max-w-7xl border-transparent bg-transparent",
        )}
      >
        <Link href="/" aria-label="Leedfly — início">
          <Marca tamanho="md" />
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-ink-muted md:flex">
          {LINKS_TOPO.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={ativa === l.id ? "location" : undefined}
              className={cx(
                "rounded-full px-3.5 py-1.5 transition-colors duration-200 hover:bg-ink/6 hover:text-ink",
                ativa === l.id && "bg-ink/6 text-ink",
              )}
            >
              {l.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AlternadorTema compacto />
          <ButtonLink href="/em-desenvolvimento" variante="fantasma" tamanho="sm" className="hidden sm:inline-flex">
            Entrar
          </ButtonLink>
          <ButtonLink href="/em-desenvolvimento" variante="primaria" tamanho="sm">
            Criar conta
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

/**
 * Planos com entrada própria, diferente do resto da página: o título é
 * revelado por uma varredura de luz e os três
 * cards começam empilhados no centro, como um baralho, e se abrem em leque.
 * Depois os itens estalam um a um e o selo do
 * Pro cai com um quique. Toca uma vez, quando a seção chega na tela.
 */
function Planos() {
  const raiz = useRef<HTMLElement>(null);
  const [trimestral, setTrimestral] = useState(false);

  useGSAP(
    () => {
      const no = raiz.current!;
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-plano]", no);
        const centro = (el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        };
        const meio = centro(cards[1]);
        // Quanto cada card precisa andar para ficar empilhado sobre o do meio.
        const dx = (i: number) => meio.x - centro(cards[i]).x;
        const dy = (i: number) => meio.y - centro(cards[i]).y;

        gsap.set(cards, {
          x: (i) => dx(i),
          y: (i) => dy(i) + 80,
          rotation: (i) => (i - 1) * 6,
          scale: 0.9,
          autoAlpha: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: no, start: "top 70%", once: true },
        });

        // Título: a luz atravessa e o texto aparece por trás dela.
        tl.fromTo(
          "[data-varredura-texto]",
          { clipPath: "inset(-15% 100% -15% 0%)" },
          { clipPath: "inset(-15% 0% -15% 0%)", duration: 1.2, ease: "power3.inOut" },
          0,
        )
          .fromTo(
            "[data-varredura-luz]",
            { left: "0%", autoAlpha: 1 },
            { left: "100%", duration: 1.2, ease: "power3.inOut" },
            0,
          )
          .to("[data-varredura-luz]", { autoAlpha: 0, duration: 0.3 }, 1.1)
          .from("[data-periodo]", { y: 12, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, 0.8);

        // Cards: sobem empilhados no centro…
        tl.to(cards, { y: (i) => dy(i), autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.07 }, 0.9)
          // …e se abrem em leque até o lugar de cada um.
          .to(
            cards,
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: 1.1,
              ease: "expo.out",
              stagger: { each: 0.06, from: "center" },
            },
            1.55,
          )
          .from("[data-selo]", { y: -36, autoAlpha: 0, duration: 0.9, ease: "bounce.out" }, 2.2)
          .from(
            "[data-item]",
            { x: -12, autoAlpha: 0, duration: 0.45, ease: "power2.out", stagger: 0.05 },
            2.15,
          )
          .from("[data-check]", { scale: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.05 }, 2.15)
          .from(
            "[data-plano-botao]",
            { y: 14, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 },
            2.5,
          );

      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} id="planos" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="relative inline-block text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em] text-ink [&_em]:text-brand-500 [&_em]:not-italic">
            <span data-varredura-texto className="block">
              Planos
            </span>
            {/* A luz que atravessa o título na entrada. */}
            <span
              aria-hidden
              data-varredura-luz
              className="pointer-events-none absolute -inset-y-[8%] left-0 w-[3px] rounded-full bg-brand-400 opacity-0 shadow-[0_0_28px_6px_var(--color-brand-500)]"
            />
          </h2>

          {/* Mensal ou trimestral: o fundo roxo desliza para a opção escolhida. */}
          <div data-periodo className="mt-8 flex justify-center">
            <div
              role="radiogroup"
              aria-label="Período de cobrança"
              className="relative grid grid-cols-2 rounded-full bg-ink/6 p-1 ring-1 ring-line/60"
            >
              <span
                aria-hidden
                className={cx(
                  "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-600 shadow-[0_8px_24px_-10px_var(--color-brand-500)] transition-transform duration-500 ease-mola",
                  trimestral && "translate-x-full",
                )}
              />
              {[
                { valor: false, rotulo: "Mensal" },
                { valor: true, rotulo: "Trimestral" },
              ].map((o) => (
                <button
                  key={o.rotulo}
                  type="button"
                  role="radio"
                  aria-checked={trimestral === o.valor}
                  onClick={() => setTrimestral(o.valor)}
                  className={cx(
                    "relative flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-300",
                    trimestral === o.valor ? "text-white" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {o.rotulo}
                  {o.valor && (
                    <span
                      className={cx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-300",
                        trimestral ? "bg-white/20 text-white" : "bg-ok-soft text-ok",
                      )}
                    >
                      -10%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {PLANOS.map((plano, i) => (
            <div key={plano.nome} data-plano className="relative h-full">
              <Inclinavel intensidade={6} className="h-full rounded-3xl">
                {/* Carta de baralho: frente mensal, verso trimestral. Viram em sequência. */}
                <div className="h-full perspective-[1600px]">
                  <div
                    className={cx(
                      "grid h-full transform-3d transition-transform duration-900 ease-fluida",
                      trimestral && "rotate-y-180",
                    )}
                    style={{ transitionDelay: `${i * 110}ms` }}
                  >
                    <FacePlano plano={plano} trimestral={false} visivel={!trimestral} />
                    <FacePlano plano={plano} trimestral visivel={trimestral} verso />
                  </div>
                </div>
              </Inclinavel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Um lado da carta do plano. O verso já nasce virado (rotate-y-180) e escondido de costas. */
function FacePlano({
  plano,
  trimestral,
  visivel,
  verso,
}: {
  plano: (typeof PLANOS)[number];
  trimestral: boolean;
  visivel: boolean;
  verso?: boolean;
}) {
  const preco = trimestral ? plano.trimestral : plano.preco;
  return (
    <div
      aria-hidden={!visivel}
      inert={!visivel}
      className={cx(
        "relative flex h-full flex-col rounded-3xl p-8 backface-hidden [grid-area:1/1]",
        verso && "rotate-y-180",
        plano.destaque
          ? "plano-destaque bg-linear-to-b from-brand-600 to-brand-500 text-white shadow-[0_30px_70px_-20px_var(--color-brand-600)]"
          : "vidro card-shadow text-ink",
      )}
    >
      {plano.destaque && (
        <span
          data-selo
          className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-elevado"
        >
          Mais popular
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className={cx("text-lg font-semibold", plano.destaque ? "text-white" : "text-ink")}>{plano.nome}</h3>
        <span
          className={cx(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            plano.destaque ? "bg-white/15 text-white" : "bg-ink/6 text-ink-muted",
          )}
        >
          {trimestral ? "Trimestral" : "Mensal"}
        </span>
      </div>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight tabular-nums">{fmt.moeda(preco)}</span>
        <span className={cx("text-sm", plano.destaque ? "text-white/70" : "text-ink-muted")}>/mês</span>
      </p>
      <p className={cx("mt-1 h-4 text-xs", plano.destaque ? "text-white/75" : "text-ink-muted")}>
        {trimestral ? `${fmt.moeda(plano.trimestral * 3)} a cada 3 meses` : "Cobrado todo mês"}
      </p>

      <ul className="mt-7 flex-1 space-y-3 text-sm">
        {plano.itens.map((item) => (
          <li key={item} data-item className="flex items-start gap-2.5">
            <span
              aria-hidden
              data-check
              className={cx(
                "mt-px grid size-4.5 shrink-0 place-items-center rounded-full text-[9px]",
                plano.destaque ? "bg-white/20 text-white" : "bg-brand-500/15 text-brand-600",
              )}
            >
              ✓
            </span>
            <span className={plano.destaque ? "text-white/90" : "text-ink-muted"}>{item}</span>
          </li>
        ))}
      </ul>

      <div data-plano-botao className="mt-8 shrink-0">
        <ButtonLink
          href="/em-desenvolvimento"
          variante={plano.destaque ? "secundaria" : "primaria"}
          className={cx("h-11 w-full justify-center", plano.destaque && "bg-white! text-brand-600! hover:bg-white/90!")}
        >
          Começar com {plano.nome}
        </ButtonLink>
      </div>
    </div>
  );
}

// Perfis da Leedfly nas redes. Vazios por enquanto: preencha com a URL completa
// (https://…) e o botão passa a abrir o perfil numa nova aba.
const REDES = {
  linkedin: "",
  instagram: "",
};

function Rodape() {
  const [termosAbertos, setTermosAbertos] = useState(false);

  return (
    <footer className="divisa relative overflow-hidden border-t">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Marca tamanho="md" />
            <p className="texto-bonito mt-3 text-sm text-ink-muted">
              Captação e validação de leads por IA.
            </p>
            <div className="mt-5 flex gap-2">
              <BotaoRede rotulo="LinkedIn da Leedfly" href={REDES.linkedin}>
                <IconeLinkedin />
              </BotaoRede>
              <BotaoRede rotulo="Instagram da Leedfly" href={REDES.instagram}>
                <IconeInstagram />
              </BotaoRede>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-12">
            <ColunaRodape titulo="Produto">
              <a href="#produto">Produto</a>
              <a href="#pratica">Na prática</a>
              <a href="#recursos">Recursos</a>
              <a href="#planos">Planos</a>
            </ColunaRodape>
            <ColunaRodape titulo="Conta">
              <Link href="/em-desenvolvimento">Entrar</Link>
              <Link href="/em-desenvolvimento">Criar conta</Link>
            </ColunaRodape>
          </div>
        </div>

      </div>

      {/* Linha de ponta a ponta da tela, como a do topo do rodapé. */}
      <div className="divisa mt-10 border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pt-6 text-xs text-ink-muted sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Leedfly. Todos os direitos reservados.</span>
          <button
            type="button"
            onClick={() => setTermosAbertos(true)}
            className="w-fit text-left transition-colors duration-200 hover:text-ink"
          >
            Termos de serviço
          </button>
        </div>
      </div>
      <ModalTermos aberto={termosAbertos} aoFechar={() => setTermosAbertos(false)} />

      {/* Assinatura gigante, cortada pela base — o nome como paisagem. */}
      <MarcaGigante />
    </footer>
  );
}

/** Botão redondo com o logo da rede. Sem `href` ainda, fica visível mas não leva a lugar nenhum. */
function BotaoRede({ rotulo, href, children }: { rotulo: string; href: string; children: ReactNode }) {
  return (
    <a
      href={href || undefined}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      aria-label={rotulo}
      className="grid size-10 place-items-center rounded-full bg-ink/5 text-ink-muted ring-1 ring-line/60 transition-all duration-300 ease-fluida hover:-translate-y-0.5 hover:bg-brand-500/15 hover:text-ink hover:ring-brand-500/50 [&_svg]:size-4.5"
    >
      {children}
    </a>
  );
}

function IconeLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
    </svg>
  );
}

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ColunaRodape({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <p className="font-medium text-ink">{titulo}</p>
      <div className="flex flex-col gap-2.5 text-ink-muted [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-ink">
        {children}
      </div>
    </div>
  );
}
