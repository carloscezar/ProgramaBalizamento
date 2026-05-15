// js-temp/balizamento.js - Gerenciamento de Balizamento (Heat/Lane Assignment)

document.addEventListener('DOMContentLoaded', () => {
    const eventoSelect = document.getElementById('evento-select');
    const btnGerarBalizamento = document.getElementById('btn-gerar-balizamento');
    const btnLimparBalizamento = document.getElementById('btn-limpar-balizamento');
    const btnImprimirBalizamento = document.getElementById('btn-imprimir-balizamento');
    const balizamentoContainer = document.getElementById('balizamento-container');
    const mensagemContainer = document.getElementById('mensagem-container');
    
    // Elementos de adição manual
    const secaoAdicionarManual = document.getElementById('secao-adicionar-manual');
    const selectProvaManual = document.getElementById('select-prova-manual');
    const selectAtletaManual = document.getElementById('select-atleta-manual');
    const inputSerieManual = document.getElementById('input-serie-manual');
    const inputRaiaManual = document.getElementById('input-raia-manual');
    const btnAdicionarAtletaManual = document.getElementById('btn-adicionar-atleta-manual');
    const btnCancelarAdicionar = document.getElementById('btn-cancelar-adicionar');

    // Elementos do modal de reorganização
    const modalReorganizar = document.getElementById('modal-reorganizar');
    const modalAtletaDisplay = document.getElementById('modal-atleta-display');
    const modalClubeDisplay = document.getElementById('modal-clube-display');
    const modalSerieInput = document.getElementById('modal-serie-input');
    const modalRaiaInput = document.getElementById('modal-raia-input');
    const modalErro = document.getElementById('modal-erro');
    const modalWarning = document.getElementById('modal-warning');
    const btnSalvarReorganizacao = document.getElementById('btn-salvar-reorganizacao');
    const btnCancelarReorganizacao = document.getElementById('btn-cancelar-reorganizacao');
    const btnFecharModal = document.getElementById('btn-fechar-modal');

    let eventoSelecionado = null;
    let balizamentoEmEdicao = null; // Controlar qual balizamento está sendo editado

    // ===== CARREGAMENTO INICIAL =====
    function carregarEventos() {
        const eventos = getEventos();
        eventoSelect.innerHTML = '<option value="">-- Selecione um evento --</option>';
        
        eventos.forEach(evento => {
            const option = document.createElement('option');
            option.value = evento.id;
            option.textContent = `${evento.nome} (${evento.local})`;
            eventoSelect.appendChild(option);
        });
    }

    // ===== EXIBIÇÃO DE MENSAGENS =====
    function exibirMensagem(texto, tipo = 'info') {
        mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
        setTimeout(() => {
            mensagemContainer.innerHTML = '';
        }, 5000);
    }

    // ===== MAPPERS E HELPERS =====
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

    function obterSexoAtleta(atletaId) {
        const atletas = getAtletas();
        return atletas.find(a => a.id === atletaId)?.sexo || '';
    }

    function obterTempoReferencia(atletaId, provaId) {
        const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
        const registro = melhoresTempos.find(mt => mt.atletaId === atletaId && mt.provaId === provaId);
        return registro?.tempo || 'S/ tempo';
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

    // ===== FUNÇÕES DE ADIÇÃO MANUAL =====
    function carregarProvasParaAdicaoManual() {
        if (!eventoSelecionado) {
            selectProvaManual.innerHTML = '<option value="">-- Selecione uma prova --</option>';
            return;
        }

        const provasEvento = getProvasEvento(eventoSelecionado);
        const provas = getProvas();
        const categorias = getCategorias();

        selectProvaManual.innerHTML = '<option value="">-- Selecione uma prova --</option>';

        provasEvento
            .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0))
            .forEach(pe => {
                const prova = provas.find(p => p.id === pe.provaId);
                const categoria = categorias.find(c => c.id === pe.categoriaId);
                const label = `${pe.numeroProva}. ${prova?.nome || 'Desconhecida'} - ${categoria?.nome || 'Desconhecida'} (${pe.sexo})`;
                const option = document.createElement('option');
                option.value = pe.id;
                option.textContent = label;
                selectProvaManual.appendChild(option);
            });
    }

    function carregarAtletasParaAdicaoManual() {
        const provaEventoId = selectProvaManual.value;
        selectAtletaManual.innerHTML = '<option value="">-- Selecione um atleta --</option>';

        if (!provaEventoId) {
            return;
        }

        const atletasInscritos = getAtletasInscritosNaProva(provaEventoId);
        const atletas = getAtletas();
        const clubes = getClubes();
        const balizamentos = getBalizamentos();

        // Filtrar atletas já balizado nesta prova
        const atletasBalizados = balizamentos
            .filter(b => b.provaEventoId === provaEventoId)
            .map(b => b.atletaId);

        atletasInscritos
            .map(atletaId => atletas.find(a => a.id === atletaId))
            .filter(atleta => atleta && !atletasBalizados.includes(atleta.id))
            .forEach(atleta => {
                const clube = clubes.find(c => c.id === atleta.clubeId);
                const label = `${atleta.nome} - ${clube?.nome || 'S/ clube'}`;
                const option = document.createElement('option');
                option.value = atleta.id;
                option.textContent = label;
                selectAtletaManual.appendChild(option);
            });
    }

    function adicionarAtletaManualmente() {
        const provaEventoId = selectProvaManual.value;
        const atletaId = selectAtletaManual.value;
        const serie = parseInt(inputSerieManual.value, 10);
        const raia = parseInt(inputRaiaManual.value, 10);

        if (!provaEventoId || !atletaId || isNaN(serie) || isNaN(raia)) {
            exibirMensagem('Preencha todos os campos corretamente!', 'erro');
            return;
        }

        if (serie < 1 || raia < 1) {
            exibirMensagem('Série e raia devem ser maiores que zero!', 'erro');
            return;
        }

        const evento = getEventos().find(e => e.id === eventoSelecionado);
        if (raia > (evento?.qtdeRaias || 8)) {
            exibirMensagem(`Raia inválida! Máximo de raias: ${evento?.qtdeRaias || 8}`, 'erro');
            return;
        }

        // Verificar duplicidade
        if (verificarBalizamentoDuplicado(provaEventoId, serie, raia)) {
            exibirMensagem('Já existe um atleta nessa série/raia!', 'erro');
            return;
        }

        // Obter tempo de referência
        const provaEvento = getProvasEvento().find(pe => pe.id === provaEventoId);
        const tempoRef = obterTempoReferencia(atletaId, provaEvento?.provaId);

        const balizamento = {
            id: `bal-${Date.now()}-${Math.random()}`,
            provaEventoId: provaEventoId,
            atletaId: atletaId,
            serie: serie,
            raia: raia,
            tempoReferencia: tempoRef,
            tempoFinal: ''
        };

        const resultado = salvarBalizamento(balizamento);
        if (resultado.sucesso) {
            exibirMensagem('✓ Atleta adicionado com sucesso!', 'sucesso');
            fecharFormularioAdicaoManual();
            renderizarBalizamento();
        } else {
            exibirMensagem(`✗ Erro: ${resultado.mensagem}`, 'erro');
        }
    }

    function abrirFormularioAdicaoManual() {
        secaoAdicionarManual.style.display = 'block';
        carregarProvasParaAdicaoManual();
        selectProvaManual.focus();
    }

    function fecharFormularioAdicaoManual() {
        secaoAdicionarManual.style.display = 'none';
        selectProvaManual.value = '';
        selectAtletaManual.value = '';
        inputSerieManual.value = '';
        inputRaiaManual.value = '';
    }

    function imprimirBalizamento() {
        if (!eventoSelecionado) {
            exibirMensagem('Selecione um evento primeiro!', 'erro');
            return;
        }

        const balizamentos = getBalizamentos(eventoSelecionado);
        if (balizamentos.length === 0) {
            exibirMensagem('Nenhum balizamento para gerar!', 'erro');
            return;
        }

        const evento = getEventos().find(e => e.id === eventoSelecionado);
        const nomeEvento = evento?.nome || 'Evento Desconhecido';
        const provasEvento = getProvasEvento(eventoSelecionado);

        // Criar workbook com ExcelJS
        const workbook = new ExcelJS.Workbook();

        provasEvento
            .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0))
            .forEach(provaEvento => {
                const balProva = balizamentos.filter(b => b.provaEventoId === provaEvento.id);
                
                if (balProva.length === 0) return;

                const detalhes = obterDetalhesProva(provaEvento.id);
                
                // Agrupar por série
                const balPorSerie = {};
                balProva.forEach(bal => {
                    if (!balPorSerie[bal.serie]) {
                        balPorSerie[bal.serie] = [];
                    }
                    balPorSerie[bal.serie].push(bal);
                });

                // Criar worksheet
                const nomeAba = `P${detalhes.numeroProva} - ${detalhes.provaNome}`.substring(0, 31);
                const worksheet = workbook.addWorksheet(nomeAba);

                // Definir largura das colunas
                worksheet.columns = [
                    { width: 10 },  // Raia
                    { width: 28 },  // Atleta
                    { width: 22 },  // Clube
                    { width: 18 }   // Melhor Tempo
                ];

                let rowIndex = 1;

                // Estilo para header principal (verde escuro)
                const headerPrincipal = {
                    font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Arial' },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0a9396' } },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: 'thin', color: { argb: 'FFcccccc' } },
                        bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
                        left: { style: 'thin', color: { argb: 'FFcccccc' } },
                        right: { style: 'thin', color: { argb: 'FFcccccc' } }
                    }
                };

                // Estilo para header secundário (verde claro)
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

                // Estilo para linha de dados com fundo azul claro
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

                // Estilo para linha de dados com fundo branco
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

                // Linha 1: Título da prova
                const rowTitulo = worksheet.getRow(rowIndex);
                rowTitulo.values = [`PROVA ${detalhes.numeroProva}: ${detalhes.provaNome}`, null, null, null];
                rowTitulo.height = 28;
                worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
                rowTitulo.getCell(1).style = headerPrincipal;
                rowIndex++;

                // Linha 2: Categoria e sexo
                const rowCategoria = worksheet.getRow(rowIndex);
                rowCategoria.values = [`${detalhes.categoriaNome} | ${detalhes.sexo}`, null, null, null];
                rowCategoria.height = 20;
                worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
                rowCategoria.getCell(1).style = headerSecundario;
                rowIndex++;

                // Linha 3: Vazia
                rowIndex++;

                // Processar cada série
                const series = Object.keys(balPorSerie)
                    .map(s => parseInt(s, 10))
                    .sort((a, b) => a - b);

                series.forEach((numSerie, idxSerie) => {
                    const balSerie = balPorSerie[numSerie]
                        .sort((a, b) => a.raia - b.raia);

                    // Título da série
                    const rowSerie = worksheet.getRow(rowIndex);
                    rowSerie.values = [`SÉRIE ${numSerie}`, null, null, null];
                    rowSerie.height = 22;
                    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
                    rowSerie.getCell(1).style = headerSecundario;
                    rowIndex++;

                    // Cabeçalho das colunas
                    const rowCabecalho = worksheet.getRow(rowIndex);
                    rowCabecalho.values = ['Raia', 'Atleta', 'Clube', 'Melhor Tempo'];
                    rowCabecalho.height = 22;
                    
                    for (let col = 1; col <= 4; col++) {
                        const cell = rowCabecalho.getCell(col);
                        cell.style = headerPrincipal;
                    }
                    rowIndex++;

                    // Dados de atletas com linhas alternadas
                    balSerie.forEach((bal, idx) => {
                        const row = worksheet.getRow(rowIndex);
                        row.values = [
                            bal.raia,
                            obterNomeAtleta(bal.atletaId),
                            obterNomeClube(bal.atletaId),
                            bal.tempoReferencia || 'S/ registro'
                        ];
                        row.height = 18;

                        const estiloLinha = idx % 2 === 0 ? linhaAzulClaro : linhabranca;

                        for (let col = 1; col <= 4; col++) {
                            const cell = row.getCell(col);
                            cell.style = JSON.parse(JSON.stringify(estiloLinha)); // Deep copy
                            
                            // Raia centralizada
                            if (col === 1) {
                                cell.alignment = { horizontal: 'center', vertical: 'center' };
                            }
                        }
                        rowIndex++;
                    });

                    // Espaços entre séries (para quebra de página)
                    rowIndex += 2;
                });
            });

        // Gerar arquivo e fazer download
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Balizamento_${nomeEvento}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
            
            exibirMensagem(`✓ Arquivo "${link.download}" gerado com sucesso!`, 'sucesso');
        }).catch(err => {

            exibirMensagem('✗ Erro ao gerar arquivo Excel', 'erro');
        });
    }

    // ===== RENDERIZAÇÃO =====
    function renderizarBalizamento() {
        balizamentoContainer.innerHTML = '';
        
        if (!eventoSelecionado) {
            balizamentoContainer.innerHTML = '<p class="info-vazia">Selecione um evento para visualizar o balizamento.</p>';
            return;
        }

        const balizamentos = getBalizamentos(eventoSelecionado);
        const provasEvento = getProvasEvento(eventoSelecionado);

        if (balizamentos.length === 0) {
            balizamentoContainer.innerHTML = `
                <div class="info-vazia">
                    <p>📋 Nenhum balizamento gerado para este evento.</p>
                    <p style="font-size: 0.9em; color: #666;">
                        Clique em "Gerar Balizamento Automático" para criar o balizamento dos atletas inscritos.
                    </p>
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

        // Ordenar e renderizar provas (TODAS, com ou sem atletas)
        provasEvento
            .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0))
            .forEach(provaEvento => {
                const detalhes = obterDetalhesProva(provaEvento.id);
                const balProva = balPorProva[provaEvento.id] || []; // Vazio se prova não tem atletas

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
                            <span class="badge">${balProva.length} atleta(s)</span>
                            <button class="btn-adicionar-manual-prova" data-prova-id="${provaEvento.id}" title="Adicionar atleta manualmente">
                                ➕ Adicionar
                            </button>
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

                // Ordenar séries e renderizar
                const series = Object.keys(balPorSerie)
                    .map(s => parseInt(s, 10))
                    .sort((a, b) => a - b);

                series.forEach(numSerie => {
                    const balSerie = balPorSerie[numSerie]
                        .sort((a, b) => a.raia - b.raia);

                    const serieDiv = document.createElement('div');
                    serieDiv.className = 'serie-container';
                    serieDiv.innerHTML = `<h4>🏊 Série ${numSerie}</h4>`;

                    // Criar tabela em vez de cards
                    const tabela = document.createElement('table');
                    tabela.className = 'raias-tabela';
                    tabela.innerHTML = `
                        <thead>
                            <tr>
                                <th>Raia</th>
                                <th>Atleta</th>
                                <th>Clube</th>
                                <th>Melhor Tempo</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;

                    const tbody = tabela.querySelector('tbody');

                    balSerie.forEach(bal => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="raia-cell"><strong>${bal.raia}</strong></td>
                            <td class="atleta-cell">${obterNomeAtleta(bal.atletaId)}</td>
                            <td class="clube-cell">${obterNomeClube(bal.atletaId)}</td>
                            <td class="tempo-cell">⏱️ ${bal.tempoReferencia || 'S/ registro'}</td>
                            <td class="acoes-cell">
                                <button class="btn-reorganizar btn-pequeno" data-balizamento-id="${bal.id}" title="Reorganizar série/raia">↕️</button>
                                <button class="btn-remover-balizamento btn-pequeno" data-balizamento-id="${bal.id}" title="Remover atleta">❌</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    serieDiv.appendChild(tabela);
                    seriesContainer.appendChild(serieDiv);
                });

                balizamentoContainer.appendChild(provaCard);
            });

        // Adicionar event listeners para reorganização
        adicionarListenersBalizamento();
    }

    // ===== EVENT LISTENERS =====
    function adicionarListenersBalizamento() {
        // Reorganizar
        document.querySelectorAll('.btn-reorganizar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const balizamentoId = e.target.dataset.balizamentoId;
                abrirDialogoReorganizar(balizamentoId);
            });
        });

        // Remover
        document.querySelectorAll('.btn-remover-balizamento').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const balizamentoId = e.target.dataset.balizamentoId;
                if (confirm('Deseja remover este atleta do balizamento?')) {
                    removerBalizamento(balizamentoId);
                    renderizarBalizamento();
                    exibirMensagem('Atleta removido do balizamento!', 'sucesso');
                }
            });
        });

        // Adicionar atleta manualmente (por prova)
        document.querySelectorAll('.btn-adicionar-manual-prova').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provaEventoId = e.target.dataset.provaId;
                selectProvaManual.value = provaEventoId;
                carregarAtletasParaAdicaoManual();
                abrirFormularioAdicaoManual();
                // Mover o foco para raia após carregar atletas
                setTimeout(() => {
                    inputSerieManual.focus();
                }, 100);
            });
        });
    }

    function abrirDialogoReorganizar(balizamentoId) {
        const balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
        const bal = balizamentos.find(b => b.id === balizamentoId);

        if (!bal) return;

        const evento = getEventos().find(e => e.id === eventoSelecionado);
        const qtdeRaias = evento?.qtdeRaias || 8;

        // Armazenar dados do balizamento que está sendo editado
        balizamentoEmEdicao = {
            id: balizamentoId,
            provaEventoId: bal.provaEventoId,
            serieAtual: bal.serie,
            raiaAtual: bal.raia,
            qtdeRaias: qtdeRaias
        };

        // Preencher campos de visualização
        modalAtletaDisplay.value = obterNomeAtleta(bal.atletaId);
        modalClubeDisplay.value = obterNomeClube(bal.atletaId);
        modalSerieInput.value = bal.serie;
        modalRaiaInput.value = bal.raia;
        modalErro.style.display = 'none';
        modalWarning.style.display = 'none';
        modalErro.textContent = '';
        modalWarning.textContent = '';

        // Habilitar botão salvar
        btnSalvarReorganizacao.disabled = false;

        // Mostrar modal
        modalReorganizar.style.display = 'flex';
        modalSerieInput.focus();
    }

    // Função para validar e salvar reorganização
    function salvarReorganizacao() {
        if (!balizamentoEmEdicao) return;

        const novaSerie = parseInt(modalSerieInput.value, 10);
        const novaRaia = parseInt(modalRaiaInput.value, 10);
        const qtdeRaias = balizamentoEmEdicao.qtdeRaias;

        // Limpar erros anteriores
        modalErro.style.display = 'none';
        modalWarning.style.display = 'none';
        modalErro.textContent = '';
        modalWarning.textContent = '';

        // Validações
        if (isNaN(novaSerie) || novaSerie < 1) {
            modalErro.textContent = 'Série deve ser um número maior que zero!';
            modalErro.style.display = 'block';
            modalSerieInput.focus();
            return;
        }

        if (isNaN(novaRaia) || novaRaia < 1 || novaRaia > qtdeRaias) {
            modalErro.textContent = `Raia deve estar entre 1 e ${qtdeRaias}!`;
            modalErro.style.display = 'block';
            modalRaiaInput.focus();
            return;
        }

        // Verificar se já existe atleta nessa série/raia (exceto o atual)
        if (verificarBalizamentoDuplicado(
            balizamentoEmEdicao.provaEventoId,
            novaSerie,
            novaRaia,
            balizamentoEmEdicao.id
        )) {
            modalErro.textContent = '❌ Já existe um atleta nessa série/raia!';
            modalErro.style.display = 'block';
            return;
        }

        // Verificar se mudou algo
        if (novaSerie === balizamentoEmEdicao.serieAtual && novaRaia === balizamentoEmEdicao.raiaAtual) {
            modalWarning.textContent = '⚠️ Série e raia são iguais às atuais. Nenhuma alteração será feita.';
            modalWarning.style.display = 'block';
            return;
        }

        // Atualizar balizamento
        const resultado = atualizarBalizamento(balizamentoEmEdicao.id, novaSerie, novaRaia);
        if (resultado.sucesso) {
            fecharModalReorganizar();
            renderizarBalizamento();
            exibirMensagem(
                `✓ Atleta movido para Série ${novaSerie}, Raia ${novaRaia}!`,
                'sucesso'
            );
        } else {
            modalErro.textContent = `✗ Erro: ${resultado.mensagem}`;
            modalErro.style.display = 'block';
        }
    }

    // Função para fechar modal
    function fecharModalReorganizar() {
        modalReorganizar.style.display = 'none';
        balizamentoEmEdicao = null;
        modalAtletaDisplay.value = '';
        modalClubeDisplay.value = '';
        modalSerieInput.value = '';
        modalRaiaInput.value = '';
        modalErro.style.display = 'none';
        modalWarning.style.display = 'none';
    }

    // Event listeners do modal
    btnSalvarReorganizacao.addEventListener('click', salvarReorganizacao);
    btnCancelarReorganizacao.addEventListener('click', fecharModalReorganizar);
    btnFecharModal.addEventListener('click', fecharModalReorganizar);

    // Fechar modal ao clicar fora
    modalReorganizar.addEventListener('click', (e) => {
        if (e.target === modalReorganizar) {
            fecharModalReorganizar();
        }
    });

    // Permitir Enter para salvar
    modalSerieInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarReorganizacao();
    });

    modalRaiaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarReorganizacao();
    });

    // ===== EVENT LISTENERS PRINCIPAIS =====
    eventoSelect.addEventListener('change', (e) => {
        eventoSelecionado = e.target.value || null;
        
        // Atualizar disponibilidade dos botões
        const temBalizamento = eventoSelecionado && getBalizamentos(eventoSelecionado).length > 0;
        btnImprimirBalizamento.disabled = !temBalizamento;
        
        renderizarBalizamento();
    });

    btnGerarBalizamento.addEventListener('click', () => {
        if (!eventoSelecionado) {
            exibirMensagem('Selecione um evento primeiro!', 'erro');
            return;
        }

        const evento = getEventos().find(e => e.id === eventoSelecionado);
        if (evento && evento.isFinalizado) {
            exibirMensagem('Não é possível gerar balizamento para evento finalizado!', 'erro');
            return;
        }

        // Validar pré-requisitos
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
    });

    btnLimparBalizamento.addEventListener('click', () => {
        if (!eventoSelecionado) {
            exibirMensagem('Selecione um evento primeiro!', 'erro');
            return;
        }

        if (confirm('Deseja remover todos os balizamentos deste evento?')) {
            removerBalizamentosPorEvento(eventoSelecionado);
            renderizarBalizamento();
            exibirMensagem('Balizamento removido!', 'sucesso');
        }
    });

    btnImprimirBalizamento.addEventListener('click', () => {
        imprimirBalizamento();
    });

    selectProvaManual.addEventListener('change', () => {
        carregarAtletasParaAdicaoManual();
    });

    btnAdicionarAtletaManual.addEventListener('click', () => {
        adicionarAtletaManualmente();
    });

    btnCancelarAdicionar.addEventListener('click', () => {
        fecharFormularioAdicaoManual();
    });

    // ===== INICIALIZAÇÃO =====
    carregarEventos();
    renderizarBalizamento();
});
