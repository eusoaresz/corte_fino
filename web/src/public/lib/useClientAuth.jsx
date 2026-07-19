import React from "react";
import { clearClientSession, getClient, getClientToken, setClientSession, clienteApi } from "../../lib/api";

const ClientAuthContext = React.createContext(null);

export function ClientAuthProvider({ children }) {
  const [token, setToken] = React.useState(getClientToken());
  const [cliente, setCliente] = React.useState(getClient());

  const iniciarSessao = (resposta) => {
    setClientSession(resposta.token, resposta.cliente);
    setToken(resposta.token);
    setCliente(resposta.cliente);
    return resposta;
  };

  const login = async (email, senha) => iniciarSessao(await clienteApi.login(email, senha));
  const cadastrar = async (dados) => iniciarSessao(await clienteApi.cadastrar(dados));
  const logout = () => {
    clearClientSession();
    setToken(null);
    setCliente(null);
  };

  return <ClientAuthContext.Provider value={{ cliente, autenticado: Boolean(token), login, cadastrar, logout }}>
    {children}
  </ClientAuthContext.Provider>;
}

export function useClientAuth() {
  const context = React.useContext(ClientAuthContext);
  if (!context) throw new Error("useClientAuth precisa estar dentro de ClientAuthProvider");
  return context;
}
