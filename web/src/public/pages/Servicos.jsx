import React from "react";
import { useNavigate } from "react-router-dom";
import { servicosApi } from "../../lib/api";

// Serviços "combo" são identificados pelo nome conter "(Combo)" — mantém a mesma
// separação visual em abas que a tela original tinha, mas agora com dados reais.
function isCombo(servico) {
  return /combo/i.test(servico.nome);
}

function formatarPreco(preco) {
  return Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Servicos() {
  const navigate = useNavigate();
  const [servicos, setServicos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("Serviços");

  React.useEffect(() => {
    servicosApi
      .listar(true)
      .then(setServicos)
      .catch(() => setErro("Não foi possível carregar os serviços agora. Tente novamente em instantes."))
      .finally(() => setLoading(false));
  }, []);

  const listaServicos = servicos.filter((s) => !isCombo(s));
  const listaCombos = servicos.filter(isCombo);

  const handleAgendar = (servico) => {
    // O serviço já vai selecionado; o próximo passo é escolher o barbeiro.
    navigate("/barbeiros", { state: { servicoId: servico.id } });
  };

  const renderItems = (items) =>
    items.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0"
      >
        <span className="font-semibold text-lg md:text-xl flex-grow">
          {item.nome}
          <span className="block text-xs font-normal text-gray-400">{item.duracaoMinutos} min</span>
        </span>
        <span className="text-yellow-400 font-bold text-lg mr-4">{formatarPreco(item.preco)}</span>
        <button
          onClick={() => handleAgendar(item)}
          className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors text-sm md:text-base"
        >
          Agendar
        </button>
      </div>
    ));

  return (
    <>
      <section
        className="min-h-screen bg-cover bg-center pt-24 px-4 text-white flex justify-center items-center"
        style={{ backgroundImage: "url('Fundo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 hidden md:flex w-full max-w-5xl h-[600px] rounded-xl overflow-hidden shadow-2xl">
          <div className="w-full h-full bg-cover bg-center">
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] bg-black/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
            <div className="flex justify-start mb-6">
              {["Serviços", "Combos", "Produtos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors mr-3 text-sm md:text-base
                    ${activeTab === tab ? "bg-yellow-500 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {loading && <p className="text-center text-gray-300 py-8">Carregando serviços...</p>}
              {erro && <p className="text-center text-red-300 py-8">{erro}</p>}
              {!loading && !erro && activeTab === "Serviços" && renderItems(listaServicos)}
              {!loading && !erro && activeTab === "Combos" && renderItems(listaCombos)}
              {activeTab === "Produtos" && (
                <p className="text-center py-8 text-gray-400">Em breve: Nossos produtos exclusivos para cuidados.</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm md:hidden bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10">
          <h1 className="text-xl font-bold text-center mb-4 text-yellow-500">Nossos Serviços</h1>

          <div className="flex justify-start mb-4">
            {["Serviços", "Combos", "Produtos"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 font-semibold rounded-md transition-colors mr-2 text-xs
                  ${activeTab === tab ? "bg-yellow-500 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {loading && <p className="text-center text-gray-300 py-6 text-sm">Carregando serviços...</p>}
            {erro && <p className="text-center text-red-300 py-6 text-sm">{erro}</p>}
            {!loading && !erro && activeTab === "Serviços" && renderItems(listaServicos)}
            {!loading && !erro && activeTab === "Combos" && renderItems(listaCombos)}
            {activeTab === "Produtos" && (
              <p className="text-center py-6 text-gray-400 text-sm">Em breve: Produtos exclusivos para celular.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
