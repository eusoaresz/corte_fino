# Corte Fino — Barbearia

Sistema completo de agendamento para barbearia: site público para o cliente marcar
horário e painel administrativo para gerenciar barbeiros, serviços, disponibilidade
e agendamentos. Projeto dividido em backend (API) e frontend (site), cada um na sua
própria pasta.

```
corte_fino/
  api/   → Backend  — Node.js + Express + TypeScript + Prisma + MySQL/MariaDB
  web/   → Frontend — React + Vite + Tailwind CSS
```

## Visão geral

- **Área pública**: o cliente escolhe o serviço e/ou o barbeiro, vê apenas os
  horários realmente disponíveis (calculados a partir da grade semanal do
  barbeiro, dos bloqueios e dos agendamentos já confirmados) e confirma o
  agendamento.
- **Área administrativa** (`/admin`, protegida por login): CRUD de barbeiros,
  CRUD de serviços, gestão da disponibilidade (grade semanal + bloqueios de
  folga/feriado/pausa) e gestão dos agendamentos (listar com filtros, cancelar,
  reagendar).
- Toda a informação (barbeiros, serviços, horários) vem do banco de dados — nada
  fica fixo no código do frontend.

## Tecnologias

| Camada | Stack |
|---|---|
| Backend | Node.js, Express 5, TypeScript, Prisma 7, MySQL/MariaDB, Zod, JWT, bcrypt |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, SweetAlert2 |

## Funcionalidades

- Barbeiros: criar, editar, remover (soft delete)
- Serviços: criar, editar, remover (soft delete), com preço e duração
- Disponibilidade: grade semanal por dia/horário e bloqueios (folgas, feriados, pausas)
- Agendamentos: criação pública, listagem administrativa com filtros, cancelamento e reagendamento
- Cálculo automático de horários livres, cruzando grade semanal, bloqueios e agendamentos existentes
- Impede overbooking com constraint única no banco `(barbeiroId, data, horaInicio)`
- Login administrativo com JWT + bcrypt + log de acessos

## Como rodar

### Pré-requisitos

- Node.js 18+
- MySQL ou MariaDB rodando localmente (ou um serviço na nuvem)
- Opcional: Bruno, Postman ou Insomnia para testar a API diretamente

### 1. Criar o banco vazio

```sql
CREATE DATABASE corte_fino;
```

### 2. Backend (`api/`)

```bash
cd api
npm install
cp .env.example .env
```

Edite o `.env` com os dados reais do seu MySQL/MariaDB (`DATABASE_URL`,
`DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`) e defina
um `JWT_SECRET` próprio.

```bash
npx prisma migrate dev --name init   # cria as tabelas e gera o Prisma Client
npm run seed                          # popula com dados de teste (veja abaixo)
npm run dev                           # http://localhost:3000
```

> Se depois de `migrate dev` o Prisma Client não for gerado automaticamente
> (erro `Cannot find module '.../generated/prisma/client'`), rode `npx prisma generate`
> manualmente e tente de novo.

O `seed` cria:
- Login admin: **`admin@cortefino.com`** / senha **`Admin@123`**
- 2 barbeiros (Carlos e João)
- 8 serviços (incluindo combos)
- Grade de horários de segunda a sábado (09h–12h e 13h30–18h) para os dois

### 3. Frontend (`web/`)

Em outro terminal, sem fechar o da API:

```bash
cd web
npm install
cp .env.example .env    # aponta VITE_API_URL para a API (padrão http://localhost:3000)
npm run dev              # http://localhost:5173
```

- Área pública: `http://localhost:5173`
- Área administrativa: `http://localhost:5173/admin/login`

## Como testar

1. **API isolada**: com o backend rodando, acesse `http://localhost:3000/barbeiros`
   no navegador — deve retornar um JSON com Carlos e João.
2. **Fluxo do cliente**: pelo site, escolha serviço/barbeiro → dia → horário →
   preencha nome e telefone → confirme. Tente marcar o **mesmo horário duas vezes**
   para confirmar que o segundo agendamento é recusado.
3. **Painel administrativo**: faça login com as credenciais do seed e teste criar/
   editar/remover um barbeiro ou serviço, adicionar um bloqueio de dia inteiro para
   um barbeiro (e confirmar que aquele dia some da agenda pública) e cancelar/
   reagendar o agendamento criado no passo anterior.

## Problemas comuns

| Erro | Causa provável | Solução |
|---|---|---|
| `Cannot find module '.../generated/prisma/client'` | O Prisma Client ainda não foi gerado | Rode `npx prisma generate` dentro de `api/` |
| `Error: The datasource.url property is required...` | Falta o `prisma.config.ts` em `api/` | Confirme que o arquivo existe na raiz de `api/` (já incluído neste projeto) |
| `Already in sync, no schema change...` ao rodar migrate | Normal — significa que as tabelas já existem e estão atualizadas | Nenhuma ação necessária, siga para o `seed`/`dev` |
| Frontend não carrega dados / erro de rede no console | API não está rodando, ou `VITE_API_URL` errado no `web/.env` | Confirme que a API está no ar em `http://localhost:3000` e que o `.env` do `web` aponta pra lá |
| `401` ao chamar rotas do admin | Token ausente/expirado | Faça login de novo em `/admin/login` (o token expira em 8h) |

## Estrutura de pastas

```
api/
  lib/               # Prisma client, mailer
  prisma/            # schema, migrations, seed
  src/
    middlewares/      # autenticação (JWT)
    routes/           # barbeiros, servicos, disponibilidade, bloqueios, agendamentos, usuarios
    utils/horarios.ts # cálculo de horários disponíveis
    server.ts

web/
  src/
    lib/api.js         # cliente HTTP único (fonte única de dados)
    public/             # Home, Barbers, Servicos, Agendar, Confirmation, Contato
    admin/               # Login, Dashboard, Barbeiros, Servicos, Disponibilidade, Agendamentos
    App.jsx              # roteamento público + administrativo
```

## Próximos passos sugeridos

- Trocar o campo "nome do arquivo de foto" do barbeiro por upload de imagem de
  verdade (disco local ou serviço como S3/Cloudinary).
- Enviar e-mail de confirmação ao cliente quando o agendamento é criado — a
  infraestrutura de e-mail via Mailtrap/Nodemailer já existe em `api/lib/mailer.ts`,
  falta só plugar a chamada em `POST /agendamentos`.
- Adicionar paginação na listagem de agendamentos do painel, à medida que o volume
  de dados crescer.
- Adicionar recuperação de senha do admin no frontend (a rota `POST
  /usuarios/recuperar-senha` e `/redefinir-senha` já existem na API).
- Trocar o `localStorage` do token do admin por um mecanismo com refresh token,
  caso o projeto evolua para produção com múltiplos administradores.
