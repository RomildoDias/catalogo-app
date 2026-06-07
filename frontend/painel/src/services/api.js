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

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Erro na requisição");
  return data;
}

export const api = {
  login: (email, senha) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  me: () => request("/auth/me"),

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
  },
};
