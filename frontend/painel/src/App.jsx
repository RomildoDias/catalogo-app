import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Personalizacao from "./pages/Personalizacao";
import Admin from "./pages/Admin";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-8">Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<PrivateRoute><Dashboard /></PrivateRoute>}
      />
      <Route
        path="/produtos"
        element={<PrivateRoute><Produtos /></PrivateRoute>}
      />
      <Route
        path="/categorias"
        element={<PrivateRoute><Categorias /></PrivateRoute>}
      />
      <Route
        path="/personalizacao"
        element={<PrivateRoute><Personalizacao /></PrivateRoute>}
      />
      <Route
        path="/admin"
        element={<PrivateRoute><Admin /></PrivateRoute>}
      />
    </Routes>
  );
}
