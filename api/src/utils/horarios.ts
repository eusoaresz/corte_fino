import { DiaSemana } from "../../generated/prisma/client";

const DIAS_SEMANA: DiaSemana[] = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
];

/** Converte uma data (0=domingo ... 6=sábado) no enum DiaSemana do Prisma. */
export function diaSemanaDe(data: Date): DiaSemana {
  return DIAS_SEMANA[data.getUTCDay()];
}

/** "09:30" -> 570 (minutos desde 00:00) */
export function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 570 -> "09:30" */
export function paraHHMM(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export interface Intervalo {
  inicio: number;
  fim: number;
}

/** Verifica se dois intervalos [inicio, fim) se sobrepõem. */
export function sobrepoe(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

/**
 * Gera os horários de início possíveis dentro de uma janela de disponibilidade,
 * dado a duração do serviço e removendo os que colidem com bloqueios/agendamentos existentes.
 */
export function gerarSlotsDisponiveis(params: {
  janelas: { horaInicio: string; horaFim: string; intervaloMinutos: number }[];
  duracaoServicoMinutos: number;
  ocupados: Intervalo[]; // bloqueios + agendamentos já convertidos em minutos
  minutosMinimos?: number; // usado para não sugerir horários no passado (hoje)
}): string[] {
  const { janelas, duracaoServicoMinutos, ocupados, minutosMinimos } = params;
  const slots = new Set<string>();

  for (const janela of janelas) {
    const inicioJanela = paraMinutos(janela.horaInicio);
    const fimJanela = paraMinutos(janela.horaFim);
    const passo = janela.intervaloMinutos || 30;

    for (
      let inicio = inicioJanela;
      inicio + duracaoServicoMinutos <= fimJanela;
      inicio += passo
    ) {
      if (minutosMinimos !== undefined && inicio < minutosMinimos) continue;

      const candidato: Intervalo = { inicio, fim: inicio + duracaoServicoMinutos };
      const colide = ocupados.some((o) => sobrepoe(candidato, o));

      if (!colide) {
        slots.add(paraHHMM(inicio));
      }
    }
  }

  return Array.from(slots).sort();
}
