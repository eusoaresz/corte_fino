import React from "react";
import { Link } from "react-router-dom";
import { clienteApi } from "../../lib/api";
import { useClientAuth } from "../lib/useClientAuth";

const statusClasses = { CONFIRMADO: "bg-blue-500/20 text-blue-200", CONCLUIDO: "bg-green-500/20 text-green-200", CANCELADO: "bg-red-500/20 text-red-200" };
const statusTexto = { CONFIRMADO: "Confirmado", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" };
const dataBr = (data) => new Date(`${String(data).split("T")[0]}T00:00:00`).toLocaleDateString("pt-BR");

export default function MinhaConta() {
  const { cliente, logout } = useClientAuth();
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(true);

  React.useEffect(() => {
    clienteApi.meusAgendamentos().then(setAgendamentos).catch((err) => setErro(err.message)).finally(() => setCarregando(false));
  }, []);

  return <section className="min-h-screen bg-neutral-950 pt-28 pb-12 px-6 text-white">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between gap-4 items-start mb-8">
        <div><h1 className="text-3xl font-bold text-yellow-400">Minha conta</h1><p className="text-gray-300 mt-1">Olá, {cliente?.nome}. Veja seu histórico e seus próximos horários.</p></div>
        <div className="flex gap-3"><Link to="/agendamento" className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold">Novo agendamento</Link><button onClick={logout} className="text-sm text-red-300">Sair</button></div>
      </div>
      <h2 className="text-xl font-bold mb-4">Meus agendamentos</h2>
      {carregando ? <p className="text-gray-300">Carregando...</p> : erro ? <p className="text-red-300">{erro}</p> : agendamentos.length === 0 ? <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300">Você ainda não possui agendamentos. <Link to="/agendamento" className="text-yellow-400">Agende seu primeiro corte.</Link></div> : <div className="grid gap-4">{agendamentos.map((item) => <article key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-wrap gap-4 justify-between"><div><h3 className="font-bold text-lg">{item.servico?.nome}</h3><p className="text-gray-300">com {item.barbeiro?.nome}</p><p className="text-gray-300 mt-2">{dataBr(item.data)} às {item.horaInicio}</p></div><span className={`h-fit px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[item.status] || "bg-white/10"}`}>{statusTexto[item.status] || item.status}</span></article>)}</div>}
    </div>
  </section>;
}
