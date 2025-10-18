const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";
let dadosLojas = {};
let lojaAtual = null;
let usuarioLogado = null;

// 🔒 LOGIN
function processarLogin(event) {
  event.preventDefault();
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

// 🔗 CARREGAR DADOS DA PLANILHA
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha.");

    const dados = await resposta.json();
    console.log("✅ Dados recebidos:", dados);

    dadosLojas = {}; // Limpa dados antigos

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

    carregarLojas();
  } catch (erro) {
    console.error("❌ Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados. Verifique se o link do Apps Script está correto e publicado.");
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
  mudarTab("lista");
}

// 📷 BUSCAR IMAGEM USANDO GOOGLE CUSTOM SEARCH
async function buscarImagem(marca, modelo) {
  const API_KEY = "AIzaSyAfKIPVFsLXBG0eTDF0ylMC_MuSBiF3XJs";
  const CX = "25b45e6e7620d46d2";
  const query = `óculos ${marca} ${modelo}`;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&searchType=image&key=${API_KEY}&num=1`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.items && dados.items.length > 0) {
      return dados.items[0].link;
    } else {
      return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    }
  } catch (erro) {
    console.error("Erro ao buscar imagem:", erro);
    return "https://via.placeholder.com/300x200?text=Erro+na+Imagem";
  }
}

// 🏷️ CARREGAR ARMAÇÕES COM IMAGENS (FUNÇÃO ATUALIZADA)
async function carregarArmacoes(lojaId) {
  const armacoesList = document.getElementById("armacoes-list");
  const armacoes = dadosLojas[lojaId] || [];

  if (armacoes.length === 0) {
    armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Nenhuma armação cadastrada nesta loja</p>";
    return;
  }

  armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Carregando armações...</p>";

  try {
    // Buscar as imagens em paralelo
    const promessasImagens = armacoes.map(armacao => buscarImagem(armacao.marca, armacao.modelo));
    const imagensURLs = await Promise.all(promessasImagens);

    // Montar os cards
    const cardsHTML = armacoes.map((armacao, i) => `
      <div class="frame-card">
        <img src="${imagensURLs[i]}" alt="Imagem da armação ${armacao.marca} ${armacao.modelo}" style="width:100%; border-radius:6px; margin-bottom:10px;">
        <h4>${armacao.modelo}</h4>
        <p><strong>Marca:</strong> ${armacao.marca}</p>
        <p><strong>Quantidade:</strong> ${armacao.quantidade} unidades</p>
        <p><strong>Preço:</strong> ${armacao.preco}</p>
        <p><strong>Categoria:</strong> ${armacao.categoria}</p>
      </div>
    `).join('');

    armacoesList.innerHTML = cardsHTML;

  } catch (erro) {
    console.error("Erro ao carregar imagens das armações:", erro);
    armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Erro ao carregar as imagens das armações.</p>";
  }
}

// 🔘 MUDAR TABS
function mudarTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// 🎯 EVENTOS
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginForm").addEventListener("submit", processarLogin);
  document.getElementById("search-store").addEventListener("input", filtrarLojas);
  document.getElementById("back-to-stores").addEventListener("click", function () {
    document.getElementById("armacoes-container").classList.remove("active-section");
    document.getElementById("lojas-container").classList.add("active-section");
  });
});
