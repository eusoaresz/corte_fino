import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
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
        <p className="text-sm text-gray-400 mb-6 text-center">Painel Administrativo</p>

        <label className="text-sm font-semibold block mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        <label className="text-sm font-semibold block mb-1">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        {erro && <p className="text-sm text-red-300 mb-4">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black py-3 rounded-lg font-bold"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
