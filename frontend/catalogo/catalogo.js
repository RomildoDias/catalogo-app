let dadosLoja = null;
let categoriaAtiva = null;
let buscaTimeout = null;

function toggleTheme() {
  document.body.classList.toggle("dark");
  var el = document.getElementById("theme-toggle");
  var isDark = document.body.classList.contains("dark");
  el.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
  el.innerHTML = isDark
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Tema claro'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Tema escuro';
  localStorage.setItem("tema", document.body.classList.contains("dark") ? "escuro" : "claro");
}

function initTheme() {
  var salvo = localStorage.getItem("tema");
  var prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (salvo === "escuro" || (!salvo && prefereEscuro)) {
    document.body.classList.add("dark");
    document.getElementById("theme-toggle").innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Tema claro';
  }
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("slug")) return params.get("slug");
  const path = window.location.pathname.replace(/^\/catalogo\/?/, "");
  return path || "";
}

function formatarPreco(valor) {
  if (valor == null) return "";
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function formatarParcelamento(valor) {
  if (valor == null) return "";
  var parcela = valor / 3;
  return "ou 3x de R$ " + parcela.toFixed(2).replace(".", ",");
}

function mensagemWhatsApp(produto) {
  var texto = "Olá! Tenho interesse em: " + produto.nome;
  if (produto.preco) texto += " (" + formatarPreco(produto.preco) + ")";
  return encodeURIComponent(texto);
}

function limparTelefone(wpp) {
  return wpp.replace(/\D/g, "");
}

function fallbackImagem(img) {
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.style.display = "none";
  var wrap = img.parentElement;
  var plc = document.createElement("div");
  plc.className = "produto-foto-placeholder";
  plc.textContent = "📦";
  wrap.appendChild(plc);
}

function mostrarSkeletons() {
  var produtosEl = document.getElementById("produtos");
  produtosEl.innerHTML = "";
  for (var i = 0; i < 6; i++) {
    var card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML =
      '<div class="skeleton-img skeleton"></div><div class="skeleton-body"><div class="skeleton-line skeleton"></div><div class="skeleton-line skeleton"></div></div>';
    produtosEl.appendChild(card);
  }
}

async function carregarLoja() {
  const slug = getSlug();
  const produtosEl = document.getElementById("produtos");
  mostrarSkeletons();
  if (!slug) {
    produtosEl.innerHTML =
      '<div class="empty-state" role="alert"><div class="empty-state-icon">🔍</div><p>Use /catalogo/?slug=nome-da-loja</p></div>';
    return;
  }
  try {
    const res = await fetch("/loja/" + slug);
    if (!res.ok) throw new Error("Loja não encontrada");
    dadosLoja = await res.json();
    renderizar();
  } catch (err) {
    produtosEl.innerHTML =
      '<div class="empty-state" role="alert"><div class="empty-state-icon">😕</div><p>' +
      err.message +
      '</p></div>';
    document.getElementById("loja-nome").textContent = "Loja não encontrada";
  }
}

function renderizar() {
  const loja = dadosLoja;
  document.title = loja.nome;
  document.querySelector('meta[property="og:title"]').content = loja.nome;
  document.querySelector('meta[name="description"]').content = "Confira os produtos de " + loja.nome + "!";
  document.querySelector('meta[property="og:description"]').content = "Confira os produtos de " + loja.nome + "!";
  document.getElementById("loja-nome").textContent = loja.nome;

  const logo = document.getElementById("logo");
  if (loja.logo_url) {
    logo.src = loja.logo_url;
    logo.style.display = "block";
    logo.onerror = function () {
      this.style.display = "none";
    };
  }

  var heroBg = loja.cor_primaria;
  document.querySelector("header").style.setProperty("--hero-bg", heroBg);
  document.getElementById("hero-banner").style.setProperty("--hero-bg", heroBg);

  var oldStyle = document.getElementById("dinamic-style");
  if (oldStyle) oldStyle.remove();
  var style = document.createElement("style");
  style.id = "dinamic-style";
  style.textContent =
    "#categorias button.ativa { background: " +
    loja.cor_primaria +
    "; border-color: " +
    loja.cor_primaria +
    "; } .produto-preco { color: " +
    loja.cor_primaria +
    "; } .modal-preco { color: " +
    loja.cor_primaria +
    "; } #buscador input:focus { border-color: " +
    loja.cor_primaria +
    "; box-shadow: 0 0 0 3px " +
    loja.cor_primaria +
    "33; } #categorias button:hover { border-color: " +
    loja.cor_primaria +
    "; color: " +
    loja.cor_primaria +
    "; }";
  document.head.appendChild(style);

  var banner = document.getElementById("hero-banner");
  banner.classList.add("show");
  document.getElementById("hero-titulo").textContent = "Bem-vindo à " + loja.nome + "!";
  document.getElementById("hero-descricao").textContent =
    "Confira nossos produtos e faça seu pedido pelo WhatsApp.";

  var watermark = document.getElementById("watermark");
  watermark.style.display = loja.exibir_watermark ? "block" : "none";

  document.getElementById("footer-copy").textContent = "\u00a9 " + new Date().getFullYear() + " " + loja.nome + " \u00b7 Todos os direitos reservados";

  var wppBtn = document.getElementById("whatsapp-btn");
  wppBtn.href = "https://wa.me/" + limparTelefone(loja.whatsapp);

  var socialEl = document.getElementById("social-links");
  socialEl.innerHTML = "";
  var links = [
    { url: loja.instagram_url, label: "Instagram", svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' },
    { url: loja.mercado_livre_url, label: "Mercado Livre", svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' },
  ];
  for (var i = 0; i < links.length; i++) {
    if (links[i].url) {
      var a = document.createElement("a");
      a.href = links[i].url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "footer-btn";
      a.innerHTML = links[i].svg + " " + links[i].label;
      socialEl.appendChild(a);
    }
  }

  var catNav = document.getElementById("categorias");
  catNav.innerHTML = "";
  var todasBtn = document.createElement("button");
  todasBtn.textContent = "Todas";
  todasBtn.onclick = function () {
    filtrarPorCategoria(null);
  };
  catNav.appendChild(todasBtn);
  loja.categorias.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.textContent = cat.nome;
    btn.dataset.id = cat.id;
    btn.onclick = function () {
      filtrarPorCategoria(cat.id);
    };
    catNav.appendChild(btn);
  });

  filtrarPorCategoria(null);
}

function mostrarDestaques() {
  var el = document.getElementById("destaques");
  var destaques = dadosLoja.produtos.filter(function (p) {
    return p.badge === "Popular" || p.badge === "Oferta" || p.badge === "Novo";
  });
  if (destaques.length < 3) {
    destaques = dadosLoja.produtos.slice(0, 5);
  }
  if (destaques.length < 2) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }
  el.classList.add("show");
  var html = '<h3>⭐ Destaques</h3><div class="destaques-scroll">';
  for (var i = 0; i < destaques.length; i++) {
    var p = destaques[i];
    var img = p.foto_url
      ? '<img class="produto-foto" src="' +
        p.foto_url +
        '" alt="" loading="lazy" onerror="fallbackImagem(this)">'
      : '<div class="produto-foto-placeholder">📦</div>';
    var preco = p.preco != null ? '<div class="produto-preco">' + formatarPreco(p.preco) + "</div>" : "";
    html +=
      '<div class="destaque-card" onclick="abrirDetalhes(' +
      dadosLoja.produtos.indexOf(p) +
      ')"><div class="produto-foto-wrap">' +
      img +
      '</div><div class="produto-body"><div class="produto-nome">' +
      p.nome +
      "</div>" +
      preco +
      "</div></div>";
  }
  html += "</div>";
  el.innerHTML = html;
}

function filtrarPorCategoria(categoriaId) {
  categoriaAtiva = categoriaId;
  var botoes = document.querySelectorAll("#categorias button");
  for (var i = 0; i < botoes.length; i++) {
    var btn = botoes[i];
    btn.classList.toggle(
      "ativa",
      btn.dataset.id === categoriaId || (!categoriaId && !btn.dataset.id)
    );
  }
  filtrar();
}

function aplicarFiltro() {
  var busca = (document.getElementById("busca").value || "").toLowerCase();
  var produtosEl = document.getElementById("produtos");
  produtosEl.innerHTML = "";
  var produtos = dadosLoja.produtos;
  if (categoriaAtiva) {
    produtos = produtos.filter(function (p) {
      return p.categoria_id === categoriaAtiva;
    });
  }
  if (busca) {
    produtos = produtos.filter(function (p) {
      return (
        p.nome.toLowerCase().includes(busca) ||
        (p.descricao && p.descricao.toLowerCase().includes(busca))
      );
    });
  }
  if (produtos.length === 0) {
    var empty = document.createElement("div");
    empty.className = "empty-state";
    empty.setAttribute("role", "alert");
    empty.innerHTML =
      '<div class="empty-state-icon">🔍</div><p>Nenhum produto encontrado</p>' +
      (busca || categoriaAtiva
        ? '<button class="btn-limpar" onclick="limparFiltros()">Limpar filtros</button>'
        : "");
    produtosEl.appendChild(empty);
    return;
  }
  var wpp = limparTelefone(dadosLoja.whatsapp);
  for (var i = 0; i < produtos.length; i++) {
    var p = produtos[i];
    var card = document.createElement("div");
    card.className = "produto-card";

    var fotoWrap = document.createElement("div");
    fotoWrap.className = "produto-foto-wrap";
    if (p.foto_url) {
      var img = document.createElement("img");
      img.className = "produto-foto";
      img.src = p.foto_url;
      img.alt = p.nome;
      img.loading = "lazy";
      img.onerror = function () {
        fallbackImagem(this);
      };
      fotoWrap.appendChild(img);
    } else {
      var plc = document.createElement("div");
      plc.className = "produto-foto-placeholder";
      plc.textContent = "📦";
      fotoWrap.appendChild(plc);
    }
    card.appendChild(fotoWrap);

    var body = document.createElement("div");
    body.className = "produto-body";

    if (p.badge) {
      var badge = document.createElement("span");
      badge.className = "produto-badge";
      badge.textContent = p.badge;
      body.appendChild(badge);
    }

    var nome = document.createElement("div");
    nome.className = "produto-nome";
    nome.textContent = p.nome;
    body.appendChild(nome);

    if (p.descricao) {
      var desc = document.createElement("div");
      desc.className = "produto-descricao";
      desc.textContent = p.descricao;
      body.appendChild(desc);
    }

    if (p.preco != null) {
      var preco = document.createElement("div");
      preco.className = "produto-preco";
      preco.textContent = formatarPreco(p.preco);
      body.appendChild(preco);

      if (p.preco >= 20) {
        var parcelas = document.createElement("div");
        parcelas.style.cssText = "font-size:0.75rem;color:var(--text-secondary);margin-top:2px";
        parcelas.textContent = formatarParcelamento(p.preco);
        body.appendChild(parcelas);
      }
    }

    var actions = document.createElement("div");
    actions.className = "produto-actions";

    var wppLink = document.createElement("a");
    wppLink.className = "btn-comprar";
    wppLink.href = "https://wa.me/" + wpp + "?text=" + mensagemWhatsApp(p);
    wppLink.target = "_blank";
    wppLink.textContent = "Comprar";
    actions.appendChild(wppLink);

    var detalhes = document.createElement("div");
    detalhes.className = "produto-detalhes";
    detalhes.textContent = "Detalhes →";
    detalhes.onclick = (function (idx) {
      return function () {
        abrirDetalhes(idx);
      };
    })(i);
    actions.appendChild(detalhes);

    body.appendChild(actions);
    card.appendChild(body);
    produtosEl.appendChild(card);
  }
}

var _filtroPending = null;

function filtrar() {
  if (_filtroPending) {
    clearTimeout(_filtroPending);
  }
  _filtroPending = setTimeout(function () {
    _filtroPending = null;
    aplicarFiltro();
    var busca = document.getElementById("busca").value;
    document.getElementById("search-clear").classList.toggle("show", busca.length > 0);
    mostrarDestaques();
  }, 150);
}

function limparFiltros() {
  document.getElementById("busca").value = "";
  document.getElementById("search-clear").classList.remove("show");
  categoriaAtiva = null;
  var botoes = document.querySelectorAll("#categorias button");
  for (var i = 0; i < botoes.length; i++) {
    botoes[i].classList.toggle("ativa", !botoes[i].dataset.id);
  }
  filtrar();
}

var produtoAtivo = null;

function abrirDetalhes(index) {
  produtoAtivo = dadosLoja.produtos[index];
  if (!produtoAtivo) return;
  var body = document.getElementById("modal-body");
  body.innerHTML = "";
  var wpp = limparTelefone(dadosLoja.whatsapp);

  var fotoWrap = document.createElement("div");
  fotoWrap.className = "modal-foto-wrap";
  if (produtoAtivo.foto_url) {
    var img = document.createElement("img");
    img.className = "modal-foto";
    img.src = produtoAtivo.foto_url;
    img.alt = "";
    img.loading = "lazy";
    img.onerror = function () {
      this.style.display = "none";
      this.parentElement.innerHTML =
        '<div class="modal-foto-placeholder">📦</div>';
    };
    fotoWrap.appendChild(img);
  } else {
    var plc = document.createElement("div");
    plc.className = "modal-foto-placeholder";
    plc.textContent = "📦";
    fotoWrap.appendChild(plc);
  }
  body.appendChild(fotoWrap);

  if (produtoAtivo.badge) {
    var badge = document.createElement("span");
    badge.className = "modal-badge";
    badge.textContent = produtoAtivo.badge;
    body.appendChild(badge);
  }

  var nome = document.createElement("h2");
  nome.className = "modal-nome";
  nome.textContent = produtoAtivo.nome;
  body.appendChild(nome);

  if (produtoAtivo.descricao) {
    var desc = document.createElement("p");
    desc.className = "modal-descricao";
    desc.textContent = produtoAtivo.descricao;
    body.appendChild(desc);
  }

  if (produtoAtivo.preco != null) {
    var preco = document.createElement("div");
    preco.className = "modal-preco";
    preco.textContent = formatarPreco(produtoAtivo.preco);
    body.appendChild(preco);
  }

  var wppLink = document.createElement("a");
  wppLink.className = "btn-whatsapp";
  wppLink.href = "https://wa.me/" + wpp + "?text=" + mensagemWhatsApp(produtoAtivo);
  wppLink.target = "_blank";
  wppLink.textContent = "Comprar via WhatsApp";
  body.appendChild(wppLink);

  var modal = document.getElementById("modal-detalhes");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  setTimeout(function () {
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }, 100);

  modal.addEventListener("keydown", trapTab);
}

function trapTab(e) {
  var modal = document.getElementById("modal-detalhes");
  if (modal.style.display === "none") {
    modal.removeEventListener("keydown", trapTab);
    return;
  }
  if (e.key === "Tab") {
    var focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

function fecharDetalhes(event) {
  if (event && event.target !== document.getElementById("modal-detalhes")) return;
  document.getElementById("modal-detalhes").style.display = "none";
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    var modal = document.getElementById("modal-detalhes");
    if (modal.style.display !== "none") {
      fecharDetalhes({ target: modal });
    }
  }
});

document.getElementById("busca").addEventListener("input", filtrar);

document.getElementById("search-clear").addEventListener("click", limparFiltros);

initTheme();
carregarLoja();
