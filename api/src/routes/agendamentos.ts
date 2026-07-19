import { prisma } from "../../lib/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { ReqCliente, verificarCliente, verificarToken } from "../middlewares/auth";
import {
  diaSemanaDe,
  gerarSlotsDisponiveis,
  paraMinutos,
  paraHHMM,
  Intervalo,
} from "../utils/horarios";

const router = Router();

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Monta os intervalos ocupados (bloqueios + agendamentos confirmados) de um barbeiro em uma data. */
async function calcularOcupados(barbeiroId: number, data: Date, ignorarAgendamentoId?: number) {
  const [bloqueios, agendamentos] = await Promise.all([
    prisma.bloqueio.findMany({ where: { barbeiroId, data } }),
    prisma.agendamento.findMany({
      where: {
        barbeiroId,
        data,
        status: "CONFIRMADO",
        ...(ignorarAgendamentoId ? { id: { not: ignorarAgendamentoId } } : {}),
      },
    }),
  ]);

  // Bloqueio sem hora definida = dia inteiro indisponível (0h às 24h)
  const diaTodoBloqueado = bloqueios.some((b) => !b.horaInicio || !b.horaFim);

  const ocupados: Intervalo[] = diaTodoBloqueado
    ? [{ inicio: 0, fim: 24 * 60 }]
    : [
        ...bloqueios.map((b) => ({
          inicio: paraMinutos(b.horaInicio!),
          fim: paraMinutos(b.horaFim!),
        })),
        ...agendamentos.map((a) => ({
          inicio: paraMinutos(a.horaInicio),
          fim: paraMinutos(a.horaFim),
        })),
      ];

  return ocupados;
}

// ── GET /agendamentos/horarios-disponiveis — cálculo público de disponibilidade real ──

router.get("/horarios-disponiveis", async (req: Request, res: Response) => {
  const barbeiroId = Number(req.query.barbeiroId);
  const servicoId = Number(req.query.servicoId);
  const dataStr = String(req.query.data ?? "");

  if (!barbeiroId || !servicoId || !dataRegex.test(dataStr)) {
    res.status(400).json({ erro: "Informe barbeiroId, servicoId e data (AAAA-MM-DD) válidos." });
    return;
  }

  try {
    const servico = await prisma.servico.findFirst({
      where: { id: servicoId, deleted: false },
    });
    if (!servico) {
      res.status(404).json({ erro: "Serviço não encontrado." });
      return;
    }

    const data = new Date(`${dataStr}T00:00:00.000Z`);
    const diaSemana = diaSemanaDe(data);

    const janelas = await prisma.disponibilidade.findMany({
      where: { barbeiroId, diaSemana },
    });

    if (janelas.length === 0) {
      res.json({ horarios: [] });
      return;
    }

    const ocupados = await calcularOcupados(barbeiroId, data);

    // Se a data for hoje, não sugerir horários que já passaram
    const agora = new Date();
    const ehHoje = agora.toISOString().split("T")[0] === dataStr;
    const minutosMinimos = ehHoje ? agora.getUTCHours() * 60 + agora.getUTCMinutes() : undefined;

    const horarios = gerarSlotsDisponiveis({
      janelas,
      duracaoServicoMinutos: servico.duracaoMinutos,
      ocupados,
      minutosMinimos,
    });

    res.json({ horarios, duracaoMinutos: servico.duracaoMinutos });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao calcular horários disponíveis." });
  }
});

// ── POST /agendamentos — criação pública (fluxo do cliente) ─────────────

const criarAgendamentoSchema = z.object({
  barbeiroId: z.number().int().positive(),
  servicoId: z.number().int().positive(),
  data: z.string().regex(dataRegex),
  horaInicio: z.string().regex(horaRegex),
  observacoes: z.string().max(500).optional(),
});

router.post("/", verificarCliente, async (req: ReqCliente, res: Response) => {
  const parsed = criarAgendamentoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  const { barbeiroId, servicoId, data, horaInicio, observacoes } = parsed.data;

  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: req.clienteId } });
    if (!cliente) {
      res.status(401).json({ erro: "Cliente não encontrado. Faça login novamente." });
      return;
    }
    const servico = await prisma.servico.findFirst({ where: { id: servicoId, deleted: false } });
    if (!servico) {
      res.status(404).json({ erro: "Serviço não encontrado." });
      return;
    }

    const barbeiro = await prisma.barbeiro.findFirst({ where: { id: barbeiroId, deleted: false } });
    if (!barbeiro) {
      res.status(404).json({ erro: "Barbeiro não encontrado." });
      return;
    }

    const dataObj = new Date(`${data}T00:00:00.000Z`);
    const diaSemana = diaSemanaDe(dataObj);

    const janelas = await prisma.disponibilidade.findMany({ where: { barbeiroId, diaSemana } });
    const ocupados = await calcularOcupados(barbeiroId, dataObj);

    const horariosValidos = gerarSlotsDisponiveis({
      janelas,
      duracaoServicoMinutos: servico.duracaoMinutos,
      ocupados,
    });

    if (!horariosValidos.includes(horaInicio)) {
      res.status(409).json({ erro: "Esse horário não está mais disponível. Escolha outro horário." });
      return;
    }

    const horaFim = paraHHMM(paraMinutos(horaInicio) + servico.duracaoMinutos);

    const agendamento = await prisma.agendamento.create({
      data: {
        barbeiroId,
        servicoId,
        data: dataObj,
        horaInicio,
        horaFim,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteTelefone: cliente.telefone,
        clienteEmail: cliente.email,
        observacoes,
      },
      include: { barbeiro: true, servico: true },
    });

    res.status(201).json(agendamento);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ erro: "Esse horário acabou de ser reservado. Escolha outro horário." });
      return;
    }
    res.status(500).json({ erro: "Erro ao criar agendamento." });
  }
});

// ── GET /agendamentos — listagem administrativa (protegida) ─────────────

router.get("/", verificarToken, async (req: Request, res: Response) => {
  try {
    const barbeiroId = req.query.barbeiroId ? Number(req.query.barbeiroId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const data = req.query.data && dataRegex.test(String(req.query.data))
      ? new Date(`${req.query.data}T00:00:00.000Z`)
      : undefined;

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        ...(barbeiroId ? { barbeiroId } : {}),
        ...(status ? { status: status as any } : {}),
        ...(data ? { data } : {}),
      },
      include: { barbeiro: true, servico: true },
      orderBy: [{ data: "asc" }, { horaInicio: "asc" }],
    });

    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar agendamentos." });
  }
});

// ── PATCH /agendamentos/:id/cancelar — protegida ─────────────────────────

router.patch("/:id/cancelar", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: { status: "CANCELADO" },
    });
    res.json(agendamento);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Agendamento não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao cancelar agendamento." });
  }
});

// ── PATCH /agendamentos/:id/reagendar — protegida ────────────────────────

const reagendarSchema = z.object({
  data: z.string().regex(dataRegex),
  horaInicio: z.string().regex(horaRegex),
});

router.patch("/:id/reagendar", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  const parsed = reagendarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const atual = await prisma.agendamento.findUnique({ where: { id }, include: { servico: true } });
    if (!atual) {
      res.status(404).json({ erro: "Agendamento não encontrado." });
      return;
    }

    const { data, horaInicio } = parsed.data;
    const dataObj = new Date(`${data}T00:00:00.000Z`);
    const diaSemana = diaSemanaDe(dataObj);

    const janelas = await prisma.disponibilidade.findMany({
      where: { barbeiroId: atual.barbeiroId, diaSemana },
    });
    const ocupados = await calcularOcupados(atual.barbeiroId, dataObj, id);

    const horariosValidos = gerarSlotsDisponiveis({
      janelas,
      duracaoServicoMinutos: atual.servico.duracaoMinutos,
      ocupados,
    });

    if (!horariosValidos.includes(horaInicio)) {
      res.status(409).json({ erro: "Esse horário não está disponível para reagendamento." });
      return;
    }

    const horaFim = paraHHMM(paraMinutos(horaInicio) + atual.servico.duracaoMinutos);

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: { data: dataObj, horaInicio, horaFim, status: "CONFIRMADO" },
      include: { barbeiro: true, servico: true },
    });

    res.json(agendamento);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ erro: "Esse horário acabou de ser reservado. Escolha outro horário." });
      return;
    }
    res.status(500).json({ erro: "Erro ao reagendar." });
  }
});

export default router;
