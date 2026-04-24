# Corte Fino

Site de barbearia desenvolvido com React, Vite e Tailwind CSS.

O projeto apresenta uma experiencia de agendamento simples, com fluxo visual em varias telas:
inicio, escolha de barbeiro, selecao de data/horario e confirmacao.

## Tecnologias

- React 18
- React Router DOM 6
- Vite 5
- Tailwind CSS 3
- PostCSS + Autoprefixer

## Funcionalidades

- Pagina inicial com destaque visual da marca.
- Lista de barbeiros com descricao de perfil.
- Selecao de data e horario para agendamento.
- Tela de confirmacao com resumo do agendamento.
- Pagina de servicos com abas para Servicos, Combos e Produtos.
- Layout responsivo para desktop e mobile.

## Fluxo de funcionamento

1. O usuario acessa a pagina inicial em /.
2. Clica em Agende seu Horario e vai para /barbeiros.
3. Escolhe um barbeiro e e redirecionado para /agendamento.
4. Seleciona dia e horario e confirma.
5. O app navega para /confirmacao exibindo os dados escolhidos.

## Rotas da aplicacao

- / : Home
- /barbeiros : Selecao de barbeiro
- /agendamento : Escolha de data e horario
- /confirmacao : Resumo do agendamento
- /servicos : Lista de servicos e combos

## Requisitos

- Node.js 18+ (recomendado)
- npm 9+ (ou equivalente compativel)

## Como iniciar o projeto

1. Instale as dependencias:

```bash
npm install
```

2. Rode em modo de desenvolvimento:

```bash
npm run dev
```

3. Abra no navegador o endereco exibido no terminal (geralmente http://localhost:5173).

## Scripts disponiveis

- npm run dev : inicia servidor de desenvolvimento.
- npm run build : gera build de producao em dist/.
- npm run preview : serve localmente a build gerada.

## Assets obrigatorios em public/

Para o layout aparecer corretamente, mantenha estes arquivos na pasta public/:

- Fundo.jpg
- Emblema.png
- Barbeiro.png
- homem1.jpg
- homem2.jpg
- BarbeariaInterna.jpg

## Estrutura resumida

```text
src/
   components/
      Header.jsx
   pages/
      Home.jsx
      Barbers.jsx
      Agendar.jsx
      Confirmation.jsx
      Servicos.jsx
   App.jsx
   main.jsx
```

## Observacoes

- O projeto atualmente usa dados locais (mock) para barbeiros, servicos e combos.
- O agendamento nao persiste em banco de dados.
- O link de contato no menu pode ser conectado a uma secao/whatsapp no futuro.

## Proximos passos recomendados

- Integrar backend para persistir agendamentos.
- Validar disponibilidade real de horarios por barbeiro.
- Adicionar notificacao de sucesso/erro sem uso de alert nativo.
- Criar pagina de contato com canais oficiais da barbearia.
