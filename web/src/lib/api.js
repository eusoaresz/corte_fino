// Fonte única de dados: todo o front-end fala com a API através deste módulo.
// Antes, barbeiros/serviços/horários viviam em arrays fixos dentro dos componentes.
// Agora eles vêm sempre do backend (Node/Express/Prisma).

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "corte_fino_admin_token";
const CLIENT_TOKEN_KEY = "corte_fino_cliente_token";
const CLIENT_KEY = "corte_fino_cliente";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getClientToken() {
  return localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function setClientSession(token, cliente) {
  localStorage.setItem(CLIENT_TOKEN_KEY, token);
  localStorage.setItem(CLIENT_KEY, JSON.stringify(cliente));
}

export function getClient() {
  const cliente = localStorage.getItem(CLIENT_KEY);
  try { return cliente ? JSON.parse(cliente) : null; } catch { return null; }
}

export function clearClientSession() {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
}

async function request(path, { method = "GET", body, auth = false, clientAuth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (clientAuth) {
    const token = getClientToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const mensagem =
      (data && (data.erro || data.mensagem)) ||
      `Erro ${response.status} ao acessar ${path}`;
    const erro = new Error(
      typeof mensagem === "string" ? mensagem : JSON.stringify(mensagem)
    );
    erro.status = response.status;
    erro.data = data;
    throw erro;
  }

  return data;
}

// ── Barbeiros ────────────────────────────────────────────────────────────
export const barbeirosApi = {
  listar: (somenteAtivos = false) =>
    request(`/barbeiros${somenteAtivos ? "?ativos=true" : ""}`),
  buscar: (id) => request(`/barbeiros/${id}`),
  criar: (dados) => request("/barbeiros", { method: "POST", body: dados, auth: true }),
  atualizar: (id, dados) => request(`/barbeiros/${id}`, { method: "PUT", body: dados, auth: true }),
  remover: (id) => request(`/barbeiros/${id}`, { method: "DELETE", auth: true }),
};

// ── Serviços ─────────────────────────────────────────────────────────────
export const servicosApi = {
  listar: (somenteAtivos = false) =>
    request(`/servicos${somenteAtivos ? "?ativos=true" : ""}`),
  buscar: (id) => request(`/servicos/${id}`),
  criar: (dados) => request("/servicos", { method: "POST", body: dados, auth: true }),
  atualizar: (id, dados) => request(`/servicos/${id}`, { method: "PUT", body: dados, auth: true }),
  remover: (id) => request(`/servicos/${id}`, { method: "DELETE", auth: true }),
};

// ── Disponibilidade (grade semanal) ────────────────────────────────────
export const disponibilidadeApi = {
  listar: (barbeiroId) =>
    request(`/disponibilidades${barbeiroId ? `?barbeiroId=${barbeiroId}` : ""}`),
  criar: (dados) => request("/disponibilidades", { method: "POST", body: dados, auth: true }),
  atualizar: (id, dados) =>
    request(`/disponibilidades/${id}`, { method: "PUT", body: dados, auth: true }),
  remover: (id) => request(`/disponibilidades/${id}`, { method: "DELETE", auth: true }),
};

// ── Bloqueios (folgas, pausas, feriados) ─────────────────────────────────
export const bloqueiosApi = {
  listar: (barbeiroId, data) => {
    const params = new URLSearchParams();
    if (barbeiroId) params.set("barbeiroId", barbeiroId);
    if (data) params.set("data", data);
    const qs = params.toString();
    return request(`/bloqueios${qs ? `?${qs}` : ""}`);
  },
  criar: (dados) => request("/bloqueios", { method: "POST", body: dados, auth: true }),
  remover: (id) => request(`/bloqueios/${id}`, { method: "DELETE", auth: true }),
};

// ── Agendamentos ─────────────────────────────────────────────────────────
export const agendamentosApi = {
  horariosDisponiveis: (barbeiroId, servicoId, data) =>
    request(
      `/agendamentos/horarios-disponiveis?barbeiroId=${barbeiroId}&servicoId=${servicoId}&data=${data}`
    ),
  criar: (dados) => request("/agendamentos", { method: "POST", body: dados, clientAuth: true }),
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const qs = params.toString();
    return request(`/agendamentos${qs ? `?${qs}` : ""}`, { auth: true });
  },
  cancelar: (id) => request(`/agendamentos/${id}/cancelar`, { method: "PATCH", auth: true }),
  reagendar: (id, dados) =>
    request(`/agendamentos/${id}/reagendar`, { method: "PATCH", body: dados, auth: true }),
};

// ── Usuários / autenticação administrativa ───────────────────────────────
export const authApi = {
  login: (email, senha) => request("/usuarios/login", { method: "POST", body: { email, senha } }),
  cadastrar: (nome, email, senha) =>
    request("/usuarios", { method: "POST", body: { nome, email, senha } }),
};

export const clienteApi = {
  cadastrar: (dados) => request("/clientes/cadastro", { method: "POST", body: dados }),
  login: (email, senha) => request("/clientes/login", { method: "POST", body: { email, senha } }),
  me: () => request("/clientes/me", { clientAuth: true }),
  meusAgendamentos: () => request("/clientes/me/agendamentos", { clientAuth: true }),
};
