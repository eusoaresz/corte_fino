import { prisma } from "../../lib/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { verificarToken } from "../middlewares/auth";
import { paraMinutos } from "../utils/horarios";

const router = Router();

const diaSemanaEnum = z.enum([
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
]);

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const disponibilidadeSchema = z
  .object({
    barbeiroId: z.number().int().positive(),
    diaSemana: diaSemanaEnum,
    horaInicio: z.string().regex(horaRegex, "Use o formato HH:MM"),
    horaFim: z.string().regex(horaRegex, "Use o formato HH:MM"),
    intervaloMinutos: z.number().int().min(5).max(240).optional(),
  })
  .refine((d) => paraMinutos(d.horaInicio) < paraMinutos(d.horaFim), {
    message: "horaInicio deve ser antes de horaFim",
    path: ["horaFim"],
  });

// GET /disponibilidades?barbeiroId= — pode ser usado tanto pelo admin quanto
// pela tela pública para saber quais dias o barbeiro atende.
router.get("/", async (req: Request, res: Response) => {
  try {
    const barbeiroId = req.query.barbeiroId ? Number(req.query.barbeiroId) : undefined;

    const disponibilidades = await prisma.disponibilidade.findMany({
      where: barbeiroId ? { barbeiroId } : {},
      orderBy: [{ barbeiroId: "asc" }, { diaSemana: "asc" }, { horaInicio: "asc" }],
    });
    res.json(disponibilidades);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar disponibilidades." });
  }
});

router.post("/", verificarToken, async (req: Request, res: Response) => {
  const parsed = disponibilidadeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const disponibilidade = await prisma.disponibilidade.create({ data: parsed.data });
    res.status(201).json(disponibilidade);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ erro: "Já existe uma janela com esse horário de início nesse dia." });
      return;
    }
    res.status(500).json({ erro: "Erro ao criar disponibilidade." });
  }
});

router.put("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  const parsed = disponibilidadeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const disponibilidade = await prisma.disponibilidade.update({
      where: { id },
      data: parsed.data,
    });
    res.json(disponibilidade);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Disponibilidade não encontrada." });
      return;
    }
    res.status(500).json({ erro: "Erro ao atualizar disponibilidade." });
  }
});

router.delete("/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    await prisma.disponibilidade.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ erro: "Disponibilidade não encontrada." });
      return;
    }
    res.status(500).json({ erro: "Erro ao excluir disponibilidade." });
  }
});

export default router;
