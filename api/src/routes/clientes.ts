import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { ReqCliente, verificarCliente } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "segredo_corte_fino";
const SALT_ROUNDS = 10;

const senhaSchema = z.string().min(8, "A senha deve ter no mínimo 8 caracteres");
const cadastroSchema = z.object({
  nome: z.string().min(3).max(60),
  email: z.string().email().max(60),
  telefone: z.string().min(8).max(20),
  senha: senhaSchema,
});
const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(1) });

function respostaLogin(cliente: { id: number; nome: string; email: string; telefone: string }) {
  const token = jwt.sign({ id: cliente.id, email: cliente.email, tipo: "cliente" }, JWT_SECRET, { expiresIn: "8h" });
  return { token, cliente };
}

async function vincularAgendamentosAntigos(clienteId: number, email: string) {
  // Permite que reservas públicas antigas, feitas com o mesmo e-mail, apareçam na conta.
  await prisma.agendamento.updateMany({
    where: { clienteId: null, clienteEmail: { equals: email, mode: "insensitive" } },
    data: { clienteId },
  });
}

router.post("/cadastro", async (req, res) => {
  const parsed = cadastroSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  const { nome, email, telefone, senha } = parsed.data;
  const emailNormalizado = email.trim().toLowerCase();
  const existe = await prisma.cliente.findUnique({ where: { email: emailNormalizado } });
  if (existe) {
    res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
    return;
  }

  const cliente = await prisma.cliente.create({
    data: { nome: nome.trim(), email: emailNormalizado, telefone: telefone.trim(), senha: await bcrypt.hash(senha, SALT_ROUNDS) },
    select: { id: true, nome: true, email: true, telefone: true },
  });
  await vincularAgendamentosAntigos(cliente.id, cliente.email);
  res.status(201).json(respostaLogin(cliente));
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Informe e-mail e senha válidos." });
    return;
  }
  const cliente = await prisma.cliente.findUnique({ where: { email: parsed.data.email.trim().toLowerCase() } });
  if (!cliente || !(await bcrypt.compare(parsed.data.senha, cliente.senha))) {
    res.status(401).json({ erro: "E-mail ou senha inválidos." });
    return;
  }
  await vincularAgendamentosAntigos(cliente.id, cliente.email);
  res.json(respostaLogin(cliente));
});

router.get("/me", verificarCliente, async (req: ReqCliente, res) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: req.clienteId },
    select: { id: true, nome: true, email: true, telefone: true },
  });
  if (!cliente) {
    res.status(404).json({ erro: "Cliente não encontrado." });
    return;
  }
  res.json(cliente);
});

router.get("/me/agendamentos", verificarCliente, async (req: ReqCliente, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    where: { clienteId: req.clienteId },
    include: { barbeiro: true, servico: true },
    orderBy: [{ data: "desc" }, { horaInicio: "desc" }],
  });
  res.json(agendamentos);
});

export default router;
