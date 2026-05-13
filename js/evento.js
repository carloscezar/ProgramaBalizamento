// ===== EVENTO.JS - Gestão de Eventos, Provas e Categorias =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-evento');
  const listaEventosContainer = document.getElementById('lista-eventos-container');
  const removerTodosEventosBtn = document.getElementById('btn-remover-todos-eventos');
  const modalEventoConfig = document.getElementById('modal-evento-config');
  const provasContainerModal = document.getElementById('provas-container-modal');
  const categoriasContainerModal = document.getElementById('categorias-container-modal');
  const btnSalvarConfigModal = document.getElementById('btn-salvar-config-modal');

  let eventoSelecionado = null; // Evento sendo configurado

  // ===== FUNÇÕES DE MODAL =====
  window.abrirModalEventoConfig = function(eventoId) {
    const eventos = getEventos();
    eventoSelecionado = eventos.find((e) => e.id === eventoId);

    if (!eventoSelecionado) {
      alert('Evento não encontrado!');
      return;
    }

    renderizarProvasECategoriasModal(eventoId);
    modalEventoConfig.style.display = 'flex';
  };

  window.fecharModalEventoConfig = function() {
    modalEventoConfig.style.display = 'none';
    eventoSelecionado = null;
  };

  // Fechar modal ao clicar no overlay (fora do conteúdo)
  modalEventoConfig.addEventListener('click', (e) => {
    if (e.target === modalEventoConfig) {
      fecharModalEventoConfig();
    }
  });

  // ===== RENDERIZAR LISTA DE EVENTOS =====
  function renderizarListaEventos() {
    const eventos = getEventos();
    listaEventosContainer.innerHTML = '';

    if (eventos.length === 0) {
      listaEventosContainer.innerHTML = '<p>Nenhum evento cadastrado.</p>';
      removerTodosEventosBtn.style.display = 'none';
      return;
    }

    removerTodosEventosBtn.style.display = 'inline-block';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nome</th>
          <th>Local</th>
          <th>Data</th>
          <th>Raias</th>
          <th>Status</th>
          <th>Ação</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement('tbody');
    eventos.forEach((evento) => {
      const status = evento.isFinalizado ? '✓ Finalizado' : '⏳ Em Andamento';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evento.nome}</td>
        <td>${evento.local}</td>
        <td>${new Date(evento.dataEvento).toLocaleDateString('pt-BR')}</td>
        <td>${evento.qtdeRaias}</td>
        <td>${status}</td>
        <td>
          <button class="btn-config-evento" data-id="${evento.id}">Configurar</button>
          <button class="btn-remover-evento" data-id="${evento.id}">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    listaEventosContainer.appendChild(table);

    // Eventos dos botões
    document.querySelectorAll('.btn-config-evento').forEach((btn) => {
      btn.addEventListener('click', () => window.abrirModalEventoConfig(btn.dataset.id));
    });

    document.querySelectorAll('.btn-remover-evento').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover este evento?')) {
          removerEvento(btn.dataset.id);
          renderizarListaEventos();
        }
      });
    });
  }

  // ===== RENDERIZAR PROVAS E CATEGORIAS NO MODAL =====
  function renderizarProvasECategoriasModal(eventoId) {
    const provas = getProvas();
    const categorias = getCategorias();
    const eventosProvas = getEventosProvas();
    const eventosCategorias = getEventosCategorias();

    // Provas selecionadas neste evento
    const provasSelecionadas = eventosProvas
      .filter((ep) => ep.eventoId === eventoId)
      .map((ep) => `${ep.provaId}-${ep.sexo}`);

    // Categorias selecionadas neste evento
    const categoriasSelecionadas = eventosCategorias
      .filter((ec) => ec.eventoId === eventoId)
      .map((ec) => `${ec.categoriaId}-${ec.sexo}`);

    // Renderizar provas
    provasContainerModal.innerHTML = '';
    provas.forEach((prova) => {
      ['Masculino', 'Feminino'].forEach((sexo) => {
        const chave = `${prova.id}-${sexo}`;
        const isChecked = provasSelecionadas.includes(chave);

        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <input
            type="checkbox"
            class="checkbox-prova-modal"
            id="prova-modal-${chave}"
            data-prova-id="${prova.id}"
            data-sexo="${sexo}"
            ${isChecked ? 'checked' : ''}
          />
          <label for="prova-modal-${chave}" style="margin-bottom: 0; cursor: pointer;">${prova.nome} -1 ${sexo}</label>
        `;
        provasContainerModal.appendChild(div);
      });
    });

    // Renderizar categorias
    categoriasContainerModal.innerHTML = '';
    categorias.forEach((categoria) => {
      if (!categoria.ativo) return; // Mostrar apenas categorias ativas

      const grupoCategoria = document.createElement('div');
      grupoCategoria.className = 'grupo-checkbox';

      ['Masculino', 'Feminino'].forEach((sexo) => {
        const chave = `${categoria.id}-${sexo}`;
        const isChecked = categoriasSelecionadas.includes(chave);

        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <input
            type="checkbox"
            class="checkbox-categoria-modal"
            id="categoria-modal-${chave}"
            data-categoria-id="${categoria.id}"
            data-sexo="${sexo}"
            ${isChecked ? 'checked' : ''}
          />
          <label for="categoria-modal-${chave}" style="margin-bottom: 0; cursor: pointer;">${categoria.nome} - ${sexo}</label>
        `;
        grupoCategoria.appendChild(div);
      });

      categoriasContainerModal.appendChild(grupoCategoria);
    });

    // ===== CONFIGURAR LISTENERS PARA SELECIONAR/DESELECIONAR TODOS =====
    const selectAllProvasModal = document.getElementById('select-all-provas-modal');
    const selectAllCategoriasModal = document.getElementById('select-all-categorias-modal');
    const checkboxesProvaModal = document.querySelectorAll('.checkbox-prova-modal');
    const checkboxesCategoriaModal = document.querySelectorAll('.checkbox-categoria-modal');

    // Atualizar estado do checkbox "Selecionar Todos" para Provas
    selectAllProvasModal.checked = checkboxesProvaModal.length > 0 && Array.from(checkboxesProvaModal).every(cb => cb.checked);

    // Atualizar estado do checkbox "Selecionar Todos" para Categorias
    selectAllCategoriasModal.checked = checkboxesCategoriaModal.length > 0 && Array.from(checkboxesCategoriaModal).every(cb => cb.checked);

    // Evento para selecionar/deselecionar todas as provas
    selectAllProvasModal.addEventListener('change', () => {
      document.querySelectorAll('.checkbox-prova-modal').forEach(cb => {
        cb.checked = selectAllProvasModal.checked;
      });
    });

    // Evento para selecionar/deselecionar todas as categorias
    selectAllCategoriasModal.addEventListener('change', () => {
      document.querySelectorAll('.checkbox-categoria-modal').forEach(cb => {
        cb.checked = selectAllCategoriasModal.checked;
      });
    });
  }

  // ===== SALVAR CONFIGURAÇÃO (PROVAS E CATEGORIAS) =====
  btnSalvarConfigModal.addEventListener('click', () => {
    if (!eventoSelecionado) {
      alert('Nenhum evento selecionado!');
      return;
    }

    // Recuperar provas selecionadas
    const provasSelecionadas = [];
    document.querySelectorAll('#provas-container-modal input[type="checkbox"]:checked').forEach((checkbox) => {
      provasSelecionadas.push({
        eventoId: eventoSelecionado.id,
        provaId: checkbox.dataset.provaId,
        sexo: checkbox.dataset.sexo,
      });
    });

    // Recuperar categorias selecionadas
    const categoriasSelecionadas = [];
    document.querySelectorAll('#categorias-container-modal input[type="checkbox"]:checked').forEach((checkbox) => {
      categoriasSelecionadas.push({
        eventoId: eventoSelecionado.id,
        categoriaId: checkbox.dataset.categoriaId,
        sexo: checkbox.dataset.sexo,
      });
    });

    // Salvar no banco de dados
    salvarEventosProvas(eventoSelecionado.id, provasSelecionadas);
    salvarEventosCategorias(eventoSelecionado.id, categoriasSelecionadas);

    // Gerar PROVAEVENTO automaticamente
    gerarProvasEvento(eventoSelecionado.id);

    alert('Configuração de provas e categorias salva com sucesso!');
    fecharModalEventoConfig();
    renderizarListaEventos();
  });

  // ===== EVENTO: ENVIAR FORMULÁRIO =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome-evento').value.trim();
    const local = document.getElementById('local-evento').value.trim();
    const dataEvento = document.getElementById('data-evento').value;
    const qtdeRaias = parseInt(document.getElementById('qtde-raias').value, 10);
    const isFinalizado = document.getElementById('evento-finalizado').checked;

    if (!nome || !local || !dataEvento) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se já existe evento com este nome
    const eventos = getEventos();
    const eventoExistente = eventos.some(
      (evt) => evt.nome.toLowerCase() === nome.toLowerCase() && evt.id !== (eventoSelecionado?.id || '')
    );

    if (eventoExistente) {
      alert('Erro: Um evento com este nome já existe!');
      return;
    }

    const novoEvento = {
      id: eventoSelecionado?.id || `evt-${Date.now()}`,
      nome: nome,
      local: local,
      dataEvento: dataEvento,
      qtdeRaias: qtdeRaias,
      isFinalizado: isFinalizado,
    };

    salvarEvento(novoEvento);

    alert('Evento salvo com sucesso!');
    form.reset();
    document.getElementById('evento-finalizado').checked = false;
    eventoSelecionado = null;
    renderizarListaEventos();
  });

  // ===== EVENTO: REMOVER TODOS =====
  removerTodosEventosBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover TODOS os eventos?')) {
      removerTodosEventos();
      renderizarListaEventos();
    }
  });

  // ===== INICIALIZAÇÃO =====
  renderizarListaEventos();
});
