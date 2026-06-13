import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Layout from "../components/Layout";
import usePageTitle from "../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [produtos, categorias] = await Promise.all([
          api.produtos.listar(),
          api.categorias.listar(),
        ]);
        setStats({
          totalProdutos: produtos.length,
          ativos: produtos.filter((p) => p.ativo).length,
          categorias: categorias.length,
        });
        setRecentes(
          produtos
            .filter((p) => p.ativo)
            .slice(0, 5)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Bem-vindo, {user?.nome}!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Aqui está um resumo da sua loja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Produtos Ativos</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-bold text-gray-800">
              {stats?.ativos || 0}
              <span className="text-sm font-normal text-gray-400 ml-1">
                / {stats?.totalProdutos || 0}
              </span>
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-emerald-500">
          <p className="text-sm text-gray-500 font-medium">Categorias</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-bold text-gray-800">{stats?.categorias || 0}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-amber-500">
          <p className="text-sm text-gray-500 font-medium">Seu Plano</p>
          <p className="text-3xl font-bold text-gray-800 capitalize">{user?.plano}</p>
          <p className="text-xs text-gray-400 mt-1">
            WhatsApp: {user?.whatsapp}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="font-medium text-gray-800 mb-3">Últimos Produtos Ativos</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : recentes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum produto ativo ainda.
          </p>
        ) : (
          <div className="divide-y">
            {recentes.map((p) => (
              <div key={p.id} className="py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-500">
                    {p.preco != null
                      ? "R$ " + parseFloat(p.preco).toFixed(2)
                      : "Preço não definido"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
