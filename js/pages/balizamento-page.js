// Módulo de Página - Balizamento
window.BalizamentoPage = {
    init: function() {
        const eventoFilter = document.getElementById('evento-select');
        const btnGerarBalizamento = document.getElementById('btn-gerar-balizamento');
        const btnLimparBalizamento = document.getElementById('btn-limpar-balizamento');
        const btnImprimirBalizamento = document.getElementById('btn-imprimir-balizamento');
        const balizamentoContainer = document.getElementById('balizamento-container');
        const mensagemContainer = document.getElementById('mensagem-container');

        // Debug: Verificar elementos
        

        if (!eventoFilter || !balizamentoContainer) {
                        return;
        }

        if (!btnImprimirBalizamento) {
                    }

        let eventoSelecionado = null;

        // ===== REGISTRAR LISTENERS PRIMEIRO =====
        eventoFilter.addEventListener('change', handleEventoChange);
        btnGerarBalizamento.addEventListener('click', handleGerarBalizamento);
        btnLimparBalizamento.addEventListener('click', handleLimparBalizamento);
        
        if (btnImprimirBalizamento) {
            btnImprimirBalizamento.addEventListener('click', handleImprimirBalizamento);
                    } else {
                    }

        // ===== DEPOIS, CARREGAR EVENTOS =====
        carregarEventos();

        // ===== CARREGAMENTO INICIAL =====
        function carregarEventos() {
            const eventos = getEventos().filter(e => !e.isFinalizado);
            eventoFilter.innerHTML = '<option value="">-- Selecione um evento --</option>';
            

            eventos.forEach(evento => {
                const option = document.createElement('option');
                option.value = evento.id;
                option.textContent = `${evento.nome} (${evento.local})`;
                eventoFilter.appendChild(option);
            });

            // Auto-selecionar se houver apenas 1 evento não finalizado
            if (eventos.length === 1) {
                eventoFilter.value = eventos[0].id;
                                // IMPORTANTE: Disparar evento change para atualizar UI
                eventoFilter.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // ===== HANDLERS DE EVENTOS =====
        function handleEventoChange(e) {
            eventoSelecionado = e.target.value || null;
            const balizamentos = getBalizamentos(eventoSelecionado);
            const temBalizamento = eventoSelecionado && balizamentos.length > 0;
            
                        // IMPORTANTE: Manter botão habilitado mesmo sem balizamento para permitir teste
            // btnImprimirBalizamento.disabled = !temBalizamento;
            if (btnImprimirBalizamento) {
                btnImprimirBalizamento.disabled = false; // SEMPRE HABILITADO
                            }
            
            renderizarBalizamento();
        }

        function handleGerarBalizamento() {
            if (!eventoSelecionado) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            const evento = getEventos().find(e => e.id === eventoSelecionado);
            if (evento && evento.isFinalizado) {
                exibirMensagem('Não é possível gerar balizamento para evento finalizado!', 'erro');
                return;
            }

            const provasEvento = getProvasEvento(eventoSelecionado);
            if (provasEvento.length === 0) {
                exibirMensagem('❌ Este evento não possui provas configuradas. Acesse "Gerenciar Provas do Evento" para adicionar provas.', 'erro');
                return;
            }

            const inscricoes = getInscricoes(eventoSelecionado);
            if (inscricoes.length === 0) {
                exibirMensagem('❌ Nenhuma inscrição encontrada. Acesse "Inscrições" para registrar atletas nas provas.', 'erro');
                return;
            }

            const resultado = gerarBalizamentoAutomatico(eventoSelecionado);
            if (resultado.sucesso) {
                renderizarBalizamento();
                exibirMensagem('✓ ' + resultado.mensagem, 'sucesso');
            } else {
                exibirMensagem(`✗ Erro: ${resultado.mensagem}`, 'erro');
            }
        }

        function handleLimparBalizamento() {
            if (!eventoSelecionado) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            if (confirm('Deseja remover todos os balizamentos deste evento?')) {
                removerBalizamentosPorEvento(eventoSelecionado);
                renderizarBalizamento();
                exibirMensagem('✓ Balizamento removido!', 'sucesso');
            }
        }

        function handleImprimirBalizamento() {

            imprimirBalizamento();
        }

        // ===== RENDERIZAÇÃO =====
        function renderizarBalizamento() {
            balizamentoContainer.innerHTML = '';
            
            if (!eventoSelecionado) {
                balizamentoContainer.innerHTML = '<p style="text-align: center; color: #999;">Selecione um evento para visualizar o balizamento.</p>';
                return;
            }

            const balizamentos = getBalizamentos(eventoSelecionado);
            const provasEvento = getProvasEvento(eventoSelecionado);

            if (balizamentos.length === 0) {
                balizamentoContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #666;">
                        <p>📋 Nenhum balizamento gerado para este evento.</p>
                        <p style="font-size: 0.9em;">Clique em "Gerar Balizamento Automático" para criar o balizamento dos atletas inscritos.</p>
                    </div>
                `;
                return;
            }

            // Agrupar por PROVAEVENTO
            const balPorProva = {};
            balizamentos.forEach(bal => {
                if (!balPorProva[bal.provaEventoId]) {
                    balPorProva[bal.provaEventoId] = [];
                }
                balPorProva[bal.provaEventoId].push(bal);
            });

            // Renderizar provas
            provasEvento
                .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0))
                .forEach(provaEvento => {
                    const detalhes = obterDetalhesProva(provaEvento.id);
                    const balProva = balPorProva[provaEvento.id] || [];

                    // Card da prova
                    const provaCard = document.createElement('div');
                    provaCard.className = 'prova-card';
                    provaCard.innerHTML = `
                        <div class="prova-header">
                            <div>
                                <h3>Prova ${detalhes.numeroProva}. ${detalhes.provaNome}</h3>
                                <p class="prova-subheader">${detalhes.categoriaNome} • ${detalhes.sexo}</p>
                            </div>
                            <div class="prova-stats">
                                <span class="badge" style="cursor: pointer;" onclick="window.BalizamentoPage.abrirModalAtletasProva('${provaEvento.id}')">${balProva.length} atleta(s) ➕</span>
                                <button class="btn btn-pequeno" style="margin-left: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.9rem;" onclick="window.BalizamentoPage.refazerBalizamentoProva('${provaEvento.id}')" title="Refazer balizamento desta prova">🔄 Refazer</button>
                            </div>
                        </div>
                        <div class="prova-series-container"></div>
                    `;

                    const seriesContainer = provaCard.querySelector('.prova-series-container');

                    // Agrupar por série
                    const balPorSerie = {};
                    balProva.forEach(bal => {
                        if (!balPorSerie[bal.serie]) {
                            balPorSerie[bal.serie] = [];
                        }
                        balPorSerie[bal.serie].push(bal);
                    });

                    // Renderizar séries
                    const series = Object.keys(balPorSerie)
                        .map(s => parseInt(s, 10))
                        .sort((a, b) => a - b);

                    series.forEach(numSerie => {
                        const balSerie = balPorSerie[numSerie]
                            .sort((a, b) => a.raia - b.raia);

                        const serieDiv = document.createElement('div');
                        serieDiv.className = 'serie-container';
                        serieDiv.innerHTML = `<div class="serieHeader"><h4 style="margin: 0;">🏊 Série ${numSerie}</h4></div>`;

                        // Criar tabela
                        const tabela = document.createElement('table');
                        tabela.className = 'raias-tabela';
                        tabela.innerHTML = `
                            <thead>
                                <tr>
                                    <th>Raia</th>
                                    <th>Atleta</th>
                                    <th>Clube</th>
                                    <th>Melhor Tempo</th>
                                    <th style="text-align: center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        `;

                        const tbody = tabela.querySelector('tbody');

                        balSerie.forEach(bal => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td><strong>${bal.raia}</strong></td>
                                <td>${obterNomeAtleta(bal.atletaId)}</td>
                                <td>${obterNomeClube(bal.atletaId)}</td>
                                <td>⏱️ ${bal.tempoReferencia || 'S/ registro'}</td>
                                <td style="text-align: center;">
                                    <button class="btn btn-pequeno" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" 
                                        onclick="window.BalizamentoPage.abrirModalEditarRaiaSerie('${bal.id}', '${provaEvento.id}')" 
                                        title="Editar raia/série">✏️ Editar</button>
                                </td>
                            `;
                            tbody.appendChild(tr);
                        });

                        serieDiv.appendChild(tabela);
                        seriesContainer.appendChild(serieDiv);
                    });

                    balizamentoContainer.appendChild(provaCard);
                });
        }

        // ===== HELPERS =====
        function obterNomeAtleta(atletaId) {
            const atletas = getAtletas();
            return atletas.find(a => a.id === atletaId)?.nome || 'Desconhecido';
        }

        function obterNomeClube(atletaId) {
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === atletaId);
            if (!atleta) return '';
            const clubes = getClubes();
            return clubes.find(c => c.id === atleta.clubeId)?.nome || '';
        }

        function obterDetalhesProva(provaEventoId) {
            const provasEvento = getProvasEvento();
            const provaEvento = provasEvento.find(pe => pe.id === provaEventoId);
            
            if (!provaEvento) return null;
            
            const provas = getProvas();
            const categorias = getCategorias();
            
            const prova = provas.find(p => p.id === provaEvento.provaId);
            const categoria = categorias.find(c => c.id === provaEvento.categoriaId);
            
            return {
                provaNome: prova?.nome || 'Desconhecida',
                categoriaNome: categoria?.nome || 'Desconhecida',
                sexo: provaEvento.sexo,
                numeroProva: provaEvento.numeroProva || '',
                provaId: provaEvento.provaId
            };
        }

        function exibirMensagem(texto, tipo = 'info') {
            const classeMensagem = `mensagem mensagem-${tipo}`;
            mensagemContainer.innerHTML = `<div class="${classeMensagem}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        // ===== MODAL DE GERENCIAR ATLETAS NA PROVA =====
        window.BalizamentoPage.abrirModalAtletasProva = function(provaEventoId) {
            const modal = document.getElementById('modal-adicionar-balizamento');
            const modalContent = document.getElementById('modal-balizamento-content');
            
            const provasEvento = getProvasEvento();
            const provaEvento = provasEvento.find(pe => pe.id === provaEventoId);
            if (!provaEvento) return;
            
            const detalhes = obterDetalhesProva(provaEventoId);
            const balizamentos = getBalizamentos(eventoSelecionado);
            const balProva = balizamentos.filter(b => b.provaEventoId === provaEventoId);
            const atletasNoBaliz = new Set(balProva.map(b => b.atletaId));
            
            // Obter TODOS os atletas elegíveis para esta prova (sexo + categoria)
            const todosOsAtletas = getAtletas();
            const atletasElegiveis = todosOsAtletas.filter(atleta => {
                // Verificar sexo
                if (atleta.sexo !== provaEvento.sexo) return false;
                
                // Verificar categoria
                const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
                return categoriaAtleta === provaEvento.categoriaId;
            }).sort((a, b) => a.nome.localeCompare(b.nome));
            
            // Montar conteúdo do modal
            document.getElementById('modal-balizamento-titulo').textContent = 
                `Atletas: Prova ${detalhes.numeroProva} - ${detalhes.provaNome}`;
            
            let html = `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #005f73; margin-bottom: 0.5rem;">📋 ${detalhes.categoriaNome} • ${detalhes.sexo}</h4>
                    <div style="background: #f0f0f0; padding: 0.8rem; border-radius: 4px; margin-bottom: 1rem;">
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">
                            <strong>${balProva.length}</strong> no balizamento | <strong>${atletasElegiveis.length}</strong> elegível(is)
                        </p>
                    </div>
                </div>
            `;
            
            if (atletasElegiveis.length === 0) {
                html += '<p style="color: #999; text-align: center; padding: 1rem;">Nenhum atleta elegível para esta prova.</p>';
            } else {
                html += '<div style="max-height: 400px; overflow-y: auto;"><table class="table" style="font-size: 0.9rem;"><thead><tr><th>Atleta</th><th>Clube</th><th>Ação</th></tr></thead><tbody>';
                
                atletasElegiveis.forEach(atleta => {
                    const clube = getClubes().find(c => c.id === atleta.clubeId);
                    const noBaliz = atletasNoBaliz.has(atleta.id);
                    
                    html += `
                        <tr style="background: ${noBaliz ? '#e8f5e9' : '#fff'};">
                            <td><strong>${atleta.nome}</strong></td>
                            <td>${clube?.nome || 'S/ clube'}</td>
                            <td>
                                ${noBaliz 
                                    ? `<button class="btn btn-pequeno btn-danger" onclick="window.BalizamentoPage.removerDoBaliz('${provaEventoId}', '${atleta.id}')">✕ Remover</button>` 
                                    : `<button class="btn btn-pequeno btn-success" onclick="window.BalizamentoPage.adicionarAoBaliz('${atleta.id}', '${provaEventoId}')">✓ Adicionar</button>`
                                }
                            </td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table></div>';
            }
            
            modalContent.innerHTML = html;
            modal.style.display = 'flex';
        };
        
        window.BalizamentoPage.adicionarAoBaliz = function(atletaId, provaEventoId) {
            const atleta = getAtletas().find(a => a.id === atletaId);
            if (!atleta) return;
            
            // Encontrar série e raia disponíveis
            const evento = getEventos().find(e => e.id === eventoSelecionado);
            const balizamentos = getBalizamentos(eventoSelecionado);
            const balizProva = balizamentos.filter(b => b.provaEventoId === provaEventoId);
            
            let serie = 1;
            let raia = 1;
            let encontrou = false;
            
            // Procurar série e raia livres
            for (let s = 1; s <= 5 && !encontrou; s++) {
                for (let r = 1; r <= (evento?.quantRaias || 8) && !encontrou; r++) {
                    if (!balizProva.some(b => b.serie === s && b.raia === r)) {
                        serie = s;
                        raia = r;
                        encontrou = true;
                    }
                }
            }
            
            // PASSO 1: Verificar se o atleta já tem inscrição nesta prova
            // Se não tiver, criar a inscrição (IMPORTANTE para refazer funcionar)
            const inscricaoExistente = getInscricoes(eventoSelecionado)
                .some(i => i.atletaId === atletaId && i.eventoProvaId === provaEventoId);
            
            if (!inscricaoExistente) {
                const resultInscricao = salvarInscricao(atletaId, provaEventoId);
                if (!resultInscricao.sucesso) {
                    exibirMensagem(`✗ Erro ao registrar inscrição: ${resultInscricao.mensagem}`, 'erro');
                    return;
                }
            }

            // PASSO 2: Criar novo balizamento
            const novoBaliz = {
                id: `bal-${Date.now()}`,
                eventoId: eventoSelecionado,
                provaEventoId: provaEventoId,
                atletaId: atletaId,
                serie: serie,
                raia: raia,
                tempoReferencia: ''
            };
            
            const resultado = salvarBalizamento(novoBaliz);
            if (resultado.sucesso) {
                exibirMensagem(`✓ ${atleta.nome} adicionado ao balizamento (e inscrito na prova)!`, 'sucesso');
                renderizarBalizamento();
                window.BalizamentoPage.abrirModalAtletasProva(provaEventoId);
            } else {
                exibirMensagem(`✗ ${resultado.mensagem}`, 'erro');
            }
        };
        
        window.BalizamentoPage.removerDoBaliz = function(provaEventoId, atletaId) {
            const balizamentos = getBalizamentos().filter(b => b.provaEventoId === provaEventoId && b.atletaId === atletaId);
            if (balizamentos.length === 0) return;
            
            removerBalizamento(balizamentos[0].id);
            exibirMensagem('✓ Atleta removido do balizamento!', 'sucesso');
            renderizarBalizamento();
            window.BalizamentoPage.abrirModalAtletasProva(provaEventoId);
        };

        // ===== EDITAR RAIA E SÉRIE =====
        window.BalizamentoPage.abrirModalEditarRaiaSerie = function(balizamentoId, provaEventoId) {
            const modal = document.getElementById('modal-editar-raia-serie');
            const modalContent = document.getElementById('modal-editar-raia-serie-content');
            
            const balizamentos = getBalizamentos(eventoSelecionado);
            const balizamento = balizamentos.find(b => b.id === balizamentoId);
            
            if (!balizamento) {
                exibirMensagem('Balizamento não encontrado!', 'erro');
                return;
            }

            const atleta = getAtletas().find(a => a.id === balizamento.atletaId);
            const evento = getEventos().find(e => e.id === eventoSelecionado);
            const qtdeRaias = evento?.quantRaias || 8;

            // Obter raias/séries ocupadas nesta prova
            const ocupadas = new Set();
            balizamentos
                .filter(b => b.provaEventoId === provaEventoId && b.id !== balizamentoId)
                .forEach(b => ocupadas.add(`${b.serie}-${b.raia}`));

            // Montar opções de séries e raias disponíveis
            let opcoesHTML = '';
            for (let serie = 1; serie <= 5; serie++) {
                for (let raia = 1; raia <= qtdeRaias; raia++) {
                    const disponivel = !ocupadas.has(`${serie}-${raia}`);
                    const selecionado = serie === balizamento.serie && raia === balizamento.raia;
                    const backgroundColor = selecionado ? '#e3f2fd' : disponivel ? '#fff' : '#f5f5f5';
                    const cursor = disponivel ? 'pointer' : 'not-allowed';
                    const opacity = disponivel ? '1' : '0.5';
                    
                    opcoesHTML += `
                        <button class="btn-raia-serie" 
                            data-serie="${serie}" data-raia="${raia}"
                            style="padding: 0.6rem 0.8rem; margin: 0.3rem; background-color: ${backgroundColor}; 
                                cursor: ${cursor}; opacity: ${opacity}; border: ${selecionado ? '2px solid #0a9396' : '1px solid #ddd'};"
                            ${!disponivel ? 'disabled' : ''}
                            ${selecionado ? 'title="Seleção atual"' : disponivel ? `title="S${serie} - R${raia}"` : 'title="Ocupada"'}>
                            S${serie} R${raia}
                        </button>
                    `;
                }
            }

            modalContent.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #005f73; margin-bottom: 0.5rem;">⚙️ Editar Série e Raia</h4>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
                        <strong>${atleta?.nome || 'Atleta'}</strong>
                    </p>
                    <p style="color: #999; font-size: 0.85rem; margin-bottom: 1rem;">
                        Série/Raia atual: <strong>S${balizamento.serie} R${balizamento.raia}</strong>
                    </p>
                </div>

                <div style="margin-bottom: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 4px;">
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.8rem;">Clique para selecionar a nova posição:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;" id="opcoes-raia-serie">
                        ${opcoesHTML}
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="document.getElementById('modal-editar-raia-serie').style.display='none'">Cancelar</button>
                    <button class="btn btn-primary" id="btn-salvar-raia-serie" onclick="window.BalizamentoPage.salvarRaiaSerie('${balizamentoId}', '${provaEventoId}')">
                        💾 Salvar
                    </button>
                </div>
            `;

            // Adicionar listeners aos botões de seleção
            document.querySelectorAll('.btn-raia-serie').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    if (this.disabled) return;
                    
                    // Remover seleção anterior
                    document.querySelectorAll('.btn-raia-serie').forEach(b => {
                        b.style.borderColor = '#ddd';
                        b.style.backgroundColor = '#fff';
                    });
                    
                    // Marcar como selecionado
                    this.style.borderColor = '#0a9396';
                    this.style.borderWidth = '2px';
                    this.style.backgroundColor = '#e3f2fd';
                    
                    // Guardar seleção em data attribute
                    document.getElementById('opcoes-raia-serie').dataset.selecionada = 
                        this.dataset.serie + '-' + this.dataset.raia;
                });
            });

            modal.style.display = 'flex';
        };

        window.BalizamentoPage.salvarRaiaSerie = function(balizamentoId, provaEventoId) {
            const opcoes = document.getElementById('opcoes-raia-serie');
            const selecionada = opcoes.dataset.selecionada;

            if (!selecionada) {
                exibirMensagem('Selecione uma série e raia!', 'erro');
                return;
            }

            const [novaSerie, novaRaia] = selecionada.split('-').map(Number);

            // Usar a função de atualizar do database que já valida
            const resultado = atualizarBalizamento(balizamentoId, novaSerie, novaRaia);
            
            if (!resultado.sucesso) {
                exibirMensagem(`✗ ${resultado.mensagem}`, 'erro');
                return;
            }

            exibirMensagem(`✓ Série e raia atualizadas para S${novaSerie} R${novaRaia}!`, 'sucesso');
            
            document.getElementById('modal-editar-raia-serie').style.display = 'none';
            renderizarBalizamento();
        };

        // ===== REFAZER BALIZAMENTO DE UMA PROVA =====
        window.BalizamentoPage.refazerBalizamentoProva = function(provaEventoId) {
            if (!eventoSelecionado) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            if (!confirm('Deseja refazer o balizamento desta prova? Os atletas serão redistribuídos automaticamente.')) {
                return;
            }

            // Obter evento e informações
            const evento = getEventos().find(e => e.id === eventoSelecionado);
            const provasEvento = getProvasEvento();
            const provaEvento = provasEvento.find(pe => pe.id === provaEventoId);
            
            if (!evento || !provaEvento) {
                exibirMensagem('Prova não encontrada!', 'erro');
                return;
            }

            // Remover todos os balizamentos desta prova
            const balizamentosAntigos = getBalizamentos(eventoSelecionado)
                .filter(b => b.provaEventoId === provaEventoId);
            balizamentosAntigos.forEach(bal => removerBalizamento(bal.id));

            // Obter atletas inscritos nesta prova e ordená-los por tempo
            const inscricoes = getInscricoes(eventoSelecionado);
            const atletasInscritos = inscricoes
                .filter(i => i.eventoProvaId === provaEventoId)
                .map(i => i.atletaId);

            if (atletasInscritos.length === 0) {
                exibirMensagem('Nenhum atleta inscrito nesta prova!', 'erro');
                return;
            }

            // Separar atletas com e sem melhor tempo
            const melhoresTempos = getMelhoresTempos() || [];
            const atletasComTempo = [];
            const atletasSemTempo = [];

            atletasInscritos.forEach(atletaId => {
                const tempo = melhoresTempos.find(mt => 
                    mt.atletaId === atletaId && mt.provaId === provaEvento.provaId
                );
                
                if (tempo) {
                    atletasComTempo.push({ atletaId, tempo: tempo.tempo });
                } else {
                    atletasSemTempo.push(atletaId);
                }
            });

            // Ordenar atletas com tempo (ascendente = mais rápidos)
            atletasComTempo.sort((a, b) => converterTempoParaSegundos(a.tempo) - converterTempoParaSegundos(b.tempo));

            // Concatenar: LENTOS PRIMEIRO (sem tempo + reverso dos com tempo)
            const atletasOrdenados = [
                ...atletasSemTempo,
                ...atletasComTempo.reverse().map(a => a.atletaId)
            ];

            // Calcular séries e raias
            const qtdeRaias = evento.quantRaias || 8;
            const qtdeAtletas = atletasOrdenados.length;
            const qtdeSeriesTotal = Math.ceil(qtdeAtletas / qtdeRaias);

            // Função auxiliar para converter tempo em segundos
            function converterTempoParaSegundos(tempo) {
                if (!tempo) return 0;
                const partes = tempo.split(':').map(p => parseFloat(p));
                if (partes.length === 3) {
                    return partes[0] * 3600 + partes[1] * 60 + partes[2];
                } else if (partes.length === 2) {
                    return partes[0] * 60 + partes[1];
                }
                return partes[0];
            }

            // Função para calcular raias ideais (centro alternando para fora)
            function calcularRaiasParaSerie(qtdeAtletasNaSerie) {
                const raiasOrdenadas = [];
                const centroEsq = Math.ceil(qtdeRaias / 2);
                const centroDir = centroEsq + 1;

                raiasOrdenadas.push(centroEsq);
                if (centroDir <= qtdeRaias) {
                    raiasOrdenadas.push(centroDir);
                }

                let esq = centroEsq - 1;
                let dir = centroDir + 1;
                while (esq >= 1 || dir <= qtdeRaias) {
                    if (esq >= 1) raiasOrdenadas.push(esq--);
                    if (dir <= qtdeRaias) raiasOrdenadas.push(dir++);
                }

                return raiasOrdenadas.slice(0, qtdeAtletasNaSerie);
            }

            // Distribuir atletas em séries (Série 1 com mínimo 2, demais crescentes)
            let atletaIndex = 0;
            
            for (let numSerie = 1; numSerie <= qtdeSeriesTotal; numSerie++) {
                let qtdeNestaSerie;

                if (qtdeSeriesTotal === 1) {
                    qtdeNestaSerie = qtdeAtletas;
                } else if (numSerie === 1) {
                    qtdeNestaSerie = Math.min(2, qtdeAtletas);
                } else {
                    // Distribuição crescente para séries intermediárias
                    const atletasRestantes = qtdeAtletas - atletaIndex;
                    const seriesRestantes = qtdeSeriesTotal - numSerie + 1;
                    qtdeNestaSerie = Math.min(
                        Math.ceil(atletasRestantes / seriesRestantes),
                        qtdeRaias
                    );
                }

                const raias = calcularRaiasParaSerie(qtdeNestaSerie);

                for (let i = 0; i < qtdeNestaSerie && atletaIndex < atletasOrdenados.length; i++) {
                    const atletaId = atletasOrdenados[atletaIndex];
                    const raia = raias[i];

                    const novoBaliz = {
                        eventoId: eventoSelecionado,
                        provaEventoId: provaEventoId,
                        atletaId: atletaId,
                        serie: numSerie,
                        raia: raia,
                        tempoReferencia: ''
                    };

                    salvarBalizamento(novoBaliz);
                    atletaIndex++;
                }
            }

            exibirMensagem('✓ Balizamento refito com sucesso!', 'sucesso');
            renderizarBalizamento();
        };


        // ===== IMPRESSÃO =====" 
        function imprimirBalizamento() {
                        if (!eventoSelecionado) {
                exibirMensagem('Selecione um evento primeiro!', 'erro');
                return;
            }

            if (typeof ExcelJS === 'undefined') {
                exibirMensagem('✗ Erro: Biblioteca ExcelJS não carregada!', 'erro');
                return;
            }

            const balizamentos = getBalizamentos(eventoSelecionado);
            if (balizamentos.length === 0) {
                exibirMensagem('Nenhum balizamento para gerar!', 'erro');
                return;
            }

            try {
                const evento = getEventos().find(e => e.id === eventoSelecionado);
                const provasEvento = getProvasEvento(eventoSelecionado);
                
                const workbook = new ExcelJS.Workbook();

                provasEvento
                    .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0))
                    .forEach(provaEvento => {
                        const balProva = balizamentos.filter(b => b.provaEventoId === provaEvento.id);
                        if (balProva.length === 0) return;

                        const detalhes = obterDetalhesProva(provaEvento.id);
                        const nomeAba = `P${detalhes.numeroProva}`;
                        
                        const worksheet = workbook.addWorksheet(nomeAba);
                        worksheet.columns = [
                            { width: 8 },
                            { width: 35 },
                            { width: 28 },
                            { width: 16 }
                        ];

                        // Título
                        const titleRow = worksheet.addRow([`PROVA ${detalhes.numeroProva}: ${detalhes.provaNome}`]);
                        titleRow.font = { bold: true, size: 13 };
                        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe8f4f8' } };

                        // Subtítulo
                        const subtitleRow = worksheet.addRow([`${detalhes.categoriaNome} | ${detalhes.sexo}`]);
                        subtitleRow.font = { italic: true, size: 10 };

                        // Linha vazia
                        worksheet.addRow([]);

                        // Agrupar por série
                        const balPorSerie = {};
                        balProva.forEach(bal => {
                            if (!balPorSerie[bal.serie]) {
                                balPorSerie[bal.serie] = [];
                            }
                            balPorSerie[bal.serie].push(bal);
                        });

                        // Renderizar séries
                        Object.keys(balPorSerie)
                            .map(s => parseInt(s, 10))
                            .sort((a, b) => a - b)
                            .forEach(numSerie => {
                                // Header série
                                const serieHeaderRow = worksheet.addRow([`SÉRIE ${numSerie}`]);
                                serieHeaderRow.font = { bold: true, size: 11 };
                                serieHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0a9396' } };

                                // Headers coluna
                                const headerRow = worksheet.addRow(['Raia', 'Atleta', 'Clube', 'Melhor Tempo']);
                                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                                headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005f73' } };

                                // Dados
                                const balSerie = balPorSerie[numSerie].sort((a, b) => a.raia - b.raia);
                                balSerie.forEach((bal, idx) => {
                                    const dataRow = worksheet.addRow([
                                        bal.raia,
                                        obterNomeAtleta(bal.atletaId),
                                        obterNomeClube(bal.atletaId),
                                        bal.tempoReferencia || 'S/ registro'
                                    ]);
                                    
                                    if (idx % 2 === 1) {
                                        dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                                    }
                                });

                                worksheet.addRow([]);
                            });
                    });

                // Download
                const nomeEvento = String(evento?.nome || 'Balizamento').replace(/[\\/?*\[\]]/g, '');
                
                workbook.xlsx.writeBuffer().then(buffer => {
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
                    const nomeArquivo = `Balizamento_${nomeEvento}_${dataAtual}.xlsx`;
                    a.download = nomeArquivo;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                                        exibirMensagem('✓ Balizamento exportado com sucesso!', 'sucesso');
                }).catch(erro => {
                                        exibirMensagem(`✗ Erro ao gerar Excel: ${erro.message}`, 'erro');
                });
            } catch (erro) {
                                exibirMensagem(`✗ Erro: ${erro.message}`, 'erro');
            }
        }

        // ===== FUNÇÃO AUXILIAR =====
        function getCategoriaAtleta(anoNascimento) {
            const categorias = getCategorias().filter(c => c.ativo);
            const anoAtual = new Date().getFullYear();
            const idade = anoAtual - anoNascimento;
            
            return categorias.find(cat => {
                const idadeMin = anoAtual - cat.anoFinal;
                const idadeMax = anoAtual - cat.anoInicial;
                return idade >= idadeMin && idade <= idadeMax;
            });
        }

        // ===== SANITIZAR PARA XML =====
        function sanitizarParaXml(texto) {
            if (!texto) return '';
            return String(texto)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;')
                .trim();
        }
    }
};


