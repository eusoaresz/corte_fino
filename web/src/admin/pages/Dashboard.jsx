import React from "react";
import { barbeirosApi, servicosApi, agendamentosApi } from "../../lib/api";

function getTodayIsoDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
}

export default function Dashboard() {
  const [stats, setStats] = React.useState(null);
  const [erro, setErro] = React.useState("");

  React.useEffect(() => {
    const hoje = getTodayIsoDate();
    Promise.all([
      barbeirosApi.listar(),
      servicosApi.listar(),
      agendamentosApi.listar({ data: hoje, status: "CONFIRMADO" }),
    ])
      .then(([barbeiros, servicos, agendamentosHoje]) => {
        setStats({
          barbeiros: barbeiros.length,
          servicos: servicos.length,
          agendamentosHoje: agendamentosHoje.length,
        });
      })
      .catch(() => setErro("Não foi possível carregar o resumo."));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {erro && <p className="text-red-300">{erro}</p>}

      {!stats && !erro && <p className="text-gray-400">Carregando...</p>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Barbeiros cadastrados</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.barbeiros}</p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Serviços cadastrados</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.servicos}</p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Agendamentos confirmados hoje</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.agendamentosHoje}</p>
          </div>
        </div>
      )}
    </div>
  );
}
