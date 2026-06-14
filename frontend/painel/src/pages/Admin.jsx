import { useState, useEffect } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";
import usePageTitle from "../hooks/usePageTitle";

export default function Admin() {
  usePageTitle("Clientes");
  const [lojistas, setLojistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "", senha: "", plano: "gratuito" });

  const carregar = async () => {
    try {
      setLojistas(await api.admin.listarLojistas());
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const toggleAtivo = async (id) => {
    try {
      await api.admin.toggleAtivo(id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const alterarPlano = async (id, plano) => {
    try {
      await api.admin.alterarPlano(id, plano);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.admin.criarLojista(form);
      setModal(false);
      setForm({ nome: "", email: "", whatsapp: "", senha: "", plano: "gratuito" });
      carregar();
    } catch (e) {
      alert(e.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <Layout><p className="text-slate-400">Carregando...</p></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Clientes</h2>
        <button
          onClick={() => setModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          + Novo Cliente
        </button>
      </div>

      <div className="bg-slate-700 rounded-lg shadow-sm overflow-hidden border border-slate-600">
        <table className="w-full text-sm">
          <thead className="bg-slate-600 text-slate-200">
            <tr>
              <th className="text-left p-3 font-medium">Lojista</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
              <th className="text-left p-3 font-medium">Plano</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {lojistas.map((l) => (
              <tr key={l.id} className="hover:bg-slate-600">
                <td className="p-3">
                  <p className="font-medium text-white">{l.nome}</p>
                  <p className="text-xs text-slate-400">{l.slug}</p>
                </td>
                <td className="p-3 text-slate-300 hidden md:table-cell">{l.email}</td>
                <td className="p-3">
                  <select
                    value={l.plano}
                    onChange={(e) => alterarPlano(l.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs bg-slate-600 text-white border-slate-500"
                  >
                    <option value="gratuito">Gratuito</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleAtivo(l.id)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      l.ativo
                        ? "text-red-400 border-red-500 hover:bg-red-700"
                        : "text-green-400 border-green-500 hover:bg-green-700"
                    }`}
                  >
                    {l.ativo ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lojistas.length === 0 && (
          <p className="p-6 text-slate-400 text-center">Nenhum cliente cadastrado</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(false)}>
          <div className="bg-slate-700 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Novo Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-500 bg-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-500 bg-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-500 bg-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Plano</label>
                <select
                  value={form.plano}
                  onChange={(e) => setForm({ ...form, plano: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-500 bg-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gratuito">Gratuito</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-500 bg-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
