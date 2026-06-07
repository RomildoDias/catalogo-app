let dadosLoja = null;
let categoriaAtiva = null;

// Tema escuro
function toggleTheme() {
  document.body.classList.toggle("dark");
  var el = document.getElementById("theme-toggle");
  el.textContent = document.body.classList.contains("dark") ? "\u2600\uFE0F Tema claro" : "\u{1F319} Tema escuro";
  localStorage.setItem("tema", document.body.classList.contains("dark") ? "escuro" : "claro");
}

function initTheme() {
  var salvo = localStorage.getItem("tema");
  var prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (salvo === "escuro" || (!salvo && prefereEscuro)) {
    document.body.classList.add("dark");
    document.getElementById("theme-toggle").textContent = "\u2600\uFE0F Tema claro";
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

function mensagemWhatsApp(produto) {
  let texto = "Ol\u00e1! Tenho interesse em: " + produto.nome;
  if (produto.preco) texto += " (" + formatarPreco(produto.preco) + ")";
  return encodeURIComponent(texto);
}

function limparTelefone(wpp) {
  return wpp.replace(/\D/g, "");
}

async function carregarLoja() {
  const slug = getSlug();
  const produtosEl = document.getElementById("produtos");
  produtosEl.innerHTML = '<p class="carregando">Carregando...</p>';
  if (!slug) {
    var msg = document.createElement("p");
    msg.className = "erro";
    msg.textContent = "Use /catalogo/?slug=nome-da-loja";
    produtosEl.innerHTML = "";
    produtosEl.appendChild(msg);
    return;
  }
  try {
    const res = await fetch("/loja/" + slug);
    if (!res.ok) throw new Error("Loja n\u00e3o encontrada");
    dadosLoja = await res.json();
    renderizar();
  } catch (err) {
    produtosEl.innerHTML = "";
    var msg = document.createElement("p");
    msg.className = "erro";
    msg.textContent = err.message;
    produtosEl.appendChild(msg);
    document.getElementById("loja-nome").textContent = "Loja n\u00e3o encontrada";
  }
}

function renderizar() {
  const loja = dadosLoja;
  document.title = loja.nome;
  document.getElementById("loja-nome").textContent = loja.nome;
  const logo = document.getElementById("logo");
  if (loja.logo_url) {
    logo.src = loja.logo_url;
    logo.style.display = "block";
  }
  document.querySelector("header").style.background = loja.cor_primaria;
  var style = document.createElement("style");
  style.textContent =
    "#categorias button.ativa { background: " +
    loja.cor_primaria +
    "; border-color: " +
    loja.cor_primaria +
    "; } .produto-preco { color: " +
    loja.cor_primaria +
    "; } #buscador input:focus { border-color: " +
    loja.cor_primaria +
    "; }";
  document.head.appendChild(style);
  var watermark = document.getElementById("watermark");
  watermark.style.display = loja.exibir_watermark ? "block" : "none";
  var wppBtn = document.getElementById("whatsapp-btn");
  wppBtn.href = "https://wa.me/55" + limparTelefone(loja.whatsapp);
  // Links sociais
  var socialEl = document.getElementById("social-links");
  socialEl.innerHTML = "";
  var links = [
    { url: loja.instagram_url, label: "Instagram", icon: "\ud83d\udcf7" },
    { url: loja.mercado_livre_url, label: "Mercado Livre", icon: "\ud83d\uded2" },
  ];
  for (var i = 0; i < links.length; i++) {
    if (links[i].url) {
      var a = document.createElement("a");
      a.href = links[i].url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "social-link";
      a.textContent = links[i].icon + " " + links[i].label;
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

function filtrar() {
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
    var msg = document.createElement("p");
    msg.style.cssText = "text-align:center;padding:40px 0;color:#999";
    msg.textContent = "Nenhum produto encontrado";
    produtosEl.appendChild(msg);
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
      img.alt = "";
      img.loading = "lazy";
      fotoWrap.appendChild(img);
    } else {
      var plc = document.createElement("div");
      plc.className = "produto-foto-placeholder";
      plc.textContent = "\ud83d\udce6";
      fotoWrap.appendChild(plc);
    }
    card.appendChild(fotoWrap);

    var info = document.createElement("div");
    info.className = "produto-info";

    if (p.badge) {
      var badge = document.createElement("span");
      badge.className = "produto-badge";
      badge.textContent = p.badge;
      info.appendChild(badge);
    }

    var nome = document.createElement("div");
    nome.className = "produto-nome";
    nome.textContent = p.nome;
    info.appendChild(nome);

    if (p.descricao) {
      var desc = document.createElement("div");
      desc.className = "produto-descricao";
      desc.textContent = p.descricao;
      info.appendChild(desc);
    }

    if (p.preco != null) {
      var preco = document.createElement("div");
      preco.className = "produto-preco";
      preco.textContent = formatarPreco(p.preco);
      info.appendChild(preco);
    }

    var wppLink = document.createElement("a");
    wppLink.className = "btn-whatsapp";
    wppLink.href = "https://wa.me/55" + wpp + "?text=" + mensagemWhatsApp(p);
    wppLink.target = "_blank";
    wppLink.style.cssText = "margin-top:8px;font-size:0.8125rem;padding:8px;text-decoration:none;color:#fff;background:#25d366;border-radius:6px;display:inline-block;text-align:center";
    wppLink.textContent = "Comprar via WhatsApp";
    info.appendChild(wppLink);

    var detalhes = document.createElement("div");
    detalhes.className = "produto-detalhes";
    detalhes.textContent = "Detalhes \u2192";
    detalhes.onclick = (function(idx) {
      return function() { abrirDetalhes(idx); };
    })(i);
    info.appendChild(detalhes);

    card.appendChild(info);
    produtosEl.appendChild(card);
  }
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
    fotoWrap.appendChild(img);
  } else {
    var plc = document.createElement("div");
    plc.className = "modal-foto-placeholder";
    plc.textContent = "\ud83d\udce6";
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
  wppLink.href = "https://wa.me/55" + wpp + "?text=" + mensagemWhatsApp(produtoAtivo);
  wppLink.target = "_blank";
  wppLink.textContent = "Comprar via WhatsApp";
  body.appendChild(wppLink);

  document.getElementById("modal-detalhes").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function fecharDetalhes(event) {
  if (event && event.target !== document.getElementById("modal-detalhes")) return;
  document.getElementById("modal-detalhes").style.display = "none";
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharDetalhes({ target: document.getElementById("modal-detalhes") });
});

initTheme();
carregarLoja();
