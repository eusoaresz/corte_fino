import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const DIAS_UTEIS = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const;

async function main() {
  console.log("Seed: iniciando...");

  // ── Usuário administrador ────────────────────────────────────────────
  const senhaHash = await bcrypt.hash("Admin@123", 10);
  await prisma.usuario.upsert({
    where: { email: "admin@cortefino.com" },
    update: {},
    create: { nome: "Administrador", email: "admin@cortefino.com", senha: senhaHash },
  });

  // ── Barbeiros ─────────────────────────────────────────────────────────
  const carlos = await prisma.barbeiro.create({
    data: {
      nome: "Carlos",
      foto: "homem1.jpg",
      descricao:
        "Especialista em cortes modernos, estilo urbano e desafios criativos. Ideal para quem quer mudar o visual com personalidade.",
    },
  });

  const joao = await prisma.barbeiro.create({
    data: {
      nome: "João",
      foto: "homem2.jpg",
      descricao:
        "Focado em cortes clássicos, alinhados e tradicionais. Excelente para quem busca um estilo elegante e bem definido.",
    },
  });

  // ── Serviços ──────────────────────────────────────────────────────────
  const servicos = await Promise.all([
    prisma.servico.create({ data: { nome: "Corte de Cabelo", preco: 40, duracaoMinutos: 30 } }),
    prisma.servico.create({ data: { nome: "Barba", preco: 30, duracaoMinutos: 20 } }),
    prisma.servico.create({ data: { nome: "Hidratação", preco: 20, duracaoMinutos: 20 } }),
    prisma.servico.create({ data: { nome: "Sobrancelha", preco: 15, duracaoMinutos: 10 } }),
    prisma.servico.create({ data: { nome: "Corte de Cabelo (Combo)", preco: 60, duracaoMinutos: 50 } }),
    prisma.servico.create({ data: { nome: "Barba + Corte (Combo)", preco: 65, duracaoMinutos: 50 } }),
    prisma.servico.create({ data: { nome: "Hidratação + Corte (Combo)", preco: 55, duracaoMinutos: 50 } }),
    prisma.servico.create({ data: { nome: "Sobrancelha + Corte (Combo)", preco: 50, duracaoMinutos: 40 } }),
  ]);

  // ── Disponibilidade (segunda a sábado, 09h-12h e 13h30-18h) ──────────
  for (const barbeiro of [carlos, joao]) {
    for (const dia of DIAS_UTEIS) {
      await prisma.disponibilidade.createMany({
        data: [
          { barbeiroId: barbeiro.id, diaSemana: dia, horaInicio: "09:00", horaFim: "12:00", intervaloMinutos: 30 },
          { barbeiroId: barbeiro.id, diaSemana: dia, horaInicio: "13:30", horaFim: "18:00", intervaloMinutos: 30 },
        ],
      });
    }
  }

  console.log("Seed: concluído.");
  console.log(`Login admin -> email: admin@cortefino.com | senha: Admin@123`);
  console.log(`Barbeiros: ${carlos.nome} (id ${carlos.id}), ${joao.nome} (id ${joao.id})`);
  console.log(`Serviços cadastrados: ${servicos.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
