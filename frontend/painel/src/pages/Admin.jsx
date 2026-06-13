import { useState, useEffect } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";
import usePageTitle from "../hooks/usePageTitle";

export default function Admin() {
  usePageTitle("Administração");
  const [lojistas, setLojistas] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Layout><p>Carregando...</p></Layout>;

  return (
    <Layout>
      <h2 className="text-xl font-semibold text-white mb-6">Administração</h2>

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
          <p className="p-6 text-slate-400 text-center">Nenhum lojista cadastrado</p>
        )}
      </div>
    </Layout>
  );
}
