// 🔗 LINK DA API DO GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";

let dadosLojas = {};
let lojaAtual = null;

// 🔒 LOGIN
function processarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (usuario === "admin" && senha === "1234") {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarDados();
  } else {
    errorMsg.textContent = "Usuário ou senha incorretos!";
  }
}

// 🚪 LOGOUT
function fazerLogout() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login-container").style.display = "flex";
}

// 🔄 CARREGAR DADOS DA PLANILHA
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    const dados = await resposta.json();

    dadosLojas = {};

    dados.lojas.forEach(item => {
      const loja = (item.Loja || "SEM NOME").toUpperCase().trim();
      if (!dadosLojas[loja]) dadosLojas[loja] = [];
      dadosLojas[loja].push({
        marca: item.Marca || "Sem marca",
        modelo: item.Modelo || "Sem modelo",
        quantidade: parseInt(item.Quantidade) || 0,
        preco: item.Preço ? parseFloat(item.Preço) : 0,
        categoria: item.Categoria || "Sem categoria",
        imagem: `https://source.unsplash.com/collection/1163637/200x100?sig=${Math.random()}`
      });
    });

    carregarLojas();
  } catch (erro) {
    console.error("❌ Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados da planilha. Verifique se o Apps Script está publicado e acessível.");
  }
}

// 🏬 MOSTRAR LISTA DE LOJAS
function carregarLojas() {
  const lojasList = document.getElementById("lojas-list");
  lojasList.innerHTML = "";

  const lojas = Object.keys(dadosLojas);
  if (lojas.length === 0) {
    lojasList.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma loja encontrada.</p>";
    return;
  }

  lojas.forEach(loja => {
    const totalModelos = dadosLojas[loja].length;
    const totalEstoque = dadosLojas[loja].reduce((sum, a) => sum + a.quantidade, 0);

    const card = document.createElement("div");
    card.className = "store-card";
    card.innerHTML = `
      <h3>${loja}</h3>
      <p><strong>${totalModelos}</strong> modelos cadastrados</p>
      <p><strong>${totalEstoque}</strong> unidades em estoque</p>
    `;
    card.addEventListener("click", () => abrirLoja(loja));
    lojasList.appendChild(card);
  });
}

// 👓 ABRIR LOJA E MOSTRAR ARMAÇÕES
function abrirLoja(loja) {
  lojaAtual = loja;
  document.getElementById("store-name").textContent = loja;
  document.getElementById("lojas-container").style.display = "none";
  document.getElementById("armacoes-container").style.display = "block";
  carregarArmacoes();
}

// 🔙 VOLTAR À LISTA DE LOJAS
document.getElementById("back-to-stores").addEventListener("click", () => {
  document.getElementById("armacoes-container").style.display = "none";
  document.getElementById("lojas-container").style.display = "block";
});

// 🕶️ MOSTRAR LISTA DE ARMAÇÕES
function carregarArmacoes() {
  const lista = document.getElementById("armacoes-list");
  const armacoes = dadosLojas[lojaAtual] || [];
  lista.innerHTML = "";

  if (armacoes.length === 0) {
    lista.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma armação cadastrada nesta loja.</p>";
    return;
  }

  armacoes.forEach(a => {
    const card = document.createElement("div");
    card.className = "armacao-card";
    card.innerHTML = `
      <img src="${a.imagem}" alt="${a.modelo}">
      <div>
        <h4>${a.marca} - ${a.modelo}</h4>
        <p>Categoria: ${a.categoria}</p>
        <p>Quantidade: <strong>${a.quantidade}</strong></p>
        <p>Preço: <strong>R$ ${a.preco.toFixed(2)}</strong></p>
      </div>
    `;
    lista.appendChild(card);
  });
}

// 🔍 FILTRAR LOJAS
document.getElementById("search-store").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  const lojasList = document.getElementById("lojas-list");
  lojasList.innerHTML = "";

  const lojasFiltradas = Object.keys(dadosLojas).filter(loja =>
    loja.toLowerCase().includes(termo)
  );

  if (lojasFiltradas.length === 0) {
    lojasList.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma loja encontrada.</p>";
    return;
  }

  lojasFiltradas.forEach(loja => {
    const card = document.createElement("div");
    card.className = "store-card";
    const totalModelos = dadosLojas[loja].length;
    const totalEstoque = dadosLojas[loja].reduce((sum, a) => sum + a.quantidade, 0);
    card.innerHTML = `
      <h3>${loja}</h3>
      <p><strong>${totalModelos}</strong> modelos cadastrados</p>
      <p><strong>${totalEstoque}</strong> unidades</p>
    `;
    card.addEventListener("click", () => abrirLoja(loja));
    lojasList.appendChild(card);
  });
});

// 🔎 FILTRAR ARMAÇÕES
document.getElementById("search-frame").addEventListener("input", e => filtrarArmacoes());
document.getElementById("filter-brand").addEventListener("change", e => filtrarArmacoes());
document.getElementById("filter-category").addEventListener("change", e => filtrarArmacoes());
document.getElementById("filter-price").addEventListener("change", e => filtrarArmacoes());

function filtrarArmacoes() {
  const termo = document.getElementById("search-frame").value.toLowerCase();
  const marca = document.getElementById("filter-brand").value;
  const categoria = document.getElementById("filter-category").value;
  const precoRange = document.getElementById("filter-price").value;

  let armacoes = dadosLojas[lojaAtual] || [];

  if (termo) armacoes = armacoes.filter(a =>
    a.modelo.toLowerCase().includes(termo) || a.marca.toLowerCase().includes(termo)
  );

  if (marca) armacoes = armacoes.filter(a => a.marca === marca);
  if (categoria) armacoes = armacoes.filter(a => a.categoria === categoria);

  if (precoRange) {
    const [min, max] = precoRange.split("-").map(Number);
    armacoes = armacoes.filter(a => a.preco >= min && a.preco <= max);
  }

  const lista = document.getElementById("armacoes-list");
  lista.innerHTML = "";

  if (armacoes.length === 0) {
    lista.innerHTML = "<p style='text-align:center;color:#777;'>Nenhum resultado encontrado.</p>";
    return;
  }

  armacoes.forEach(a => {
    const card = document.createElement("div");
    card.className = "armacao-card";
    card.innerHTML = `
      <img src="${a.imagem}" alt="${a.modelo}">
      <div>
        <h4>${a.marca} - ${a.modelo}</h4>
        <p>Categoria: ${a.categoria}</p>
        <p>Qtd: ${a.quantidade} | Preço: R$ ${a.preco.toFixed(2)}</p>
      </div>
    `;
    lista.appendChild(card);
  });
}

// 🎯 EVENTO PRINCIPAL
document.getElementById("loginForm").addEventListener("submit", processarLogin);
