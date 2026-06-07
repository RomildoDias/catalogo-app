import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">CatálogoApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.nome}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo, {user?.nome}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">Seu plano</p>
              <p className="text-2xl font-bold text-green-800 capitalize">
                {user?.plano}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">WhatsApp</p>
              <p className="text-lg font-bold text-blue-800">{user?.whatsapp}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700 font-medium">Slug da loja</p>
              <p className="text-lg font-bold text-purple-800">{user?.slug}</p>
            </div>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            Em breve: gestão de produtos, categorias e personalização.
          </p>
        </div>
      </main>
    </div>
  );
}
