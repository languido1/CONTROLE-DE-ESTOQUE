// ========================================
// 📦 SISTEMA DE CONTROLE DE ESTOQUE - ÓTICAS DINIZ
// ========================================

const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";
let dadosLojas = {};
let lojaAtual = null;
let usuarioLogado = null;

// ========================================
// 🔒 LOGIN
// ========================================
function processarLogin(event) {
  event.preventDefault();
  console.log("Formulário de login enviado!");

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
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

// ========================================
// 🔗 CARREGAR DADOS DA PLANILHA (via Google Apps Script)
// ========================================
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha.");

    const dados = await resposta.json();
    console.log("✅ Dados recebidos:", dados);

    dadosLojas = {}; // limpa dados antigos

    // Espera estrutura { lojas: [ { Loja, Marca, Modelo, Quantidade, Preço, Categoria } ] }
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
    alert("Erro ao carregar dados da planilha. Verifique se o link do Apps Script está publicado como 'Qualquer pessoa com o link'.");
  }
}

// ========================================
// 🏬 EXIBIR LOJAS
// ========================================
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
        <p><strong>${totalArmacoes}</strong> modelos</p>
        <p><strong>${totalQuantidade}</strong> unidades</p>
      </div>
    `;
  }).join('');
}

// ========================================
// 🔍 FILTRAR LOJAS
// ========================================
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

// ========================================
// 🛠️ DETALHES DA LOJA
// ========================================
function abrirDetalhesLoja(lojaId) {
  lojaAtual = lojaId.toUpperCase().trim();
  document.getElementById("lojas-container").classList.remove("active-section");
  document.getElementById("armacoes-container").classList.add("active-section");
  document.getElementById("current-store-name").textContent = lojaId;
  carregarArmacoes(lojaAtual);
  mudarTab("lista");
}

// ========================================
// 👓 LISTA DE ARMAÇÕES
// ========================================
function carregarArmacoes(lojaId) {
  const armacoesList = document.getElementById("armacoes-list");
  const armacoes = dadosLojas[lojaId] || [];

  if (armacoes.length === 0) {
    armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Nenhuma armação cadastrada nesta loja</p>";
    return;
  }

  armacoesList.innerHTML = armacoes.map(a => `
    <div class="frame-card">
      <h4>${a.modelo}</h4>
      <p><strong>Marca:</strong> ${a.marca}</p>
      <p><strong>Quantidade:</strong> ${a.quantidade}</p>
      <p><strong>Preço:</strong> ${a.preco}</p>
      <p><strong>Categoria:</strong> ${a.categoria}</p>
    </div>
  `).join('');
}

// ========================================
// 🧾 CADASTRAR NOVA ARMAÇÃO
// ========================================
async function cadastrarArmacao(event) {
  event.preventDefault();

  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const quantidade = document.getElementById("quantidade").value;
  const loja = document.getElementById("loja").value.trim();

  if (!marca || !modelo || !quantidade || !loja) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  // Aqui você poderia enviar para o Apps Script (POST)
  alert(`✅ Armação cadastrada!\n\nMarca: ${marca}\nModelo: ${modelo}\nLoja: ${loja}`);

  document.getElementById("formCadastro").reset();
  mudarTab("lista");
}

// ========================================
// 🔁 REGISTRAR ENTRADA / SAÍDA
// ========================================
function registrarMovimentacao(event) {
  event.preventDefault();
  const ref = document.getElementById("referencia").value.trim();
  const tipo = document.getElementById("tipo").value;
  const qtd = parseInt(document.getElementById("qtdMovimentada").value);

  if (!ref || !qtd) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  alert(`✅ Movimentação registrada!\n${tipo === "entrada" ? "Entrada" : "Saída"} de ${qtd} unidade(s) para ${ref}.`);
  document.getElementById("formMovimentacao").reset();
  mudarTab("lista");
}

// ========================================
// 🔘 TABS
// ========================================
function mudarTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// ========================================
// 🎯 EVENTOS GERAIS
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  // Login
  document.getElementById("loginForm").addEventListener("submit", processarLogin);

  // Buscar loja
  document.getElementById("search-store").addEventListener("input", filtrarLojas);

  // Voltar para lista de lojas
  document.getElementById("back-to-stores").addEventListener("click", function () {
    document.getElementById("armacoes-container").classList.remove("active-section");
    document.getElementById("lojas-container").classList.add("active-section");
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", fazerLogout);

  // Formulários internos
  const formCadastro = document.getElementById("formCadastro");
  if (formCadastro) formCadastro.addEventListener("submit", cadastrarArmacao);

  const formMov = document.getElementById("formMovimentacao");
  if (formMov) formMov.addEventListener("submit", registrarMovimentacao);
});
