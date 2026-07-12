import React from "react";
import Swal from "sweetalert2";
import { agendamentosApi, barbeirosApi } from "../../lib/api";

function getTodayIsoDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
}

export default function AdminAgendamentos() {
  const [barbeiros, setBarbeiros] = React.useState([]);
  const [filtroBarbeiro, setFiltroBarbeiro] = React.useState("");
  const [filtroData, setFiltroData] = React.useState(getTodayIsoDate());
  const [filtroStatus, setFiltroStatus] = React.useState("");
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");

  React.useEffect(() => {
    barbeirosApi.listar().then(setBarbeiros);
  }, []);

  const carregar = React.useCallback(() => {
    setCarregando(true);
    const filtros = {};
    if (filtroBarbeiro) filtros.barbeiroId = filtroBarbeiro;
    if (filtroData) filtros.data = filtroData;
    if (filtroStatus) filtros.status = filtroStatus;

    agendamentosApi
      .listar(filtros)
      .then(setAgendamentos)
      .catch(() => setErro("Não foi possível carregar os agendamentos."))
      .finally(() => setCarregando(false));
  }, [filtroBarbeiro, filtroData, filtroStatus]);

  React.useEffect(carregar, [carregar]);

  const handleCancelar = async (agendamento) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancelar agendamento?",
      text: `${agendamento.clienteNome} — ${agendamento.horaInicio}`,
      showCancelButton: true,
      confirmButtonText: "Cancelar agendamento",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await agendamentosApi.cancelar(agendamento.id);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao cancelar", text: err.message });
    }
  };

  const handleReagendar = async (agendamento) => {
    const { value: form } = await Swal.fire({
      title: "Reagendar",
      html: `
        <input id="swal-data" type="date" class="swal2-input" value="${String(agendamento.data).split("T")[0]}">
        <input id="swal-hora" type="time" class="swal2-input" value="${agendamento.horaInicio}">
      `,
      showCancelButton: true,
      confirmButtonText: "Reagendar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
      preConfirm: () => {
        const data = document.getElementById("swal-data").value;
        const horaInicio = document.getElementById("swal-hora").value;
        if (!data || !horaInicio) {
          Swal.showValidationMessage("Informe data e horário");
          return false;
        }
        return { data, horaInicio };
      },
    });

    if (!form) return;

    try {
      await agendamentosApi.reagendar(agendamento.id, form);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Não foi possível reagendar", text: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agendamentos</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filtroBarbeiro}
          onChange={(e) => setFiltroBarbeiro(e.target.value)}
          className="p-2 rounded bg-white text-black"
        >
          <option value="">Todos os barbeiros</option>
          {barbeiros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="p-2 rounded bg-white text-black"
        />
        <button
          type="button"
          onClick={() => setFiltroData("")}
          className="text-sm text-gray-300 underline"
        >
          limpar data
        </button>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="p-2 rounded bg-white text-black"
        >
          <option value="">Todos os status</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="CANCELADO">Cancelado</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      {erro && <p className="text-red-300 mb-4">{erro}</p>}
      {carregando && <p className="text-gray-400">Carregando...</p>}

      {!carregando && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Hora</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Barbeiro</th>
                <th className="py-2 pr-4">Serviço</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    {new Date(String(a.data).split("T")[0] + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2 pr-4">
                    {a.horaInicio} - {a.horaFim}
                  </td>
                  <td className="py-2 pr-4">
                    {a.clienteNome}
                    <span className="block text-xs text-gray-400">{a.clienteTelefone}</span>
                  </td>
                  <td className="py-2 pr-4">{a.barbeiro?.nome}</td>
                  <td className="py-2 pr-4">{a.servico?.nome}</td>
                  <td className="py-2 pr-4">{a.status}</td>
                  <td className="py-2 pr-4 flex gap-3">
                    {a.status === "CONFIRMADO" && (
                      <>
                        <button onClick={() => handleReagendar(a)} className="text-yellow-400 font-semibold">
                          Reagendar
                        </button>
                        <button onClick={() => handleCancelar(a)} className="text-red-400 font-semibold">
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {agendamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-gray-400">
                    Nenhum agendamento encontrado para esse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
