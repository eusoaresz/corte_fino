import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { barbeirosApi } from "../../lib/api";

function foto(barbeiro) {
  if (!barbeiro.foto) return "/Barbeiro.png";
  return /^(data:|https?:|\/)/.test(barbeiro.foto) ? barbeiro.foto : `/${barbeiro.foto}`;
}

export default function Barbers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [barbeiros, setBarbeiros] = React.useState([]);
  const [erro, setErro] = React.useState("");
  React.useEffect(() => { barbeirosApi.listar(true).then(setBarbeiros).catch(() => setErro("Não foi possível carregar os barbeiros agora.")); }, []);

  return <section className="site-page" style={{ backgroundImage: "url('Fundo.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}><div className="page-content">
    <header className="mb-10 max-w-2xl"><p className="eyebrow mb-3">Seu profissional</p><h1 className="text-4xl font-black sm:text-5xl">Escolha quem vai cuidar do seu estilo.</h1><p className="mt-4 text-white/70">Conheça nossos profissionais e siga para escolher o melhor horário.</p></header>
    {erro && <p className="text-red-300">{erro}</p>}
    {!erro && barbeiros.length === 0 && <p className="text-white/70">Carregando profissionais...</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{barbeiros.map((barbeiro) => <article key={barbeiro.id} className="glass-panel group overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/50">
      <img src={foto(barbeiro)} alt={barbeiro.nome} className="h-64 w-full rounded-xl object-cover grayscale transition duration-500 group-hover:grayscale-0" />
      <div className="px-1 pb-1 pt-5"><h2 className="text-2xl font-bold">{barbeiro.nome}</h2><p className="mt-2 min-h-12 text-sm leading-relaxed text-white/65">{barbeiro.descricao || "Profissional Corte Fino."}</p><button onClick={() => navigate("/agendamento", { state: { barbeiroId: barbeiro.id, servicoId: location.state?.servicoId } })} className="mt-5 text-sm font-bold text-yellow-400 transition hover:text-yellow-300">Escolher profissional →</button></div>
    </article>)}</div>
  </div></section>;
}
