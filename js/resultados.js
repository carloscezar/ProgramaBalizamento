// js-temp/resultados.js - Lançar Resultados das Provas v=20250115

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const eventoFilter = document.getElementById('evento-filter');
    const apenasPendentesCheckbox = document.getElementById('apenas-pendentes');
    const pendenteImpressaoCheckbox = document.getElementById('pendente-impressao');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
    const resultadosContainer = document.getElementById('resultados-container');
    const mensagemContainer = document.getElementById('mensagem-container');

    // Estado da página
    let alteracoesPorSerie = {}; // { "provaEventoId-serieNum": { balizamentoId: {tempoFinal, desqualificado}, ... } }

    // ===== CARREGAMENTO INICIAL =====
    function carregarEventos() {
        const eventos = getEventos();
        
        eventoFilter.innerHTML = '<option value="">-- Selecione um evento --</option>';
        
        eventos.forEach(evento => {
            const option = document.createElement('option');
            option.value = evento.id;
            option.textContent = `${evento.nome} (${evento.local})`;
            eventoFilter.appendChild(option);
        });

        // Se apenas 1 evento, auto-selecionar
        if (eventos.length === 1) {
            eventoFilter.value = eventos[0].id;
            renderizarResultados();
        }
    }

    // ===== AGRUPAMENTO DE DADOS =====
    function grouparBalizamentosPorProvaESerie(eventoId) {
        const apenasPendentes = apenasPendentesCheckbox.checked;
        const pendentImp = pendenteImpressaoCheckbox.checked;

        let provasEvento = getProvasEvento(eventoId);
        const resultadosProva = getResultadosProva(eventoId);

        // Filtrar por status
        provasEvento = provasEvento.filter(pe => {
            const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
            
            if (apenasPendentes && resultado?.finalizada) {
                return false; // Excluir finalizadas
            }
            
            if (pendentImp && (!resultado?.finalizada || resultado?.impressa)) {
                return false; // Excluir não finalizadas ou já impressas
            }
            
            return true;
        });

        // Agrupar balizamentos por prova e série
        const agrupado = {};
        
        provasEvento.forEach(pe => {
            const balizamentos = getBalizamentos(null, pe.id)
                .sort((a, b) => a.serie - b.serie || a.raia - b.raia);

            // Exibir apenas provas com atletas (balizamentos)
            if (balizamentos.length === 0) {
                return; // Pula provas sem atletas
            }

            const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id) || 
                            obterOuCriarResultadoProva(pe.id);

            if (!agrupado[pe.id]) {
                agrupado[pe.id] = {
                    provaEvento: pe,
                    resultado: resultado,
                    series: {}
                };
            }

            // Agrupar por série
            balizamentos.forEach(bal => {
                if (!agrupado[pe.id].series[bal.serie]) {
                    agrupado[pe.id].series[bal.serie] = [];
                }
                agrupado[pe.id].series[bal.serie].push(bal);
            });
        });

        return agrupado;
    }

    // ===== RENDERIZAÇÃO =====
    function renderizarResultados() {
        const eventoId = eventoFilter.value;
        if (!eventoId) {
            resultadosContainer.innerHTML = '<p style="text-align: center; color: #999;">Selecione um evento para visualizar as provas.</p>';
            return;
        }

        const agrupado = grouparBalizamentosPorProvaESerie(eventoId);
        const provasEventoIds = Object.keys(agrupado);

        if (provasEventoIds.length === 0) {
            resultadosContainer.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma prova encontrada com os filtros selecionados.</p>';
            return;
        }

        resultadosContainer.innerHTML = '';
        alteracoesPorSerie = {};

        provasEventoIds.forEach(provaEventoId => {
            const { provaEvento, resultado, series } = agrupado[provaEventoId];
            const provaDetalhes = getProvasEventoDetalhadas(eventoId)
                .find(p => p.id === provaEvento.id);

            // Card da prova (igual a balizamento)
            const provaCard = document.createElement('div');
            provaCard.className = 'prova-card';
            
            // Header da prova (igual a balizamento)
            provaCard.innerHTML = `
                <div class="prova-header">
                    <div>
                        <h3>Prova ${provaDetalhes?.numeroProva || ''}. ${provaDetalhes?.provaNome || ''}</h3>
                        <p class="prova-subheader">${provaDetalhes?.categoriaNome || ''} • ${provaEvento.sexo}</p>
                    </div>
                    <div class="prova-stats">
                        <span class="badge ${resultado?.finalizada ? 'finalizada' : 'pendente'}">
                            ${resultado?.finalizada ? '✓ Finalizada' : '⏳ Pendente'}
                        </span>
                        ${resultado?.impressa ? '<span class="badge impressa">🖨️ Impressa</span>' : ''}
                        ${!resultado?.finalizada ? `<button class="btn-finalizar-prova" style="background-color: #ffc107; color: #000; border: none; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;">⏹️ Finalizar Prova</button>` : ''}
                        ${resultado?.finalizada && !resultado?.impressa ? `<button class="btn-imprimir-prova" style="background-color: #007bff; color: #fff; border: none; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap; margin-left: 8px;">🖨️ Imprimir</button>` : ''}
                    </div>
                </div>
                <div class="prova-series-container"></div>
            `;

            const seriesContainer = provaCard.querySelector('.prova-series-container');
            const btnFinalizarProva = provaCard.querySelector('.btn-finalizar-prova');
            const btnImprimirProva = provaCard.querySelector('.btn-imprimir-prova');
            if (btnFinalizarProva) {
                btnFinalizarProva.addEventListener('click', () => finalizarProva(provaEventoId, provaDetalhes));
            }
            if (btnImprimirProva) {
                btnImprimirProva.addEventListener('click', () => imprimirProva(provaEventoId, provaDetalhes));
            }

            // Renderizar séries
            const seriesOrdenadas = Object.keys(series).map(Number).sort((a, b) => a - b);
            
            seriesOrdenadas.forEach(serieNum => {
                const balizamentos = series[serieNum];
                const chaveSerieKey = `${provaEventoId}-${serieNum}`;

                // Container da série
                const serieDiv = document.createElement('div');
                serieDiv.className = 'serie-container';

                // Título da série
                const serieHeader = document.createElement('div');
                serieHeader.className = 'serieHeader';
                serieHeader.style.display = 'flex';
                serieHeader.style.justifyContent = 'space-between';
                serieHeader.style.alignItems = 'center';
                serieHeader.style.height = '40px';
                serieHeader.style.backgroundColor = '#94d2bd';
                serieDiv.appendChild(serieHeader);

                const serieTitle = document.createElement('h4');
                serieTitle.textContent = `🏊 Série ${serieNum}`;
                serieTitle.style.margin = '0';
                serieTitle.style.flex = '1';
                serieTitle.style.padding = '0.4rem 0.75rem';
                serieTitle.style.borderRadius = '4px 0 0 4px';
                serieHeader.appendChild(serieTitle);

                // Botão Salvar (por série) - alinhado à direita
                const btnSalvarSerie = document.createElement('button');
                btnSalvarSerie.className = 'btn-imprimir';
                btnSalvarSerie.style.backgroundColor = '#28a745';
                btnSalvarSerie.style.padding = '0.3rem 0.9rem';
                btnSalvarSerie.style.whiteSpace = 'nowrap';
                btnSalvarSerie.style.marginTop = '0';
                btnSalvarSerie.style.marginLeft = '0';
                btnSalvarSerie.style.marginRight = '1rem';
                btnSalvarSerie.textContent = '💾 Salvar';
                btnSalvarSerie.addEventListener('click', () => salvarSerie(provaEventoId, serieNum, chaveSerieKey));
                serieHeader.appendChild(btnSalvarSerie);


                // Tabela (igual a balizamento)
                const tabela = document.createElement('table');
                tabela.className = 'raias-tabela';
                tabela.style.width = '100%';
                tabela.style.borderCollapse = 'collapse';
                tabela.style.marginTop = '0.5rem';
                tabela.innerHTML = `
                    <thead>
                        <tr style="height: 35px; background-color: #2c5aa0; color: white; font-weight: 600;">
                            <th style="width: 8%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Raia</th>
                            <th style="width: 35%; text-align: left; padding: 6px 8px; border: 1px solid #ddd;">Atleta</th>
                            <th style="width: 20%; text-align: left; padding: 6px 8px; border: 1px solid #ddd;">Clube</th>
                            <th style="width: 15%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Tempo</th>
                            <th style="width: 22%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;

                const tbody = tabela.querySelector('tbody');

                balizamentos.forEach((bal, index) => {
                    const atleta = getAtletas().find(a => a.id === bal.atletaId);
                    const row = document.createElement('tr');
                    row.style.height = '38px';
                    row.style.borderBottom = '1px solid #e0e0e0';
                    
                    // Zebra striping (alternância de cores)
                    if (index % 2 === 0) {
                        row.style.backgroundColor = '#f9f9f9';
                    }

                    // Hover effect
                    row.addEventListener('mouseover', () => {
                        row.style.backgroundColor = bal.desqualificado ? '#fce4e6' : '#f0f4f8';
                    });
                    row.addEventListener('mouseout', () => {
                        if (bal.desqualificado) {
                            row.style.backgroundColor = '#f8d7da';
                        } else {
                            row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
                        }
                    });
                    
                    // Classe para desclassificado (fundo vermelho)
                    if (bal.desqualificado) {
                        row.style.backgroundColor = '#f8d7da';
                        row.style.color = '#721c24';
                        row.style.fontWeight = '500';
                    }

                    row.innerHTML = `
                        <td class="raia-cell" style="width: 8%; text-align: center; padding: 6px 4px; border: 1px solid #e0e0e0; font-weight: 600; font-size: 16px;"><strong>${bal.raia}</strong></td>
                        <td class="atleta-cell" style="width: 35%; text-align: left; padding: 6px 8px; border: 1px solid #e0e0e0; font-size: 13px;">${atleta?.nome || 'Desconhecido'}</td>
                        <td class="clube-cell" style="width: 20%; text-align: left; padding: 6px 8px; border: 1px solid #e0e0e0; font-size: 12px; color: #666;">${obterNomeClube(bal.atletaId)}</td>
                        <td class="tempo-cell" style="width: 15%; text-align: center; padding: 4px 2px;">
                            <input 
                                type="text" 
                                class="input-tempo" 
                                data-baliza-id="${bal.id}"
                                data-serie-key="${chaveSerieKey}"
                                value="${bal.tempoFinal || ''}"
                                placeholder="00:00.00"
                                ${bal.desqualificado ? 'disabled' : ''}
                                style="width: 85%; padding: 4px 4px; border: 1px solid #bbb; border-radius: 4px; text-align: center; font-size: 13px; font-weight: 500; font-family: 'Courier New', monospace;"
                            />
                        </td>
                        <td class="acoes-cell" style="width: 22%; text-align: center; padding: 4px;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; justify-content: center;">
                                <div class="switch-toggle" 
                                    data-baliza-id="${bal.id}" 
                                    data-serie-key="${chaveSerieKey}" 
                                    data-checked="${bal.desqualificado ? 'true' : 'false'}" 
                                    title="${bal.desqualificado ? 'Atleta desqualificado - Clique para qualificar' : 'Clique para desqualificar o atleta'}"
                                    style="
                                    position: relative;
                                    display: inline-block;
                                    width: 50px;
                                    height: 24px;
                                    cursor: pointer;
                                ">
                                    <span class="switch-slider" style="
                                        position: absolute;
                                        cursor: pointer;
                                        top: 0;
                                        left: 0;
                                        right: 0;
                                        bottom: 0;
                                        background-color: ${bal.desqualificado ? '#dc3545' : '#ccc'};
                                        border-radius: 24px;
                                        transition: background-color 0.3s;
                                    "></span>
                                    <span class="switch-thumb" style="
                                        position: absolute;
                                        cursor: pointer;
                                        height: 18px;
                                        width: 18px;
                                        left: ${bal.desqualificado ? '26px' : '3px'};
                                        bottom: 3px;
                                        background-color: white;
                                        border-radius: 50%;
                                        transition: left 0.3s;
                                    "></span>
                                </div>
                            </div>
                        </td>
                    `;

                    // Listeners
                    const inputTempo = row.querySelector('.input-tempo');
                    const switchToggle = row.querySelector('.switch-toggle');
                    const switchSlider = row.querySelector('.switch-slider');
                    const switchThumb = row.querySelector('.switch-thumb');

                    inputTempo.addEventListener('change', (e) => {
                        registrarAlteracao(chaveSerieKey, bal.id, 'tempoFinal', e.target.value);
                        atualizarEstiloRow(row, bal.id, chaveSerieKey);
                    });

                    // Atualizar visual do switch
                    function atualizarSwitchVisual(isChecked) {
                        if (isChecked) {
                            switchSlider.style.backgroundColor = '#dc3545';
                            switchThumb.style.left = '26px';
                        } else {
                            switchSlider.style.backgroundColor = '#ccc';
                            switchThumb.style.left = '3px';
                        }
                        switchToggle.dataset.checked = isChecked ? 'true' : 'false';
                    }

                    // Event listener para clique no switch
                    switchToggle.addEventListener('click', () => {
                        const isChecked = switchToggle.dataset.checked === 'true';
                        const novoStatus = !isChecked;

                        registrarAlteracao(chaveSerieKey, bal.id, 'desqualificado', novoStatus);
                        inputTempo.disabled = novoStatus;
                        
                        if (novoStatus && inputTempo.value) {
                            inputTempo.value = '';
                        }
                        atualizarEstiloRow(row, bal.id, chaveSerieKey);
                        atualizarSwitchVisual(novoStatus);
                    });

                    // Inicializar visual do switch
                    atualizarSwitchVisual(bal.desqualificado);

                    tbody.appendChild(row);
                });

                serieDiv.appendChild(tabela);


                seriesContainer.appendChild(serieDiv);
            });

            resultadosContainer.appendChild(provaCard);
        });
    }

    // ===== FUNÇÕES AUXILIARES =====
    function registrarAlteracao(chaveSerieKey, balizamentoId, campo, valor) {
        if (!alteracoesPorSerie[chaveSerieKey]) {
            alteracoesPorSerie[chaveSerieKey] = {};
        }
        if (!alteracoesPorSerie[chaveSerieKey][balizamentoId]) {
            alteracoesPorSerie[chaveSerieKey][balizamentoId] = {};
        }
        alteracoesPorSerie[chaveSerieKey][balizamentoId][campo] = valor;
    }

    function atualizarEstiloRow(row, balizamentoId, chaveSerieKey) {
        const alteracoes = alteracoesPorSerie[chaveSerieKey]?.[balizamentoId] || {};
        const desqualificado = alteracoes.desqualificado;

        row.classList.remove('row-desqualificado', 'row-claro', 'row-escuro');
        if (desqualificado) {
            row.classList.add('row-desqualificado');
        } else {
            row.classList.add(row.classList.length > 0 ? 'row-claro' : 'row-escuro');
        }
    }

    function salvarSerie(provaEventoId, serieNum, chaveSerieKey) {
        const alteracoes = alteracoesPorSerie[chaveSerieKey] || {};

        if (Object.keys(alteracoes).length === 0) {
            exibirMensagem('Nenhuma alteração nesta série para salvar.', 'info');
            return;
        }

        // Atualizar balizamentos
        const balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];

        for (const [balizamentoId, mudancas] of Object.entries(alteracoes)) {
            const bal = balizamentos.find(b => b.id === balizamentoId);
            if (bal) {
                if ('tempoFinal' in mudancas) {
                    bal.tempoFinal = mudancas.tempoFinal;
                }
                if ('desqualificado' in mudancas) {
                    bal.desqualificado = mudancas.desqualificado;
                }
            }
        }

        localStorage.setItem('balizamentos', JSON.stringify(balizamentos));

        // Limpar alterações dessa série
        delete alteracoesPorSerie[chaveSerieKey];

        exibirMensagem(`✓ Série ${serieNum} salva com sucesso!`, 'sucesso');
        
        // Verificar se a prova está finalizada
        const eventoId = eventoFilter.value;
        const resultadosProva = getResultadosProva(eventoId);
        const resultadoProva = resultadosProva.find(rp => rp.provaEventoId === provaEventoId);
        
        if (resultadoProva?.finalizada) {
            // Se a prova está finalizada, executar a rotina de finalizar
            const provaDetalhes = getProvasEventoDetalhadas(eventoId)
                .find(p => p.id === provaEventoId);
            
            try {
                // Executar a rotina de finalizar (sem aguardar renderização)
                const balizamentosProva = getBalizamentos(null, provaEventoId);
                const atletasValidos = balizamentosProva.filter(bal => 
                    !bal.desqualificado && bal.tempoFinal && bal.tempoFinal.trim() !== ''
                );

                if (atletasValidos.length > 0) {
                    const atletasOrdenados = atletasValidos.sort((a, b) => 
                        tempoParaSegundos(a.tempoFinal) - tempoParaSegundos(b.tempoFinal)
                    );

                    const provaId = getProvaIdFromProvaEvento(provaEventoId);
                    
                    atletasOrdenados.forEach((atleta, indice) => {
                        const posicao = indice + 1;
                        
                        // Salvar resultado do atleta
                        salvarOuAtualizarResultadoAtleta(
                            resultadoProva.id,
                            atleta.atletaId,
                            atleta.tempoFinal,
                            false,
                            posicao
                        );

                        // Verificar e salvar melhor tempo
                        if (provaId) {
                            const melhorTempoAtual = getMelhorTempoAtleta(atleta.atletaId, provaId);
                            if (isMelhorTempo(atleta.tempoFinal, melhorTempoAtual)) {
                                salvarMelhorTempo(atleta.atletaId, provaId, atleta.tempoFinal);
                            }
                        }
                    });

                    exibirMensagem(`✓ Resultados e melhor tempo atualizados!`, 'sucesso');
                }
            } catch (erro) {
            }
        }
        
        renderizarResultados();
    }

    function finalizarProva(provaEventoId, provaDetalhes) {
        try {
            // 1. Pegar todos os balizamentos da prova
            const balizamentos = getBalizamentos(null, provaEventoId);
            
            // 2. Filtrar: remover desqualificados E sem tempo
            const atletasValidos = balizamentos.filter(bal => 
                !bal.desqualificado && bal.tempoFinal && bal.tempoFinal.trim() !== ''
            );

            if (atletasValidos.length === 0) {
                exibirMensagem('Nenhum atleta com tempo válido para finalizar a prova.', 'erro');
                return;
            }

            // 3. Ordenar por tempo (melhor tempo = posição 1)
            const atletasOrdenados = atletasValidos.sort((a, b) => 
                tempoParaSegundos(a.tempoFinal) - tempoParaSegundos(b.tempoFinal)
            );

            // 4. Criar/atualizar RESULTADOPROVA com finalizada=true
            const resultadoProva = obterOuCriarResultadoProva(provaEventoId);
            atualizarResultadoProva(provaEventoId, true, false);

            // 5. Para cada atleta: criar RESULTADOPROVAATLETA e verificar melhor tempo
            const provaId = getProvaIdFromProvaEvento(provaEventoId);
            
            atletasOrdenados.forEach((atleta, indice) => {
                const posicao = indice + 1;
                
                // Salvar resultado do atleta
                salvarOuAtualizarResultadoAtleta(
                    resultadoProva.id,
                    atleta.atletaId,
                    atleta.tempoFinal,
                    false, // não desqualificado (já filtramos)
                    posicao // Passar a posição
                );

                // Verificar se é melhor tempo
                if (provaId) {
                    const melhorTempoAtual = getMelhorTempoAtleta(atleta.atletaId, provaId);
                    if (isMelhorTempo(atleta.tempoFinal, melhorTempoAtual)) {
                        salvarMelhorTempo(atleta.atletaId, provaId, atleta.tempoFinal);
                    }
                }
            });

            exibirMensagem(
                `✓ Prova finalizada com ${atletasOrdenados.length} atleta(s)!`,
                'sucesso'
            );
            renderizarResultados();
        } catch (erro) {
            exibirMensagem(`Erro ao finalizar prova: ${erro.message}`, 'erro');
        }
    }

    function imprimirProva(provaEventoId, provaDetalhes) {
        try {
            // Pegar dados da prova
            const balizamentos = getBalizamentos(null, provaEventoId);
            const resultadosProva = getResultadosProva(eventoFilter.value);
            const resultadoProva = resultadosProva.find(rp => rp.provaEventoId === provaEventoId);
            
            if (!resultadoProva?.finalizada) {
                exibirMensagem('Prova não está finalizada. Finalize-a primeiro.', 'erro');
                return;
            }

            // Agrupar por série
            const series = {};
            balizamentos.forEach(bal => {
                if (!series[bal.serie]) {
                    series[bal.serie] = [];
                }
                series[bal.serie].push(bal);
            });

            // Criar conteúdo para impressão
            let conteudoImpressao = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #2c5aa0; font-size: 24px; margin-bottom: 5px; }
                        h2 { text-align: center; color: #666; font-size: 16px; margin-bottom: 20px; }
                        h3 { color: #2c5aa0; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #94d2bd; padding-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th { background-color: #2c5aa0; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .desqualificado { background-color: #f8d7da; color: #721c24; font-weight: bold; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>🏊 Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</h1>
                    <h2>${provaDetalhes?.categoriaNome} • ${getEventos().find(e => e.id === eventoFilter.value)?.nome}</h2>
            `;

            // Adicionar séries e resultados
            const seriesOrdenadas = Object.keys(series).map(Number).sort((a, b) => a - b);
            seriesOrdenadas.forEach(serieNum => {
                const balizamentosSerie = series[serieNum]
                    .filter(bal => !bal.desqualificado && bal.tempoFinal && bal.tempoFinal.trim() !== '')
                    .sort((a, b) => tempoParaSegundos(a.tempoFinal) - tempoParaSegundos(b.tempoFinal));

                conteudoImpressao += `<h3>Série ${serieNum}</h3><table>`;
                conteudoImpressao += `<tr><th>Pos.</th><th>Raia</th><th>Atleta</th><th>Clube</th><th>Tempo</th></tr>`;

                balizamentosSerie.forEach((bal, index) => {
                    const atleta = getAtletas().find(a => a.id === bal.atletaId);
                    const posicao = index + 1;
                    conteudoImpressao += `
                        <tr>
                            <td>${posicao}</td>
                            <td>${bal.raia}</td>
                            <td>${atleta?.nome || 'Desconhecido'}</td>
                            <td>${obterNomeClube(bal.atletaId)}</td>
                            <td>${bal.tempoFinal}</td>
                        </tr>
                    `;
                });

                conteudoImpressao += `</table>`;
            });

            conteudoImpressao += `<div class="footer">Gerado automaticamente pelo Sistema de Balizamento</div></body></html>`;

            // Abrir em nova aba para impressão
            const janela = window.open('', '_blank');
            janela.document.write(conteudoImpressao);
            janela.document.close();
            
            // Aguardar carregamento e abrir diálogo de impressão
            janela.onload = () => {
                janela.print();
                
                // Marcar como impressa após imprimir
                atualizarResultadoProva(provaEventoId, true, true);
                exibirMensagem('✓ Prova enviada para impressão!', 'sucesso');
                renderizarResultados();
            };
        } catch (erro) {
            exibirMensagem(`Erro ao imprimir: ${erro.message}`, 'erro');
        }
    }

    function exibirMensagem(texto, tipo = 'info') {
        const msg = document.createElement('div');
        msg.className = `mensagem mensagem-${tipo}`;
        msg.textContent = texto;
        mensagemContainer.innerHTML = '';
        mensagemContainer.appendChild(msg);

        setTimeout(() => {
            msg.remove();
        }, 4000);
    }

    // ===== EVENTOS =====
    eventoFilter.addEventListener('change', renderizarResultados);
    apenasPendentesCheckbox.addEventListener('change', renderizarResultados);
    pendenteImpressaoCheckbox.addEventListener('change', renderizarResultados);

    btnLimparFiltros.addEventListener('click', () => {
        eventoFilter.value = '';
        apenasPendentesCheckbox.checked = true;
        pendenteImpressaoCheckbox.checked = false;
        resultadosContainer.innerHTML = '<p style="text-align: center; color: #999;">Selecione um evento para visualizar as provas.</p>';
        alteracoesPorSerie = {};
    });

    // ===== INICIALIZAÇÃO =====
    carregarEventos();
});


