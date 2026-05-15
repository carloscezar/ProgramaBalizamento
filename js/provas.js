// ===== PROVAS.JS - Gestão de Provas =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-prova');
  const listaProvasContainer = document.getElementById('lista-provas-container');
  const removerTodasProvasBtn = document.getElementById('btn-remover-todas-provas');

  // ===== RENDERIZAR LISTA DE PROVAS =====
  function renderizarListaProvas() {
    const provas = getProvas();
    listaProvasContainer.innerHTML = '';

    if (provas.length === 0) {
      listaProvasContainer.innerHTML = '<p>Nenhuma prova cadastrada.</p>';
      removerTodasProvasBtn.style.display = 'none';
      return;
    }

    removerTodasProvasBtn.style.display = 'inline-block';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nome da Prova</th>
          <th>Ação</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement('tbody');
    provas.forEach((prova) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${prova.nome}</td>
        <td>
          <button class="btn-remover-prova" data-prova-id="${prova.id}" type="button">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    listaProvasContainer.appendChild(table);
  }

  // ===== EVENT DELEGATION PARA REMOVER PROVA =====
  listaProvasContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remover-prova')) {
      const provaId = e.target.getAttribute('data-prova-id');
      
      if (!provaId) {
        alert('Erro: ID da prova não encontrado');
        return;
      }

      if (confirm('Tem certeza que deseja remover esta prova?')) {
        removerProva(provaId);
        renderizarListaProvas();
        alert('Prova removida com sucesso!');
      }
    }
  });

  // ===== EVENTO: ENVIAR FORMULÁRIO =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome-prova').value.trim();

    if (!nome) {
      alert('Por favor, preencha o nome da prova.');
      return;
    }

    const novaProva = {
      id: `prova-${Date.now()}`,
      nome: nome,
    };

    const resultado = salvarProva(novaProva);
    if (resultado) {
      alert('Prova salva com sucesso!');
      form.reset();
      renderizarListaProvas();
    }
  });

  // ===== EVENTO: REMOVER TODAS =====
  removerTodasProvasBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover TODAS as provas?')) {
      removerTodasProvas();
      renderizarListaProvas();
      alert('Todas as provas foram removidas!');
    }
  });

  // ===== INICIALIZAÇÃO =====
  renderizarListaProvas();
});