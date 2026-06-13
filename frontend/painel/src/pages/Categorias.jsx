import { useState, useEffect } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import usePageTitle from "../hooks/usePageTitle";

export default function Categorias() {
  usePageTitle("Categorias");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [nome, setNome] = useState("");
  const [editId, setEditId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showFeedback = (msg, tipo) => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback(null), 4000);
  };

  const carregar = async () => {
    try {
      setCategorias(await api.categorias.listar());
    } catch (e) {
      showFeedback(e.message, "erro");
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
      if (editId) {
        await api.categorias.atualizar(editId, nome);
        showFeedback("Categoria renomeada", "sucesso");
      } else {
        await api.categorias.criar(nome);
        showFeedback("Categoria criada", "sucesso");
      }
      setModal(null);
      carregar();
    } catch (e) {
      showFeedback(e.message, "erro");
    }
  };

  const deletar = async (id) => {
    try {
      setConfirmDelete(null);
      await api.categorias.deletar(id);
      showFeedback("Categoria removida", "sucesso");
      carregar();
    } catch (e) {
      showFeedback(e.message, "erro");
    }
  };

  const mover = async (id, direcao) => {
    const idx = categorias.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const nova = [...categorias];
    const troca = direcao === "cima" ? idx - 1 : idx + 1;
    if (troca < 0 || troca >= nova.length) return;
    [nova[idx], nova[troca]] = [nova[troca], nova[idx]];
    const itens = nova.map((c, i) => ({ id: c.id, ordem: i }));
    try {
      await api.categorias.reordenar(itens);
      carregar();
    } catch (e) {
      showFeedback(e.message, "erro");
    }
  };

  if (loading) return <Layout><TableSkeleton /></Layout>;

  return (
    <Layout>
      {feedback && (
        <div className={"mb-4 px-4 py-2 rounded-md text-sm " + (feedback.tipo === "erro" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
          {feedback.msg}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Categorias</h2>
        <button
          onClick={abrirCriar}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {categorias.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Nenhuma categoria cadastrada</p>
        ) : (
          <div className="divide-y">
            {categorias.map((c, i) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => mover(c.id, "cima")}
                      disabled={i === 0}
                      className="text-xs leading-none text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => mover(c.id, "baixo")}
                      disabled={i === categorias.length - 1}
                      className="text-xs leading-none text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      ▼
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{c.nome}</p>
                    <p className="text-xs text-gray-400">Ordem: {c.ordem}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEditar(c)} className="text-sm text-blue-600 hover:text-blue-800">
                    Renomear
                  </button>
                  <button onClick={() => setConfirmDelete(c.id)} className="text-sm text-red-600 hover:text-red-800">
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
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  {editId ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remover categoria"
        message="Tem certeza? Produtos vinculados ficarão sem categoria."
        onConfirm={() => deletar(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
