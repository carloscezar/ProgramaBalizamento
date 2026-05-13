// Módulo de Página - Resultado Final das Provas
window.ResultadoFinalPage = {
    init: function() {
        // Elementos da página
        const eventoFilter = document.getElementById('evento-filter');
        const pendenteImpressaoCheckbox = document.getElementById('pendente-impressao');
        const resultadosContainer = document.getElementById('resultados-container');
        const mensagemContainer = document.getElementById('mensagem-container');

        if (!eventoFilter || !resultadosContainer) {
                        return;
        }

        let eventoSelecionado = null;

        // Inicializar página
        carregarEventos();
        
        // Event listeners
        eventoFilter.addEventListener('change', renderizarResultados);
        if (pendenteImpressaoCheckbox) pendenteImpressaoCheckbox.addEventListener('change', renderizarResultados);

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

            // ✅ Auto-selecionar evento se houver apenas 1 ativo
            const eventosAtivo = getEventos().filter(e => !e.isFinalizado);
            if (eventosAtivo.length === 1) {
                eventoSelecionado = eventosAtivo[0].id;
                eventoFilter.value = eventoSelecionado;
                renderizarResultados();
            }
        }

        // ===== AGRUPAMENTO DE DADOS =====
        function agruparResultadosPorProva(eventoId) {
            const pendenteImpressao = pendenteImpressaoCheckbox?.checked;
            let provasEvento = getProvasEvento(eventoId);
            const resultadosProva = getResultadosProva(eventoId);

            provasEvento = provasEvento.filter(pe => {
                const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
                if (!resultado || !resultado.finalizada) return false;
                if (pendenteImpressao && resultado.impressa) return false;
                return true;
            });

            const agrupado = {};
            provasEvento.forEach(pe => {
                const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
                const atletasResultados = getResultadosProvaAtleta(null, pe.id)
                    .sort((a, b) => a.posicao - b.posicao);

                if (atletasResultados.length === 0) return;

                agrupado[pe.id] = {
                    provaEvento: pe,
                    resultado: resultado,
                    atletasResultados: atletasResultados
                };
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

            const agrupado = agruparResultadosPorProva(eventoId);
            const provasEventoIds = Object.keys(agrupado);

            if (provasEventoIds.length === 0) {
                resultadosContainer.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma prova encontrada com os filtros selecionados.</p>';
                return;
            }

            resultadosContainer.innerHTML = '';

            provasEventoIds.forEach(provaEventoId => {
                const { provaEvento, resultado, atletasResultados } = agrupado[provaEventoId];
                const provaDetalhes = getProvasEventoDetalhadas(eventoId)
                    .find(p => p.id === provaEvento.id);

                // Card da prova
                const provaCard = document.createElement('div');
                provaCard.className = 'prova-card';
                
                provaCard.innerHTML = `
                    <div class="prova-header">
                        <div>
                            <h3>Prova ${provaDetalhes?.numeroProva || ''}. ${provaDetalhes?.provaNome || ''}</h3>
                            <p class="prova-subheader">${provaDetalhes?.categoriaNome || ''} • ${provaEvento.sexo}</p>
                        </div>
                        <div class="prova-stats">
                            <span class="badge finalizada">✓ Finalizada</span>
                            ${resultado?.impressa ? '<span class="badge impressa">🖨️ Impressa</span>' : ''}
                        </div>
                    </div>
                    <div class="prova-series-container"></div>
                `;

                const seriesContainer = provaCard.querySelector('.prova-series-container');

                // Container da série
                const serieDiv = document.createElement('div');
                serieDiv.className = 'serie-container';

                const serieHeader = document.createElement('div');
                serieHeader.className = 'serieHeader';
                serieHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; height: 40px; background-color: #94d2bd;';
                serieDiv.appendChild(serieHeader);

                const serieTitle = document.createElement('h4');
                serieTitle.textContent = '🏆 Resultado Final';
                serieTitle.style.cssText = 'margin: 0; flex: 1; padding: 0.4rem 0.75rem;';
                serieHeader.appendChild(serieTitle);

                // Botões
                const btnGroup = document.createElement('div');
                btnGroup.style.cssText = 'display: flex; gap: 0.5rem; margin-right: 1rem;';

                const btnImprimirHtml = document.createElement('button');
                btnImprimirHtml.className = 'btn btn-primary';
                btnImprimirHtml.style.cssText = 'padding: 0.3rem 0.9rem;';
                btnImprimirHtml.textContent = '📄 HTML';
                btnImprimirHtml.addEventListener('click', () => imprimirProvaHtml(provaEventoId, provaDetalhes));
                btnGroup.appendChild(btnImprimirHtml);

                const btnImprimirExcel = document.createElement('button');
                btnImprimirExcel.className = 'btn btn-success';
                btnImprimirExcel.style.cssText = 'padding: 0.3rem 0.9rem;';
                btnImprimirExcel.textContent = '📊 Excel';
                btnImprimirExcel.addEventListener('click', () => exportarExcelProva(provaEventoId, provaDetalhes));
                btnGroup.appendChild(btnImprimirExcel);

                serieHeader.appendChild(btnGroup);

                // Tabela
                const tabela = document.createElement('table');
                tabela.className = 'raias-tabela';
                tabela.style.cssText = 'width: 100%; border-collapse: collapse; margin-top: 0.5rem;';
                tabela.innerHTML = `
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Atleta</th>
                            <th>Clube</th>
                            <th>Tempo</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;

                const tbody = tabela.querySelector('tbody');
                atletasResultados.forEach((atleta, indice) => {
                    const row = document.createElement('tr');
                    row.className = indice % 2 === 0 ? 'row-claro' : 'row-escuro';
                    row.innerHTML = `
                        <td class="posicao-cell"><strong>${atleta.posicao}º</strong></td>
                        <td class="atleta-cell">${obterNomeAtleta(atleta.atletaId)}</td>
                        <td class="clube-cell">${obterNomeClube(atleta.atletaId)}</td>
                        <td class="tempo-cell"><strong>${atleta.tempoFinal || '—'}</strong></td>
                    `;
                    tbody.appendChild(row);
                });

                serieDiv.appendChild(tabela);
                seriesContainer.appendChild(serieDiv);
                resultadosContainer.appendChild(provaCard);
            });
        }

        // ===== FUNÇÕES AUXILIARES =====
        function exibirMensagem(texto, tipo = 'info') {
            if (mensagemContainer) {
                mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
                setTimeout(() => {
                    mensagemContainer.innerHTML = '';
                }, 4000);
            }
        }

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
    }
};

