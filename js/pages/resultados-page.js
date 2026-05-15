// Módulo de Página - Lançar Resultados das Provas
window.ResultadosPage = {
    init: function() {
        const eventoFilter = document.getElementById('evento-filter');
        const apenasPendentesCheckbox = document.getElementById('apenas-pendentes');
        const resultadosContainer = document.getElementById('resultados-container');
        const mensagemContainer = document.getElementById('mensagem-container');

        if (!eventoFilter || !resultadosContainer) {
            return;
        }

        let alteracoesPorSerie = {};
        let eventoSelecionado = null;

        carregarEventos();
        
        eventoFilter.addEventListener('change', renderizarResultados);
        if (apenasPendentesCheckbox) apenasPendentesCheckbox.addEventListener('change', renderizarResultados);

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

            // ✅ Auto-selecionar evento se houver apenas 1
            if (eventos.length === 1) {
                eventoSelecionado = eventos[0].id;
                eventoFilter.value = eventoSelecionado;
                renderizarResultados();
            }
        }

        // ===== AGRUPAMENTO DE DADOS =====
        function grouparBalizamentosPorProvaESerie(eventoId) {
            const apenasPendentes = apenasPendentesCheckbox?.checked;

            let provasEvento = getProvasEvento(eventoId);
            const resultadosProva = getResultadosProva(eventoId);

            provasEvento = provasEvento.filter(pe => {
                const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
                if (apenasPendentes && resultado?.finalizada) return false;
                return true;
            });

            const agrupado = {};
            provasEvento
                .sort((a,b) => a.numeroProva - b.numeroProva)
                .forEach(pe => {
                    const balizamentos = getBalizamentos(null, pe.id)
                        .sort((a, b) => a.serie - b.serie || a.raia - b.raia);

                    if (balizamentos.length === 0) return;

                    const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id) || 
                                    obterOuCriarResultadoProva(pe.id);

                    if (!agrupado[pe.id]) {
                        agrupado[pe.id] = {
                            provaEvento: pe,
                            resultado: resultado,
                            series: {}
                        };
                    }

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

            provasEventoIds
                .forEach(provaEventoId => {
                    const { provaEvento, resultado, series } = agrupado[provaEventoId];
                    const provaDetalhes = getProvasEventoDetalhadas(eventoId)
                        .find(p => p.id === provaEvento.id);

                    const provaCard = document.createElement('div');
                    provaCard.className = 'prova-card';
                    
                    provaCard.innerHTML = `
                        <div class="prova-header">
                            <div>
                                <h3>Prova ${provaDetalhes?.numeroProva || ''}. ${provaDetalhes?.provaNome || ''} • ${provaEvento.sexo.toUpperCase()} • ${(provaDetalhes?.categoriaNome || '').toUpperCase()}</h3>
                            </div>
                            <div class="prova-stats">
                                <span class="badge ${resultado?.finalizada ? 'finalizada' : 'pendente'}" style="padding:0.1rem 0.8rem">
                                    ${resultado?.finalizada ? '✓ Finalizada' : '⏳ Pendente'}
                                </span>
                                ${resultado?.impressa ? '<span class="badge impressa" style="font-size: 0.8rem;">🖨️ Impressa</span>' : ''}
                                ${!resultado?.finalizada ? `<button class="btn btn-warning" style="margin-left: 0.5rem; padding: 0.2rem 0.6rem; font-size: 0.8rem;">⏹️ Finalizar</button>` : ''}
                                ${resultado?.finalizada ? `
                                    <button class="btn btn-info" style="margin-left: 0.5rem; padding: 0.2rem 0.6rem; font-size: 0.8rem;">📄 HTML</button>
                                    <button class="btn btn-success" style="margin-left: 0.3rem; padding: 0.2rem 0.6rem; font-size: 0.8rem;">📊 Excel</button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="prova-series-container"></div>
                    `;

                    const seriesContainer = provaCard.querySelector('.prova-series-container');
                    const btnFinalizar = provaCard.querySelector('.btn-warning');
                    if (btnFinalizar) {
                        btnFinalizar.addEventListener('click', () => finalizarProva(provaEventoId, provaDetalhes));
                    }

                    // Botões de impressão (aparecem apenas quando finalizado)
                    const btnHtml = provaCard.querySelector('.btn-info');
                    const btnExcel = provaCard.querySelector('.btn-success');
                    if (btnHtml) {
                        btnHtml.addEventListener('click', () => imprimirProvaHtml(provaEventoId, provaDetalhes, eventoId));
                    }
                    if (btnExcel) {
                        btnExcel.addEventListener('click', () => exportarExcelProva(provaEventoId, provaDetalhes, eventoId));
                    }

                    const seriesOrdenadas = Object.keys(series).map(Number).sort((a, b) => a - b);
                    
                    seriesOrdenadas.forEach(serieNum => {
                        const balizamentos = series[serieNum];
                        const chaveSerieKey = `${provaEventoId}-${serieNum}`;

                        const serieDiv = document.createElement('div');
                        serieDiv.className = 'serie-container';

                        const serieHeader = document.createElement('div');
                        serieHeader.className = 'serieHeader';
                        serieHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; height: 40px; background-color: #94d2bd;';
                        serieDiv.appendChild(serieHeader);

                        const serieTitle = document.createElement('h4');
                        serieTitle.textContent = `🏊 Série ${serieNum}`;
                        serieTitle.style.cssText = 'margin: 0; flex: 1; padding: 0.4rem 0.75rem;';
                        serieHeader.appendChild(serieTitle);

                        const btnSalvarSerie = document.createElement('button');
                        btnSalvarSerie.className = 'btn btn-success';
                        btnSalvarSerie.style.cssText = 'padding: 0.3rem 0.9rem; margin-right: 1rem;';
                        btnSalvarSerie.textContent = '💾 Salvar';
                        btnSalvarSerie.addEventListener('click', () => salvarSerie(provaEventoId, serieNum, chaveSerieKey));
                        serieHeader.appendChild(btnSalvarSerie);

                        const tabela = document.createElement('table');
                        tabela.className = 'raias-tabela';
                        tabela.style.cssText = 'width: 100%; border-collapse: collapse; margin-top: 0.5rem;';
                        tabela.innerHTML = `
                            <thead>
                                <tr style="height: 35px; background-color: #2c5aa0; color: white; font-weight: 600;">
                                    <th style="width: 8%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Raia</th>
                                    <th style="width: 35%; text-align: left; padding: 6px 8px; border: 1px solid #ddd;">Atleta</th>
                                    <th style="width: 20%; text-align: left; padding: 6px 8px; border: 1px solid #ddd;">Clube</th>
                                    <th style="width: 15%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Tempo</th>
                                    <th style="width: 22%; text-align: center; padding: 6px 4px; border: 1px solid #ddd;">Desqualificar</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        `;

                        const tbody = tabela.querySelector('tbody');
                        balizamentos.forEach((bal, index) => {
                            const atleta = getAtletas().find(a => a.id === bal.atletaId);
                            const row = document.createElement('tr');
                            row.style.height = '38px';
                            row.style.borderBottom = '1px solid #e0e0e0';
                            
                            if (index % 2 === 0) {
                                row.style.backgroundColor = '#f9f9f9';
                            }

                            if (bal.desqualificado) {
                                row.style.backgroundColor = '#f8d7da';
                                row.style.color = '#721c24';
                                row.style.fontWeight = '500';
                            }

                            row.innerHTML = `
                                <td style="width: 8%; text-align: center; padding: 6px 4px; border: 1px solid #e0e0e0; font-weight: 600;"><strong>${bal.raia}</strong></td>
                                <td style="width: 35%; text-align: left; padding: 6px 8px; border: 1px solid #e0e0e0; font-size: 13px;">${atleta?.nome || 'Desconhecido'}</td>
                                <td style="width: 20%; text-align: left; padding: 6px 8px; border: 1px solid #e0e0e0; font-size: 12px; color: #666;">${obterNomeClube(bal.atletaId)}</td>
                                <td style="width: 15%; text-align: center; padding: 4px 2px;">
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
                                <td style="width: 22%; text-align: center; padding: 4px;">
                                    <div class="switch-toggle" 
                                        data-baliza-id="${bal.id}" 
                                        data-serie-key="${chaveSerieKey}" 
                                        data-checked="${bal.desqualificado ? 'true' : 'false'}"
                                        style="position: relative; display: inline-block; width: 50px; height: 24px; cursor: pointer;">
                                        <span class="switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${bal.desqualificado ? '#dc3545' : '#ccc'}; border-radius: 24px; transition: background-color 0.3s;"></span>
                                        <span class="switch-thumb" style="position: absolute; cursor: pointer; height: 18px; width: 18px; left: ${bal.desqualificado ? '26px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: left 0.3s;"></span>
                                    </div>
                                </td>
                            `;

                            const inputTempo = row.querySelector('.input-tempo');
                            const switchToggle = row.querySelector('.switch-toggle');
                            const switchSlider = row.querySelector('.switch-slider');
                            const switchThumb = row.querySelector('.switch-thumb');

                            inputTempo.addEventListener('change', (e) => {
                                registrarAlteracao(chaveSerieKey, bal.id, 'tempoFinal', e.target.value);
                            });

                            switchToggle.addEventListener('click', () => {
                                const isChecked = switchToggle.dataset.checked === 'true';
                                const novoStatus = !isChecked;

                                registrarAlteracao(chaveSerieKey, bal.id, 'desqualificado', novoStatus);
                                inputTempo.disabled = novoStatus;
                                
                                if (novoStatus && inputTempo.value) {
                                    inputTempo.value = '';
                                }

                                if (novoStatus) {
                                    switchSlider.style.backgroundColor = '#dc3545';
                                    switchThumb.style.left = '26px';
                                } else {
                                    switchSlider.style.backgroundColor = '#ccc';
                                    switchThumb.style.left = '3px';
                                }
                                switchToggle.dataset.checked = novoStatus ? 'true' : 'false';
                            });

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

        function salvarSerie(provaEventoId, serieNum, chaveSerieKey) {
            const alteracoes = alteracoesPorSerie[chaveSerieKey] || {};

            if (Object.keys(alteracoes).length === 0) {
                exibirMensagem('Nenhuma alteração nesta série para salvar.', 'info');
                return;
            }

            const balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
            const resultados = getResultadosProva();
            const resultado = resultados.find(rp => rp.provaEventoId === provaEventoId);
            
            // Atualizar balizamentos
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
            delete alteracoesPorSerie[chaveSerieKey];

            // Se prova está finalizada, sincronizar resultados
            if (resultado?.finalizada) {
                sincronizarResultadosProva(provaEventoId, resultado);
                exibirMensagem(`✓ Série ${serieNum} atualizada e resultados sincronizados!`, 'sucesso');
            } else {
                exibirMensagem(`✓ Série ${serieNum} salva com sucesso!`, 'sucesso');
            }

            renderizarResultados();
        }

        function sincronizarResultadosProva(provaEventoId, resultado) {
            try {
                const balizamentos = getBalizamentos(null, provaEventoId);
                const atletasValidos = balizamentos.filter(bal => 
                    !bal.desqualificado && bal.tempoFinal && bal.tempoFinal.trim() !== ''
                );

                if (atletasValidos.length === 0) {
                    return;
                }

                // Ordenar por tempo
                const atletasOrdenados = atletasValidos.sort((a, b) => 
                    tempoParaSegundos(a.tempoFinal) - tempoParaSegundos(b.tempoFinal)
                );

                const provaId = getProvaIdFromProvaEvento(provaEventoId);
                const resultadosProvaAtletaStored = JSON.parse(localStorage.getItem('resultadosProvaAtleta')) || [];

                // Atualizar cada atleta com nova posição e tempo
                atletasOrdenados.forEach((atleta, indice) => {
                    const posicao = indice + 1;
                    
                    // Buscar na lista carregada do localStorage
                    const resultadoAtleta = resultadosProvaAtletaStored.find(
                        rpa => rpa.resultadoProvaId === resultado.id && rpa.atletaId === atleta.atletaId
                    );
                    
                    if (resultadoAtleta) {
                        // Atualizar existente
                        resultadoAtleta.tempoFinal = atleta.tempoFinal;
                        resultadoAtleta.posicao = posicao;
                    }

                    // Atualizar melhor tempo
                    if (provaId) {
                        const melhorTempoAtual = getMelhorTempoAtleta(atleta.atletaId, provaId);
                        if (isMelhorTempo(atleta.tempoFinal, melhorTempoAtual)) {
                            salvarMelhorTempo(atleta.atletaId, provaId, atleta.tempoFinal);
                        }
                    }
                });

                // Salvar atualizações de resultadosProvaAtleta
                localStorage.setItem('resultadosProvaAtleta', JSON.stringify(resultadosProvaAtletaStored));

                // Marcar resultado como não impressa (já que os dados mudaram)
                atualizarResultadoProva(provaEventoId, true, false);

            } catch (error) {
                            }
        }

        function finalizarProva(provaEventoId, provaDetalhes) {
            try {
                const balizamentos = getBalizamentos(null, provaEventoId);
                const atletasValidos = balizamentos.filter(bal => 
                    !bal.desqualificado && bal.tempoFinal && bal.tempoFinal.trim() !== ''
                );

                if (atletasValidos.length === 0) {
                    exibirMensagem('Nenhum atleta com tempo válido para finalizar a prova.', 'erro');
                    return;
                }

                const atletasOrdenados = atletasValidos.sort((a, b) => 
                    tempoParaSegundos(a.tempoFinal) - tempoParaSegundos(b.tempoFinal)
                );

                const resultadoProva = obterOuCriarResultadoProva(provaEventoId);
                atualizarResultadoProva(provaEventoId, true, false);

                const provaId = getProvaIdFromProvaEvento(provaEventoId);
                
                atletasOrdenados.forEach((atleta, indice) => {
                    const posicao = indice + 1;
                    salvarOuAtualizarResultadoAtleta(
                        resultadoProva.id,
                        atleta.atletaId,
                        atleta.tempoFinal,
                        false,
                        posicao
                    );

                    if (provaId) {
                        const melhorTempoAtual = getMelhorTempoAtleta(atleta.atletaId, provaId);
                        if (isMelhorTempo(atleta.tempoFinal, melhorTempoAtual)) {
                            salvarMelhorTempo(atleta.atletaId, provaId, atleta.tempoFinal);
                        }
                    }
                });

                exibirMensagem(`✓ Prova finalizada e resultados registrados!`, 'sucesso');
                renderizarResultados();
            } catch (error) {
                                exibirMensagem('Erro ao finalizar prova. Verifique o console.', 'erro');
            }
        }

        function exibirMensagem(texto, tipo = 'info') {
            if (mensagemContainer) {
                mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
                setTimeout(() => {
                    mensagemContainer.innerHTML = '';
                }, 4000);
            }
        }

        function obterNomeClube(atletaId) {
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === atletaId);
            if (!atleta) return '';
            const clubes = getClubes();
            return clubes.find(c => c.id === atleta.clubeId)?.nome || '';
        }
    }
};


