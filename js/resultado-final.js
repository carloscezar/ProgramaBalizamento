// js-temp/resultado-final.js - Resultado Final das Provas v=20250115

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const eventoFilter = document.getElementById('evento-filter');
    const impressaCheckbox = document.getElementById('impressa');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
    const resultadosContainer = document.getElementById('resultados-container');
    const mensagemContainer = document.getElementById('mensagem-container');

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
    function agruparResultadosPorProva(eventoId) {
        const impressa = impressaCheckbox.checked;

        let provasEvento = getProvasEvento(eventoId);
        const resultadosProva = getResultadosProva(eventoId);

        // Filtrar por status
        provasEvento = provasEvento.filter(pe => {
            const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
            
            if (!resultado) {
                return false; // Excluir provas sem resultado registrado
            }
            
            if (!resultado.finalizada) {
                return false; // Excluir não finalizadas
            }
            
            if (impressa && !resultado.impressa) {
                return false; // Excluir não impressas
            }
            
            return true;
        });

        // Agrupar atletasResultados por prova
        const agrupado = {};
        
        provasEvento.forEach(pe => {
            const resultado = resultadosProva.find(rp => rp.provaEventoId === pe.id);
            const atletasResultados = getResultadosProvaAtleta(null, pe.id)
                .sort((a, b) => a.posicao - b.posicao);

            // Exibir apenas provas com resultados
            if (atletasResultados.length === 0) {
                return; // Pula provas sem resultados
            }

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
            
            // Header da prova
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

            // Container da série (padrão resultados.js)
            const serieDiv = document.createElement('div');
            serieDiv.className = 'serie-container';

            // Série Header com botões
            const serieHeader = document.createElement('div');
            serieHeader.className = 'serieHeader';
            serieHeader.style.display = 'flex';
            serieHeader.style.justifyContent = 'space-between';
            serieHeader.style.alignItems = 'center';
            serieHeader.style.height = '40px';
            serieHeader.style.backgroundColor = '#94d2bd';
            serieDiv.appendChild(serieHeader);

            // Título da série
            const serieTitle = document.createElement('h4');
            serieTitle.textContent = '🏆 Resultado Final';
            serieTitle.style.margin = '0';
            serieTitle.style.flex = '1';
            serieTitle.style.padding = '0.4rem 0.75rem';
            serieHeader.appendChild(serieTitle);

            // Botões (lado direito do header)
            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '0.5rem';
            btnGroup.style.marginRight = '1rem';

            // Botão Imprimir HTML
            const btnImprimirHtml = document.createElement('button');
            btnImprimirHtml.className = 'btn-imprimir';
            btnImprimirHtml.style.backgroundColor = '#007bff';
            btnImprimirHtml.style.color = '#fff';
            btnImprimirHtml.style.padding = '0.3rem 0.9rem';
            btnImprimirHtml.style.whiteSpace = 'nowrap';
            btnImprimirHtml.textContent = '📄 HTML';
            btnImprimirHtml.addEventListener('click', () => imprimirProvaHtml(provaEventoId, provaDetalhes));
            btnGroup.appendChild(btnImprimirHtml);

            // Botão Imprimir Excel
            const btnImprimirExcel = document.createElement('button');
            btnImprimirExcel.className = 'btn-salvar';
            btnImprimirExcel.style.backgroundColor = '#28a745';
            btnImprimirExcel.style.color = '#fff';
            btnImprimirExcel.style.padding = '0.3rem 0.9rem';
            btnImprimirExcel.style.whiteSpace = 'nowrap';
            btnImprimirExcel.textContent = '📊 Excel';
            btnImprimirExcel.addEventListener('click', () => exportarExcelProva(provaEventoId, provaDetalhes));
            btnGroup.appendChild(btnImprimirExcel);

            serieHeader.appendChild(btnGroup);

            // Tabela de classificação
            const tabela = document.createElement('table');
            tabela.className = 'raias-tabela';
            tabela.style.width = '100%';
            tabela.style.borderCollapse = 'collapse';
            tabela.style.marginTop = '0.5rem';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Atleta</th>
                        <th>Clube</th>
                        <th>Tempo</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
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
    function imprimirProvaHtml(provaEventoId, provaDetalhes) {
        try {
            const eventoId = eventoFilter.value;
            const resultadosProva = getResultadosProva(eventoId);
            const resultado = resultadosProva.find(rp => rp.provaEventoId === provaEventoId);
            const atletasResultados = getResultadosProvaAtleta(null, provaEventoId)
                .sort((a, b) => a.posicao - b.posicao);

            if (atletasResultados.length === 0) {
                exibirMensagem('Nenhum resultado para exportar.', 'erro');
                return;
            }

            if (!resultado?.finalizada) {
                exibirMensagem('Prova não está finalizada. Finalize-a primeiro.', 'erro');
                return;
            }

            // Criar conteúdo para impressão (HTML)
            let conteudoImpressao = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #2c5aa0; font-size: 24px; margin-bottom: 5px; }
                        h2 { text-align: center; color: #666; font-size: 16px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #2c5aa0; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>🏊 Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</h1>
                    <h2>${provaDetalhes?.categoriaNome} • ${getEventos().find(e => e.id === eventoId)?.nome}</h2>
                    <table>
                        <tr>
                            <th>Posição</th>
                            <th>Atleta</th>
                            <th>Clube</th>
                            <th>Tempo</th>
                        </tr>
            `;

            // Adicionar linhas de atletas
            atletasResultados.forEach((atleta) => {
                const nomeAtleta = obterNomeAtleta(atleta.atletaId);
                const nomeClube = obterNomeClube(atleta.atletaId);
                conteudoImpressao += `
                    <tr>
                        <td><strong>${atleta.posicao}º</strong></td>
                        <td>${nomeAtleta}</td>
                        <td>${nomeClube}</td>
                        <td>${atleta.tempoFinal || '—'}</td>
                    </tr>
                `;
            });

            conteudoImpressao += `
                    </table>
                    <div class="footer">Gerado automaticamente pelo Sistema de Balizamento</div>
                </body>
                </html>
            `;

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

    function exportarExcelProva(provaEventoId, provaDetalhes) {
        try {
            const eventoId = eventoFilter.value;
            const resultadosProva = getResultadosProva(eventoId);
            const resultado = resultadosProva.find(rp => rp.provaEventoId === provaEventoId);
            const atletasResultados = getResultadosProvaAtleta(null, provaEventoId)
                .sort((a, b) => a.posicao - b.posicao);

            if (atletasResultados.length === 0) {
                exibirMensagem('Nenhum resultado para exportar.', 'erro');
                return;
            }

            if (!resultado?.finalizada) {
                exibirMensagem('Prova não está finalizada. Finalize-a primeiro.', 'erro');
                return;
            }

            // Criar workbook com ExcelJS
            const workbook = new ExcelJS.Workbook();
            const nomeEvento = getEventos().find(e => e.id === eventoId)?.nome || 'Evento';
            const nomeAba = `P${provaDetalhes?.numeroProva}`.substring(0, 31);
            const worksheet = workbook.addWorksheet(nomeAba);

            // Definir largura das colunas
            worksheet.columns = [
                { width: 12 },  // Posição
                { width: 28 },  // Atleta
                { width: 22 },  // Clube
                { width: 15 }   // Tempo
            ];

            // Estilos
            const headerPrincipal = {
                font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Arial' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2c5aa0' } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: {
                    top: { style: 'thin', color: { argb: 'FFcccccc' } },
                    bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
                    left: { style: 'thin', color: { argb: 'FFcccccc' } },
                    right: { style: 'thin', color: { argb: 'FFcccccc' } }
                }
            };

            const headerSecundario = {
                font: { bold: true, size: 11, color: { argb: 'FF001219' }, name: 'Arial' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF94d2bd' } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: {
                    top: { style: 'thin', color: { argb: 'FFcccccc' } },
                    bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
                    left: { style: 'thin', color: { argb: 'FFcccccc' } },
                    right: { style: 'thin', color: { argb: 'FFcccccc' } }
                }
            };

            const linhaAzulClaro = {
                font: { size: 10, color: { argb: 'FF000000' }, name: 'Arial' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0f8ff' } },
                alignment: { horizontal: 'left', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { argb: 'FFcccccc' } },
                    bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
                    left: { style: 'thin', color: { argb: 'FFcccccc' } },
                    right: { style: 'thin', color: { argb: 'FFcccccc' } }
                }
            };

            const linhabranca = {
                font: { size: 10, color: { argb: 'FF000000' }, name: 'Arial' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
                alignment: { horizontal: 'left', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { argb: 'FFcccccc' } },
                    bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
                    left: { style: 'thin', color: { argb: 'FFcccccc' } },
                    right: { style: 'thin', color: { argb: 'FFcccccc' } }
                }
            };

            let rowIndex = 1;

            // Linha 1: Título da prova
            const rowTitulo = worksheet.getRow(rowIndex);
            rowTitulo.values = [`PROVA ${provaDetalhes?.numeroProva}: ${provaDetalhes?.provaNome}`, null, null, null];
            rowTitulo.height = 28;
            worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
            rowTitulo.getCell(1).style = headerPrincipal;
            rowIndex++;

            // Linha 2: Categoria e evento
            const rowCategoria = worksheet.getRow(rowIndex);
            rowCategoria.values = [`${provaDetalhes?.categoriaNome} | ${nomeEvento}`, null, null, null];
            rowCategoria.height = 20;
            worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
            rowCategoria.getCell(1).style = headerSecundario;
            rowIndex++;

            // Linha 3: Vazia
            rowIndex++;

            // Cabeçalho das colunas
            const rowCabecalho = worksheet.getRow(rowIndex);
            rowCabecalho.values = ['Posição', 'Atleta', 'Clube', 'Tempo'];
            rowCabecalho.height = 22;
            
            for (let col = 1; col <= 4; col++) {
                const cell = rowCabecalho.getCell(col);
                cell.style = headerPrincipal;
            }
            rowIndex++;

            // Dados com linhas alternadas
            atletasResultados.forEach((atleta, idx) => {
                const row = worksheet.getRow(rowIndex);
                row.values = [
                    atleta.posicao,
                    obterNomeAtleta(atleta.atletaId),
                    obterNomeClube(atleta.atletaId),
                    atleta.tempoFinal || '—'
                ];
                row.height = 18;

                const estiloLinha = idx % 2 === 0 ? linhaAzulClaro : linhabranca;

                for (let col = 1; col <= 4; col++) {
                    const cell = row.getCell(col);
                    cell.style = JSON.parse(JSON.stringify(estiloLinha)); // Deep copy
                    
                    // Posição centralizada
                    if (col === 1) {
                        cell.alignment = { horizontal: 'center', vertical: 'center' };
                    }
                }
                rowIndex++;
            });

            // Gerar arquivo e fazer download
            workbook.xlsx.writeBuffer().then(buffer => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Prova${provaDetalhes?.numeroProva}_${provaDetalhes?.provaNome}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
                
                // Marcar como impressa após exportar
                atualizarResultadoProva(provaEventoId, true, true);
                exibirMensagem(`✓ Arquivo "${link.download}" gerado com sucesso!`, 'sucesso');
                renderizarResultados();
            }).catch(err => {
                exibirMensagem('✗ Erro ao gerar arquivo Excel', 'erro');
            });
        } catch (erro) {
            exibirMensagem(`Erro ao exportar: ${erro.message}`, 'erro');
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
    impressaCheckbox.addEventListener('change', renderizarResultados);

    btnLimparFiltros.addEventListener('click', () => {
        eventoFilter.value = '';
        impressaCheckbox.checked = false;
        resultadosContainer.innerHTML = '<p style="text-align: center; color: #999;">Selecione um evento para visualizar as provas.</p>';
    });

    // ===== INICIALIZAÇÃO =====
    carregarEventos();
});


