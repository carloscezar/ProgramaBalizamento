// ===== MÓDULO DE PÁGINA - INSCRIÇÕES =====
// Padrão de código consistente com as demais telas

window.InscricaoPage = {
    init: function() {
        
        const eventoFilter = document.getElementById('evento-filter');
        const filtroClube = document.getElementById('filtro-clube');
        const filtroAtleta = document.getElementById('filtro-atleta');
        const infoEvento = document.getElementById('info-evento');

        if (!eventoFilter) {
            return;
        }

        let eventoSelecionadoId = null;

        // ===== FUNÇÕES LOCAIS COM CLOSURE =====

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
                eventoSelecionadoId = eventos[0].id;  // ✅ Setar ANTES de chamar renderizarDados
                renderizarDados();
            }
        }

        function onEventoChange() {
            eventoSelecionadoId = eventoFilter.value;

            if (!eventoSelecionadoId) {
                listaInscricoesContainer.innerHTML = '';
                if (infoEvento) infoEvento.innerHTML = '';
                return;
            }

            renderizarDados();
        }

        function renderizarDados() {
            if (!eventoSelecionadoId) return;
            mostrarInfoEvento();
            carregarFiltroClubes();
            carregarFiltroAtletas();
            renderizarResumoInscricoes();
        }

        function mostrarInfoEvento() {
            if (!infoEvento) return;
            
            const eventos = getEventos();
            const evento = eventos.find(e => e.id === eventoSelecionadoId);
            if (!evento) return;

            const provasEvento = getProvasEvento(eventoSelecionadoId);
            const dataFormatada = evento.dataEvento 
                ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') 
                : 'Data não informada';

            infoEvento.innerHTML = `
                <strong>${evento.nome}</strong> &nbsp;|&nbsp;
                ${evento.local} &nbsp;|&nbsp;
                ${dataFormatada} &nbsp;|&nbsp;
                <strong>${provasEvento.length}</strong> prova(s) cadastrada(s)
                ${evento.isFinalizado ? '<span class="badge-finalizado" style="margin-left: 10px;">FINALIZADO</span>' : ''}
            `;
        }

        function carregarFiltroClubes() {
            if (!filtroClube) return;
            
            const clubes = getClubes();
            const valorAtual = filtroClube.value;
            filtroClube.innerHTML = '<option value="">Todos os clubes</option>';

            clubes
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .forEach(clube => {
                    const opt = document.createElement('option');
                    opt.value = clube.id;
                    opt.textContent = clube.nome;
                    filtroClube.appendChild(opt);
                });

            if (valorAtual && clubes.some(clube => clube.id === valorAtual)) {
                filtroClube.value = valorAtual;
            }
        }

        function carregarFiltroAtletas() {
            if (!filtroAtleta) return;
            
            const valorAtual = filtroAtleta.value;
            const filtroClubeSel = filtroClube ? filtroClube.value : '';
            filtroAtleta.innerHTML = '<option value="">Todos os atletas</option>';

            if (!eventoSelecionadoId) {
                return;
            }

            const atletas = getAtletas();
            const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);
            const atletasElegiveis = atletas
                .filter(atleta => !filtroClubeSel || atleta.clubeId === filtroClubeSel)
                .filter(atleta => {
                    if (provasEvento.length === 0) return true;
                    const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
                    return provasEvento.some(pe => pe.sexo === atleta.sexo && pe.categoriaId === categoriaAtleta);
                })
                .sort((a, b) => a.nome.localeCompare(b.nome));

            atletasElegiveis.forEach(atleta => {
                const option = document.createElement('option');
                option.value = atleta.id;
                option.textContent = atleta.nome;
                filtroAtleta.appendChild(option);
            });

            if (valorAtual && atletasElegiveis.some(atleta => atleta.id === valorAtual)) {
                filtroAtleta.value = valorAtual;
            }
        }

        function renderizarResumoInscricoes() {
            const resumoContainer = document.getElementById('resumo-inscricoes-content');
            if (!resumoContainer) return;

            resumoContainer.innerHTML = '';

            if (!eventoSelecionadoId) {
                resumoContainer.innerHTML = '<p style="color: #666;">Selecione um evento para visualizar as inscrições.</p>';
                return;
            }

            const atletas = getAtletas();
            const clubes = getClubes();
            const clubesMap = {};
            clubes.forEach(c => { clubesMap[c.id] = c; });

            // Coleta todas as inscrições (atleta + provas)
            const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);
            const linhas = [];
            atletas.forEach(atleta => {
                // Verificar se o atleta tem categoria elegível neste evento
                const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
                const provasAtleta = provasEvento.filter(pe =>
                    pe.sexo === atleta.sexo && pe.categoriaId === categoriaAtleta
                );
                
                // Pular atletas sem provas elegíveis neste evento
                if (provasAtleta.length === 0) return;

                const inscricoesAtleta = getInscricoesPorAtletaEvento(atleta.id, eventoSelecionadoId);

                // Pega as provas inscritas
                const idsInscritos = new Set(inscricoesAtleta.map(i => i.eventoProvaId));
                const provasInscritas = provasEvento.filter(p => idsInscritos.has(p.id));

                // Concatena provas em uma string descritiva com categoria
                const descricaoProvas = provasInscritas
                    .sort((a,b) => a.numeroProva - b.numeroProva)
                    .map(p => `#${p.numeroProva} - ${p.provaNome}`)
                    .join(' <br> ');

                linhas.push({
                    clube: clubesMap[atleta.clubeId]?.nome || 'Desconhecido',
                    clubeId: atleta.clubeId,
                    atleta: atleta.nome,
                    atletaId: atleta.id,
                    sexoAno: `${atleta.sexo} • Nasc. ${atleta.anoNascimento}`,
                    provas: descricaoProvas,
                    qtdProvas: inscricoesAtleta.length,
                    provasDetalhadas: provasInscritas
                });
            });

            if (linhas.length === 0) {
                resumoContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">📭 Nenhuma inscrição realizada ainda.</p>';
                return;
            }

            // Aplicar filtros
            const filtroClubeSel = filtroClube ? filtroClube.value : '';
            const filtroAtletaSel = filtroAtleta ? filtroAtleta.value : '';

            const linhasFiltradas = linhas.filter(linha => {
                const passClube = !filtroClubeSel || linha.clubeId === filtroClubeSel;
                const passAtleta = !filtroAtletaSel || linha.atletaId === filtroAtletaSel;
                return passClube && passAtleta;
            });

            if (linhasFiltradas.length === 0) {
                resumoContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">📭 Nenhum resultado encontrado com os filtros selecionados.</p>';
                return;
            }

            // Ordena por clube e depois por atleta
            linhasFiltradas.sort((a, b) => {
                const cmpClube = a.clube.localeCompare(b.clube);
                if (cmpClube !== 0) return cmpClube;
                return a.atleta.localeCompare(b.atleta);
            });

            // Cria tabela HTML padrão do sistema
            const tabela = document.createElement('table');
            tabela.className = 'table';

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['🏢 Clube', '👤 Atleta', '🏊 Provas Inscritas', 'Ações'];
            headers.forEach((headerText) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                if (headerText === "Ações") {
                    th.style.minWidth = '8rem';
                }
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            tabela.appendChild(thead);

            // Body
            const tbody = document.createElement('tbody');
            linhasFiltradas.forEach(linha => {
                const row = document.createElement('tr');

                // Célula Clube
                const tdClube = document.createElement('td');
                tdClube.textContent = linha.clube;
                tdClube.style.fontWeight = '500';
                tdClube.style.color = '#005f73';
                row.appendChild(tdClube);

                // Célula Atleta
                const tdAtleta = document.createElement('td');
                tdAtleta.innerHTML = `
                    <div style="font-weight: 600; color: #005f73;">${linha.atleta}</div>
                    <div style="font-size: 0.9rem; color: #666;">${linha.sexoAno}</div>
                `;
                row.appendChild(tdAtleta);

                // Célula Provas - com detalhes
                const tdProvas = document.createElement('td');
                tdProvas.innerHTML = `
                    <div style="color: #005f73; font-size: 0.9rem; line-height: 1.4;">
                        ${linha.provas}
                    </div>
                    <div style="color: #999; font-size: 0.85rem; margin-top: 0.3rem;">
                        ✓ ${linha.qtdProvas} prova(s)
                    </div>
                `;
                row.appendChild(tdProvas);

                // Célula Ações
                const tdAcoes = document.createElement('td');
                tdAcoes.style.minWidth = '140px';
                const btnInscrever = document.createElement('button');
                btnInscrever.className = 'btn btn-pequeno btn-warning';
                btnInscrever.textContent = '📝 Inscrever';
                btnInscrever.style.cursor = 'pointer';
                btnInscrever.onclick = () => {
                                        window.abrirModalInscricaoAtleta(linha.atletaId);
                };
                tdAcoes.appendChild(btnInscrever);
                row.appendChild(tdAcoes);

                tbody.appendChild(row);
            });
            tabela.appendChild(tbody);

            resumoContainer.appendChild(tabela);
        }



        function renderizarAtletaInscricao(atleta, provasAtleta, finalizado) {
            const inscricoesAtleta = getInscricoesPorAtletaEvento(atleta.id, eventoSelecionadoId);
            const idsInscritos = new Set(inscricoesAtleta.map(i => i.eventoProvaId));
            const qtdInscricoes = inscricoesAtleta.length;

            const card = document.createElement('div');
            card.className = 'atleta-inscricao-card';
            card.dataset.atletaId = atleta.id;
            card.style.marginBottom = '0.75rem';
            card.style.border = '1px solid #e0e0e0';
            card.style.borderRadius = '6px';
            card.style.overflow = 'hidden';

            const headerHtml = `
                <div class="atleta-inscricao-header" onclick="window.InscricaoPage.toggleAtletaProvas('${atleta.id}')" style="
                    background: #f9f9f9;
                    padding: 1rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e0e0e0;
                ">
                    <div class="atleta-inscricao-info">
                        <div style="font-weight: 600; color: #005f73; margin-bottom: 0.25rem;">${atleta.nome}</div>
                        <div style="font-size: 0.85rem; color: #666;">${atleta.sexo} • Nasc. ${atleta.anoNascimento}</div>
                    </div>
                    <div class="atleta-inscricao-status" style="display: flex; align-items: center; gap: 1rem;">
                        <span class="badge-inscricoes" style="
                            background: ${qtdInscricoes > 0 ? '#c8e6c9' : '#f0f0f0'};
                            color: ${qtdInscricoes > 0 ? '#2e7d32' : '#666'};
                            padding: 0.4rem 0.8rem;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            font-weight: 500;
                        ">${qtdInscricoes} prova(s)</span>
                        <span class="toggle-icon" style="font-size: 0.9rem;">▼</span>
                    </div>
                </div>
            `;

            const provasHtml = `
                <div class="atleta-provas-container" id="provas-${atleta.id}" style="display: none; padding: 1rem; background: #fafafa;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                        ${provasAtleta.map(pe => {
                            const inscrito = idsInscritos.has(pe.id);
                            const melhoresTempos = getMelhoresTempos(atleta.id);
                            const melhorTempo = melhoresTempos.find(mt => mt.provaId === pe.provaId);
                            const tempoLabel = melhorTempo ? `<span style="font-size: 0.75rem; color: #999; margin-left: 0.5rem;">${melhorTempo.tempo}</span>` : '<span style="font-size: 0.75rem; color: #ccc; margin-left: 0.5rem;">s/tempo</span>';
                            const disabled = finalizado ? 'disabled' : '';
                            
                            return `
                                <label id="label-${atleta.id}-${pe.id}" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    padding: 0.5rem;
                                    background: ${inscrito ? '#e8f5e9' : '#fff'};
                                    border: 1px solid ${inscrito ? '#4caf50' : '#ddd'};
                                    border-radius: 4px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    font-size: 0.9rem;
                                ">
                                    <input type="checkbox"
                                        ${inscrito ? 'checked' : ''}
                                        ${disabled}
                                        onchange="window.InscricaoPage.toggleInscricao('${atleta.id}', '${pe.id}', this.checked)"
                                        style="cursor: pointer; accent-color: #0a9396;"
                                    />
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #005f73;">${pe.provaNome} #${pe.numeroProva}</div>
                                        <div style="font-size: 0.8rem; color: #666;">${pe.categoriaNome}</div>
                                    </div>
                                    ${tempoLabel}
                                </label>
                            `;
                        }).join('')}
                    </div>
                    ${!finalizado ? `
                    <div style="display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid #ddd;">
                        <button class="btn btn-secondary btn-pequeno" onclick="window.InscricaoPage.inscreverTodasProvas('${atleta.id}')" style="flex: 1;">✓ Todas</button>
                        <button class="btn btn-danger btn-pequeno" onclick="window.InscricaoPage.removerTodasInscricoes('${atleta.id}')" style="flex: 1;">✕ Nenhuma</button>
                    </div>` : ''}
                </div>
            `;

            card.innerHTML = headerHtml + provasHtml;
            return card;
        }



        function getCategoriaAtleta(anoNascimento) {
            const categorias = getCategorias().filter(c => c.ativo);
            const anoAtual = new Date().getFullYear();
            const idade = anoAtual - anoNascimento;

            return categorias.find(cat => {
                // Calcular idade mínima e máxima da categoria
                const idadeMin = anoAtual - cat.anoFinal;  // Mais jovem (maior ano nascimento)
                const idadeMax = anoAtual - cat.anoInicial;  // Mais velho (menor ano nascimento)
                return idade >= idadeMin && idade <= idadeMax;
            });
        }

        // ===== EVENT LISTENERS =====

        carregarEventos();
        carregarFiltroClubes();
        eventoFilter.addEventListener('change', onEventoChange);
        if (filtroClube) filtroClube.addEventListener('change', () => {
                        carregarFiltroAtletas();
            renderizarResumoInscricoes();
        });
        if (filtroAtleta) filtroAtleta.addEventListener('change', () => {
            renderizarResumoInscricoes();
        });

        // ===== FUNÇÕES PÚBLICAS =====

        window.InscricaoPage.toggleAtletaProvas = function(atletaId) {
            const container = document.getElementById(`provas-${atletaId}`);
            const card = document.querySelector(`[data-atleta-id="${atletaId}"]`);
            const icon = card.querySelector('.toggle-icon');
            
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        };

        window.InscricaoPage.toggleInscricao = function(atletaId, provaEventoId, checked) {
            if (checked) {
                const resultado = salvarInscricao(atletaId, provaEventoId);
                if (!resultado.sucesso) {
                    alert(resultado.mensagem);
                    document.querySelector(`[onchange*="'${atletaId}', '${provaEventoId}'"]`)?.click();
                    return;
                }
            } else {
                removerInscricao(atletaId, provaEventoId);
            }
            atualizarBadgeAtleta(atletaId);
            atualizarLabelProva(atletaId, provaEventoId, checked);
            atualizarEstatisticasClube(atletaId);
            renderizarResumoInscricoes(); // Atualizar resumo
        };

        window.InscricaoPage.inscreverTodasProvas = function(atletaId) {
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === atletaId);
            if (!atleta) return;

            const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);
            const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
            const provasAtleta = provasEvento.filter(pe =>
                pe.sexo === atleta.sexo && pe.categoriaId === categoriaAtleta
            );

            provasAtleta.forEach(pe => {
                salvarInscricao(atletaId, pe.id);
            });

            atualizarCardAtleta(atletaId);
            renderizarResumoInscricoes(); // Atualizar resumo
        };

        window.InscricaoPage.removerTodasInscricoes = function(atletaId) {
            if (!confirm('Remover todas as inscrições deste atleta neste evento?')) return;
            const inscricoes = getInscricoesPorAtletaEvento(atletaId, eventoSelecionadoId);
            inscricoes.forEach(i => removerInscricao(atletaId, i.eventoProvaId));
            atualizarCardAtleta(atletaId);
            renderizarResumoInscricoes(); // Atualizar resumo
        };

        window.InscricaoPage.atualizarResumo = function() {
            renderizarResumoInscricoes();
        };

        function atualizarBadgeAtleta(atletaId) {
            const inscricoes = getInscricoesPorAtletaEvento(atletaId, eventoSelecionadoId);
            const qtd = inscricoes.length;
            const badge = document.querySelector(`[data-atleta-id="${atletaId}"] .badge-inscricoes`);
            if (badge) {
                badge.textContent = `${qtd} prova(s)`;
                badge.style.background = qtd > 0 ? '#c8e6c9' : '#f0f0f0';
                badge.style.color = qtd > 0 ? '#2e7d32' : '#666';
            }
        }

        function atualizarLabelProva(atletaId, provaEventoId, inscrito) {
            const label = document.getElementById(`label-${atletaId}-${provaEventoId}`);
            if (label) {
                label.style.background = inscrito ? '#e8f5e9' : '#fff';
                label.style.borderColor = inscrito ? '#4caf50' : '#ddd';
            }
        }

        function atualizarEstatisticasClube(atletaId) {
            // Função mantida por compatibilidade, mas não faz mais nada
        }

        function atualizarCardAtleta(atletaId) {
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === atletaId);
            if (!atleta) return;

            const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);
            const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
            const provasAtleta = provasEvento.filter(pe =>
                pe.sexo === atleta.sexo && pe.categoriaId === categoriaAtleta
            );

            const evento = getEventos().find(e => e.id === eventoSelecionadoId);
            const finalizado = evento && evento.isFinalizado;

            const cardAntigo = document.querySelector(`[data-atleta-id="${atletaId}"]`);
            if (!cardAntigo) return;

            const novoCard = renderizarAtletaInscricao(atleta, provasAtleta, finalizado);
            const provasContainer = novoCard.querySelector(`#provas-${atletaId}`);
            if (provasContainer && cardAntigo.querySelector(`#provas-${atletaId}`)?.style.display !== 'none') {
                provasContainer.style.display = 'block';
                novoCard.querySelector('.toggle-icon').textContent = '▲';
            }

            cardAntigo.replaceWith(novoCard);
        }
    }
};


