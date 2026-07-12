# Corte Fino — Web (Frontend)

Site da barbearia em React + Vite + Tailwind CSS, dividido em área pública e área
administrativa. Veja o README na raiz do projeto para a visão geral da arquitetura.

## Tecnologias

- React 18 + React Router DOM 6
- Vite 5 + Tailwind CSS 3
- SweetAlert2 (modais de confirmação/erro)

## Estrutura

```
src/
  lib/api.js            # cliente HTTP único, fala com a API (fonte única de dados)
  public/
    layout/Header.jsx
    pages/               # Home, Barbers, Servicos, Agendar, Confirmation, Contato
  admin/
    lib/useAuth.jsx      # contexto de autenticação (token JWT)
    components/ProtectedRoute.jsx
    layout/AdminLayout.jsx
    pages/               # Login, Dashboard, Barbeiros, Servicos, Disponibilidade, Agendamentos
  App.jsx                 # roteamento público + administrativo
```

## Como rodar

```bash
npm install
cp .env.example .env   # aponta VITE_API_URL para a API (padrão: http://localhost:3000)
npm run dev
```

- Área pública: `http://localhost:5173/`
- Área administrativa: `http://localhost:5173/admin/login`

## Fluxo de agendamento (público)

1. `/` → `/servicos` (opcional, escolhe o serviço primeiro) ou direto `/barbeiros`.
2. `/barbeiros` → escolhe o barbeiro (vindo da API).
3. `/agendamento` → confirma/escolhe serviço, escolhe dia e vê os horários realmente
   disponíveis para aquele barbeiro + serviço + dia (calculados pela API), preenche
   nome/telefone e revisa o resumo antes de confirmar.
4. `/confirmacao` → mostra barbeiro, serviço, data, horário e duração do agendamento
   criado.
