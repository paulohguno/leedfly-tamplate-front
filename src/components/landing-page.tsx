"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggler } from "@/components/theme-toggler";
import {
  SearchIcon,
  RadarIcon,
  SparkIcon,
  DocumentIcon,
  DashboardIcon,
  DonutIcon,
  ArrowUpIcon,
  LinkIcon,
} from "@/components/icons";
import { SatinFlow } from "@/components/satin-flow";
import { Badge, Brand, ButtonLink, Reveal, Spotlight } from "@/components/ui";
import { cx, step } from "@/lib/utils";

const IN_DEVELOPMENT_PATH = "/em-desenvolvimento";

const FEATURES = [
  {
    Icon: SparkIcon,
    title: "Pontuação por IA",
    text: "Cada lead recebe um score e uma justificativa, cruzando o perfil comercial da sua empresa com o que a busca encontrou.",
  },
  {
    Icon: RadarIcon,
    title: "Busca por região e raio",
    text: "Escolha a cidade, o raio e o que procura, e dispare a captura sob demanda — sem agendamento fixo, sem promessa vaga.",
  },
  {
    Icon: DocumentIcon,
    title: "Nunca o mesmo CNPJ duas vezes",
    text: "Todo CNPJ já capturado ou descartado entra na exclusão automática — e você ainda pode importar sua própria lista de clientes.",
  },
  {
    Icon: DashboardIcon,
    title: "Dashboard completo",
    text: "Métricas de captura, ciclo de uso, distribuição de score e funil de situação, tudo em um painel só.",
  },
  {
    Icon: DonutIcon,
    title: "Funil de situação",
    text: "Acompanhe cada lead do preparo até a validação, com etiquetas de funil que a sua equipe comercial já entende.",
  },
  {
    Icon: LinkIcon,
    title: "Links para o time",
    text: "Compartilhe o dashboard com quem precisa acompanhar — sem criar login, sem dar acesso administrativo.",
  },
] as const;

const USE_CASES = [
  {
    Icon: ArrowUpIcon,
    title: "Impulsione suas vendas",
    text: "Leads validados e com nota de aderência, prontos para a sua equipe abordar — sem perder tempo qualificando planilha na mão.",
  },
  {
    Icon: DonutIcon,
    title: "Análise de mercado",
    text: "Veja a densidade de empresas por segmento e região antes de decidir onde expandir ou abrir uma nova frente.",
  },
  {
    Icon: SearchIcon,
    title: "Busque fornecedores rápido",
    text: "A mesma busca por região e segmento serve para prospectar quem vende para você, não só quem compra.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Configure o perfil da empresa",
    text: "Proposta de valor, público-alvo e ticket médio — é isso que a IA usa para pontuar.",
  },
  {
    number: "02",
    title: "Dispare uma captura",
    text: "Escolha cidade, raio e o que você procura. A busca roda sob demanda, na hora.",
  },
  {
    number: "03",
    title: "Receba leads com nota da IA",
    text: "Cada lead chega com contato, segmento e uma nota de aderência ao seu perfil.",
  },
  {
    number: "04",
    title: "Decida e acompanhe",
    text: "Marque a situação no funil ou descarte — o CNPJ descartado não volta a aparecer.",
  },
] as const;

const PLANS = [
  {
    name: "Start",
    featured: false,
    items: ["150 leads por ciclo", "2 administradores", "2 visitantes", "Validação por IA"],
  },
  {
    name: "Pro",
    featured: true,
    items: [
      "500 leads por ciclo",
      "5 administradores",
      "5 visitantes",
      "Triangulação por grafos",
      "Exportação do dashboard",
    ],
  },
  {
    name: "Scale",
    featured: false,
    items: ["1.500 leads por ciclo", "15 administradores", "15 visitantes", "Métodos de busca dedicados"],
  },
] as const;

const HIGHLIGHTS = [
  { label: "Busca sob demanda", detail: "sem agendamento fixo" },
  { label: "Exclusão automática", detail: "de CNPJ já trabalhado" },
  { label: "Funil de situação", detail: "do jeito que vendas usa" },
  { label: "Acesso de visitante", detail: "sem senha, só o link" },
] as const;

function unsplashPhoto(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

const HERO_PHOTO = unsplashPhoto("1552664730-d307ca884978", 1200);
const RESULT_PHOTO = unsplashPhoto("1600880292203-757bb62b4baf", 1600);
const TEAM_PHOTO = unsplashPhoto("1521737604893-d14cc237f11d", 1200);
const CTA_PHOTO = unsplashPhoto("1556761175-5973dc0f32e7", 1920);

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    function measure() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollableHeight > 0 ? Math.min(100, (window.scrollY / scrollableHeight) * 100) : 0);
      frameId = 0;
    }
    function onScroll() {
      if (frameId) return;
      frameId = requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return progress;
}

export function LandingPage() {
  const progress = useScrollProgress();

  return (
    <div className="relative">
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-0.5 bg-linear-to-r from-brand-400 via-brand-500 to-brand-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, zIndex: "calc(var(--z-nav) + 1)" }}
      />

      <TopBar scrolled={progress > 0.5} />
      <Hero />
      <HighlightsBand />
      <WhyUse />
      <Features />
      <HowItWorks />
      <Result />
      <Plans />
      <FinalCta />
      <Footer />
    </div>
  );
}

function TopBar({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={cx(
        "sticky top-0 border-x-0 border-t-0 transition-all duration-300 ease-fluid",
        scrolled ? "glass-dense shadow-elevated" : "border-transparent bg-transparent",
      )}
      style={{ zIndex: "var(--z-nav)" }}
    >
      <div
        className={cx(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 ease-fluid sm:px-6",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Brand size="md" />

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex">
          <a href="#features" className="transition-colors duration-200 hover:text-ink">
            Recursos
          </a>
          <a href="#how-it-works" className="transition-colors duration-200 hover:text-ink">
            Como funciona
          </a>
          <a href="#plans" className="transition-colors duration-200 hover:text-ink">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggler />
          <ButtonLink href={IN_DEVELOPMENT_PATH} variant="ghost" size="sm">
            Entrar
          </ButtonLink>
          <ButtonLink href={IN_DEVELOPMENT_PATH} variant="primary" size="sm">
            Criar conta
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[72rem]">
        <SatinFlow
          interactive={false}
          scale={16}
          speed={180}
          grain={22}
          className="opacity-70 [mask-image:linear-gradient(to_bottom,black_5%,transparent_62%)]"
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-28">
        <div className="cascade max-w-xl">
          <div style={step(0)}>
            <Badge>Captação de leads com IA</Badge>
          </div>

          <h1
            className="mt-5 text-4xl font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl"
            style={step(1)}
          >
            Leads que a IA já{" "}
            <span className="bg-linear-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              valida
            </span>{" "}
            pelo perfil da sua empresa.
          </h1>

          <p className="mt-5 max-w-lg text-base text-pretty text-ink-muted sm:text-lg" style={step(2)}>
            Busque por região e raio, deixe a IA cruzar com o seu perfil comercial e receba só quem
            faz sentido — sem duplicar CNPJ que você já trabalhou.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3" style={step(3)}>
            <ButtonLink href={IN_DEVELOPMENT_PATH} size="md" icon="→">
              Criar conta gratuita
            </ButtonLink>
            <ButtonLink href={IN_DEVELOPMENT_PATH} variant="secondary" size="md">
              Já tenho conta
            </ButtonLink>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm" style={step(4)}>
            {["Validação por IA", "Zero CNPJ duplicado", "Painel em tempo real"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-ink-muted">
                <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
                {item}
              </div>
            ))}
          </dl>
        </div>

        <Reveal delay={120} className="relative">
          <Spotlight className="glass card-shadow group relative rounded-3xl p-2.5">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={HERO_PHOTO}
                alt="Equipe planejando a estratégia de captação de leads em um quadro de ideias"
                width={1200}
                height={900}
                fetchPriority="high"
                className="aspect-4/3 w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-scrim/60 via-transparent to-transparent" />
            </div>

            <div className="animate-float glass-dense absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-floating">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ok-soft text-ok">
                <SparkIcon className="size-5" />
              </span>
              <div>
                <p className="text-lg font-bold tabular-nums text-ink">92</p>
                <p className="text-xs text-ink-muted">Aderência ao perfil</p>
              </div>
            </div>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}

function HighlightsBand() {
  return (
    <section className="divider border-y bg-surface-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
        {HIGHLIGHTS.map((highlight, index) => (
          <Reveal key={highlight.label} delay={index * 70} className="text-center sm:text-left">
            <p className="text-sm font-semibold text-ink">{highlight.label}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{highlight.detail}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function WhyUse() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal as="div" className="mx-auto max-w-2xl text-center">
        <Badge>Para que usar</Badge>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
          Uma busca, três formas de vender mais
        </h2>
        <p className="mt-4 text-base text-pretty text-ink-muted">
          A mesma IA que valida leads também mapeia o mercado e encontra fornecedores.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {USE_CASES.map((useCase, index) => (
          <Reveal key={useCase.title} delay={index * 100}>
            <Spotlight className="glass card-shadow lift group h-full rounded-2xl p-7 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 transition-transform duration-300 ease-fluid group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:rotate-6">
                <useCase.Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{useCase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{useCase.text}</p>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal as="div" className="mx-auto max-w-2xl text-center">
        <Badge>Recursos</Badge>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
          Tudo que a captação manual custava caro para fazer bem
        </h2>
        <p className="mt-4 text-base text-pretty text-ink-muted">
          A plataforma cuida da busca, da validação e da higiene da base — a sua equipe cuida da
          conversa.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 3) * 90}>
            <Spotlight className="glass card-shadow lift group h-full rounded-2xl p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-500/12 text-brand-600 transition-transform duration-300 ease-fluid group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:rotate-6">
                <feature.Icon className="size-5.5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{feature.text}</p>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="divider border-t bg-surface-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Reveal>
              <Badge>Como funciona</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
                Do perfil da empresa ao lead qualificado, em quatro passos
              </h2>
            </Reveal>

            <ol className="mt-10 space-y-8">
              {STEPS.map((item, index) => (
                <Reveal key={item.number} delay={index * 90} as="li" className="flex gap-4">
                  <span className="font-mono text-sm font-semibold text-brand-500 tabular-nums">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-muted">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal delay={120}>
            <div className="group glass card-shadow overflow-hidden rounded-3xl">
              <img
                src={TEAM_PHOTO}
                alt="Time revisando leads capturados em laptops"
                width={1200}
                height={1500}
                loading="lazy"
                className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Result() {
  return (
    <section className="relative">
      <Reveal as="div" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="glass card-shadow relative overflow-hidden rounded-3xl">
          <img
            src={RESULT_PHOTO}
            alt="Dupla comemorando o fechamento de uma venda"
            width={1600}
            height={900}
            loading="lazy"
            className="aspect-21/9 w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-scrim/90 via-scrim/55 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-md px-8 sm:px-12">
              <h2 className="text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
                Menos tempo filtrando planilha, mais tempo fechando negócio.
              </h2>
              <p className="mt-3 text-sm text-pretty text-white/80 sm:text-base">
                A IA já entrega o lead com nota e justificativa — sua equipe decide rápido o que
                vale ligar primeiro.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Plans() {
  return (
    <section id="plans" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal as="div" className="mx-auto max-w-2xl text-center">
        <Badge>Planos</Badge>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
          Uma cota que cresce junto com a sua operação
        </h2>
        <p className="mt-4 text-base text-pretty text-ink-muted">
          Cota de leads por ciclo, sem taxa de captura por fora. Cancele quando quiser.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 90} className="relative h-full">
            {plan.featured && (
              <div
                aria-hidden
                className="animate-pulse-soft absolute -inset-3 -z-10 rounded-[2rem] bg-brand-500/40 blur-2xl"
                style={{ animationDuration: "4s" }}
              />
            )}

            <div
              className={cx(
                "relative flex h-full flex-col rounded-3xl p-8 transition-transform duration-300 ease-fluid hover:-translate-y-1.5",
                plan.featured
                  ? "bg-linear-to-b from-brand-600 to-brand-500 text-white shadow-[0_24px_60px_-20px_var(--color-brand-600)]"
                  : "glass card-shadow text-ink",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-elevated">
                  Mais popular
                </span>
              )}

              <h3 className={cx("text-lg font-semibold", plan.featured ? "text-white" : "text-ink")}>
                {plan.name}
              </h3>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden className={cx("mt-0.5", plan.featured ? "text-white" : "text-brand-500")}>
                      ✓
                    </span>
                    <span className={plan.featured ? "text-white/90" : "text-ink-muted"}>{item}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={IN_DEVELOPMENT_PATH}
                variant={plan.featured ? "secondary" : "primary"}
                className={cx(
                  "mt-8 w-full justify-center",
                  plan.featured && "!bg-white !text-brand-600 hover:!bg-white/90",
                )}
              >
                Começar com {plan.name}
              </ButtonLink>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={CTA_PHOTO}
            alt="Apresentação de resultados para o time"
            width={1920}
            height={800}
            loading="lazy"
            className="aspect-21/9 w-full object-cover"
          />
          <div className="absolute inset-0 bg-scrim/80" />
          <div className="absolute inset-0 bg-linear-to-t from-scrim/50 via-transparent to-scrim/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h2 className="max-w-xl text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
              Comece a validar leads com IA hoje
            </h2>
            <p className="mt-3 max-w-md text-sm text-pretty text-white/80">
              Cadastre a empresa, configure o perfil e dispare a primeira captura ainda hoje.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={IN_DEVELOPMENT_PATH} icon="→">
                Criar conta gratuita
              </ButtonLink>
              <ButtonLink
                href={IN_DEVELOPMENT_PATH}
                variant="secondary"
                className="!border !border-white/40 !bg-white/15 !text-white hover:!bg-white/25"
              >
                Já tenho conta
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="divider border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Brand size="md" />
            <p className="mt-3 text-sm text-pretty text-ink-muted">
              Captação e validação de leads por IA, com região, raio e perfil comercial de verdade.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-12">
            <FooterColumn title="Produto">
              <a href="#features">Recursos</a>
              <a href="#how-it-works">Como funciona</a>
              <a href="#plans">Planos</a>
            </FooterColumn>
            <FooterColumn title="Conta">
              <Link href={IN_DEVELOPMENT_PATH}>Entrar</Link>
              <Link href={IN_DEVELOPMENT_PATH}>Criar conta</Link>
            </FooterColumn>
          </div>
        </div>

        <div className="divider mt-10 border-t pt-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} Leedfly. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <p className="font-medium text-ink">{title}</p>
      <div className="flex flex-col gap-2.5 text-ink-muted [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-ink">
        {children}
      </div>
    </div>
  );
}
