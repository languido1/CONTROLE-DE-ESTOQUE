// === CONFIGURAÇÃO: coloque aqui a URL da sua API do Google Apps Script ===
const API_URL = "COLE_AQUI_SUA_URL_DO_APPS_SCRIPT";

// Carrega do localStorage ou usa objeto vazio
let dadosLojas = JSON.parse(localStorage.getItem("dadosLojas")) || {};

// Salvar localmente
function salvarLocal() {
  localStorage.setItem("dadosLojas", JSON.stringify(dadosLojas));
}

// Buscar dados da planilha e atualizar localStorage
async function carregarDados() {
  try {
    const resp = await fetch(API_URL);
    const dados = await resp.json();

    // Organiza por loja
    dadosLojas = {};
    dados.forEach(item => {
      if (!dadosLojas[item.loja]) dadosLojas[item.loja] = [];
      dadosLojas[item.loja].push(item);
    });

    salvarLocal();
  } catch (err) {
    console.warn("Erro ao carregar da planilha, usando localStorage:", err);
    dadosLojas = JSON.parse(localStorage.getItem("dadosLojas")) || {};
  }
}

// Salvar nova armação na planilha e também no localStorage
async function salvarNaPlanilha(lojaId, armacao) {
  armacao.loja = lojaId;

  // Salva primeiro no localStorage
  if (!dadosLojas[lojaId]) dadosLojas[lojaId] = [];
  dadosLojas[lojaId].push(armacao);
  salvarLocal();

  // Depois tenta salvar na planilha
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(armacao),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Erro ao salvar na planilha, mas salvo no localStorage:", err);
  }
}

// Função para abrir os detalhes da loja
async function abrirDetalhesLoja(lojaId) {
  await carregarDados();
  const loja = dadosLojas[lojaId] || [];

  const marcas = [...new Set(loja.map(item => item.marca))];
  const categorias = [...new Set(loja.map(item => item.categoria))];

  const modalHTML = `
    <div class="modal-armacoes">
      <h2>${lojaId.toUpperCase()}</h2>
      <button onclick="fecharModal()">Fechar</button>

      <!-- FILTROS -->
      <div class="filtros" style="margin:10px 0;display:flex;gap:10px;flex-wrap:wrap;">
        <select id="filtroMarca">
          <option value="">Todas as Marcas</option>
          ${marcas.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
        <select id="filtroCategoria">
          <option value="">Todas as Categorias</option>
          ${categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="filtroPreco">
          <option value="">Todos os Preços</option>
          <option value="0-199">Até R$ 199</option>
          <option value="200-299">R$ 200 a R$ 299</option>
          <option value="300-399">R$ 300 a R$ 399</option>
          <option value="400-9999">Acima de R$ 400</option>
        </select>
        <select id="filtroQuantidade">
          <option value="">Todas as Quantidades</option>
          <option value="1-5">1 a 5</option>
          <option value="6-10">6 a 10</option>
          <option value="11-999">Mais de 10</option>
        </select>
      </div>

      <table id="tabelaArmacoes">
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Marca</th>
            <th>Quantidade</th>
            <th>Preço</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          ${gerarLinhasTabela(loja)}
        </tbody>
      </table>

      <h3>Cadastrar nova armação</h3>
      <form id="formCadastro">
        <input type="text" id="modelo" placeholder="Modelo" required>
        <input type="text" id="marca" placeholder="Marca" required>
        <input type="number" id="quantidade" placeholder="Quantidade" required>
        <input type="text" id="preco" placeholder="Preço (R$)" required>
        <input type="text" id="categoria" placeholder="Categoria" required>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  `;

  fecharModal();
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Listener do formulário
  document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const novaArmacao = {
      modelo: document.getElementById("modelo").value,
      marca: document.getElementById("marca").value,
      quantidade: parseInt(document.getElementById("quantidade").value),
      preco: document.getElementById("preco").value,
      categoria: document.getElementById("categoria").value,
    };
    await salvarNaPlanilha(lojaId, novaArmacao);
    abrirDetalhesLoja(lojaId);
  });

  // Eventos dos filtros
  ["filtroMarca", "filtroCategoria", "filtroPreco", "filtroQuantidade"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => aplicarFiltros(loja, lojaId));
  });
}

// Gera linhas da tabela
function gerarLinhasTabela(lista) {
  return lista.map(item => `
    <tr>
      <td>${item.modelo}</td>
      <td>${item.marca}</td>
      <td>${item.quantidade}</td>
      <td>${item.preco}</td>
      <td>${item.categoria}</td>
    </tr>
  `).join('');
}

// Função para aplicar filtros
function aplicarFiltros(loja, lojaId) {
  const marca = document.getElementById("filtroMarca").value;
  const categoria = document.getElementById("filtroCategoria").value;
  const faixaPreco = document.getElementById("filtroPreco").value;
  const faixaQtd = document.getElementById("filtroQuantidade").value;

  const listaFiltrada = loja.filter(item => {
    const preco = parseFloat(item.preco.replace("R$","").replace(".","").replace(",","."));
    const qtd = parseInt(item.quantidade);

    const passaMarca = !marca || item.marca === marca;
    const passaCategoria = !categoria || item.categoria === categoria;

    let passaPreco = true;
    if (faixaPreco) {
      const [min, max] = faixaPreco.split('-').map(Number);
      passaPreco = preco >= min && preco <= max;
    }

    let passaQtd = true;
    if (faixaQtd) {
      const [min, max] = faixaQtd.split('-').map(Number);
      passaQtd = qtd >= min && qtd <= max;
    }

    return passaMarca && passaCategoria && passaPreco && passaQtd;
  });

  const tbody = document.querySelector("#tabelaArmacoes tbody");
  tbody.innerHTML = gerarLinhasTabela(listaFiltrada);
}

// Fechar modal
function fecharModal() {
  const modal = document.querySelector(".modal-armacoes");
  if (modal) modal.remove();
}

// Vincula os eventos aos cards de loja
document.querySelectorAll(".card-loja").forEach((card) => {
  card.addEventListener("click", () => {
    const lojaId = card.getAttribute("data-loja");
    abrirDetalhesLoja(lojaId);
  });
});
