import React from "react";
import { getToken, setToken, clearToken, authApi } from "../../lib/api";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = React.useState(getToken());
  const [usuario, setUsuario] = React.useState(null);

  const login = async (email, senha) => {
    const resposta = await authApi.login(email, senha);
    setToken(resposta.token);
    setTokenState(resposta.token);
    setUsuario(resposta.usuario);
    return resposta;
  };

  const cadastrar = async (nome, email, senha) => {
    await authApi.cadastrar(nome, email, senha);
    return login(email, senha);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUsuario(null);
  };

  const value = { token, usuario, autenticado: Boolean(token), login, cadastrar, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  return ctx;
}
