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
     // script.js

// Simulando dados das lojas e armações
const lojas = [
  { id: 1, nome: "Loja Centro" },
  { id: 2, nome: "Loja Shopping" },
];

let armações = [
  { id: 1, lojaId: 1, nome: "Armação A", marca: "Marca X", categoria: "Categoria 1", preco: 250, quantidade: 10 },
  { id: 2, lojaId: 1, nome: "Armação B", marca: "Marca Y", categoria: "Categoria 2", preco: 350, quantidade: 5 },
  { id: 3, lojaId: 2, nome: "Armação C", marca: "Marca X", categoria: "Categoria 1", preco: 450, quantidade: 8 },
];

const loginContainer = document.getElementById("login-container");
const dashboard = document.getElementById("dashboard");
const userMenu = document.getElementById("user-menu");
const userDropdown = document.getElementById("user-dropdown");
const errorMsg = document.getElementById("errorMsg");
const lojasList = document.getElementById("lojas-list");
const armacoesContainer = document.getElementById("armacoes-container");
const currentStoreName = document.getElementById("current-store-name");
const backToStoresBtn = document.getElementById("back-to-stores");

// Tabs
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

// Lista de armações
const armacoesList = document.getElementById("armacoes-list");

// Formulários e mensagens
const formCadastro = document.getElementById("form-cadastro");
const cadastroMsg = document.getElementById("cadastro-msg");
const formEntradaSaida = document.getElementById("form-entrada-saida");
const entradaSaidaMsg = document.getElementById("entrada-saida-msg");
const frameSelect = document.getElementById("frame-select");

// Variável para armazenar loja selecionada
let lojaSelecionada = null;

// Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  
  if(usuario === "admin" && senha === "1234"){
    loginContainer.style.display = "none";
    dashboard.style.display = "block";
    carregarLojas();
  } else {
    errorMsg.textContent = "Usuário ou senha inválidos!";
  }
});

// Carregar lojas
function carregarLojas(){
  lojasList.innerHTML = "";
  lojas.forEach(loja => {
    const div = document.createElement("div");
    div.className = "store-card";
    div.textContent = loja.nome;
    div.style.cursor = "pointer";
    div.addEventListener("click", () => abrirLoja(loja));
    lojasList.appendChild(div);
  });
}

// Abrir loja e mostrar armações
function abrirLoja(loja){
  lojaSelecionada = loja;
  currentStoreName.textContent = loja.nome;
  document.getElementById("lojas-container").classList.remove("active-section");
  armacoesContainer.classList.add("active-section");
  mostrarArmações(loja.id);
  limparTabs();
  ativarTab("lista");
  cadastroMsg.textContent = "";
  entradaSaidaMsg.textContent = "";
}

// Mostrar armações da loja
function mostrarArmações(lojaId){
  armacoesList.innerHTML = "";
  const armaçõesDaLoja = armações.filter(a => a.lojaId === lojaId);
  if(armaçõesDaLoja.length === 0){
    armacoesList.innerHTML = "<p>Nenhuma armação encontrada.</p>";
    return;
  }
  armaçõesDaLoja.forEach(a => {
    const card = document.createElement("div");
    card.className = "frame-card";
    card.innerHTML = `
      <h4>${a.nome}</h4>
      <p>Marca: ${a.marca}</p>
      <p>Categoria: ${a.categoria}</p>
      <p class="frame-price">Preço: R$ ${a.preco.toFixed(2)}</p>
      <p>Quantidade: ${a.quantidade}</p>
    `;
    armacoesList.appendChild(card);
  });
  atualizarFrameSelect(armaçõesDaLoja);
}

// Atualizar select para entrada/saída
function atualizarFrameSelect(armaçõesDaLoja){
  frameSelect.innerHTML = '<option value="">Selecione a armação</option>';
  armaçõesDaLoja.forEach(a => {
    const option = document.createElement("option");
    option.value = a.id;
    option.textContent = `${a.nome} (Qtd: ${a.quantidade})`;
    frameSelect.appendChild(option);
  });
}

// Botão voltar para lojas
backToStoresBtn.addEventListener("click", () => {
  armacoesContainer.classList.remove("active-section");
  document.getElementById("lojas-container").classList.add("active-section");
  lojaSelecionada = null;
});

// Tabs switch
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    limparTabs();
    ativarTab(tab.dataset.tab);
    cadastroMsg.textContent = "";
    entradaSaidaMsg.textContent = "";
  });
});

function limparTabs(){
  tabs.forEach(t => t.classList.remove("active"));
  tabContents.forEach(c => c.classList.remove("active"));
}

function ativarTab(tabName){
  const tab = Array.from(tabs).find(t => t.dataset.tab === tabName);
  const tabContent = document.getElementById(`tab-${tabName}`);
  if(tab && tabContent){
    tab.classList.add("active");
    tabContent.classList.add("active");
  }
}

// Formulário cadastro
formCadastro.addEventListener("submit", e => {
  e.preventDefault();
  if(!lojaSelecionada) return;
  
  const nome = document.getElementById("frame-name").value.trim();
  const marca = document.getElementById("frame-brand").value.trim();
  const categoria = document.getElementById("frame-category").value.trim();
  const preco = parseFloat(document.getElementById("frame-price").value);
  const quantidade = parseInt(document.getElementById("frame-quantity").value);

  if(!nome || !marca || !categoria || isNaN(preco) || isNaN(quantidade)){
    cadastroMsg.style.color = "red";
    cadastroMsg.textContent = "Preencha todos os campos corretamente.";
    return;
  }

  const novoId = armações.length ? armações[armações.length -1].id +1 : 1;
  armações.push({ id: novoId, lojaId: lojaSelecionada.id, nome, marca, categoria, preco, quantidade });

  cadastroMsg.style.color = "green";
  cadastroMsg.textContent = "Armação cadastrada com sucesso!";

  // Limpar form
  formCadastro.reset();

  // Atualizar lista e select
  mostrarArmações(lojaSelecionada.id);
});

// Formulário entrada/saída
formEntradaSaida.addEventListener("submit", e => {
  e.preventDefault();
  if(!lojaSelecionada) return;

  const frameId = parseInt(frameSelect.value);
  const acao = document.getElementById("action-type").value;
  const quantidade = parseInt(document.getElementById("action-quantity").value);

  if(!frameId || !acao || isNaN(quantidade) || quantidade <= 0){
    entradaSaidaMsg.style.color = "red";
    entradaSaidaMsg.textContent = "Preencha todos os campos corretamente.";
    return;
  }

  const armação = armações.find(a => a.id === frameId && a.lojaId === lojaSelecionada.id);
  if(!armação){
    entradaSaidaMsg.style.color = "red";
    entradaSaidaMsg.textContent = "Armação não encontrada.";
    return;
  }

  if(acao === "saida" && armação.quantidade < quantidade){
    entradaSaidaMsg.style.color = "red";
    entradaSaidaMsg.textContent = "Quantidade insuficiente para saída.";
    return;
  }

  // Atualizar quantidade
  if(acao === "entrada"){
    armação.quantidade += quantidade;
  } else if (acao === "saida"){
    armação.quantidade -= quantidade;
  }

  entradaSaidaMsg.style.color = "green";
  entradaSaidaMsg.textContent = "Movimentação registrada com sucesso!";

  formEntradaSaida.reset();
  mostrarArmações(lojaSelecionada.id);
});

// Logout
function fazerLogout(){
  dashboard.style.display = "none";
  loginContainer.style.display = "flex";
  document.getElementById("loginForm").reset();
  errorMsg.textContent = "";
  lojaSelecionada = null;
  armaçõesList.innerHTML = "";
}

userMenu.addEventListener("click", () => {
  userDropdown.classList.toggle("show");
});

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

