// ===============================
// CONFIGURAÇÃO DA API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbw5sOAltWnoSx0K8eRSHVErber3IWQAoxvDo9-u543FPxeYGoU0_PYTvfdarqLFhFK1/exec";

let dadosLojas = {};
let lojaAtual = null;

// ===============================
// FUNÇÃO PARA SALVAR LOCALMENTE
// ===============================
function salvarLocal() {
  localStorage.setItem("dadosLojas", JSON.stringify(dadosLojas));
}

// ===============================
// CARREGAR DADOS DA PLANILHA
// ===============================
async function carregarDados() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha");
    const dados = await resposta.json();

    dadosLojas = {};

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

    salvarLocal();
    carregarLojas();

  } catch (erro) {
    console.error("Erro ao carregar dados da planilha:", erro);
    alert("Erro ao carregar dados da planilha.");
    carregarLojas();
  }
}

// ===============================
// LOGIN SIMPLES
// ===============================
function processarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById("username").value;
  const senha = document.getElementById("password").value;

  if (usuario === "admin" && senha === "1234") {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("main-container").style.display = "block";
    carregarDados();
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// ===============================
// EXIBIR LISTA DE LOJAS
// ===============================
function carregarLojas() {
  const lojasContainer = document.getElementById("lojas-list");
  lojasContainer.innerHTML = "";

  const lojas = Object.keys(dadosLojas);
  if (lojas.length === 0) {
    lojasContainer.innerHTML = "<p style='text-align:center;color:#666'>Nenhuma loja encontrada</p>";
    return;
  }

  lojas.forEach(loja => {
    const totalArmacoes = dadosLojas[loja].length;
    const totalQuantidade = dadosLojas[loja].reduce((sum, item) => sum + item.quantidade, 0);

    lojasContainer.innerHTML += `
      <div class="store-card" onclick="abrirDetalhesLoja('${loja}')">
        <h3>${loja}</h3>
        <p><strong>${totalArmacoes}</strong> modelos de armações</p>
        <p><strong>${totalQuantidade}</strong> unidades no total</p>
        <p><small>Clique para gerenciar</small></p>
      </div>
    `;
  });
}

// ===============================
// ABRIR LOJA
// ===============================
function abrirDetalhesLoja(lojaId) {
  lojaAtual = lojaId.toUpperCase().trim();
  document.getElementById("lojas-container").classList.remove("active-section");
  document.getElementById("armacoes-container").classList.add("active-section");
  document.getElementById("current-store-name").textContent = lojaId;
  carregarArmacoes(lojaAtual);
  carregarFiltros(lojaAtual);
  mudarTab("lista");
}

// ===============================
// EXIBIR ARMAÇÕES
// ===============================
function carregarArmacoes(lojaId) {
  const armacoesList = document.getElementById("armacoes-list");
  const armacoes = dadosLojas[lojaId] || [];

  if (armacoes.length === 0) {
    armacoesList.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px; color:#666;'>Nenhuma armação cadastrada nesta loja</p>";
    return;
  }

  armacoesList.innerHTML = armacoes.map(armacao => `
    <div class="frame-card">
      <div class="frame-actions">
        <button class="btn-remove" onclick="removerArmacao('${armacao.marca}', '${armacao.modelo}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h4>${armacao.modelo}</h4>
      <p><strong>Marca:</strong> ${armacao.marca}</p>
      <p><strong>Quantidade:</strong> ${armacao.quantidade}</p>
      <p><strong>Preço:</strong> ${armacao.preco}</p>
      <p><strong>Categoria:</strong> ${armacao.categoria}</p>
    </div>
  `).join('');
}

// ===============================
// CADASTRAR ARMAÇÃO (envia pro Apps Script via POST)
// ===============================
async function cadastrarArmacao(event) {
  event.preventDefault();

  const loja = document.getElementById("cadastro-loja").value.trim().toUpperCase();
  const marca = document.getElementById("cadastro-marca").value.trim();
  const modelo = document.getElementById("cadastro-modelo").value.trim();
  const quantidade = parseInt(document.getElementById("cadastro-quantidade").value);
  const preco = document.getElementById("cadastro-preco").value;
  const categoria = document.getElementById("cadastro-categoria").value;

  if (!loja || !marca || !modelo) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const novaArmacao = {
    Loja: loja,
    Marca: marca,
    Modelo: modelo,
    Quantidade: quantidade,
    Preço: preco,
    Categoria: categoria
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ acao: "cadastrar", dados: novaArmacao }),
      headers: { "Content-Type": "application/json" }
    });

    alert(`Armação cadastrada na loja ${loja}!`);
    carregarDados();
    document.getElementById("formCadastro").reset();

  } catch (erro) {
    console.error("Erro ao cadastrar armação:", erro);
    alert("Erro ao cadastrar armação.");
  }
}

// ===============================
// REGISTRAR MOVIMENTAÇÃO
// ===============================
async function registrarMovimentacao(event) {
  event.preventDefault();

  const loja = document.getElementById("movimentacao-loja").value.trim().toUpperCase();
  const marca = document.getElementById("movimentacao-marca").value.trim();
  const modelo = document.getElementById("movimentacao-modelo").value.trim();
  const tipo = document.getElementById("movimentacao-tipo").value;
  const quantidade = parseInt(document.getElementById("movimentacao-quantidade").value);

  if (!loja || !marca || !modelo || !quantidade) {
    alert("Preencha todos os campos!");
    return;
  }

  const movimentacao = {
    Loja: loja,
    Marca: marca,
    Modelo: modelo,
    Tipo: tipo,
    Quantidade: quantidade
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ acao: "movimentar", dados: movimentacao }),
      headers: { "Content-Type": "application/json" }
    });

    alert("Movimentação registrada!");
    carregarDados();
    document.getElementById("formMovimentacao").reset();

  } catch (erro) {
    console.error("Erro ao registrar movimentação:", erro);
    alert("Erro ao registrar movimentação.");
  }
}

// ===============================
// AUXILIARES DE FILTRO E INTERFACE
// ===============================
function carregarFiltros(lojaId) {
  const armacoes = dadosLojas[lojaId] || [];
  const marcas = [...new Set(armacoes.map(a => a.marca))];
  const categorias = [...new Set(armacoes.map(a => a.categoria))];

  const brand = document.getElementById("filter-brand");
  const category = document.getElementById("filter-category");

  brand.innerHTML = "<option value=''>Todas</option>";
  marcas.forEach(m => brand.innerHTML += `<option value="${m}">${m}</option>`);

  category.innerHTML = "<option value=''>Todas</option>";
  categorias.forEach(c => category.innerHTML += `<option value="${c}">${c}</option>`);
}

function mudarTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// ===============================
// EVENTOS GERAIS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", processarLogin);
  document.getElementById("formCadastro").addEventListener("submit", cadastrarArmacao);
  document.getElementById("formMovimentacao").addEventListener("submit", registrarMovimentacao);
});
