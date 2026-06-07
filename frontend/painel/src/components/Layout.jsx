import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/produtos", label: "Produtos", icon: "📦" },
  { path: "/categorias", label: "Categorias", icon: "🏷️" },
  { path: "/personalizacao", label: "Personalizar", icon: "🎨" },
];

const adminItems = [{ path: "/admin", label: "Admin", icon: "⚙️" }];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isSuperadmin = user?.email === "admin@catalogo.app";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm hidden md:flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-800">CatálogoApp</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === item.path
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {isSuperadmin &&
            adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  location.pathname === item.path
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-600 truncate">{user?.nome}</p>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 mt-1"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">CatálogoApp</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.nome}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sair
              </button>
            </div>
          </div>
          <nav className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm whitespace-nowrap px-3 py-1 rounded-full ${
                  location.pathname === item.path
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isSuperadmin &&
              adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm whitespace-nowrap px-3 py-1 rounded-full ${
                    location.pathname === item.path
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
