import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";

function formatarPreco(preco) {
  return Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Confirmation() {
  const { state } = useLocation();
  const agendamento = state?.agendamento;

  if (!agendamento) {
    // Acesso direto sem ter passado pelo fluxo de agendamento
    return <Navigate to="/agendamento" replace />;
  }

  const { barbeiro, servico, data, horaInicio, horaFim, clienteNome } = agendamento;
  const dataFormatada = new Date(`${String(data).split("T")[0]}T00:00:00`).toLocaleDateString("pt-BR");

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
            <strong>Cliente:</strong> {clienteNome}
          </p>
          <p>
            <strong>Barbeiro:</strong> {barbeiro?.nome}
          </p>
          <p>
            <strong>Serviço:</strong> {servico?.nome}
          </p>
          <p>
            <strong>Data:</strong> {dataFormatada}
          </p>
          <p>
            <strong>Horário:</strong> {horaInicio} às {horaFim}
          </p>
          <p>
            <strong>Duração estimada:</strong> {servico?.duracaoMinutos} min
          </p>
          <p>
            <strong>Valor:</strong> {servico ? formatarPreco(servico.preco) : "-"}
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
