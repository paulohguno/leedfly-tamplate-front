"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ModalTermos({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Termos de Serviço"
      descricao="Última atualização: setembro de 2026."
      rodape={<Button onClick={aoFechar}>Entendi</Button>}
    >
      <div className="space-y-4 text-sm text-ink-muted">
        <p>
          Ao criar uma conta na Leedfly, você concorda com estes Termos de Serviço. Leia com
          atenção antes de continuar.
        </p>
        <div>
          <p className="font-medium text-ink">1. Uso da plataforma</p>
          <p>
            A Leedfly fornece ferramentas de captura e qualificação de leads. Você é responsável
            pelos dados inseridos e pelo uso adequado das informações capturadas, respeitando a
            legislação aplicável de proteção de dados.
          </p>
        </div>
        <div>
          <p className="font-medium text-ink">2. Conta e segurança</p>
          <p>
            Você é responsável por manter a confidencialidade das credenciais da sua conta e por
            todas as atividades realizadas nela.
          </p>
        </div>
        <div>
          <p className="font-medium text-ink">3. Assinatura e cobrança</p>
          <p>
            O acesso a determinados recursos depende de um plano ativo. Os detalhes de cota,
            renovação e cancelamento estão descritos na área de Assinatura da plataforma.
          </p>
        </div>
        <div>
          <p className="font-medium text-ink">4. Privacidade</p>
          <p>
            O tratamento de dados pessoais segue a nossa Política de Privacidade, disponível a
            qualquer momento dentro da plataforma.
          </p>
        </div>
        <div>
          <p className="font-medium text-ink">5. Alterações</p>
          <p>
            Estes termos podem ser atualizados periodicamente. Mudanças relevantes serão
            comunicadas por e-mail ou dentro do produto.
          </p>
        </div>
      </div>
    </Modal>
  );
}
