import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Bem-vindo, {user?.nome}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-300 font-medium">Seu plano</p>
            <p className="text-2xl font-bold text-white capitalize">
              {user?.plano}
            </p>
          </div>
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-300 font-medium">WhatsApp</p>
            <p className="text-lg font-bold text-white">{user?.whatsapp}</p>
          </div>
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-300 font-medium">Slug da loja</p>
            <p className="text-lg font-bold text-white">{user?.slug}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
