import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Agendar() {
  const location = useLocation();
  const barberName = location.state?.barberName || "Barbeiro";
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const navigate = useNavigate();

  const generateTimeSlots = (start, end) => {
    let slots = [];
    let current = start;
    while (current <= end) {
      const h = String(Math.floor(current)).padStart(2, "0");
      const m = String((current % 1) * 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
      current += 0.5;
    }
    return slots;
  };

  const times = [
    ...generateTimeSlots(9, 11.5),
    ...generateTimeSlots(13.5, 18),
  ];

  const confirm = () => {
    if (!selectedDate || !selectedTime)
      return alert("Selecione o dia e o horário.");
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
          Barbeiro Selecionado:{" "}
          <span className="text-yellow-400 font-bold">{barberName}</span>
        </p>

        <label className="font-semibold mb-1 block">Dia:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-3 w-full rounded bg-white text-black mb-4"
        />

        <label className="font-semibold mb-2 block">Horário:</label>
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {times.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`py-2 rounded-lg font-bold transition ${
                selectedTime === t
                  ? "bg-yellow-500 text-black"
                  : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-bold"
        >
          Confirmar
        </button>
      </div>
    </section>
  );
}
