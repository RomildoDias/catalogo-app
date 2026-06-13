import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import usePageTitle from "../hooks/usePageTitle";

export default function Personalizacao() {
  usePageTitle("Personalizar");
  const { user, login } = useAuth();
  const [form, setForm] = useState({ nome: "", whatsapp: "", cor_primaria: "", instagram_url: "", mercado_livre_url: "" });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || "",
        whatsapp: user.whatsapp || "",
        cor_primaria: user.cor_primaria || "#2d7a52",
        instagram_url: user.instagram_url || "",
        mercado_livre_url: user.mercado_livre_url || "",
      });
      if (user.logo_url) {
        setLogoPreview(user.logo_url);
      }
    }
  }, [user]);

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMsg("");
    try {
      const atualizado = await api.atualizarPerfil(form);
      localStorage.setItem("user", JSON.stringify(atualizado));
      setMsg("Salvo com sucesso!");
    } catch (e) {
      setMsg("Erro: " + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setUploadingLogo(true);
    try {
      const result = await api.uploadLogo(file);
      localStorage.setItem("user", JSON.stringify(result));
      setLogoPreview(result.logo_url);
      setMsg("Logo atualizada!");
    } catch (e) {
      setMsg("Erro ao enviar logo: " + e.message);
    } finally {
      setUploadingLogo(false);
      setLogoFile(null);
    }
  };

  const removerLogo = async () => {
    try {
      const result = await api.removerLogo();
      localStorage.setItem("user", JSON.stringify(result));
      setLogoPreview(null);
      setMsg("Logo removida");
    } catch (e) {
      setMsg("Erro: " + e.message);
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Personalizar Loja</h2>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg">
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Loja</label>
            {logoPreview ? (
              <div className="flex items-center gap-4 mb-3">
                <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-lg object-contain border bg-gray-50" />
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                    {uploadingLogo ? "Enviando..." : "Trocar logo"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoSelect} hidden />
                  </label>
                  <button type="button" onClick={removerLogo} className="text-xs text-red-600 hover:text-red-800 text-left">
                    Remover logo
                  </button>
                </div>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 text-sm text-gray-500 mb-3">
                {uploadingLogo ? "Enviando..." : "Clique para selecionar logo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoSelect} hidden />
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (com DDD)</label>
            <input
              type="text"
              required
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="11999999999"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Número com DDD, apenas dígitos</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={form.cor_primaria}
                onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={form.cor_primaria}
                onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="url"
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              placeholder="https://instagram.com/sua-loja"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mercado Livre</label>
            <input
              type="url"
              value={form.mercado_livre_url}
              onChange={(e) => setForm({ ...form, mercado_livre_url: e.target.value })}
              placeholder="https://mercadolivre.com.br/perfil/sua-loja"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <p className="text-sm text-gray-500">
              Slug: <strong>{user?.slug}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Plano: <strong className="capitalize">{user?.plano}</strong>
            </p>
          </div>
          {msg && (
            <p className={`text-sm ${msg.includes("Erro") ? "text-red-600" : "text-green-600"}`}>
              {msg}
            </p>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium text-gray-700 mb-3">Pré-visualizar Catálogo</h3>
          <p className="text-sm text-gray-500 mb-3">
            Veja como sua loja aparece para os clientes.
          </p>
          <a
            href={`/catalogo/?slug=${user?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Abrir Catálogo Público
          </a>
        </div>
      </div>
    </Layout>
  );
}
