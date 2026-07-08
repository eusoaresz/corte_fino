import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const STORAGE_KEY = "corte_fino_agendamentos";

const generateTimeSlots = (start, end) => {
  const slots = [];
  let current = start;

  while (current <= end) {
    const hours = String(Math.floor(current)).padStart(2, "0");
    const minutes = String((current % 1) * 60).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current += 0.5;
  }

  return slots;
};

const getTodayIsoDate = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const loadReservations = () => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveReservations = (reservations) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
};

export default function Agendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const barberName = location.state?.barberName || "Barbeiro";

  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [reservations, setReservations] = React.useState([]);

  React.useEffect(() => {
    setReservations(loadReservations());
  }, []);

  React.useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const todayIsoDate = getTodayIsoDate();
  const isPastDate = selectedDate !== "" && selectedDate < todayIsoDate;

  const bookedTimesForDate = reservations
    .filter((reservation) => reservation.selectedDate === selectedDate)
    .map((reservation) => reservation.selectedTime);

  const times = [...generateTimeSlots(9, 11.5), ...generateTimeSlots(13.5, 18)];

  const validateSelection = () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({
        icon: "error",
        title: "Selecione os dados",
        text: "Selecione o dia e o horário.",
        confirmButtonColor: "#eab308",
      });
      return false;
    }

    if (selectedDate < todayIsoDate) {
      Swal.fire({
        icon: "error",
        title: "Data inválida",
        text: "Selecione uma data atual ou futura.",
        confirmButtonColor: "#eab308",
      });
      return false;
    }

    if (bookedTimesForDate.includes(selectedTime)) {
      Swal.fire({
        icon: "error",
        title: "Horário indisponível",
        text: "Esse horário já foi reservado. Escolha outro horário.",
        confirmButtonColor: "#eab308",
      });
      return false;
    }

    return true;
  };

  const handleReview = async () => {
    if (!validateSelection()) return;

    const result = await Swal.fire({
      title: "Resumo do agendamento",
      html: `
        <div style="text-align:left; line-height:1.7; font-size:15px;">
          <p><strong>Barbeiro:</strong> ${barberName}</p>
          <p><strong>Data:</strong> ${selectedDate}</p>
          <p><strong>Horário:</strong> ${selectedTime}</p>
          <p><strong>Duração estimada:</strong> 30 min</p>
          <p><strong>Período:</strong> ${selectedTime < "12:00" ? "Manha" : "Tarde"}</p>
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
      confirm();
    }
  };

  const confirm = () => {
    if (!validateSelection()) return;

    const updatedReservations = [
      ...reservations,
      { barberName, selectedDate, selectedTime },
    ];

    saveReservations(updatedReservations);
    setReservations(updatedReservations);

    navigate("/confirmacao", {
      state: { barberName, selectedDate, selectedTime },
    });
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center pt-24 px-6 flex justify-center items-start text-white"
      style={{ backgroundImage: "url('Fundo.jpg')" }}
    >
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
          Escolha a Data e o Horário
        </h2>

        <p className="mb-4 text-gray-300">
          Barbeiro Selecionado: {" "}
          <span className="text-yellow-400 font-bold">{barberName}</span>
        </p>

        <label className="font-semibold mb-1 block">Dia:</label>
        <input
          type="date"
          value={selectedDate}
          min={todayIsoDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        {isPastDate && (
          <p className="mb-3 text-sm text-red-300">
            Datas passadas nao podem ser agendadas.
          </p>
        )}

        <label className="font-semibold mb-2 block">Horário:</label>
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {times.map((time) => {
            const isBooked = bookedTimesForDate.includes(time);

            return (
              <button
                key={time}
                type="button"
                disabled={isBooked}
                onClick={() => {
                  setSelectedTime(time);
                }}
                className={`py-2 rounded-lg font-bold transition ${
                  isBooked
                    ? "bg-neutral-900 text-neutral-500 cursor-not-allowed line-through"
                    : selectedTime === time
                      ? "bg-yellow-500 text-black"
                      : "bg-neutral-700 hover:bg-neutral-600"
                }`}
              >
                {isBooked ? `${time} ocupado` : time}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-gray-300">
          Horarios ocupados ficam bloqueados para esta data.
        </p>

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
