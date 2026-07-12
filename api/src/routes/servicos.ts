import { prisma } from "../../lib/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { verificarToken } from "../middlewares/auth";

const router = Router();

const servicoSchema = z.object({
  nome: z.string().min(2).max(60),
  descricao: z.string().max(500).optional(),
  preco: z.number().positive(),
  duracaoMinutos: z.number().int().min(5).max(480),
  ativo: z.boolean().optional(),
});

// GET /servicos — lista pública (não deletados)
router.get("/", async (req: Request, res: Response) => {
  try {
    const somenteAtivos = req.query.ativos === "true";

    const servicos = await prisma.servico.findMany({
      where: {
        deleted: false,
        ...(somenteAtivos ? { ativo: true } : {}),
      },
      orderBy: { nome: "asc" },
    });
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar serviços." });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    const servico = await prisma.servico.findFirst({
      where: { id, deleted: false },
    });

    if (!servico) {
      res.status(404).json({ erro: "Serviço não encontrado." });
      return;
    }

    res.json(servico);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar serviço." });
  }
});

router.post("/", verificarToken, async (req: Request, res: Response) => {
  const parsed = servicoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const servico = await prisma.servico.create({ data: parsed.data });
    res.status(201).json(servico);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar serviço." });
  }
});

router.put("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  const parsed = servicoSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const servico = await prisma.servico.update({
      where: { id },
      data: parsed.data,
    });
    res.json(servico);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Serviço não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao atualizar serviço." });
  }
});

router.delete("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    await prisma.servico.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date(), ativo: false },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Serviço não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao excluir serviço." });
  }
});

export default router;
