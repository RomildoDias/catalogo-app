const BASE = "";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Resposta inválida do servidor (${res.status})`);
  }
  if (!res.ok) throw new Error(data?.detail || "Erro na requisição");
  return data;
}

export const api = {
  login: (email, senha) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  me: () => request("/auth/me"),

  atualizarPerfil: (dados) =>
    request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  categorias: {
    listar: () => request("/categorias/"),
    criar: (nome) =>
      request("/categorias/", { method: "POST", body: JSON.stringify({ nome }) }),
    atualizar: (id, nome) =>
      request(`/categorias/${id}`, {
        method: "PUT",
        body: JSON.stringify({ nome }),
      }),
    deletar: (id) =>
      request(`/categorias/${id}`, { method: "DELETE" }),
    reordenar: (itens) =>
      request("/categorias/ordem", {
        method: "PATCH",
        body: JSON.stringify({ itens }),
      }),
  },

  produtos: {
    listar: () => request("/produtos/"),
    criar: (dados) =>
      request("/produtos/", { method: "POST", body: JSON.stringify(dados) }),
    atualizar: (id, dados) =>
      request(`/produtos/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
    deletar: (id) =>
      request(`/produtos/${id}`, { method: "DELETE" }),
    toggleAtivo: (id) =>
      request(`/produtos/${id}/ativo`, { method: "PATCH" }),
    uploadFoto: async (id, file) => {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("arquivo", file);
      const res = await fetch(`/produtos/${id}/foto`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.detail || "Erro no upload");
      return data;
    },
    removerFoto: (id) =>
      request(`/produtos/${id}/foto`, { method: "DELETE" }),
  },

  admin: {
    listarLojistas: () => request("/admin/lojistas"),
    toggleAtivo: (id) =>
      request(`/admin/lojistas/${id}/ativo`, { method: "PATCH" }),
    alterarPlano: (id, plano) =>
      request(`/admin/lojistas/${id}/plano`, {
        method: "PATCH",
        body: JSON.stringify({ plano }),
      }),
  },
};
