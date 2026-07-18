# Corte Fino

Sistema de agendamento para barbearia com site público para clientes e painel administrativo protegido. O cliente escolhe barbeiro, serviço, data e horário; a API calcula a disponibilidade real a partir da escala semanal, bloqueios e agendamentos existentes.

## Visão geral

| Área | O que oferece |
| --- | --- |
| Site público | Apresentação da barbearia, lista de barbeiros e serviços, criação e confirmação de agendamentos. |
| Painel administrativo | Login, resumo diário, gestão de barbeiros, serviços, grade de disponibilidade, bloqueios e agendamentos. |
| API | Validação, autenticação JWT, persistência em PostgreSQL e cálculo de horários disponíveis. |

## Tecnologias

| Camada | Stack |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3 e SweetAlert2 |
| Backend | Node.js, Express 5, TypeScript, Zod, JWT, bcrypt e Nodemailer |
| Dados | PostgreSQL, Prisma 7 e adaptador `@prisma/adapter-neon` |

## Funcionalidades

- Cadastro público de agendamentos com nome, telefone e e-mail opcional.
- Horários calculados por duração do serviço, janelas semanais, pausas/bloqueios e reservas confirmadas.
- Proteção contra dupla reserva pela validação da API e pela restrição única `(barbeiroId, data, horaInicio)` no banco.
- Gestão administrativa de barbeiros e serviços, com exclusão lógica.
- Gestão de disponibilidade por dia da semana e de bloqueios de dia inteiro ou por intervalo de horário.
- Listagem de agendamentos com filtros, cancelamento e reagendamento.
- Login administrativo com JWT e registro de acessos; há também endpoints de recuperação de senha por e-mail.

## Estrutura

```text
corte_fino/
├── api/                         # API Express + Prisma
│   ├── lib/                     # Cliente Prisma e configuração de e-mail
│   ├── prisma/                  # Schema e seed do banco
│   ├── src/
│   │   ├── middlewares/         # Autenticação JWT
│   │   ├── routes/              # Recursos e regras de negócio
│   │   ├── utils/horarios.ts    # Cálculo de slots disponíveis
│   │   └── server.ts
│   └── prisma.config.ts
└── web/                         # Aplicação React/Vite
    └── src/
        ├── admin/               # Painel e proteção de rotas
        ├── public/              # Páginas públicas
        ├── lib/api.js           # Cliente HTTP da API
        └── App.jsx              # Rotas da aplicação
```

## Pré-requisitos

- Node.js 18 ou superior
- Uma instância PostgreSQL acessível — Neon é compatível e é o adaptador configurado no projeto
- `npm`

## Como executar localmente

### 1. Configure o banco de dados

Crie um banco PostgreSQL vazio e prepare o arquivo de ambiente da API:

```bash
cd api
cp .env.example .env
```

No `api/.env`, configure ao menos:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/corte_fino?sslmode=require"
JWT_SECRET="um-segredo-longo-e-exclusivo"
PORT=3000
```

Para desenvolvimento local sem SSL, ajuste a `DATABASE_URL` de acordo com a configuração do seu PostgreSQL. As variáveis `MAILTRAP_EMAIL` e `MAILTRAP_SENHA` só são necessárias para o envio de e-mails de recuperação de senha.

### 2. Instale as dependências e inicialize o banco

Ainda em `api/`:

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

O servidor inicia, por padrão, em `http://localhost:3000`.

> O repositório não contém migrations versionadas. O primeiro comando `prisma migrate dev` cria a migration local a partir do schema atual. Se o cliente Prisma não for gerado automaticamente, execute `npm run prisma:generate`.

O seed cria os dados iniciais abaixo:

- Administrador: `admin@cortefino.com` / `Admin@123`
- Barbeiros: Carlos e João
- Oito serviços, incluindo combos
- Escala de segunda a sábado, das 09:00 às 12:00 e das 13:30 às 18:00, para ambos os barbeiros

Altere a senha padrão antes de disponibilizar a aplicação.

### 3. Execute o frontend

Em outro terminal:

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Por padrão, `web/.env` usa `VITE_API_URL=http://localhost:3000`.

- Site público: `http://localhost:5173`
- Login administrativo: `http://localhost:5173/admin/login`
- Painel: `http://localhost:5173/admin`

Para gerar a versão de produção do frontend, execute `npm run build` dentro de `web/`.

## Rotas da aplicação web

| Rota | Finalidade |
| --- | --- |
| `/` | Página inicial |
| `/barbeiros` | Lista e seleção de barbeiro |
| `/servicos` | Lista e seleção de serviço |
| `/agendamento` | Escolha de data/horário e confirmação |
| `/confirmacao` | Resumo da reserva criada |
| `/contato` | Informações de contato |
| `/admin/login` | Autenticação administrativa |
| `/admin/*` | Dashboard e gestão administrativa, protegidos por JWT |

## API

As rotas administrativas exigem `Authorization: Bearer <token>`, obtido em `POST /usuarios/login`.

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/barbeiros` | Público | Lista barbeiros; `?ativos=true` filtra ativos. |
| GET | `/barbeiros/:id` | Público | Consulta um barbeiro. |
| POST, PUT, DELETE | `/barbeiros` e `/:id` | Admin | Cria, altera e exclui logicamente. |
| GET | `/servicos` | Público | Lista serviços; `?ativos=true` filtra ativos. |
| GET | `/servicos/:id` | Público | Consulta um serviço. |
| POST, PUT, DELETE | `/servicos` e `/:id` | Admin | Gerencia serviços. |
| GET | `/disponibilidades?barbeiroId=` | Público | Consulta a grade semanal. |
| POST, PUT, DELETE | `/disponibilidades` e `/:id` | Admin | Gerencia janelas da grade semanal. |
| GET | `/bloqueios?barbeiroId=&data=` | Público | Lista bloqueios. |
| POST, DELETE | `/bloqueios` e `/:id` | Admin | Cria e remove folgas, pausas ou feriados. |
| GET | `/agendamentos/horarios-disponiveis?barbeiroId=&servicoId=&data=` | Público | Retorna slots livres para a combinação informada. |
| POST | `/agendamentos` | Público | Cria um agendamento. |
| GET | `/agendamentos?barbeiroId=&data=&status=` | Admin | Lista agendamentos com filtros opcionais. |
| PATCH | `/agendamentos/:id/cancelar` | Admin | Cancela um agendamento. |
| PATCH | `/agendamentos/:id/reagendar` | Admin | Altera data e horário. |
| POST | `/usuarios/login` | Público | Autentica o administrador e retorna JWT. |
| POST | `/usuarios/recuperar-senha` | Público | Inicia recuperação de senha. |
| POST | `/usuarios/redefinir-senha` | Público | Conclui a redefinição com código. |

## Como a disponibilidade é calculada

1. A API encontra as janelas de atendimento do barbeiro no dia da semana escolhido.
2. Ela gera horários de início compatíveis com a duração do serviço.
3. Em seguida remove os intervalos que colidem com bloqueios e agendamentos confirmados.
4. Quando a data é hoje, também remove horários já passados.
5. Ao salvar, a API recalcula a disponibilidade e o banco aplica uma restrição única como proteção final contra concorrência.

## Verificação

O backend passou na verificação de tipos:

```bash
cd api
npx tsc --noEmit
```

Para validar manualmente, após executar os dois serviços:

1. Abra o site, escolha um barbeiro e serviço e crie um agendamento.
2. Tente reservar o mesmo início para o mesmo barbeiro: a segunda tentativa deve ser recusada.
3. Entre no painel com o usuário do seed, crie um bloqueio e confirme que os horários afetados deixam de ser oferecidos.

## Observações para produção

- Defina um `JWT_SECRET` exclusivo e remova as credenciais padrão do seed.
- Restrinja `cors()` aos domínios autorizados.
- Use uma conta SMTP real e variáveis de ambiente seguras para e-mails.
- O token administrativo é armazenado no `localStorage`; considere cookies `httpOnly` e renovação de sessão em uma evolução de produção.
- Planeje migrations versionadas antes de distribuir o banco para outros ambientes.