let dadosLoja = null;
let categoriaAtiva = null;

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
    produtosEl.innerHTML = '<p class="erro">Use /catalogo/?slug=nome-da-loja</p>';
    return;
  }
  try {
    const res = await fetch("/loja/" + slug);
    if (!res.ok) throw new Error("Loja n\u00e3o encontrada");
    dadosLoja = await res.json();
    renderizar();
  } catch (err) {
    produtosEl.innerHTML = '<p class="erro">' + err.message + "</p>";
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
  watermark.style.display = loja.plano === "gratuito" ? "block" : "none";
  var wppBtn = document.getElementById("whatsapp-btn");
  wppBtn.href = "https://wa.me/55" + limparTelefone(loja.whatsapp);
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
    produtosEl.innerHTML =
      '<p style="text-align:center;padding:40px 0;color:#999">Nenhum produto encontrado</p>';
    return;
  }
  var wpp = limparTelefone(dadosLoja.whatsapp);
  for (var i = 0; i < produtos.length; i++) {
    var p = produtos[i];
    var card = document.createElement("div");
    card.className = "produto-card";
    var html = "";
    if (p.foto_url) {
      html +=
        '<img class="produto-foto" src="' +
        p.foto_url +
        '" alt="' +
        p.nome +
        '" loading="lazy">';
    }
    html += '<div class="produto-info">';
    if (p.badge) {
      html += '<span class="produto-badge">' + p.badge + "</span>";
    }
    html += '<div class="produto-nome">' + p.nome + "</div>";
    if (p.descricao) {
      html += '<div class="produto-descricao">' + p.descricao + "</div>";
    }
    if (p.preco != null) {
      html += '<div class="produto-preco">' + formatarPreco(p.preco) + "</div>";
    }
    html +=
      '<a class="btn-whatsapp" href="https://wa.me/55' +
      wpp +
      "?text=" +
      mensagemWhatsApp(p) +
      '" target="_blank" style="margin-top:8px;font-size:0.8125rem;padding:8px;text-decoration:none;color:#fff;background:#25d366;border-radius:6px;display:inline-block;text-align:center">Comprar via WhatsApp</a>';
    html += "</div>";
    card.innerHTML = html;
    produtosEl.appendChild(card);
  }
}

carregarLoja();
