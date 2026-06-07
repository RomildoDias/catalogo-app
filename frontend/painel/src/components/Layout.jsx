import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "🐟" },
  { path: "/produtos", label: "Produtos", icon: "🪸" },
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
      <aside className="w-64 bg-slate-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">AquaCatálogo</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-700"
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
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm text-slate-300 truncate">{user?.nome}</p>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 mt-1"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="bg-slate-800 md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">AquaCatálogo</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{user?.nome}</span>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300"
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
                    ? "bg-blue-500 text-white"
                    : "bg-slate-600 text-slate-200"
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
                      ? "bg-blue-500 text-white"
                      : "bg-slate-600 text-slate-200"
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
