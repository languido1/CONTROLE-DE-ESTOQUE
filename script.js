const API_URL = "https://script.google.com/macros/s/AKfycbw66jjlRRG7RuzOqApSiMOVY270KOMQ_og0bKTVJrMAi46JvIgkcUaQs1GXsfaHs8Pv/exec";

let dadosLojas = {};
let lojaAtual = null;
let usuarioLogado = null;

const imagemCache = {};
let contadorImagensBuscadasHoje = 0;
const LIMITE_IMAGENS_HOJE = 10;

// 🔒 LOGIN
function processarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const errorMsg = document.getElementById("errorMsg");

  if (usuario === "admin" && senha === "1234") {
    usuarioLogado = usuario;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").classList.add("active");
    document.querySelector(".username").textContent = usuario;
    carregarDados();
  } else {
    errorMsg.textContent = "Usuário ou senha incorretos!";
  }
}

// 🔒 LOGOUT
function fazerLogout() {
  usuarioLogado = null;
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("login-container").style.display = "flex";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("errorMsg").textContent = "";
}

// 🔗 CARREGAR DADOS DA PLANILHA
async function carregarDados() {
  try {
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
    const resposta = await fetch(proxyURL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha.");

    const dados = await resposta.json();
    console.log("✅ Dados recebidos:", dados);

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
    console.error("❌ Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados. Verifique se o link do Apps Script está correto e publicado.");
  }
}

// 🏬 EXIBIR LOJAS
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
}

// 📷 BUSCAR IMAGEM
async function buscarImagem(marca, modelo) {
  const API_KEY = "AIzaSyBQjWgFZy8oiP8yF4o7_7jfuaGc-XB9NKk";
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

// 📦 CARREGAR ARMAÇÕES E FILTROS
async function carregarArmacoes(lojaId) {
  const armacoes = dadosLojas[lojaId] || [];
  preencherFiltros(armacoes);
  aplicarFiltros();
}

// 🧩 Preencher Filtros
function preencherFiltros(armacoes) {
  const selectMarca = document.getElementById("filtro-marca");
  const selectCategoria = document.getElementById("filtro-categoria");

  const marcas = [...new Set(armacoes.map(a => a.marca).filter(Boolean))].sort();
  selectMarca.innerHTML = '<option value="">Todas as Marcas</option>' + marcas.map(m => `<option value="${m}">${m}</option>`).join('');

  const categorias = [...new Set(armacoes.map(a => a.categoria).filter(Boolean))].sort();
  selectCategoria.innerHTML = '<option value="">Todas as Categorias</option>' + categorias.map(c => `<option value="${c}">${c}</option>`).join('');
}

// 🧠 APLICAR FILTROS
async function aplicarFiltros() {
  const marcaFiltro = document.getElementById("filtro-marca").value.toLowerCase();
  const categoriaFiltro = document.getElementById("filtro-categoria").value.toLowerCase();
  const precoFiltro = document.getElementById("filtro-preco").value;
  const quantidadeFiltro = document.getElementById("filtro-quantidade").value;

  const armacoes = dadosLojas[lojaAtual] || [];

  const filtradas = armacoes.filter(item => {
    const marcaOk = !marcaFiltro || item.marca.toLowerCase().includes(marcaFiltro);
    const categoriaOk = !categoriaFiltro || item.categoria.toLowerCase().includes(categoriaFiltro);
    const precoNumero = parseFloat(item.preco.replace("R$", "").replace(",", "."));
    const precoOk = !precoFiltro || precoNumero <= parseFloat(precoFiltro);
    let qtdOk = true;
    const qtd = item.quantidade;

    if (quantidadeFiltro === "0") qtdOk = qtd === 0;
    else if (quantidadeFiltro === "1-10") qtdOk = qtd >= 1 && qtd <= 10;
    else if (quantidadeFiltro === "11-50") qtdOk = qtd >= 11 && qtd <= 50;
    else if (quantidadeFiltro === "51+") qtdOk = qtd > 50;

    return marcaOk && categoriaOk && precoOk && qtdOk;
  });

  renderizarArmacoes(filtradas);
}

// 🔁 RENDERIZAR ARMAÇÕES
async function renderizarArmacoes(armacoes) {
  const armacoesList = document.getElementById("armacoes-list");
  armacoesList.innerHTML = "";

  for (const item of armacoes) {
    let imgSrc = "https://via.placeholder.com/300x200?text=Carregando...";

    // Tentar cache primeiro
    const cacheKey = `${item.marca}_${item.modelo}`;
    if (imagemCache[cacheKey]) {
      imgSrc = imagemCache[cacheKey];
    } else if (contadorImagensBuscadasHoje < LIMITE_IMAGENS_HOJE) {
      imgSrc = await buscarImagem(item.marca, item.modelo);
      imagemCache[cacheKey] = imgSrc;
      contadorImagensBuscadasHoje++;
    } else {
      imgSrc = "https://via.placeholder.com/300x200?text=Limite+de+imagens+atingido";
    }

    const card = document.createElement("div");
    card.className = "armacao-card";

    card.innerHTML = `
      <img src="${imgSrc}" alt="Óculos ${item.marca} ${item.modelo}" />
      <h3>${item.marca} ${item.modelo}</h3>
      <p><strong>Quantidade:</strong> ${item.quantidade}</p>
      <p><strong>Preço:</strong> ${item.preco}</p>
      <p><strong>Categoria:</strong> ${item.categoria}</p>
    `;

    armacoesList.appendChild(card);
  }
}

// 🔄 VOLTAR PARA LOJAS
function voltarParaLojas() {
  document.getElementById("armacoes-container").classList.remove("active-section");
  document.getElementById("lojas-container").classList.add("active-section");
  lojaAtual = null;
}

// 🔘 LISTENERS
document.getElementById("loginForm").addEventListener("submit", processarLogin);
document.getElementById("search-store").addEventListener("input", filtrarLojas);
document.getElementById("filtro-marca").addEventListener("change", aplicarFiltros);
document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);
document.getElementById("filtro-preco").addEventListener("change", aplicarFiltros);
document.getElementById("filtro-quantidade").addEventListener("change", aplicarFiltros);
document.getElementById("back-to-stores").addEventListener("click", voltarParaLojas);
