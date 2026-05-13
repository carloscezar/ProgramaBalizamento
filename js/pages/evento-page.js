// Módulo de Página - Cadastro de Eventos
window.EventoPage = {
    init: function() {
        const form = document.getElementById('form-evento');
        const listaEventosContainer = document.getElementById('lista-eventos-container');
        const mensagemContainer = document.getElementById('mensagem-container');
        const modalEventoConfig = document.getElementById('modal-evento-config');
        const provasContainerModal = document.getElementById('provas-container-modal');
        const categoriasContainerModal = document.getElementById('categorias-container-modal');
        const btnSalvarConfigModal = document.getElementById('btn-salvar-config-modal');

        let eventoEmEdicao = null; // Armazena ID do evento em edição

        if (!form || !listaEventosContainer) {
            return;
        }

        // ===== FUNÇÕES DE MODAL =====
        function abrirModalConfiguracao(eventoId) {
            const eventos = getEventos();
            const evento = eventos.find(e => e.id === eventoId);

            if (!evento) {
                exibirMensagem('Evento não encontrado!', 'erro');
                return;
            }

            eventoEmEdicao = eventoId;
            renderizarProvasECategoriasModal(eventoId);
            if (modalEventoConfig) {
                modalEventoConfig.style.display = 'flex';
            }
        }

        function fecharModalConfiguracao() {
            if (modalEventoConfig) {
                modalEventoConfig.style.display = 'none';
            }
            eventoEmEdicao = null;
        }

        // Fechar modal ao clicar no overlay (fora do conteúdo)
        if (modalEventoConfig) {
            modalEventoConfig.addEventListener('click', (e) => {
                if (e.target === modalEventoConfig) {
                    fecharModalConfiguracao();
                }
            });
        }

        renderizarListaEventos();
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', () => { 
            eventoEmEdicao = null;
        });
        
        if (btnSalvarConfigModal) {
            btnSalvarConfigModal.addEventListener('click', handleSalvarConfig);
        }

        function handleSubmit(e) {
            e.preventDefault();

            const nome = document.getElementById('nome-evento').value.trim();
            const local = document.getElementById('local-evento').value.trim();
            const data = document.getElementById('data-evento').value;
            const qtdeRaias = parseInt(document.getElementById('qtde-raias').value, 10);
            const ativo = document.getElementById('evento-finalizado').checked;

            if (!nome || !local || !data || qtdeRaias < 1) {
                exibirMensagem('Preencha todos os campos corretamente!', 'erro');
                return;
            }

            if (eventoEmEdicao) {
                // Modo edição
                const eventos = getEventos();
                const eventoAnterior = eventos.find(e => e.id === eventoEmEdicao);
                const eventoAtualizado = {
                    id: eventoEmEdicao,
                    nome,
                    local,
                    dataEvento: data,
                    qtdeRaias,
                    isFinalizado: ativo
                };
                atualizarEvento(eventoEmEdicao, eventoAtualizado);
                exibirMensagem('✓ Evento atualizado com sucesso!', 'sucesso');
                eventoEmEdicao = null;
            } else {
                // Modo criar
                const novoEvento = {
                    id: `evt-${Date.now()}`,
                    nome,
                    local,
                    dataEvento: data,
                    qtdeRaias,
                    isFinalizado: ativo
                };
                salvarEvento(novoEvento);
                exibirMensagem('✓ Evento salvo com sucesso!', 'sucesso');
            }

            form.reset();
            renderizarListaEventos();
        }

        function renderizarListaEventos() {
            const eventos = getEventos();
            listaEventosContainer.innerHTML = '';

            if (eventos.length === 0) {
                listaEventosContainer.innerHTML = '<p class="text-light">Nenhum evento cadastrado.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.innerHTML = `
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
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            eventos.forEach(evento => {
                const status = evento.isFinalizado ? 
                    '<span class="badge finalizada">Finalizado</span>' : 
                    '<span class="badge pendente">Ativo</span>';
                const dataFormatada = new Date(evento.dataEvento).toLocaleDateString('pt-BR');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${evento.nome}</td>
                    <td>${evento.local}</td>
                    <td>${dataFormatada}</td>
                    <td>${evento.qtdeRaias}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-pequeno btn-primary" onclick="window.EventoPage.editarEvento('${evento.id}')">Editar</button>
                        <button class="btn btn-pequeno btn-info" onclick="window.EventoPage.configurarProvas('${evento.id}')">Configurar</button>
                        <button class="btn btn-pequeno btn-danger" onclick="window.EventoPage.removeEvento('${evento.id}')">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            listaEventosContainer.appendChild(tabela);
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
            if (provasContainerModal) {
                provasContainerModal.innerHTML = '';
                provas.forEach((prova) => {
                    ['Masculino', 'Feminino'].forEach((sexo) => {
                        const chave = `${prova.id}-${sexo}`;
                        const isChecked = provasSelecionadas.includes(chave);

                        const div = document.createElement('div');
                        div.style.marginBottom = '0.2rem';
                        div.innerHTML = `
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.2rem; border-radius: 4px; ${isChecked ? 'background-color: #e8f5e9' : 'background-color: #fff'}">
                                <input
                                    type="checkbox"
                                    class="checkbox-prova-modal"
                                    id="prova-modal-${chave}"
                                    data-prova-id="${prova.id}"
                                    data-sexo="${sexo}"
                                    ${isChecked ? 'checked' : ''}
                                />
                                <span style="font-size: 0.8rem">${prova.nome} - ${sexo}</span>
                            </label>
                        `;
                        provasContainerModal.appendChild(div);
                    });
                });
            }

            // Renderizar categorias
            if (categoriasContainerModal) {
                categoriasContainerModal.innerHTML = '';
                categorias.forEach((categoria) => {
                    if (!categoria.ativo) return; // Mostrar apenas categorias ativas

                    ['Masculino', 'Feminino'].forEach((sexo) => {
                        const chave = `${categoria.id}-${sexo}`;
                        const isChecked = categoriasSelecionadas.includes(chave);

                        const div = document.createElement('div');
                        div.style.marginBottom = '0.2rem';
                        div.innerHTML = `
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.2rem; border-radius: 4px; ${isChecked ? 'background-color: #e3f2fd' : 'background-color: #fff'}">
                                <input
                                    type="checkbox"
                                    class="checkbox-categoria-modal"
                                    id="categoria-modal-${chave}"
                                    data-categoria-id="${categoria.id}"
                                    data-sexo="${sexo}"
                                    ${isChecked ? 'checked' : ''}
                                />
                                <span style="font-size: 0.8rem">${categoria.nome} - ${sexo}</span>
                            </label>
                        `;
                        categoriasContainerModal.appendChild(div);
                    });
                });
            }

            // ===== CONFIGURAR LISTENERS PARA SELECIONAR/DESELECIONAR TODOS =====
            const selectAllProvasModal = document.getElementById('select-all-provas-modal');
            const selectAllCategoriasModal = document.getElementById('select-all-categorias-modal');
            const checkboxesProvaModal = document.querySelectorAll('.checkbox-prova-modal');
            const checkboxesCategoriaModal = document.querySelectorAll('.checkbox-categoria-modal');

            // Atualizar estado do checkbox "Selecionar Todos" para Provas
            if (selectAllProvasModal) {
                selectAllProvasModal.checked = checkboxesProvaModal.length > 0 && Array.from(checkboxesProvaModal).every(cb => cb.checked);

                // Evento para selecionar/deselecionar todas as provas
                selectAllProvasModal.addEventListener('change', () => {
                    document.querySelectorAll('.checkbox-prova-modal').forEach(cb => {
                        cb.checked = selectAllProvasModal.checked;
                    });
                });
            }

            // Atualizar estado do checkbox "Selecionar Todos" para Categorias
            if (selectAllCategoriasModal) {
                selectAllCategoriasModal.checked = checkboxesCategoriaModal.length > 0 && Array.from(checkboxesCategoriaModal).every(cb => cb.checked);

                // Evento para selecionar/deselecionar todas as categorias
                selectAllCategoriasModal.addEventListener('change', () => {
                    document.querySelectorAll('.checkbox-categoria-modal').forEach(cb => {
                        cb.checked = selectAllCategoriasModal.checked;
                    });
                });
            }
        }

        function handleSalvarConfig() {
            const eventoId = eventoEmEdicao;
            if (!eventoId) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            // Recuperar provas selecionadas
            const provasSelecionadas = [];
            document.querySelectorAll('#provas-container-modal input[type="checkbox"]:checked').forEach((checkbox) => {
                provasSelecionadas.push({
                    eventoId: eventoId,
                    provaId: checkbox.dataset.provaId,
                    sexo: checkbox.dataset.sexo,
                });
            });

            // Recuperar categorias selecionadas
            const categoriasSelecionadas = [];
            document.querySelectorAll('#categorias-container-modal input[type="checkbox"]:checked').forEach((checkbox) => {
                categoriasSelecionadas.push({
                    eventoId: eventoId,
                    categoriaId: checkbox.dataset.categoriaId,
                    sexo: checkbox.dataset.sexo,
                });
            });

            if (provasSelecionadas.length === 0 || categoriasSelecionadas.length === 0) {
                exibirMensagem('Selecione pelo menos uma prova e uma categoria!', 'erro');
                return;
            }

            // Salvar no banco de dados
            salvarEventosProvas(eventoId, provasSelecionadas);
            salvarEventosCategorias(eventoId, categoriasSelecionadas);

            // Gerar PROVAEVENTO automaticamente
            gerarProvasEvento(eventoId);

            exibirMensagem('✓ Configuração de provas e categorias salva com sucesso!', 'sucesso');
            fecharModalConfiguracao();
            renderizarListaEventos();
        }

        function exibirMensagem(texto, tipo = 'info') {
            if (!mensagemContainer) return;
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        window.EventoPage.configurarProvas = function(eventoId) {
            abrirModalConfiguracao(eventoId);
        };

        window.EventoPage.editarEvento = function(eventoId) {
            const eventos = getEventos();
            const evento = eventos.find(e => e.id === eventoId);
            if (evento) {
                document.getElementById('nome-evento').value = evento.nome;
                document.getElementById('local-evento').value = evento.local;
                document.getElementById('data-evento').value = evento.dataEvento;
                document.getElementById('qtde-raias').value = evento.qtdeRaias;
                document.getElementById('evento-finalizado').checked = evento.isFinalizado;
                eventoEmEdicao = eventoId;
                document.getElementById('nome-evento').focus();
            }
        };

        window.EventoPage.removeEvento = function(id) {
            if (confirm('Remover este evento?\n⚠️ Todos os dados associados serão removidos.')) {
                removerEvento(id);
                exibirMensagem('✓ Evento removido!', 'sucesso');
                eventoEmEdicao = null;
                renderizarListaEventos();
            }
        };

        // Função global para fechar modal
        window.fecharModalEventoConfig = function() {
            fecharModalConfiguracao();
        };
    }
};


