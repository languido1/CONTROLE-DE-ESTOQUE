const API_URL = "https://script.google.com/macros/s/AKfycbx10yymLcG-FsbJHU5xrXmkNjsa9tw8PQ6dEzX78Ya8R2YzWUz11W_DBUUi4acL6_Op/exec";
let dadosLojas = {};

// Salvar no localStorage
function salvarLocal() {
  localStorage.setItem("dadosLojas", JSON.stringify(dadosLojas));
}

async function carregarDados() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao acessar a planilha");

    const dados = await resposta.json();

    // 🔄 Monta estrutura de dadosLojas igual à versão original
    dadosLojas = {};

    dados.lojas.forEach(item => {
      const loja = (item.Loja || "SEM NOME").toUpperCase().trim();
      if (!dadosLojas[loja]) dadosLojas[loja] = [];
      dadosLojas[loja].push({
        marca: item.Marca || "",
        modelo: item.Modelo || "",
        quantidade: parseInt(item.Quantidade) || 0,
        preco: item.Preço || "",
        categoria: item.Categoria || ""
      });
    });

    carregarLojas(); // mantém igual ao original

  } catch (erro) {
    console.error("Erro ao carregar dados da planilha:", erro);
    alert("Erro ao carregar dados da planilha.");
    carregarLojas(); // mostra vazio se falhar
  }
}
