import React from "react";
import Swal from "sweetalert2";
import { servicosApi } from "../../lib/api";

const vazio = { nome: "", descricao: "", preco: "", duracaoMinutos: "", ativo: true };

export default function AdminServicos() {
  const [servicos, setServicos] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");
  const [form, setForm] = React.useState(vazio);
  const [editandoId, setEditandoId] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  const carregar = () => {
    setCarregando(true);
    servicosApi
      .listar()
      .then(setServicos)
      .catch(() => setErro("Não foi possível carregar os serviços."))
      .finally(() => setCarregando(false));
  };

  React.useEffect(carregar, []);

  const handleEditar = (servico) => {
    setEditandoId(servico.id);
    setForm({
      nome: servico.nome,
      descricao: servico.descricao || "",
      preco: String(servico.preco),
      duracaoMinutos: String(servico.duracaoMinutos),
      ativo: servico.ativo,
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(vazio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const payload = {
      ...form,
      preco: Number(form.preco),
      duracaoMinutos: Number(form.duracaoMinutos),
    };
    try {
      if (editandoId) {
        await servicosApi.atualizar(editandoId, payload);
      } else {
        await servicosApi.criar(payload);
      }
      handleCancelar();
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao salvar", text: err.message });
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (servico) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Remover ${servico.nome}?`,
      showCancelButton: true,
      confirmButtonText: "Remover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await servicosApi.remover(servico.id);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao remover", text: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Serviços</h2>

      <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8 max-w-xl">
        <h3 className="font-semibold mb-4">{editandoId ? "Editar serviço" : "Novo serviço"}</h3>

        <label className="text-sm font-semibold block mb-1">Nome</label>
        <input
          required
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="p-2 w-full rounded bg-white text-black mb-3"
        />

        <label className="text-sm font-semibold block mb-1">Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="p-2 w-full rounded bg-white text-black mb-3"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Preço (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              className="p-2 w-full rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Duração (min)</label>
            <input
              required
              type="number"
              min="5"
              step="5"
              value={form.duracaoMinutos}
              onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
              className="p-2 w-full rounded bg-white text-black"
            />
          </div>
        </div>

        <label className="text-sm font-semibold flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          />
          Ativo (visível na área pública)
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black px-4 py-2 rounded-lg font-bold"
          >
            {editandoId ? "Salvar alterações" : "Criar serviço"}
          </button>
          {editandoId && (
            <button type="button" onClick={handleCancelar} className="px-4 py-2 rounded-lg font-bold bg-white/10">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {erro && <p className="text-red-300 mb-4">{erro}</p>}
      {carregando && <p className="text-gray-400">Carregando...</p>}

      {!carregando && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Preço</th>
                <th className="py-2 pr-4">Duração</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">{s.nome}</td>
                  <td className="py-2 pr-4">
                    {Number(s.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-2 pr-4">{s.duracaoMinutos} min</td>
                  <td className="py-2 pr-4">{s.ativo ? "Ativo" : "Inativo"}</td>
                  <td className="py-2 pr-4 flex gap-3">
                    <button onClick={() => handleEditar(s)} className="text-yellow-400 font-semibold">
                      Editar
                    </button>
                    <button onClick={() => handleRemover(s)} className="text-red-400 font-semibold">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {servicos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-400">
                    Nenhum serviço cadastrado ainda.
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
