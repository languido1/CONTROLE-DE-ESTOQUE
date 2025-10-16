const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";
let dadosLojas = {};
let lojaAtual = null;
let usuarioLogado = null;

// 🔒 LOGIN
function processarLogin(event) {
  event.preventDefault();
  console.log("Formulário de login foi enviado!"); // Verificar se o login foi disparado corretamente

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const errorMsg = document.getElementById("errorMsg");

  if (usuario === "admin" && senha === "1234") {
    usuarioLogado = usuario;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.querySelector(".username").textContent = usuario;
    carregarDados();
  } else {
    errorMsg.textContent = "Usuário ou senha incorretos!";
  }
}

function fazerLogout() {
  usuarioLogado = null;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login-container").style.display = "flex";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
}

// 🔗 CARREGAR DADOS DA PLANILHA VIA GOOGLE APPS SCRIPT (com proxy para evitar CORS)
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha.");

    const dados = await resposta.json();
    console.log("✅ Dados recebidos:", dados);

    dadosLojas = {}; // Limpa os dados anteriores
    // Espera que a estrutura do Apps Script seja { lojas: [ { Loja, Marca, Modelo, Quantidade, Preço, Categoria } ] }
    dados.lojas.forEach(item => {
      const loja = (item.Loja || "SEM NOME").toUpperCase().trim();
      if (!dadosLojas[loja]) dadosLojas[loja] = [];
      dadosLojas[loja].push({
        marca: item.Marca || "",
        modelo: item.Modelo || "",
        quantidade: parseInt(item.Quantidade) || 0,
        preco: item.Preço ? `R$ ${item.Preço}` : "R$ 0,00",
        categoria: item.Categoria || ""
      });
    });

    carregarLojas(); // Atualiza a lista de lojas
  } catch (erro) {
    console.error("❌ Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados da planilha. Verifique se o link do Apps Script está publicado como 'Qualquer pessoa com o link'.");
  }
}

// 🏬 EXIBIR AS LOJAS
function carregarLojas() {
  const lojasList = document.getElementById("lojas-list");
  const lojas = Object.keys(dadosLojas);

  if (lojas.length === 0) {
    lojasList.innerHTML = "<p style='text-align:center; color:#666;'>Nenhuma loja cadastrada.</p>";
    return;
  }

  lojasList.innerHTML = lojas.map(loja => {
    const totalArmacoes = dadosLojas[loja].length;
    const totalQuantidade = dadosLojas[loja].reduce((sum, item) => sum + item.quantidade, 0);

    return `
      <div class="store-card" onclick="abrirDetalhesLoja('${loja}')">
        <h3>${loja}</h3>
        <p><strong>${totalArmacoes}</strong> modelos de armações</p>
        <p><strong>${totalQuantidade}</strong> unidades no total</p>
      </div>
    `;
  }).join('');
}

// 🔎 FILTRAR LOJAS
function filtrarLojas() {
  const termo = document.getElementById("search-store").value.toLowerCase();
  const lojasList = document.getElementById("lojas-list");

  const lojasFiltradas = Object.keys(dadosLojas).filter(loja =>
    loja.toLowerCase().includes(termo)
  );

  if (lojasFiltradas.length === 0) {
    lojasList.innerHTML = "<p style='text-align:center; color:#666;'>Nenhuma loja encontrada.</p>";
    return;
  }

  lojasList.innerHTML = lojasFiltradas.map(loja => `
    <div class="store-card" onclick="abrirDetalhesLoja('${loja}')">
      <h3>${loja}</h3>
      <p><strong>${dadosLojas[loja].length}</strong> modelos</p>
    </div>
  `).join('');
}

// 🛠️ ABRIR DETALHES DA LOJA
function abrirDetalhesLoja(lojaId) {
  lojaAtual = lojaId.toUpperCase().trim();
  document.getElementById("lojas-container").classList.remove("active-section");
  document.getElementById("armacoes-container").classList.add("active-section");
  document.getElementById("current-store-name").textContent = lojaId;
  carregarArmacoes(lojaAtual);
  carregarFiltros(lojaAtual);
  mudarTab("lista");
}

// 🏷️ CARREGAR ARMAÇÕES DA LOJA
function carregarArmacoes(lojaId) {
  const armacoesList = document.getElementById("armacoes-list");
  const armacoes = dadosLojas[lojaId] || [];

  if (armacoes.length === 0) {
    armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Nenhuma armação cadastrada nesta loja</p>";
    return;
  }

  armacoesList.innerHTML = armacoes.map(armacao => `
    <div class="frame-card">
      <h4>${armacao.modelo}</h4>
      <p><strong>Marca:</strong> ${armacao.marca}</p>
      <p><strong>Quantidade:</strong> ${armacao.quantidade} unidades</p>
      <p><strong>Preço:</strong> ${armacao.preco}</p>
      <p><strong>Categoria:</strong> ${armacao.categoria}</p>
    </div>
  `).join('');
}

// 🧰 APLICAR FILTROS
function aplicarFiltros() {
  const brandFilter = document.getElementById("filter-brand").value;
  const categoryFilter = document.getElementById("filter-category").value;
  const priceFilter = document.getElementById("filter-price").value;
  const quantityFilter = document.getElementById("filter-quantity").value;

  let armacoes = dadosLojas[lojaAtual] || [];

  if (brandFilter) {
    armacoes = armacoes.filter(a => a.marca === brandFilter);
  }

  if (categoryFilter) {
    armacoes = armacoes.filter(a => a.categoria === categoryFilter);
  }

  if (priceFilter) {
    const [minPrice, maxPrice] = priceFilter.split("-").map(Number);
    armacoes = armacoes.filter(a => {
      let precoNumerico = parseFloat(a.preco.replace(/\D/g, "")) || 0;
      return precoNumerico >= minPrice && precoNumerico <= maxPrice;
    });
  }

  if (quantityFilter) {
    const [minQ, maxQ] = quantityFilter.split("-").map(Number);
    armacoes = armacoes.filter(a => a.quantidade >= minQ && a.quantidade <= maxQ);
  }

  carregarArmacoes(lojaAtual, armacoes);
}

// 🔘 MUDAR TABS
function mudarTab(tabName) {
  // Esconde todas as tabs
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  // Mostra a tab selecionada
  document.getElementById(`tab-${tabName}`).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// 🎯 EVENTOS
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("loginForm").addEventListener("submit", processarLogin);
  document.getElementById("search-store").addEventListener("input", filtrarLojas);
  document.getElementById("back-to-stores").addEventListener("click", function() {
    document.getElementById("armacoes-container").classList.remove("active-section");
    document.getElementById("lojas-container").classList.add("active-section");
  });
});
