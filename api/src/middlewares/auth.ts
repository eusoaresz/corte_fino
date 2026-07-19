import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET ?? "segredo_corte_fino";

export interface ReqUsuario extends Request {
  usuarioId?: number;
  usuarioEmail?: string;
}

export interface ReqCliente extends Request {
  clienteId?: number;
  clienteEmail?: string;
}

export async function verificarToken(
  req: ReqUsuario,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Token não informado" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; tipo?: string };
    if (payload.tipo && payload.tipo !== "admin") throw new Error("Token de cliente");
    req.usuarioId = payload.id;
    req.usuarioEmail = payload.email;
    next();
  } catch {
    try {
      const decoded = jwt.decode(token) as { id?: number } | null;
      if (decoded?.id) {
        await prisma.log.create({
          data: {
            usuarioId: decoded.id,
            acao: "ACESSO_NEGADO",
            detalhes: "Token inválido ou expirado",
            ip: req.ip,
          },
        });
      }
    } catch {
      // silencia erros do log para não bloquear a resposta
    }

    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

export function verificarCliente(req: ReqCliente, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Faça login para continuar." });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; tipo?: string };
    if (payload.tipo !== "cliente") throw new Error("Token inválido para cliente");
    req.clienteId = payload.id;
    req.clienteEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ erro: "Sua sessão expirou. Faça login novamente." });
  }
}
