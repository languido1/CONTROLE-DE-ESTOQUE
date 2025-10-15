const API_URL = "https://script.google.com/macros/s/AKfycbxKEUl0kyed4s0QZYS2boeof4iD8SlAAcRTcMcU0PX6cKJsoOs8YBxXOtj-l6y-5Tlu-g/exec";
let dadosLojas = {};

// Salvar no localStorage
function salvarLocal() {
  localStorage.setItem("dadosLojas", JSON.stringify(dadosLojas));
}

// Carregar dados
async function carregarDados() {
  try {
    const response = await fetch(API_URL);
    const dadosPlanilha = await response.json();
    
    // Processar dados da planilha
    dadosLojas = {};
    dadosPlanilha.forEach(item => {
      const loja = item.Empresa || item.loja;
      if (!dadosLojas[loja]) dadosLojas[loja] = [];
      
      dadosLojas[loja].push({
        modelo: item.Modelo || item.modelo,
        marca: item.Marca || item.marca,
        quantidade: item.Saldo || item.quantidade,
        preco: item.Preço || item.preco,
        categoria: item.Categoria || item.categoria
      });
    });
    
    salvarLocal();
  } catch (err) {
    console.warn("Erro ao carregar da planilha, usando localStorage:", err);
    dadosLojas = JSON.parse(localStorage.getItem("dadosLojas")) || {};
  }
}

// Salvar nova armação
async function salvarNaPlanilha(lojaId, armacao) {
  armacao.loja = lojaId;
  armacao.action = "add";

  // Salvar no localStorage primeiro
  if (!dadosLojas[lojaId]) dadosLojas[lojaId] = [];
  dadosLojas[lojaId].push(armacao);
  salvarLocal();

  // Tentar salvar na planilha
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(armacao),
      headers: { "Content-Type": "application/json" }
    });
    const resultado = await response.json();
    console.log("Resposta da planilha:", resultado);
  } catch (err) {
    console.error("Erro ao salvar na planilha, mas salvo no localStorage:", err);
  }
}

// Restante do seu código JavaScript permanece similar...

