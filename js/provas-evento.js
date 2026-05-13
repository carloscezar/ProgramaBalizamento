document.addEventListener('DOMContentLoaded', () => {
  const eventoSelect = document.getElementById('evento-select');
  const sexoSelect = document.getElementById('sexo-select');
  const provaSelect = document.getElementById('prova-select');
  const categoriaSelect = document.getElementById('categoria-select');
  const formAdicionar = document.getElementById('form-adicionar-prova-evento');
  const btnGerarAutomatico = document.getElementById('btn-gerar-automatico');
  const listaContainer = document.getElementById('lista-provas-evento-container');

  function carregarEventos() {
    const eventos = getEventos();
    eventoSelect.innerHTML = '<option value="">Selecione um evento</option>';

    eventos.forEach((evento) => {
      const option = document.createElement('option');
      option.value = evento.id;
      option.textContent = `${evento.nome} (${new Date(evento.dataEvento).toLocaleDateString('pt-BR')})`;
      eventoSelect.appendChild(option);
    });
  }

  function carregarCombosPorEventoESexo() {
    const eventoId = eventoSelect.value;

    provaSelect.innerHTML = '<option value="">Selecione a prova</option>';
    categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';

    if (!eventoId) {
      return;
    }

    const provas = getProvas();
    const categorias = getCategorias().filter((categoria) => categoria.ativo !== false);

    provas
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .forEach((prova) => {
      const option = document.createElement('option');
      option.value = prova.id;
      option.textContent = prova.nome;
      provaSelect.appendChild(option);
    });

    categorias
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .forEach((categoria) => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nome;
      categoriaSelect.appendChild(option);
    });
  }

  function renderizarLista() {
    const eventoId = eventoSelect.value;
    listaContainer.innerHTML = '';

    if (!eventoId) {
      listaContainer.innerHTML = '<p>Selecione um evento para visualizar as provas.</p>';
      return;
    }

    const provasEvento = getProvasEventoDetalhadas(eventoId);

    if (provasEvento.length === 0) {
      listaContainer.innerHTML = '<p>Nenhuma prova gerada para este evento.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Número</th>
          <th>Prova</th>
          <th>Categoria</th>
          <th>Sexo</th>
          <th>Ação</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');

    provasEvento.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.dataset.id = item.id;
      tr.innerHTML = `
        <td>${item.numeroProva}</td>
        <td>${item.provaNome}</td>
        <td>${item.categoriaNome}</td>
        <td>${item.sexo}</td>
        <td class="coluna-acoes">
          <button type="button" class="btn-subir" data-id="${item.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn-descer" data-id="${item.id}" ${index === provasEvento.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" class="btn-remover-evento" data-id="${item.id}">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    listaContainer.appendChild(table);
  }

  function trocarOrdem(idA, idB) {
    const eventoId = eventoSelect.value;
    const lista = getProvasEventoDetalhadas(eventoId).map((item) => item.id);
    const idxA = lista.indexOf(idA);
    const idxB = lista.indexOf(idB);

    if (idxA < 0 || idxB < 0) {
      return;
    }

    const temp = lista[idxA];
    lista[idxA] = lista[idxB];
    lista[idxB] = temp;

    atualizarOrdemProvasEvento(eventoId, lista);
    renderizarLista();
  }

  eventoSelect.addEventListener('change', () => {
    carregarCombosPorEventoESexo();
    renderizarLista();
  });

  sexoSelect.addEventListener('change', () => {
    carregarCombosPorEventoESexo();
  });

  btnGerarAutomatico.addEventListener('click', () => {
    const eventoId = eventoSelect.value;
    if (!eventoId) {
      alert('Selecione um evento.');
      return;
    }

    gerarProvasEvento(eventoId);
    renderizarLista();
    alert('Provas do evento geradas com sucesso.');
  });

  formAdicionar.addEventListener('submit', (event) => {
    event.preventDefault();

    const eventoId = eventoSelect.value;
    const provaId = provaSelect.value;
    const categoriaId = categoriaSelect.value;
    const sexo = sexoSelect.value;

    if (!eventoId || !provaId || !categoriaId || !sexo) {
      alert('Preencha todos os campos para adicionar.');
      return;
    }

    const resultado = adicionarProvaEvento(eventoId, provaId, categoriaId, sexo);
    if (!resultado.sucesso) {
      alert(`Erro: ${resultado.mensagem}`);
      return;
    }

    renderizarLista();
    alert('Registro adicionado com sucesso.');
  });

  listaContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-remover-evento')) {
      const id = event.target.dataset.id;
      if (confirm('Deseja remover este registro de prova do evento?')) {
        removerProvaEvento(id);
        renderizarLista();
      }
      return;
    }

    if (event.target.classList.contains('btn-subir')) {
      const idAtual = event.target.dataset.id;
      const ids = getProvasEventoDetalhadas(eventoSelect.value).map((item) => item.id);
      const idx = ids.indexOf(idAtual);
      if (idx > 0) {
        trocarOrdem(ids[idx], ids[idx - 1]);
      }
      return;
    }

    if (event.target.classList.contains('btn-descer')) {
      const idAtual = event.target.dataset.id;
      const ids = getProvasEventoDetalhadas(eventoSelect.value).map((item) => item.id);
      const idx = ids.indexOf(idAtual);
      if (idx >= 0 && idx < ids.length - 1) {
        trocarOrdem(ids[idx], ids[idx + 1]);
      }
    }
  });

  carregarEventos();
  renderizarLista();
});
