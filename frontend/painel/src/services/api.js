const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const fetchOptions = { ...options, headers, signal: controller.signal };

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
    try {
      const res = await fetch(`${BASE}${path}`, fetchOptions);
      clearTimeout(timeoutId);

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
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError") {
        lastError = new Error("Tempo limite excedido. Verifique sua conexão.");
      }
      const isRetriable = err.name === "TypeError" || err.name === "AbortError" || (err.status >= 500);
      if (!isRetriable || attempt === 2) break;
    }
  }
  clearTimeout(timeoutId);
  throw lastError;
}

async function uploadRequest(path, file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("arquivo", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
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
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
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

  uploadLogo: (file) => uploadRequest("/auth/me/logo", file),

  removerLogo: () => request("/auth/me/logo", { method: "DELETE" }),

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
    uploadFoto: (id, file) => uploadRequest(`/produtos/${id}/foto`, file),
    removerFoto: (id) =>
      request(`/produtos/${id}/foto`, { method: "DELETE" }),
  },

  admin: {
    listarLojistas: () => request("/admin/lojistas"),
    criarLojista: (dados) =>
      request("/admin/lojistas", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    toggleAtivo: (id) =>
      request(`/admin/lojistas/${id}/ativo`, { method: "PATCH" }),
    alterarPlano: (id, plano) =>
      request(`/admin/lojistas/${id}/plano`, {
        method: "PATCH",
        body: JSON.stringify({ plano }),
      }),
  },
};
