import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export default function Login() {
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [modoCadastro, setModoCadastro] = React.useState(false);
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (modoCadastro) {
        await cadastrar(nome, email, senha);
      } else {
        await login(email, senha);
      }
      const destino = location.state?.from || "/admin";
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message || "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white px-4">
      <form onSubmit={handleSubmit} className="bg-black/60 border border-white/10 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-500 mb-1 text-center">Corte Fino</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          {modoCadastro ? "Crie sua conta" : "Painel Administrativo"}
        </p>

        {modoCadastro && (
          <>
            <label className="text-sm font-semibold block mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required={modoCadastro}
              minLength="3"
              maxLength="60"
              autoComplete="name"
              className="p-3 w-full rounded bg-white text-black mb-4"
            />
          </>
        )}

        <label className="text-sm font-semibold block mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        <label className="text-sm font-semibold block mb-1">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete={modoCadastro ? "new-password" : "current-password"}
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        {modoCadastro && (
          <p className="text-xs text-gray-400 -mt-2 mb-4">
            Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.
          </p>
        )}

        {erro && <p className="text-sm text-red-300 mb-4">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black py-3 rounded-lg font-bold"
        >
          {carregando ? "Aguarde..." : modoCadastro ? "Criar conta" : "Entrar"}
        </button>

        <button
          type="button"
          disabled={carregando}
          onClick={() => {
            setModoCadastro((atual) => !atual);
            setErro("");
          }}
          className="w-full mt-4 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-60"
        >
          {modoCadastro ? "Já tenho uma conta" : "Ainda não tenho conta"}
        </button>
      </form>
    </div>
  );
}
