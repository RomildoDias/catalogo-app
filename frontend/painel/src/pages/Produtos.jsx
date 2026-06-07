import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Produtos() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "", badge: "", categoria_id: "" });
  const [editId, setEditId] = useState(null);

  const carregar = async () => {
    try {
      const [p, c] = await Promise.all([api.produtos.listar(), api.categorias.listar()]);
      setProdutos(p);
      setCategorias(c);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => {
    setForm({ nome: "", descricao: "", preco: "", badge: "", categoria_id: "" });
    setEditId(null);
    setModal("produto");
  };

  const abrirEditar = (p) => {
    setForm({
      nome: p.nome,
      descricao: p.descricao || "",
      preco: p.preco || "",
      badge: p.badge || "",
      categoria_id: p.categoria_id || "",
    });
    setEditId(p.id);
    setModal("produto");
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...form };
      if (!dados.categoria_id) dados.categoria_id = null;
      if (dados.preco) dados.preco = parseFloat(dados.preco.replace(",", "."));
      else dados.preco = null;
      if (editId) {
        await api.produtos.atualizar(editId, dados);
      } else {
        await api.produtos.criar(dados);
      }
      setModal(null);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const deletar = async (id) => {
    if (!confirm("Remover produto?")) return;
    try {
      await api.produtos.deletar(id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleAtivo = async (id) => {
    try {
      await api.produtos.toggleAtivo(id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const maxProdutos = user?.plano === "gratuito" ? 20 : Infinity;
  const ativosCount = produtos.filter((p) => p.ativo).length;

  if (loading) return <Layout><p>Carregando...</p></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Produtos</h2>
          <p className="text-sm text-gray-500">
            {ativosCount}/{maxProdutos === Infinity ? "∞" : maxProdutos} ativos
          </p>
        </div>
        <button
          onClick={abrirCriar}
          disabled={user?.plano === "gratuito" && ativosCount >= 20}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
        >
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {produtos.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Nenhum produto cadastrado</p>
        ) : (
          <div className="divide-y">
            {produtos.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.ativo ? "bg-green-500" : "bg-red-400"}`} />
                    <p className="font-medium text-gray-800 truncate">{p.nome}</p>
                    {p.badge && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {p.categoria_id
                      ? categorias.find((c) => c.id === p.categoria_id)?.nome || "Sem categoria"
                      : "Sem categoria"}
                    {p.preco != null && ` · R$ ${parseFloat(p.preco).toFixed(2)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAtivo(p.id)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      p.ativo
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => abrirEditar(p)} className="text-sm text-blue-600 hover:text-blue-800">
                    Editar
                  </button>
                  <button onClick={() => deletar(p.id)} className="text-sm text-red-600 hover:text-red-800">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === "produto" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editId ? "Editar" : "Novo"} Produto</h3>
            <form onSubmit={salvar} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    type="text"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Nenhum</option>
                    <option value="Novo">Novo</option>
                    <option value="Popular">Popular</option>
                    <option value="Oferta">Oferta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={form.categoria_id}
                  onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
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
