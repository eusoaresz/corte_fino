import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { barbeirosApi } from "../../lib/api";

export default function Barbers() {
  const navigate = useNavigate();
  const location = useLocation();
  // Se o cliente já escolheu o serviço antes (ex: veio da tela de Serviços),
  // esse dado segue junto para o agendamento.
  const servicoPreSelecionado = location.state?.servicoId;
  const [selectedBarber, setSelectedBarber] = React.useState(null);
  const [barbers, setBarbers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState("");

  React.useEffect(() => {
    barbeirosApi
      .listar(true)
      .then(setBarbers)
      .catch(() => setErro("Não foi possível carregar os barbeiros agora. Tente novamente em instantes."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (barber) => {
    setSelectedBarber(barber.id);
    setTimeout(() => {
      navigate("/agendamento", {
        state: { barbeiroId: barber.id, barberName: barber.nome, servicoId: servicoPreSelecionado },
      });
    }, 400);
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center pt-24 px-4 text-white" style={{ backgroundImage: "url('Fundo.jpg')" }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-yellow-500">
          Escolha seu Barbeiro
        </h2>
      </div>

      {loading && <p className="text-center text-gray-300">Carregando barbeiros...</p>}
      {erro && <p className="text-center text-red-300">{erro}</p>}
      {!loading && !erro && barbers.length === 0 && (
        <p className="text-center text-gray-300">Nenhum barbeiro disponível no momento.</p>
      )}

      <div className="flex flex-wrap justify-center gap-8">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            onClick={() => handleSelect(barber)}
            className={`cursor-pointer w-80 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl transition-transform hover:scale-105`}
          >
            <img
              src={barber.foto || "Barbeiro.png"}
              alt={barber.nome}
              className={`w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto object-cover border-4 mb-4 transition-all ${
                selectedBarber === barber.id ? "border-yellow-500 scale-105" : "border-white/10"
              }`}
            />

            <h3 className="text-2xl font-semibold text-center mb-3">
              {barber.nome}
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed text-center">
              {barber.descricao}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
