//function doPost(e) {
  const ss = SpreadsheetApp.openById('1RohEHcauBGKEagwhrwYHgVyUblT4-iH4GrtnKLweatM');
  const sheet = ss.getSheetByName('Armações Diniz');
  const dados = JSON.parse(e.postData.contents);

  if (dados.action === "add") {
    // Colunas: Empresa, Marca, Saldo, Modelo, DataHora
    sheet.appendRow([
      dados.empresa,
      dados.marca,
      dados.quantidade,
      dados.modelo,
      new Date()
    ]);
    return ContentService.createTextOutput("Adicionado");
  }

  if (dados.action === "update") {
    const linhas = sheet.getDataRange().getValues();
    for (let i = 1; i < linhas.length; i++) {
      const marca = linhas[i][1];
      const modelo = linhas[i][3];
      if (marca === dados.marca && modelo === dados.modelo) {
        // coluna 3 é “Saldo”
        const valorAtual = Number(linhas[i][2]);
        const novoValor = valorAtual + Number(dados.quantidade); // se for saída, quantidade pode ser negativa
        sheet.getRange(i + 1, 3).setValue(novoValor);
        // coluna 5 será DataHora (nova coluna que você deve ter)
        sheet.getRange(i + 1, 5).setValue(new Date());
        return ContentService.createTextOutput("Atualizado");
      }
    }
    return ContentService.createTextOutput("Não encontrado");
  }

  return ContentService.createTextOutput("Ação inválida");
}

    salvarLocal();
  } catch (err) {
    console.warn("Erro ao carregar da planilha, usando localStorage:", err);
    // Se falhar, usa apenas os dados locais
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
  await carregarDados(); // tenta carregar os dados atualizados
  const loja = dadosLojas[lojaId] || [];

  const modalHTML = `
    <div class="modal-armacoes">
      <h2>${lojaId.toUpperCase()}</h2>
      <button onclick="fecharModal()">Fechar</button>

      <table>
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
          ${loja.map(item => `
            <tr>
              <td>${item.modelo}</td>
              <td>${item.marca}</td>
              <td>${item.quantidade}</td>
              <td>${item.preco}</td>
              <td>${item.categoria}</td>
            </tr>
          `).join('')}
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

  fecharModal(); // fecha se já tiver aberto
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
    abrirDetalhesLoja(lojaId); // recarrega modal atualizado
  });
}

// Fechar modal
function fecharModal() {
  const modal = document.querySelector(".modal-armacoes");
  if (modal) modal.remove();
}

// Vincula os eventos aos cards de loja
document.querySelectorAll(".card-loja").forEach((card) => {
  card.addEventListener("click", () => {
    const lojaId = card.getAttribute("data-loja"); // Ex: data-loja="primitiva1"
    abrirDetalhesLoja(lojaId);
  });
});
 === https://script.google.com/macros/s/AKfycbxFGsap0ifhvlK4WuyyGpMAVatErHO-taoFjaMEqqygZ3vSLgE0Qx_4OhWluzVpmGn8sA/exec ===

