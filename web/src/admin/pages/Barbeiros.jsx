import React from "react";
import Swal from "sweetalert2";
import { barbeirosApi } from "../../lib/api";

const vazio = { nome: "", descricao: "", foto: "", ativo: true };

export default function AdminBarbeiros() {
  const [barbeiros, setBarbeiros] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");
  const [form, setForm] = React.useState(vazio);
  const [editandoId, setEditandoId] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  const carregar = () => {
    setCarregando(true);
    barbeirosApi
      .listar()
      .then(setBarbeiros)
      .catch(() => setErro("Não foi possível carregar os barbeiros."))
      .finally(() => setCarregando(false));
  };

  React.useEffect(carregar, []);

  const handleEditar = (barbeiro) => {
    setEditandoId(barbeiro.id);
    setForm({
      nome: barbeiro.nome,
      descricao: barbeiro.descricao || "",
      foto: barbeiro.foto || "",
      ativo: barbeiro.ativo,
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(vazio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await barbeirosApi.atualizar(editandoId, form);
      } else {
        await barbeirosApi.criar(form);
      }
      handleCancelar();
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao salvar", text: err.message });
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (barbeiro) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Remover ${barbeiro.nome}?`,
      text: "O barbeiro será desativado e removido das listagens públicas.",
      showCancelButton: true,
      confirmButtonText: "Remover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await barbeirosApi.remover(barbeiro.id);
      carregar();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro ao remover", text: err.message });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Barbeiros</h2>

      <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8 max-w-xl">
        <h3 className="font-semibold mb-4">{editandoId ? "Editar barbeiro" : "Novo barbeiro"}</h3>

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
          rows={3}
        />

        <label className="text-sm font-semibold block mb-1">Foto (nome do arquivo em /public)</label>
        <input
          value={form.foto}
          onChange={(e) => setForm({ ...form, foto: e.target.value })}
          placeholder="homem1.jpg"
          className="p-2 w-full rounded bg-white text-black mb-3"
        />

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
            {editandoId ? "Salvar alterações" : "Criar barbeiro"}
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
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {barbeiros.map((b) => (
                <tr key={b.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">{b.nome}</td>
                  <td className="py-2 pr-4">{b.ativo ? "Ativo" : "Inativo"}</td>
                  <td className="py-2 pr-4 flex gap-3">
                    <button onClick={() => handleEditar(b)} className="text-yellow-400 font-semibold">
                      Editar
                    </button>
                    <button onClick={() => handleRemover(b)} className="text-red-400 font-semibold">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {barbeiros.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-gray-400">
                    Nenhum barbeiro cadastrado ainda.
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
