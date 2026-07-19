import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClientAuth } from "../lib/useClientAuth";

export default function Conta() {
  const { autenticado, cliente, login, cadastrar, logout } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cadastro, setCadastro] = React.useState(false);
  const [dados, setDados] = React.useState({ nome: "", email: "", telefone: "", senha: "" });
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);

  const atualizar = (campo) => (e) => setDados((atual) => ({ ...atual, [campo]: e.target.value }));
  const enviar = async (e) => {
    e.preventDefault(); setErro(""); setCarregando(true);
    try {
      if (cadastro) await cadastrar(dados);
      else await login(dados.email, dados.senha);
      navigate(location.state?.from || "/minha-conta", { replace: true });
    } catch (err) { setErro(err.message || "Não foi possível continuar."); }
    finally { setCarregando(false); }
  };

  if (autenticado) return (
    <section className="min-h-screen bg-neutral-950 pt-28 px-6 text-white flex justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-yellow-400">Olá, {cliente?.nome}</h1>
        <p className="text-gray-300 mt-2">Sua conta está conectada.</p>
        <button onClick={() => navigate("/minha-conta")} className="w-full mt-7 bg-yellow-500 text-black py-3 rounded-lg font-bold">Ver meus agendamentos</button>
        <button onClick={logout} className="mt-4 text-sm text-red-300 hover:text-red-200">Sair da conta</button>
      </div>
    </section>
  );

  return <section className="min-h-screen bg-neutral-950 pt-28 px-6 text-white flex justify-center">
    <form onSubmit={enviar} className="w-full max-w-md bg-black/60 border border-white/10 p-8 rounded-xl">
      <h1 className="text-3xl font-bold text-yellow-400 text-center">{cadastro ? "Criar conta" : "Entrar"}</h1>
      <p className="text-center text-gray-400 mt-2 mb-7">{cadastro ? "Acompanhe seus horários em um só lugar." : "Acesse seus agendamentos."}</p>
      {cadastro && <><label className="block text-sm mb-1">Nome</label><input required minLength="3" value={dados.nome} onChange={atualizar("nome")} className="p-3 w-full rounded text-black mb-4" /></>}
      <label className="block text-sm mb-1">E-mail</label><input type="email" required value={dados.email} onChange={atualizar("email")} className="p-3 w-full rounded text-black mb-4" />
      {cadastro && <><label className="block text-sm mb-1">Telefone</label><input type="tel" required minLength="8" value={dados.telefone} onChange={atualizar("telefone")} className="p-3 w-full rounded text-black mb-4" /></>}
      <label className="block text-sm mb-1">Senha</label><input type="password" required minLength="8" value={dados.senha} onChange={atualizar("senha")} className="p-3 w-full rounded text-black mb-4" />
      {cadastro && <p className="text-xs text-gray-400 -mt-2 mb-4">Use ao menos 8 caracteres.</p>}
      {erro && <p className="text-sm text-red-300 mb-4">{erro}</p>}
      <button disabled={carregando} className="w-full bg-yellow-500 disabled:opacity-60 text-black py-3 rounded-lg font-bold">{carregando ? "Aguarde..." : cadastro ? "Criar conta" : "Entrar"}</button>
      <button type="button" onClick={() => { setCadastro((atual) => !atual); setErro(""); }} className="w-full mt-4 text-sm text-yellow-400">{cadastro ? "Já tenho uma conta" : "Ainda não tenho conta"}</button>
    </form>
  </section>;
}
