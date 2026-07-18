-- PostgreSQL migration generated for initial schema

CREATE TABLE "barbeiros" (
    "id" serial PRIMARY KEY,
    "nome" varchar(60) NOT NULL,
    "descricao" text,
    "foto" varchar(255),
    "ativo" boolean NOT NULL DEFAULT true,
    "deleted" boolean NOT NULL DEFAULT false,
    "deleted_at" timestamp(3),
    "criado_em" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE "servicos" (
    "id" serial PRIMARY KEY,
    "nome" varchar(60) NOT NULL,
    "descricao" text,
    "preco" numeric(9,2) NOT NULL,
    "duracao_minutos" integer NOT NULL,
    "ativo" boolean NOT NULL DEFAULT true,
    "deleted" boolean NOT NULL DEFAULT false,
    "deleted_at" timestamp(3)
);

CREATE TYPE dia_semana AS ENUM ('DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO');

CREATE TABLE "disponibilidades" (
    "id" serial PRIMARY KEY,
    "barbeiro_id" integer NOT NULL,
    "dia_semana" dia_semana NOT NULL,
    "hora_inicio" varchar(5) NOT NULL,
    "hora_fim" varchar(5) NOT NULL,
    "intervalo_minutos" integer NOT NULL DEFAULT 30
);

CREATE UNIQUE INDEX "disponibilidades_barbeiro_id_dia_semana_hora_inicio_key" ON "disponibilidades" ("barbeiro_id","dia_semana","hora_inicio");

CREATE TABLE "bloqueios" (
    "id" serial PRIMARY KEY,
    "barbeiro_id" integer NOT NULL,
    "data" date NOT NULL,
    "hora_inicio" varchar(5),
    "hora_fim" varchar(5),
    "motivo" varchar(120)
);

CREATE TYPE status_agendamento AS ENUM ('CONFIRMADO','CANCELADO','CONCLUIDO');

CREATE TABLE "agendamentos" (
    "id" serial PRIMARY KEY,
    "barbeiro_id" integer NOT NULL,
    "servico_id" integer NOT NULL,
    "cliente_nome" varchar(60) NOT NULL,
    "cliente_telefone" varchar(20) NOT NULL,
    "cliente_email" varchar(60),
    "data" date NOT NULL,
    "hora_inicio" varchar(5) NOT NULL,
    "hora_fim" varchar(5) NOT NULL,
    "status" status_agendamento NOT NULL DEFAULT 'CONFIRMADO',
    "observacoes" text,
    "criado_em" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "atualizado_em" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE UNIQUE INDEX "agendamentos_barbeiro_id_data_hora_inicio_key" ON "agendamentos" ("barbeiro_id","data","hora_inicio");

CREATE TABLE "usuarios" (
    "id" serial PRIMARY KEY,
    "nome" varchar(60) NOT NULL,
    "email" varchar(60) NOT NULL,
    "senha" varchar(255) NOT NULL,
    "ultimo_login" timestamp(3),
    "primeiro_acesso" boolean NOT NULL DEFAULT true,
    "codigo_recuperacao" varchar(10),
    "codigo_expiracao" timestamp(3)
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios" ("email");

CREATE TABLE "logs" (
    "id" serial PRIMARY KEY,
    "usuario_id" integer NOT NULL,
    "acao" varchar(100) NOT NULL,
    "detalhes" text,
    "ip" varchar(45),
    "criado_em" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bloqueios" ADD CONSTRAINT "bloqueios_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "logs" ADD CONSTRAINT "logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
