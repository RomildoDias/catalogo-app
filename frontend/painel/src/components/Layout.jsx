import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
  ),
  produtos: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
  ),
  categorias: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v4H4z" /><path d="M4 12h16v4H4z" /><path d="M4 20h8v4H4z" /></svg>
  ),
  personalizar: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
  admin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
  ),
};

const navItems = [
  { path: "/", label: "Dashboard", icon: icons.dashboard },
  { path: "/produtos", label: "Produtos", icon: icons.produtos },
  { path: "/categorias", label: "Categorias", icon: icons.categorias },
  { path: "/personalizacao", label: "Personalizar", icon: icons.personalizar },
];

const adminItems = [{ path: "/admin", label: "Clientes", icon: icons.admin }];

export default function Layout({ children }) {
  const { user, logout, isSuperadmin } = useAuth();
  const location = useLocation();

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
              <span className="flex-shrink-0">{item.icon}</span>
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
                <span className="flex-shrink-0">{item.icon}</span>
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
