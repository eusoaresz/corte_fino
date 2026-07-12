# Corte Fino — API

API backend em Node.js com Express, TypeScript, Prisma e MySQL/MariaDB para gerenciamento da
barbearia: barbeiros, serviços, disponibilidade (dias/horários e bloqueios) e agendamentos.

## Tecnologias

- Node.js + Express 5
- TypeScript
- Prisma 7 (adapter MariaDB)
- MySQL/MariaDB
- Zod (validação)
- JWT + bcrypt (login administrativo)
- Nodemailer (recuperação de senha)

## Estrutura

```
api/
  lib/               # Prisma client, mailer
  prisma/
    schema.prisma    # Modelo do banco
    seed.ts          # Dados iniciais (2 barbeiros, serviços, grade de horários, admin)
    migrations/
  src/
    middlewares/      # auth (JWT)
    routes/           # barbeiros, servicos, disponibilidade, bloqueios, agendamentos, usuarios
    utils/horarios.ts # cálculo de horários disponíveis
    server.ts
```

## Passo a passo

### 1) Instalar dependências

```bash
npm install
```

### 2) Configurar o `.env`

Copie `.env.example` para `.env` e ajuste os dados de conexão do MySQL/MariaDB e o `JWT_SECRET`.

### 3) Criar o banco e rodar as migrations

```bash
npx prisma migrate dev --name init
```

### 4) Popular o banco (opcional, mas recomendado)

```bash
npm run seed
```

Isso cria:
- Um usuário administrador: `admin@cortefino.com` / senha `Admin@123`
- 2 barbeiros (Carlos e João)
- 8 serviços (incluindo combos)
- Grade de disponibilidade de segunda a sábado (09h–12h e 13h30–18h) para os 2 barbeiros

### 5) Rodar o servidor

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

## Rotas principais

| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| GET | `/barbeiros` | Lista barbeiros (não deletados) | Não |
| GET | `/barbeiros/:id` | Detalhe de um barbeiro | Não |
| POST/PUT/DELETE | `/barbeiros` | Criar/editar/remover (soft delete) | Sim |
| GET | `/servicos` | Lista serviços | Não |
| POST/PUT/DELETE | `/servicos` | Criar/editar/remover (soft delete) | Sim |
| GET | `/disponibilidades?barbeiroId=` | Grade semanal de um barbeiro | Não |
| POST/PUT/DELETE | `/disponibilidades` | Gerenciar a grade semanal | Sim |
| GET | `/bloqueios?barbeiroId=&data=` | Bloqueios (folgas, pausas) | Não |
| POST/DELETE | `/bloqueios` | Criar/remover bloqueio | Sim |
| GET | `/agendamentos/horarios-disponiveis?barbeiroId=&servicoId=&data=` | Calcula horários livres reais | Não |
| POST | `/agendamentos` | Cliente cria um agendamento | Não |
| GET | `/agendamentos?barbeiroId=&data=&status=` | Lista agendamentos (painel admin) | Sim |
| PATCH | `/agendamentos/:id/cancelar` | Cancela um agendamento | Sim |
| PATCH | `/agendamentos/:id/reagendar` | Reagenda (nova data/hora) | Sim |
| POST | `/usuarios/login` | Login administrativo (retorna JWT) | Não |
| POST | `/usuarios/recuperar-senha` / `/redefinir-senha` | Recuperação de senha | Não |

Rotas protegidas exigem o header `Authorization: Bearer <token>` obtido em `/usuarios/login`.

## Como o cálculo de horários funciona

Para uma data, o backend:
1. Descobre o dia da semana e busca as janelas de `disponibilidade` do barbeiro para aquele dia.
2. Gera horários de início dentro dessas janelas, respeitando a duração do serviço escolhido.
3. Remove horários que colidem com `bloqueios` (folgas, pausas, feriados) e com `agendamentos`
   já confirmados para aquele barbeiro naquela data.
4. Se a data for hoje, remove horários que já passaram.

Isso garante que a agenda pública mostrada ao cliente reflita a disponibilidade real cadastrada
pelo administrador, e não uma lista fixa de horários.
