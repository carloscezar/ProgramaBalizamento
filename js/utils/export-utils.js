/**
 * export-utils.js
 * Funções centralizadas para exportação de resultados (HTML e Excel)
 * Compartilhadas entre resultado-final-page.js e resultados-page.js
 */

// ===== IMPRESSÃO HTML =====
function imprimirProvaHtml(provaEventoId, provaDetalhes, eventoId) {
    try {
        // Se eventoId não for fornecido, tenta obter de eventoFilter
        if (!eventoId && typeof eventoFilter !== 'undefined') {
            eventoId = eventoFilter.value;
        }

        const atletasResultados = getResultadosProvaAtleta(null, provaEventoId)
            .sort((a, b) => a.posicao - b.posicao);

        if (atletasResultados.length === 0) {
            exibirMensagem('Nenhum resultado para exportar.', 'erro');
            return;
        }

        const evento = getEventos().find(e => e.id === eventoId);
        let conteudoImpressao = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #005f73; font-size: 24px; margin-bottom: 5px; }
                    h2 { text-align: center; color: #0a9396; font-size: 16px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #005f73; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
                    td { padding: 8px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f5f5f5; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>🏊 Prova ${provaDetalhes?.numeroProva} - ${provaDetalhes?.provaNome}</h1>
                <h2>${provaDetalhes?.categoriaNome} • ${evento?.nome}</h2>
                <table>
                    <tr>
                        <th>Posição</th>
                        <th>Atleta</th>
                        <th>Clube</th>
                        <th>Tempo</th>
                    </tr>
        `;

        atletasResultados.forEach((atleta) => {
            const nomeAtleta = obterNomeAtletaGlobal(atleta.atletaId);
            const nomeClube = obterNomeClubeGlobal(atleta.atletaId);
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

        const janela = window.open('', '_blank');
        janela.document.write(conteudoImpressao);
        janela.document.close();
        
        janela.onload = () => {
            janela.print();
            atualizarResultadoProva(provaEventoId, true, true);
            exibirMensagem('✓ Prova enviada para impressão!', 'sucesso');
        };
    } catch (error) {
        exibirMensagem('Erro ao imprimir. Verifique o console.', 'erro');
    }
}

// ===== EXPORTAR EXCEL =====
function exportarExcelProva(provaEventoId, provaDetalhes, eventoId) {
    try {
        // Se eventoId não for fornecido, tenta obter de eventoFilter
        if (!eventoId && typeof eventoFilter !== 'undefined') {
            eventoId = eventoFilter.value;
        }

        const evento = getEventos().find(e => e.id === eventoId);
        const atletasResultados = getResultadosProvaAtleta(null, provaEventoId)
            .sort((a, b) => a.posicao - b.posicao);

        if (atletasResultados.length === 0) {
            exibirMensagem('Nenhum resultado para exportar.', 'erro');
            return;
        }

        if (typeof ExcelJS === 'undefined') {
            exibirMensagem('ExcelJS não está carregado!', 'erro');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const nomeAba = `P${provaDetalhes?.numeroProva}`;
        const worksheet = workbook.addWorksheet(nomeAba);

        // Configurar colunas
        worksheet.columns = [
            { width: 8 },
            { width: 35 },
            { width: 28 },
            { width: 16 }
        ];

        // Título
        const titleRow = worksheet.addRow([`PROVA ${provaDetalhes?.numeroProva}: ${provaDetalhes?.provaNome}`]);
        titleRow.font = { bold: true, size: 13 };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe8f4f8' } };

        // Subtítulo
        const subtitleRow = worksheet.addRow([`${provaDetalhes?.categoriaNome} | ${evento?.nome}`]);
        subtitleRow.font = { italic: true, size: 10 };

        // Linha vazia
        worksheet.addRow([]);

        // Headers
        const headerRow = worksheet.addRow(['Posição', 'Atleta', 'Clube', 'Tempo']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005f73' } };

        // Dados com cores alternadas
        atletasResultados.forEach((atleta, indice) => {
            const row = worksheet.addRow([
                atleta.posicao,
                obterNomeAtletaGlobal(atleta.atletaId),
                obterNomeClubeGlobal(atleta.atletaId),
                atleta.tempoFinal || 'S/ registro'
            ]);

            if (indice % 2 === 1) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            }
        });

        // Download
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const nomeEvento = String(evento?.nome || 'Resultados').replace(/[\\/?*\[\]]/g, '');
            const nomeArquivo = `Resultado_Prova${provaDetalhes?.numeroProva}_${nomeEvento}_${dataAtual}.xlsx`;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            atualizarResultadoProva(provaEventoId, true, true);
            exibirMensagem('✓ Arquivo Excel gerado com sucesso!', 'sucesso');
        }).catch(erro => {
            exibirMensagem(`✗ Erro ao gerar Excel: ${erro.message}`, 'erro');
        });
    } catch (error) {
        exibirMensagem('Erro ao exportar. Verifique o console.', 'erro');
    }
}

// ===== FUNÇÕES AUXILIARES GLOBAIS =====
function obterNomeAtletaGlobal(atletaId) {
    return getAtletas().find(a => a.id === atletaId)?.nome || 'Desconhecido';
}

function obterNomeClubeGlobal(atletaId) {
    const atleta = getAtletas().find(a => a.id === atletaId);
    if (!atleta) return '';
    return getClubes().find(c => c.id === atleta.clubeId)?.nome || '';
}


