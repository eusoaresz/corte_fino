import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { agendamentosApi, barbeirosApi, servicosApi } from "../../lib/api";
import { useClientAuth } from "../lib/useClientAuth";

const getTodayIsoDate = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

export default function Agendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { autenticado, cliente } = useClientAuth();

  const [barbeiros, setBarbeiros] = React.useState([]);
  const [servicos, setServicos] = React.useState([]);
  const [barbeiroId, setBarbeiroId] = React.useState(location.state?.barbeiroId || "");
  const [servicoId, setServicoId] = React.useState(location.state?.servicoId || "");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [horarios, setHorarios] = React.useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = React.useState(false);
  const [erroHorarios, setErroHorarios] = React.useState("");

  const todayIsoDate = getTodayIsoDate();

  // Carrega listas para os selects (fonte única de dados: a API)
  React.useEffect(() => {
    barbeirosApi.listar(true).then(setBarbeiros).catch(() => setBarbeiros([]));
    servicosApi.listar(true).then(setServicos).catch(() => setServicos([]));
  }, []);

  // Sempre que barbeiro, serviço ou data mudam, busca os horários REALMENTE
  // disponíveis (grade semanal - bloqueios - agendamentos já confirmados).
  React.useEffect(() => {
    setSelectedTime("");
    setHorarios([]);
    setErroHorarios("");

    if (!barbeiroId || !servicoId || !selectedDate) return;

    setCarregandoHorarios(true);
    agendamentosApi
      .horariosDisponiveis(barbeiroId, servicoId, selectedDate)
      .then((res) => setHorarios(res.horarios || []))
      .catch(() => setErroHorarios("Não foi possível carregar os horários. Tente novamente."))
      .finally(() => setCarregandoHorarios(false));
  }, [barbeiroId, servicoId, selectedDate]);

  const barbeiroSelecionado = barbeiros.find((b) => String(b.id) === String(barbeiroId));
  const servicoSelecionado = servicos.find((s) => String(s.id) === String(servicoId));

  const validarSelecao = () => {
    if (!barbeiroId || !servicoId || !selectedDate || !selectedTime) {
      Swal.fire({
        icon: "error",
        title: "Selecione os dados",
        text: "Escolha barbeiro, serviço, dia e horário.",
        confirmButtonColor: "#eab308",
      });
      return false;
    }
    if (!autenticado) {
      Swal.fire({
        icon: "error",
        title: "Entre na sua conta",
        text: "Faça login ou crie uma conta para confirmar seu agendamento.",
        confirmButtonColor: "#eab308",
      });
      return false;
    }
    return true;
  };

  const confirmarAgendamento = async () => {
    try {
      const agendamento = await agendamentosApi.criar({
        barbeiroId: Number(barbeiroId),
        servicoId: Number(servicoId),
        data: selectedDate,
        horaInicio: selectedTime,
      });

      navigate("/confirmacao", { state: { agendamento } });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Não foi possível agendar",
        text: error.message || "Esse horário pode ter sido reservado por outra pessoa.",
        confirmButtonColor: "#eab308",
      });
      // Atualiza a lista de horários, já que o escolhido pode ter ficado indisponível
      setSelectedTime("");
      if (barbeiroId && servicoId && selectedDate) {
        agendamentosApi
          .horariosDisponiveis(barbeiroId, servicoId, selectedDate)
          .then((res) => setHorarios(res.horarios || []))
          .catch(() => {});
      }
    }
  };

  const handleReview = async () => {
    if (!validarSelecao()) return;

    const result = await Swal.fire({
      title: "Resumo do agendamento",
      html: `
        <div style="text-align:left; line-height:1.7; font-size:15px;">
          <p><strong>Barbeiro:</strong> ${barbeiroSelecionado?.nome ?? ""}</p>
          <p><strong>Serviço:</strong> ${servicoSelecionado?.nome ?? ""}</p>
          <p><strong>Data:</strong> ${selectedDate}</p>
          <p><strong>Horário:</strong> ${selectedTime}</p>
          <p><strong>Duração estimada:</strong> ${servicoSelecionado?.duracaoMinutos ?? "-"} min</p>
          <p><strong>Cliente:</strong> ${cliente?.nome ?? ""}</p>
          <p style="margin-top:12px;color:#6b7280;">Confira os dados antes de confirmar. Depois disso, o horário ficará bloqueado.</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Confirmar agendamento",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#334155",
      background: "#111827",
      color: "#ffffff",
      width: 520,
    });

    if (result.isConfirmed) {
      confirmarAgendamento();
    }
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center pt-24 px-6 flex justify-center items-start text-white"
      style={{ backgroundImage: "url('Fundo.jpg')" }}
    >
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
          Monte seu Agendamento
        </h2>

        <label className="font-semibold mb-1 block">Barbeiro:</label>
        <select
          value={barbeiroId}
          onChange={(e) => setBarbeiroId(e.target.value)}
          className="p-3 w-full rounded bg-white text-black mb-4"
        >
          <option value="">Selecione um barbeiro</option>
          {barbeiros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>

        <label className="font-semibold mb-1 block">Serviço:</label>
        <select
          value={servicoId}
          onChange={(e) => setServicoId(e.target.value)}
          className="p-3 w-full rounded bg-white text-black mb-4"
        >
          <option value="">Selecione um serviço</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} — {s.duracaoMinutos} min
            </option>
          ))}
        </select>

        <label className="font-semibold mb-1 block">Dia:</label>
        <input
          type="date"
          value={selectedDate}
          min={todayIsoDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        <label className="font-semibold mb-2 block">Horário:</label>
        {!barbeiroId || !servicoId || !selectedDate ? (
          <p className="text-sm text-gray-300 mb-4">Escolha barbeiro, serviço e dia para ver os horários.</p>
        ) : carregandoHorarios ? (
          <p className="text-sm text-gray-300 mb-4">Carregando horários...</p>
        ) : erroHorarios ? (
          <p className="text-sm text-red-300 mb-4">{erroHorarios}</p>
        ) : horarios.length === 0 ? (
          <p className="text-sm text-red-300 mb-4">Nenhum horário disponível nesse dia. Tente outra data.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-2">
            {horarios.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`py-2 rounded-lg font-bold transition ${
                  selectedTime === time ? "bg-yellow-500 text-black" : "bg-neutral-700 hover:bg-neutral-600"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 mb-2 p-3 rounded bg-white/10 text-sm">
          {autenticado ? <>Agendando como <strong>{cliente?.nome}</strong>.</> : <>Entre na sua conta para confirmar o agendamento.</>}
        </div>

        <button
          onClick={handleReview}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-bold"
        >
          Revisar agendamento
        </button>
      </div>
    </section>
  );
}
