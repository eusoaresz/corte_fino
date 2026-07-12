import { prisma } from "../../lib/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { verificarToken } from "../middlewares/auth";

const router = Router();

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const bloqueioSchema = z.object({
  barbeiroId: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD"),
  horaInicio: z.string().regex(horaRegex).optional().nullable(),
  horaFim: z.string().regex(horaRegex).optional().nullable(),
  motivo: z.string().max(120).optional(),
});

// GET /bloqueios?barbeiroId=&data= — usado pelo admin e pelo cálculo de horários
router.get("/", async (req: Request, res: Response) => {
  try {
    const barbeiroId = req.query.barbeiroId ? Number(req.query.barbeiroId) : undefined;
    const data = req.query.data ? new Date(String(req.query.data)) : undefined;

    const bloqueios = await prisma.bloqueio.findMany({
      where: {
        ...(barbeiroId ? { barbeiroId } : {}),
        ...(data ? { data } : {}),
      },
      orderBy: { data: "asc" },
    });
    res.json(bloqueios);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar bloqueios." });
  }
});

router.post("/", verificarToken, async (req: Request, res: Response) => {
  const parsed = bloqueioSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  const { barbeiroId, data, horaInicio, horaFim, motivo } = parsed.data;

  try {
    const bloqueio = await prisma.bloqueio.create({
      data: {
        barbeiroId,
        data: new Date(data),
        horaInicio: horaInicio ?? null,
        horaFim: horaFim ?? null,
        motivo,
      },
    });
    res.status(201).json(bloqueio);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar bloqueio." });
  }
});

router.delete("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    await prisma.bloqueio.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Bloqueio não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao excluir bloqueio." });
  }
});

export default router;
