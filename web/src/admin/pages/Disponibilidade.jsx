import React from "react";
import Swal from "sweetalert2";
import { barbeirosApi, disponibilidadeApi, bloqueiosApi } from "../../lib/api";

const DIAS = [
  { valor: "DOMINGO", label: "Domingo" },
  { valor: "SEGUNDA", label: "Segunda" },
  { valor: "TERCA", label: "Terça" },
  { valor: "QUARTA", label: "Quarta" },
  { valor: "QUINTA", label: "Quinta" },
  { valor: "SEXTA", label: "Sexta" },
  { valor: "SABADO", label: "Sábado" },
];

const janelaVazia = { diaSemana: "SEGUNDA", horaInicio: "09:00", horaFim: "18:00", intervaloMinutos: 30 };
const bloqueioVazio = { data: "", horaInicio: "", horaFim: "", motivo: "" };

export default function AdminDisponibilidade() {
  const [barbeiros, setBarbeiros] = React.useState([]);
  const [barbeiroId, setBarbeiroId] = React.useState("");
  const [janelas, setJanelas] = React.useState([]);
  const [bloqueios, setBloqueios] = React.useState([]);
  const [novaJanela, setNovaJanela] = React.useState(janelaVazia);
  const [novoBloqueio, setNovoBloqueio] = React.useState(bloqueioVazio);

  React.useEffect(() => {
    barbeirosApi.listar().then((lista) => {
      setBarbeiros(lista);
      if (lista.length > 0) setBarbeiroId(String(lista[0].id));
    });
  }, []);

  const carregar = React.useCallback(() => {
    if (!barbeiroId) return;
    disponibilidadeApi.listar(barbeiroId).then(setJanelas);
    bloqueiosApi.listar(barbeiroId).then(setBloqueios);
  }, [barbeiroId]);

  React.useEffect(carregar, [carregar]);

  const handleAddJanela = async (e) => {
    e.preventDefault();
    try {
      await disponibilidadeApi.criar({ barbeiroId: Number(barbeiroId), ...novaJanela });
      setNovaJanela(janelaVazia);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao salvar horário", text: err.message });
    }
  };

  const handleRemoverJanela = async (id) => {
    try {
      await disponibilidadeApi.remover(id);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao remover", text: err.message });
    }
  };

  const handleAddBloqueio = async (e) => {
    e.preventDefault();
    try {
      await bloqueiosApi.criar({
        barbeiroId: Number(barbeiroId),
        data: novoBloqueio.data,
        horaInicio: novoBloqueio.horaInicio || undefined,
        horaFim: novoBloqueio.horaFim || undefined,
        motivo: novoBloqueio.motivo || undefined,
      });
      setNovoBloqueio(bloqueioVazio);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao salvar bloqueio", text: err.message });
    }
  };

  const handleRemoverBloqueio = async (id) => {
    try {
      await bloqueiosApi.remover(id);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao remover", text: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Disponibilidade</h2>

      <label className="text-sm font-semibold block mb-1">Barbeiro</label>
      <select
        value={barbeiroId}
        onChange={(e) => setBarbeiroId(e.target.value)}
        className="p-2 rounded bg-white text-black mb-8"
      >
        {barbeiros.map((b) => (
          <option key={b.id} value={b.id}>
            {b.nome}
          </option>
        ))}
      </select>

      {barbeiroId && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* ── Grade semanal ── */}
          <div>
            <h3 className="font-semibold mb-3">Grade semanal</h3>

            <form onSubmit={handleAddJanela} className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
              <select
                value={novaJanela.diaSemana}
                onChange={(e) => setNovaJanela({ ...novaJanela, diaSemana: e.target.value })}
                className="p-2 w-full rounded bg-white text-black"
              >
                {DIAS.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={novaJanela.horaInicio}
                  onChange={(e) => setNovaJanela({ ...novaJanela, horaInicio: e.target.value })}
                  className="p-2 flex-1 rounded bg-white text-black"
                />
                <input
                  type="time"
                  value={novaJanela.horaFim}
                  onChange={(e) => setNovaJanela({ ...novaJanela, horaFim: e.target.value })}
                  className="p-2 flex-1 rounded bg-white text-black"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label>Intervalo entre horários (min):</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={novaJanela.intervaloMinutos}
                  onChange={(e) => setNovaJanela({ ...novaJanela, intervaloMinutos: Number(e.target.value) })}
                  className="p-1 w-20 rounded bg-white text-black"
                />
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold w-full">
                Adicionar janela
              </button>
            </form>

            <ul className="space-y-2">
              {janelas.map((j) => (
                <li
                  key={j.id}
                  className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 text-sm"
                >
                  <span>
                    {DIAS.find((d) => d.valor === j.diaSemana)?.label} — {j.horaInicio} às {j.horaFim} (
                    {j.intervaloMinutos} min)
                  </span>
                  <button onClick={() => handleRemoverJanela(j.id)} className="text-red-400 font-semibold">
                    Remover
                  </button>
                </li>
              ))}
              {janelas.length === 0 && <p className="text-gray-400 text-sm">Nenhuma janela cadastrada.</p>}
            </ul>
          </div>

          {/* ── Bloqueios ── */}
          <div>
            <h3 className="font-semibold mb-3">Bloqueios (folgas, feriados, pausas)</h3>

            <form onSubmit={handleAddBloqueio} className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
              <input
                type="date"
                required
                value={novoBloqueio.data}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, data: e.target.value })}
                className="p-2 w-full rounded bg-white text-black"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={novoBloqueio.horaInicio}
                  onChange={(e) => setNovoBloqueio({ ...novoBloqueio, horaInicio: e.target.value })}
                  className="p-2 flex-1 rounded bg-white text-black"
                  placeholder="Deixe vazio p/ dia todo"
                />
                <input
                  type="time"
                  value={novoBloqueio.horaFim}
                  onChange={(e) => setNovoBloqueio({ ...novoBloqueio, horaFim: e.target.value })}
                  className="p-2 flex-1 rounded bg-white text-black"
                />
              </div>
              <p className="text-xs text-gray-400">Deixe os horários em branco para bloquear o dia inteiro.</p>
              <input
                value={novoBloqueio.motivo}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, motivo: e.target.value })}
                placeholder="Motivo (opcional)"
                className="p-2 w-full rounded bg-white text-black"
              />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold w-full">
                Adicionar bloqueio
              </button>
            </form>

            <ul className="space-y-2">
              {bloqueios.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 text-sm"
                >
                  <span>
                    {new Date(String(b.data).split("T")[0] + "T00:00:00").toLocaleDateString("pt-BR")}
                    {b.horaInicio ? ` — ${b.horaInicio} às ${b.horaFim}` : " — dia inteiro"}
                    {b.motivo ? ` (${b.motivo})` : ""}
                  </span>
                  <button onClick={() => handleRemoverBloqueio(b.id)} className="text-red-400 font-semibold">
                    Remover
                  </button>
                </li>
              ))}
              {bloqueios.length === 0 && <p className="text-gray-400 text-sm">Nenhum bloqueio cadastrado.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
