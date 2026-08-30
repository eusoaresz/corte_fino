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
| Dados | PostgreSQL 16, Prisma 7 e adaptador `@prisma/adapter-pg` |

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

- **Recomendado:** Docker Engine e Docker Compose v2.
- Para executar sem Docker: Node.js 22, npm e uma instância PostgreSQL 16 ou compatível.

Verifique a instalação do Docker:

```bash
docker --version
docker compose version
```

## Início rápido com Docker

Este é o caminho recomendado para desenvolvimento. Um único comando inicia o
PostgreSQL, a API e o frontend.

### 1. Configure as variáveis de ambiente

Na raiz do projeto, crie seu arquivo local de configuração:

```bash
cp .env.example .env
```

Edite o `.env` e troque ao menos `JWT_SECRET` por um valor longo e exclusivo.
Se você abrir o site no navegador da própria VM, mantenha:

```env
VITE_API_URL=http://localhost:3000
```

Se o Docker estiver em uma VM e o site for aberto no Windows (ou outro
computador), informe o IP da VM:

```env
VITE_API_URL=http://IP_DA_VM:3000
```

No Ubuntu, descubra esse IP com:

```bash
hostname -I
```

> Nunca envie o arquivo `.env` ao GitHub. Ele contém credenciais locais.

### 2. Suba os serviços

```bash
docker compose up --build
```

Na primeira inicialização, a API gera o Prisma Client e aplica o schema ao
banco. Aguarde no log a mensagem `Servidor Rodando na Porta: 3000`.

Para executar em segundo plano, use:

```bash
docker compose up --build -d
```

E acompanhe os logs quando necessário:

```bash
docker compose logs -f api
```

### 3. Carregue os dados iniciais

Com os containers em execução, rode o seed **uma única vez para um banco
novo**:

```bash
docker compose exec api npm run seed
```

Ele cria:

- Administrador: `admin@cortefino.com` / `Admin@123`;
- Barbeiros Carlos e João;
- Oito serviços e a grade de atendimento de segunda a sábado.

Altere a senha padrão antes de disponibilizar o sistema para uso real.

### 4. Acesse a aplicação

| Onde o navegador está aberto | Site | Painel administrativo |
| --- | --- | --- |
| Na mesma máquina/VM do Docker | `http://localhost:5173` | `http://localhost:5173/admin/login` |
| Em outro computador da rede | `http://IP_DA_VM:5173` | `http://IP_DA_VM:5173/admin/login` |

Por exemplo, se a VM usa o IP `192.168.150.128`, o endereço é
`http://192.168.150.128:5173`.

### Comandos úteis

| Objetivo | Comando |
| --- | --- |
| Iniciar em segundo plano | `docker compose up -d` |
| Parar containers, preservando o banco | `docker compose down` |
| Ver status | `docker compose ps` |
| Ver logs da API | `docker compose logs -f api` |
| Reiniciar somente a API | `docker compose restart api` |
| Abrir um terminal PostgreSQL | `docker compose exec db psql -U corte_fino -d corte_fino` |
| Remover tudo, inclusive os dados locais | `docker compose down -v` |

> `docker compose down -v` remove o volume do PostgreSQL e todos os
> agendamentos de desenvolvimento. Use somente quando quiser reiniciar o banco
> do zero; depois, execute o seed novamente.

## Execução sem Docker

Use este modo apenas se você já possui Node.js e PostgreSQL configurados na
máquina.

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
npm ci
npx prisma db push
npm run seed
npm run dev
```

O servidor inicia, por padrão, em `http://localhost:3000`.

> O repositório não contém migrations versionadas. `npx prisma db push` aplica
> o schema diretamente no banco de desenvolvimento. Se o cliente Prisma não
> for gerado automaticamente, execute `npm run prisma:generate`.

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
npm ci
cp .env.example .env
npm run dev
```

Por padrão, `web/.env` usa `VITE_API_URL=http://localhost:3000`.

- Site público: `http://localhost:5173`
- Login administrativo: `http://localhost:5173/admin/login`
- Painel: `http://localhost:5173/admin`

## Executar com Docker (Ubuntu)

Esta opção inicia PostgreSQL, API e frontend em containers. É indicada para o
ambiente de desenvolvimento na VM.

1. Na raiz do projeto, crie o arquivo de variáveis:

```bash
cp .env.example .env
```

2. Se o navegador for aberto no Windows (fora da VM), altere
`VITE_API_URL` no `.env` para o IP da VM, por exemplo
`http://192.168.150.128:3000`. Para usar o navegador dentro da própria VM,
deixe `http://localhost:3000`.

3. Inicie os serviços:

```bash
docker compose up --build
```

Na primeira execução, a API gera o cliente Prisma e aplica o schema ao banco.
Em outro terminal, carregue os dados de exemplo uma única vez:

```bash
docker compose exec api npm run seed
```

Abra `http://localhost:5173` no navegador da VM, ou
`http://IP_DA_VM:5173` no Windows. Pare os serviços com `Ctrl+C`; os dados do
PostgreSQL permanecem no volume `postgres_data`.

Para gerar a versão de produção do frontend, execute `npm run build` dentro de `web/`.

## Solução de problemas

### O site abre, mas não carrega dados ou não permite login

Confira o valor de `VITE_API_URL` no `.env`. Quando o navegador está fora da
VM, ele precisa apontar para o IP da VM e a porta `3000`, por exemplo
`http://192.168.150.128:3000`. Depois de alterar esse valor, reinicie o
frontend:

```bash
docker compose up -d --build web
```

### A API não inicia

Veja o log da API e confirme que o banco está saudável:

```bash
docker compose logs -f api
docker compose ps
```

Se a API informar erro de conexão com o banco, reinicie os serviços:

```bash
docker compose restart db api
```

### O seed falha ou os dados foram duplicados

O seed é destinado a uma base vazia; não o execute a cada reinicialização. Se
o banco de desenvolvimento precisar ser recriado, remova os volumes e suba o
ambiente novamente:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec api npm run seed
```

### A porta já está em uso

Pare o processo/container que usa a porta `3000` ou `5173`, ou altere o
mapeamento em `compose.yaml`. Depois de editar o arquivo, execute novamente
`docker compose up -d`.

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
| POST | `/clientes/cadastro` | Público | Cria uma conta de cliente e retorna um JWT. |
| POST | `/clientes/login` | Público | Autentica uma conta de cliente. |
| GET | `/clientes/me` | Cliente | Retorna o perfil do cliente autenticado. |
| GET | `/clientes/me/agendamentos` | Cliente | Lista os agendamentos do cliente autenticado. |

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
