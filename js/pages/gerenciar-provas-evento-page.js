// Módulo de Página - Gerenciar Provas do Evento
window.GerenciarProvasEventoPage = {
    init: function() {
        const eventoFilter = document.getElementById('evento-filter');
        const btnAdicionarProva = document.getElementById('btn-adicionar-prova');
        const listaProvasEventoContainer = document.getElementById('lista-provas-evento-container');
        const mensagemContainer = document.getElementById('mensagem-container');
        const modalAdicionarProvaEvento = document.getElementById('modal-adicionar-prova-evento');
        const formAdicionarProvaEvento = document.getElementById('form-adicionar-prova-evento');
        
                if (!eventoFilter || !listaProvasEventoContainer) {
                        return;
        }

        carregarEventos();
        eventoFilter.addEventListener('change', renderizarProvasEvento);
        btnAdicionarProva.addEventListener('click', abrirModalAdicionarProva);
        if (formAdicionarProvaEvento) {
            formAdicionarProvaEvento.addEventListener('submit', handleAdicionarProva);
        }

        function carregarEventos() {
            const eventos = getEventos().filter(e => !e.isFinalizado);
            eventoFilter.innerHTML = '<option value="">-- Selecione um evento --</option>';
            
            eventos.forEach(evento => {
                const option = document.createElement('option');
                option.value = evento.id;
                option.textContent = `${evento.nome} (${evento.local})`;
                eventoFilter.appendChild(option);
            });

            if (eventos.length === 1) {
                eventoFilter.value = eventos[0].id;
                renderizarProvasEvento();
            }
        }

        function abrirModalAdicionarProva() {
            const eventoId = eventoFilter.value;
            if (!eventoId) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            // Limpar e popular os selects
            const provaSelect = document.getElementById('prova-select-evento');
            const categoriaSelect = document.getElementById('categoria-select-evento');
            
            provaSelect.innerHTML = '<option value="">-- Selecione uma prova --</option>';
            categoriaSelect.innerHTML = '<option value="">-- Selecione uma categoria --</option>';

            const todasAsProvas = getProvas();

            // Popular select de provas
            todasAsProvas
                .sort((a,b) => a.nome.localeCompare(b.nome))
                .forEach(prova => {
                    const option = document.createElement('option');
                    option.value = prova.id;
                    option.textContent = prova.nome;
                    provaSelect.appendChild(option);
                });

            // Popular select de categorias
            const categorias = getCategorias().filter(c => c.ativo !== false);
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });

            // Limpar radios de sexo
            document.querySelectorAll('input[name="sexo-evento"]').forEach(radio => {
                radio.checked = false;
            });

            // Exibir modal
            if (modalAdicionarProvaEvento) {
                modalAdicionarProvaEvento.style.display = 'flex';
            }
        }

        function handleAdicionarProva(e) {
            e.preventDefault();

            const eventoId = eventoFilter.value;
            const provaId = document.getElementById('prova-select-evento').value;
            const categoriaId = document.getElementById('categoria-select-evento').value;
            const sexo = document.querySelector('input[name="sexo-evento"]:checked')?.value;

            if (!eventoId || !provaId || !categoriaId || !sexo) {
                exibirMensagem('Preencha todos os campos!', 'erro');
                return;
            }

            const resultado = adicionarProvaEvento(eventoId, provaId, categoriaId, sexo);
            if (resultado.sucesso) {
                exibirMensagem('✓ Prova adicionada ao evento com sucesso!', 'sucesso');
                fecharModalAdicionarProvaEvento();
                renderizarProvasEvento();
            } else {
                exibirMensagem(`✗ Erro: ${resultado.mensagem}`, 'erro');
            }
        }

        function renderizarProvasEvento() {
            const eventoId = eventoFilter.value;
            listaProvasEventoContainer.innerHTML = '';

            if (!eventoId) {
                listaProvasEventoContainer.innerHTML = '<p class="text-light">Selecione um evento para visualizar suas provas.</p>';
                return;
            }

            const provasEvento = getProvasEventoDetalhadas(eventoId);

            if (provasEvento.length === 0) {
                listaProvasEventoContainer.innerHTML = '<p class="text-light">Nenhuma prova adicionada a este evento.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.id = 'tabela-provas-evento';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th style="width: 50px; text-align: center;">Mover</th>
                        <th>Nº</th>
                        <th>Prova</th>
                        <th>Categoria</th>
                        <th>Sexo</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            provasEvento.forEach((pe, index) => {
                const tr = document.createElement('tr');
                tr.className = 'draggable-row';
                tr.draggable = true;
                tr.dataset.id = pe.id;
                tr.dataset.index = index;
                
                const isFirst = index === 0;
                const isLast = index === provasEvento.length - 1;
                
                tr.innerHTML = `
                    <td style="text-align: center; cursor: grab; padding: 0.5rem;"><span class="drag-handle">≡</span></td>
                    <td>${pe.numeroProva || '-'}</td>
                    <td>${pe.provaNome || 'Desconhecida'}</td>
                    <td>${pe.categoriaNome || 'Desconhecida'}</td>
                    <td>${pe.sexo}</td>
                    <td>
                        <button class="btn btn-pequeno" onclick="window.GerenciarProvasEventoPage.subirProva('${pe.id}')" ${isFirst ? 'disabled' : ''} title="Mover para cima">↑</button>
                        <button class="btn btn-pequeno" onclick="window.GerenciarProvasEventoPage.descerProva('${pe.id}')" ${isLast ? 'disabled' : ''} title="Mover para baixo">↓</button>
                        <button class="btn btn-pequeno btn-danger" onclick="window.GerenciarProvasEventoPage.removerProva('${pe.id}')" title="Remover">🗑️</button>
                    </td>
                `;
                tbody.appendChild(tr);

                // Event listeners para drag & drop
                tr.addEventListener('dragstart', handleDragStart);
                tr.addEventListener('dragover', handleDragOver);
                tr.addEventListener('drop', handleDrop);
                tr.addEventListener('dragleave', handleDragLeave);
                tr.addEventListener('dragend', handleDragEnd);
            });

            listaProvasEventoContainer.appendChild(tabela);

            // Variáveis para drag & drop
            let draggedElement = null;

            function handleDragStart(e) {
                draggedElement = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
            }

            function handleDragOver(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                
                if (this !== draggedElement) {
                    this.classList.add('drag-over');
                }
                return false;
            }

            function handleDragLeave(e) {
                this.classList.remove('drag-over');
            }

            function handleDrop(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }

                if (draggedElement !== this) {
                    const draggedIndex = parseInt(draggedElement.dataset.index);
                    const targetIndex = parseInt(this.dataset.index);

                    // Trocar ordem
                    const provas = getProvasEventoDetalhadas(eventoId);
                    const ids = provas.map(p => p.id);

                    const temp = ids[draggedIndex];
                    ids[draggedIndex] = ids[targetIndex];
                    ids[targetIndex] = temp;

                    atualizarOrdemProvasEvento(eventoId, ids);
                    renderizarProvasEvento();
                }

                return false;
            }

            function handleDragEnd(e) {
                this.classList.remove('dragging');
                
                // Remover classe drag-over de todas as linhas
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => row.classList.remove('drag-over'));
            }
        }

        function exibirMensagem(texto, tipo = 'info') {
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        // Funções públicas para reordenação e remoção
        window.GerenciarProvasEventoPage.subirProva = function(id) {
            const eventoId = eventoFilter.value;
            if (!eventoId) return;

            const provasEvento = getProvasEventoDetalhadas(eventoId);
            const ids = provasEvento.map(pe => pe.id);
            const idx = ids.indexOf(id);

            if (idx > 0) {
                const temp = ids[idx];
                ids[idx] = ids[idx - 1];
                ids[idx - 1] = temp;

                atualizarOrdemProvasEvento(eventoId, ids);
                renderizarProvasEvento();
            }
        };

        window.GerenciarProvasEventoPage.descerProva = function(id) {
            const eventoId = eventoFilter.value;
            if (!eventoId) return;

            const provasEvento = getProvasEventoDetalhadas(eventoId);
            const ids = provasEvento.map(pe => pe.id);
            const idx = ids.indexOf(id);

            if (idx >= 0 && idx < ids.length - 1) {
                const temp = ids[idx];
                ids[idx] = ids[idx + 1];
                ids[idx + 1] = temp;

                atualizarOrdemProvasEvento(eventoId, ids);
                renderizarProvasEvento();
            }
        };

        window.GerenciarProvasEventoPage.removerProva = function(id) {
            if (confirm('Remover esta prova do evento?')) {
                removerProvaEvento(id);
                exibirMensagem('✓ Prova removida do evento!', 'sucesso');
                renderizarProvasEvento();
            }
        };

        // Funções globais para modal
        window.fecharModalAdicionarProvaEvento = function() {
            if (modalAdicionarProvaEvento) {
                modalAdicionarProvaEvento.style.display = 'none';
            }
        };

        window.abrirModalAdicionarProva = abrirModalAdicionarProva;
    }
};


