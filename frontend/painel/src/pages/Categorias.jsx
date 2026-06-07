import { useState, useEffect } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [nome, setNome] = useState("");
  const [editId, setEditId] = useState(null);

  const carregar = async () => {
    try {
      setCategorias(await api.categorias.listar());
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => { setNome(""); setEditId(null); setModal("categoria"); };

  const abrirEditar = (c) => { setNome(c.nome); setEditId(c.id); setModal("categoria"); };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.categorias.atualizar(editId, nome);
      else await api.categorias.criar(nome);
      setModal(null);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const deletar = async (id) => {
    if (!confirm("Remover categoria? Produtos vinculados ficarão sem categoria.")) return;
    try {
      await api.categorias.deletar(id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <Layout><p>Carregando...</p></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Categorias</h2>
        <button
          onClick={abrirCriar}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
        >
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {categorias.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Nenhuma categoria cadastrada</p>
        ) : (
          <div className="divide-y">
            {categorias.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{c.nome}</p>
                  <p className="text-sm text-gray-500">Ordem: {c.ordem}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEditar(c)} className="text-sm text-blue-600 hover:text-blue-800">
                    Renomear
                  </button>
                  <button onClick={() => deletar(c.id)} className="text-sm text-red-600 hover:text-red-800">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === "categoria" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">{editId ? "Renomear" : "Nova"} Categoria</h3>
            <form onSubmit={salvar} className="space-y-3">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600">
                  Cancelar
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                  {editId ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
