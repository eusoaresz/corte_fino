import { prisma } from "../../lib/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { verificarToken } from "../middlewares/auth";

const router = Router();

const barbeiroSchema = z.object({
  nome: z.string().min(2).max(60),
  descricao: z.string().max(500).optional(),
  foto: z.string().max(255).optional(),
  ativo: z.boolean().optional(),
});

// GET /barbeiros — lista pública (não deletados)
router.get("/", async (req: Request, res: Response) => {
  try {
    const somenteAtivos = req.query.ativos === "true";

    const barbeiros = await prisma.barbeiro.findMany({
      where: {
        deleted: false,
        ...(somenteAtivos ? { ativo: true } : {}),
      },
      orderBy: { nome: "asc" },
    });
    res.json(barbeiros);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar barbeiros." });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    const barbeiro = await prisma.barbeiro.findFirst({
      where: { id, deleted: false },
      include: { disponibilidades: true },
    });

    if (!barbeiro) {
      res.status(404).json({ erro: "Barbeiro não encontrado." });
      return;
    }

    res.json(barbeiro);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar barbeiro." });
  }
});

// POST /barbeiros — protegido (admin)
router.post("/", verificarToken, async (req: Request, res: Response) => {
  const parsed = barbeiroSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const barbeiro = await prisma.barbeiro.create({ data: parsed.data });
    res.status(201).json(barbeiro);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar barbeiro." });
  }
});

// PUT /barbeiros/:id — protegido (admin)
router.put("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  const parsed = barbeiroSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const barbeiro = await prisma.barbeiro.update({
      where: { id },
      data: parsed.data,
    });
    res.json(barbeiro);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Barbeiro não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao atualizar barbeiro." });
  }
});

// DELETE /barbeiros/:id — protegido (admin), soft delete
router.delete("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    await prisma.barbeiro.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date(), ativo: false },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Barbeiro não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao excluir barbeiro." });
  }
});

export default router;
