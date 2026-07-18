import React from "react";
import Swal from "sweetalert2";
import { barbeirosApi } from "../../lib/api";

const vazio = { nome: "", descricao: "", foto: "", ativo: true };

const imagensPublicas = ["Barbeiro.png", "Emblema.png", "Fundo.jpg", "homem1.jpg", "homem2.jpg"];

function normalizarFoto(foto) {
  if (!foto) return "";
  if (
    foto.startsWith("data:") ||
    foto.startsWith("http://") ||
    foto.startsWith("https://") ||
    foto.startsWith("/")
  ) {
    return foto;
  }
  return `/${foto}`;
}

export default function AdminBarbeiros() {
  const [barbeiros, setBarbeiros] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");
  const [form, setForm] = React.useState(vazio);
  const [editandoId, setEditandoId] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  const previewFoto = normalizarFoto(form.foto);

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

  const handleArquivoFoto = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      setForm((estadoAtual) => ({
        ...estadoAtual,
        foto: typeof leitor.result === "string" ? leitor.result : estadoAtual.foto,
      }));
    };
    leitor.readAsDataURL(arquivo);
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

        <label className="text-sm font-semibold block mb-1">Foto</label>
        <input
          value={form.foto}
          onChange={(e) => setForm({ ...form, foto: e.target.value })}
          placeholder="homem1.jpg, /homem1.jpg, https://... ou data:image/..."
          className="p-2 w-full rounded bg-white text-black mb-2"
        />

        <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <label className="text-sm font-semibold block mb-2">Ou envie uma imagem do computador</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleArquivoFoto}
            className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-yellow-600"
          />

          <p className="mt-2 text-xs text-gray-400">
            Se escolher um arquivo, ele será convertido para base64 e salvo no banco. Se digitar um nome,
            usamos imagens do projeto em <span className="font-semibold text-gray-200">/public</span>.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {imagensPublicas.map((imagem) => (
              <button
                key={imagem}
                type="button"
                onClick={() => setForm((estadoAtual) => ({ ...estadoAtual, foto: imagem }))}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-yellow-500 hover:text-yellow-400"
              >
                {imagem}
              </button>
            ))}
          </div>

          {previewFoto && (
            <div className="mt-4 flex items-center gap-4">
              <img
                src={previewFoto}
                alt="Pré-visualização do barbeiro"
                className="h-20 w-20 rounded-full object-cover border border-white/10"
              />
              <div className="text-xs text-gray-400 break-all">
                <p className="font-semibold text-gray-200 mb-1">Pré-visualização</p>
                <p>{form.foto}</p>
              </div>
            </div>
          )}
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
