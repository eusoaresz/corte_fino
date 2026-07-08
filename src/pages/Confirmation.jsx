import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();
  const { barberName, selectedDate, selectedTime } = state || {};
  const estimatedDuration = "30 min";
  const bookingStatus = "Agendamento confirmado no navegador atual";

  return (
    <section
      className="min-h-screen bg-cover bg-center pt-24 px-6 text-white flex justify-center items-start"
      style={{ backgroundImage: "url('Fundo.jpg')" }}
    >
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl max-w-md w-full shadow-xl text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">
          Agendamento Confirmado!
        </h2>

        <div className="text-left bg-neutral-900 p-4 rounded mb-6">
          <p>
            <strong>Barbeiro:</strong> {barberName}
          </p>
          <p>
            <strong>Data:</strong> {selectedDate}
          </p>
          <p>
            <strong>Horário:</strong> {selectedTime}
          </p>
          <p>
            <strong>Duração estimada:</strong> {estimatedDuration}
          </p>
          <p>
            <strong>Status:</strong> {bookingStatus}
          </p>
        </div>

        <Link
          to="/"
          className="bg-yellow-500 text-black py-3 px-6 rounded-lg font-bold hover:bg-yellow-600"
        >
          Voltar ao Início
        </Link>
      </div>
    </section>
  );
}
