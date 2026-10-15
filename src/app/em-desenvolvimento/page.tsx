import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Brand, ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Em desenvolvimento — Leedfly" };

export default function InDevelopmentPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label="Voltar para a página inicial">
        <Brand size="md" />
      </Link>

      <div className="glass card-shadow mt-10 w-full max-w-lg rounded-3xl px-8 py-12">
        <Badge>Em breve</Badge>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
          Em desenvolvimento
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base text-pretty text-ink-muted">
          Estamos finalizando esta parte da plataforma. Volte em breve para criar sua conta e
          começar a captar leads com IA.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/" variant="secondary">
            ← Voltar para a página inicial
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
