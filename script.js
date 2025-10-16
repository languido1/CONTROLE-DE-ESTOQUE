const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";
let dadosLojas = {};
let usuarioLogado = null;
let lojaSelecionada = null;
let armaçõesFiltradas = [];

// LOGIN
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
  lojaSelecionada = null;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login-container").style.display = "flex";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("errorMsg").textContent = "";
  limparTelaDeArmações();
}

// CARREGAR DADOS
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha.");

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

    carregarLojas();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados da planilha.");
  }
}

// MOSTRAR LISTA DE LOJAS
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
      <div class="store-card" style="cursor:pointer; border:1px solid #ccc; padding:10px; margin:10px 0;" onclick="abrirLoja('${loja}')">
        <h3>${loja}</h3>
        <p><strong>${totalArmacoes}</strong> modelos de armações</p>
        <p><strong>${totalQuantidade}</strong> unidades no total</p>
      </div>
    `;
  }).join('');
}

// AO CLICAR NA LOJA
function abrirLoja(loja) {
  lojaSelecionada = loja;
  document.getElementById("lojas-section").style.display = "none";
  document.getElementById("armações-section").style.display = "block";
  document.getElementById("titulo-loja").textContent = loja;

  armaçõesFiltradas = dadosLojas[lojaSelecionada];
  popularFiltros();
  filtrarArmações();
}

// LIMPAR TELA DE ARMAÇÕES AO VOLTAR
function limparTelaDeArmações() {
  document.getElementById("armações-section").style.display = "none";
  document.getElementById("lojas-section").style.display = "block";
  lojaSelecionada = null;
  armaçõesFiltradas = [];
  document.getElementById("titulo-loja").textContent = "";
  limparFiltros();
  limparTabela();
}

// VOLTAR PARA LISTA DE LOJAS
function voltarParaLojas() {
  limparTelaDeArmações();
}

// POPULAR FILTROS DINÂMICOS
function popularFiltros() {
  const marcas = [...new Set(armaçõesFiltradas.map(item => item.marca))].sort();
  const modelos = [...new Set(armaçõesFiltradas.map(item => item.modelo))].sort();
  const categorias = [...new Set(armaçõesFiltradas.map(item => item.categoria))].sort();

  popularSelect("filtro-marca", marcas);
  popularSelect("filtro-modelo", modelos);
  popularSelect("filtro-categoria", categorias);
}

function popularSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">Todos</option>`;
  options.forEach(opt => {
    select.innerHTML += `<option value="${opt}">${opt}</option>`;
  });
}

function limparFiltros() {
  ["filtro-marca", "filtro-modelo", "filtro-categoria"].forEach(id => {
    const select = document.getElementById(id);
    if (select) select.innerHTML = `<option value="">Todos</option>`;
  });
}

function limparTabela() {
  const tbody = document.querySelector("#tabela-armações tbody");
  if (tbody) tbody.innerHTML = "";
}

// FILTRAR ARMAÇÕES PELA SELEÇÃO DOS FILTROS
function filtrarArmações() {
  if (!lojaSelecionada) return;

  const marcaFiltro = document.getElementById("filtro-marca").value;
  const modeloFiltro = document.getElementById("filtro-modelo").value;
  const categoriaFiltro = document.getElementById("filtro-categoria").value;

  armaçõesFiltradas = dadosLojas[lojaSelecionada].filter(item => {
    return (!marcaFiltro || item.marca === marcaFiltro)
      && (!modeloFiltro || item.modelo === modeloFiltro)
      && (!categoriaFiltro || item.categoria === categoriaFiltro);
  });

  atualizarTabela();
}

function atualizarTabela() {
  const tbody = document.querySelector("#tabela-armações tbody");
  tbody.innerHTML = "";

  if (armaçõesFiltradas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhuma armação encontrada.</td></tr>`;
    return;
  }

  armaçõesFiltradas.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.marca}</td>
      <td>${item.modelo}</td>
      <td>${item.quantidade}</td>
      <td>${item.preco}</td>
      <td>${item.categoria}</td>
    `;
    tbody.appendChild(tr);
  });
}

// FILTRAR LOJAS NA TELA PRINCIPAL
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

  lojasList.innerHTML = lojasFiltradas.map(loja => {
    const totalArmacoes = dadosLojas[loja].length;
    const totalQuantidade = dadosLojas[loja].reduce((sum, item) => sum + item.quantidade, 0);

    return `
      <div class="store-card" style="cursor:pointer; border:1px solid #ccc; padding:10px; margin:10px 0;" onclick="abrirLoja('${loja}')">
        <h3>${loja}</h3>
        <p><strong>${totalArmacoes}</strong> modelos de armações</p>
        <p><strong>${totalQuantidade}</strong> unidades no total</p>
      </div>
    `;
  }).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", processarLogin);
  document.getElementById("search-store").addEventListener("input", filtrarLojas);
});
