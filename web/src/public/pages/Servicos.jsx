import React from "react";
import { useNavigate } from "react-router-dom";
import { servicosApi } from "../../lib/api";

const dinheiro = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const combo = (servico) => /combo/i.test(servico.nome);

export default function Servicos() {
  const navigate = useNavigate();
  const [servicos, setServicos] = React.useState([]); const [aba, setAba] = React.useState("servicos"); const [erro, setErro] = React.useState("");
  React.useEffect(() => { servicosApi.listar(true).then(setServicos).catch(() => setErro("Não foi possível carregar os serviços.")); }, []);
  const itens = servicos.filter((item) => aba === "combos" ? combo(item) : !combo(item));
  return <section className="site-page"><div className="page-content max-w-4xl">
    <header className="mb-9 text-center"><p className="eyebrow mb-3">Corte Fino</p><h1 className="text-4xl font-black sm:text-5xl">Serviços que acompanham seu ritmo.</h1><p className="mx-auto mt-4 max-w-xl text-white/70">Escolha o que combina com você e encontre o melhor horário.</p></header>
    <div className="glass-panel p-3 sm:p-6"><div className="mb-5 flex gap-2 border-b border-white/10 pb-4"><button onClick={() => setAba("servicos")} className={`rounded-lg px-4 py-2 text-sm font-bold ${aba === "servicos" ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/5"}`}>Serviços</button><button onClick={() => setAba("combos")} className={`rounded-lg px-4 py-2 text-sm font-bold ${aba === "combos" ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/5"}`}>Combos</button></div>
      {erro ? <p className="p-5 text-center text-red-300">{erro}</p> : itens.length === 0 ? <p className="p-5 text-center text-white/65">Carregando serviços...</p> : <div className="divide-y divide-white/10">{itens.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 px-2 py-5 sm:px-3"><div className="min-w-44 flex-1"><h2 className="font-bold sm:text-lg">{item.nome}</h2><p className="mt-1 text-sm text-white/55">{item.duracaoMinutos} minutos</p></div><strong className="text-yellow-400">{dinheiro(item.preco)}</strong><button onClick={() => navigate("/barbeiros", { state: { servicoId: item.id } })} className="rounded-lg border border-yellow-400/70 px-3 py-2 text-sm font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black">Agendar</button></div>)}</div>}
    </div>
  </div></section>;
}
