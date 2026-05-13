// js/main.js - Cadastro de Atletas (Novo DER Normalizado)
document.addEventListener('DOMContentLoaded', () => {
    const anoNascimentoInput = document.getElementById('ano-nascimento');
    const categoriaDisplay = document.getElementById('categoria-display');
    const clubeSelect = document.getElementById('clube-select');
    const formAtleta = document.getElementById('form-atleta');
    const listaAtletasContainer = document.getElementById('lista-atletas-container');
    const formTituloAtleta = document.getElementById('form-titulo-atleta');
    const btnCancelarEdicaoAtleta = document.getElementById('btn-cancelar-edicao-atleta');
    const secaoMelhoresTempos = document.getElementById('secao-melhores-tempos');
    const provaSelect = document.querySelector('.prova-select');
    const tempoInput = document.querySelector('.tempo-input');
    const btnAdicionarTempo = document.querySelector('.btn-adicionar-tempo');
    const tabelaMelhoresTempos = document.getElementById('tabela-melhores-tempos');
    const tbodyMelhoresTempos = document.getElementById('tbody-melhores-tempos');
    const secaoInscricoesEvento = document.getElementById('secao-inscricoes-evento');
    const eventoInscricaoSelect = document.getElementById('evento-inscricao-select');
    const listaProvasInscricaoContainer = document.getElementById('lista-provas-inscricao-container');

    let categoriaAtualId = '';
    let atletaEmEdicaoId = null;
    let temposSelecionados = [];

    function carregarClubes() {
        const clubes = getClubes();
        clubeSelect.innerHTML = '<option value="">Selecione um clube</option>';
        clubes.forEach(clube => {
            const option = document.createElement('option');
            option.value = clube.id;
            option.textContent = clube.nome;
            clubeSelect.appendChild(option);
        });
    }

    function carregarProvas() {
        const provas = getProvas();
        provaSelect.innerHTML = '<option value="">Selecione uma prova</option>';
        provas.forEach(prova => {
            const option = document.createElement('option');
            option.value = prova.id;
            option.textContent = prova.nome;
            provaSelect.appendChild(option);
        });
    }

    function atualizarCategoria() {
        const ano = anoNascimentoInput.value;
        if (ano) {
            const categoria = getCategoriaAtleta(ano);
            if (categoria) {
                categoriaAtualId = categoria.id;
                categoriaDisplay.textContent = categoria.nome;
            } else {
                categoriaAtualId = '';
                categoriaDisplay.textContent = 'Categoria não encontrada para este ano';
            }
        } else {
            categoriaAtualId = '';
            categoriaDisplay.textContent = 'Preencha o ano de nascimento';
        }

        if (atletaEmEdicaoId) {
            renderizarInscricoesEvento();
        }
    }

    function carregarEventosInscricao() {
        const eventos = getEventos();
        const valorAtual = eventoInscricaoSelect.value;

        eventoInscricaoSelect.innerHTML = '<option value="">Selecione um evento</option>';
        eventos.forEach(evento => {
            const option = document.createElement('option');
            option.value = evento.id;
            option.textContent = `${evento.nome}${evento.isFinalizado ? ' [Finalizado]' : ''}`;
            eventoInscricaoSelect.appendChild(option);
        });

        if (valorAtual && eventos.some(evento => String(evento.id) === String(valorAtual))) {
            eventoInscricaoSelect.value = valorAtual;
        }
    }

    function renderizarInscricoesEvento() {
        listaProvasInscricaoContainer.innerHTML = '';

        if (!atletaEmEdicaoId) {
            return;
        }

        const eventoId = eventoInscricaoSelect.value;
        if (!eventoId) {
            listaProvasInscricaoContainer.innerHTML = '<p>Selecione um evento para gerenciar as inscrições.</p>';
            return;
        }

        const atleta = getAtletas().find(item => String(item.id) === String(atletaEmEdicaoId));
        if (!atleta) {
            listaProvasInscricaoContainer.innerHTML = '<p>Atleta não encontrado.</p>';
            return;
        }

        const evento = getEventos().find(item => String(item.id) === String(eventoId));
        const eventoFinalizado = evento?.isFinalizado;
        const sexoAtual = document.querySelector('input[name="sexo"]:checked')?.value || atleta.sexo;
        const categoriaIdAtual = categoriaAtualId || atleta.categoriaId;

        const provasElegiveis = getProvasEventoDetalhadas(eventoId)
            .filter(provaEvento => provaEvento.sexo === sexoAtual && provaEvento.categoriaId === categoriaIdAtual)
            .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0));

        if (provasElegiveis.length === 0) {
            listaProvasInscricaoContainer.innerHTML = '<p>Nenhuma prova elegível para este atleta neste evento.</p>';
            return;
        }

        const inscricoes = getInscricoesPorAtletaEvento(atletaEmEdicaoId, eventoId);
        const inscricoesSet = new Set(inscricoes.map(item => item.eventoProvaId));

        const wrapper = document.createElement('div');
        wrapper.className = 'provas-grid';

        provasElegiveis.forEach(provaEvento => {
            const inscrito = inscricoesSet.has(provaEvento.id);
            const label = document.createElement('label');
            label.className = `prova-check-label ${inscrito ? 'inscrito' : ''}`;
            label.innerHTML = `
                <input
                    type="checkbox"
                    data-evento-id="${eventoId}"
                    data-prova-evento-id="${provaEvento.id}"
                    ${inscrito ? 'checked' : ''}
                    ${eventoFinalizado ? 'disabled' : ''}
                />
                <span class="prova-check-numero">#${provaEvento.numeroProva}</span>
                <span class="prova-check-nome">${provaEvento.provaNome}</span>
                <span class="prova-check-categoria">${provaEvento.categoriaNome}</span>
            `;
            wrapper.appendChild(label);
        });

        if (eventoFinalizado) {
            const aviso = document.createElement('p');
            aviso.className = 'msg-vazio';
            aviso.style.padding = '0.5rem 0';
            aviso.textContent = 'Evento finalizado: não é possível alterar inscrições.';
            listaProvasInscricaoContainer.appendChild(aviso);
        }

        listaProvasInscricaoContainer.appendChild(wrapper);
    }

    function validarFormatoTempo(tempo) {
        const regex = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
        const match = tempo.match(regex);
        if (!match) {
            return false;
        }

        const minutos = parseInt(match[1], 10);
        const segundos = parseInt(match[2], 10);
        const centesimos = match[3] ? parseInt(match[3], 10) : 0;
        return !(minutos > 59 || segundos > 59 || centesimos > 99);
    }

    function getNomeClube(clubeId) {
        const clube = getClubes().find(item => String(item.id) === String(clubeId));
        return clube ? clube.nome : 'Clube não encontrado';
    }

    function getNomeCategoria(categoriaId) {
        const categoria = getCategorias().find(item => item.id === categoriaId);
        return categoria ? categoria.nome : 'Categoria não encontrada';
    }

    function renderizarTabelaMelhoresTempos() {
        tbodyMelhoresTempos.innerHTML = '';

        if (temposSelecionados.length === 0) {
            tabelaMelhoresTempos.style.display = 'none';
            return;
        }

        tabelaMelhoresTempos.style.display = 'table';
        temposSelecionados.forEach((tempo, indice) => {
            const provaObj = getProvas().find(p => String(p.id) === String(tempo.provaId));
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${provaObj ? provaObj.nome : 'Prova não encontrada'}</td>
                <td>${tempo.tempo}</td>
                <td>
                    <button type="button" class="btn-remover-tempo" data-indice="${indice}">Remover</button>
                </td>
            `;
            tbodyMelhoresTempos.appendChild(linha);
        });

        document.querySelectorAll('.btn-remover-tempo').forEach(btn => {
            btn.addEventListener('click', () => {
                const indice = parseInt(btn.dataset.indice, 10);
                temposSelecionados.splice(indice, 1);
                renderizarTabelaMelhoresTempos();
            });
        });
    }

    function renderizarListaAtletas() {
        const atletas = getAtletas();
        listaAtletasContainer.innerHTML = '';

        if (atletas.length === 0) {
            listaAtletasContainer.innerHTML = '<p>Nenhum atleta cadastrado.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Clube</th>
                    <th>Sexo</th>
                    <th>Ano</th>
                    <th>Categoria</th>
                    <th>Ação</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement('tbody');
        atletas.forEach(atleta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${atleta.nome}</td>
                <td>${getNomeClube(atleta.clubeId)}</td>
                <td>${atleta.sexo}</td>
                <td>${atleta.anoNascimento}</td>
                <td>${getNomeCategoria(atleta.categoriaId)}</td>
                <td class="coluna-acoes">
                    <button type="button" class="btn-editar-categoria" data-id="${atleta.id}">Editar</button>
                    <button type="button" class="btn-remover-atleta" data-id="${atleta.id}">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        listaAtletasContainer.appendChild(table);
    }

    function entrarModoNovoCadastro() {
        atletaEmEdicaoId = null;
        temposSelecionados = [];
        formAtleta.reset();
        categoriaAtualId = '';
        categoriaDisplay.textContent = 'Preencha o ano de nascimento';
        formTituloAtleta.textContent = 'Cadastrar Novo Atleta';
        formAtleta.querySelector('button[type="submit"]').textContent = 'Cadastrar';
        btnCancelarEdicaoAtleta.style.display = 'none';
        secaoMelhoresTempos.style.display = 'none';
        secaoInscricoesEvento.style.display = 'none';
        eventoInscricaoSelect.value = '';
        listaProvasInscricaoContainer.innerHTML = '';
        renderizarTabelaMelhoresTempos();
    }

    function abrirEdicaoAtleta(atletaId) {
        const atleta = getAtletas().find(item => String(item.id) === String(atletaId));
        if (!atleta) {
            alert('Atleta não encontrado.');
            return;
        }

        atletaEmEdicaoId = atleta.id;
        document.getElementById('nome-atleta').value = atleta.nome;
        clubeSelect.value = atleta.clubeId;
        anoNascimentoInput.value = atleta.anoNascimento;
        document.getElementById('sexo-masculino').checked = atleta.sexo === 'Masculino';
        document.getElementById('sexo-feminino').checked = atleta.sexo === 'Feminino';
        atualizarCategoria();

        temposSelecionados = getMelhoresTemposAtleta(atleta.id).map(item => ({
            provaId: item.provaId,
            tempo: item.tempo
        }));

        formTituloAtleta.textContent = 'Editar Atleta';
        formAtleta.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
        btnCancelarEdicaoAtleta.style.display = 'inline-block';
        secaoMelhoresTempos.style.display = 'block';
        secaoInscricoesEvento.style.display = 'block';
        carregarEventosInscricao();
        renderizarInscricoesEvento();
        renderizarTabelaMelhoresTempos();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnAdicionarTempo.addEventListener('click', (e) => {
        e.preventDefault();

        if (!atletaEmEdicaoId) {
            return;
        }

        if (!provaSelect.value) {
            alert('Por favor, selecione uma prova.');
            return;
        }

        if (!tempoInput.value) {
            alert('Por favor, informe o tempo.');
            return;
        }

        if (!validarFormatoTempo(tempoInput.value.trim())) {
            alert('Formato de tempo inválido. Use MM:SS ou MM:SS:CC');
            return;
        }

        if (temposSelecionados.some(t => String(t.provaId) === String(provaSelect.value))) {
            alert('Já existe tempo cadastrado para essa prova. Remova o atual para adicionar outro.');
            return;
        }

        temposSelecionados.push({
            provaId: provaSelect.value,
            tempo: tempoInput.value.trim()
        });

        provaSelect.value = '';
        tempoInput.value = '';
        renderizarTabelaMelhoresTempos();
    });

    anoNascimentoInput.addEventListener('input', atualizarCategoria);

    document.querySelectorAll('input[name="sexo"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (atletaEmEdicaoId) {
                renderizarInscricoesEvento();
            }
        });
    });

    eventoInscricaoSelect.addEventListener('change', () => {
        renderizarInscricoesEvento();
    });

    listaProvasInscricaoContainer.addEventListener('change', (event) => {
        const target = event.target;
        if (!target.matches('input[type="checkbox"][data-prova-evento-id]')) {
            return;
        }

        if (!atletaEmEdicaoId) {
            target.checked = !target.checked;
            return;
        }

        const provaEventoId = target.dataset.provaEventoId;
        if (target.checked) {
            const resultado = salvarInscricao(atletaEmEdicaoId, provaEventoId);
            if (!resultado.sucesso) {
                alert(`Erro ao inscrever: ${resultado.mensagem}`);
                target.checked = false;
            }
        } else {
            removerInscricao(atletaEmEdicaoId, provaEventoId);
        }

        const label = target.closest('label');
        if (label) {
            if (target.checked) {
                label.classList.add('inscrito');
            } else {
                label.classList.remove('inscrito');
            }
        }
    });

    btnCancelarEdicaoAtleta.addEventListener('click', () => {
        entrarModoNovoCadastro();
    });

    listaAtletasContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover-atleta')) {
            const atletaId = event.target.dataset.id;
            if (confirm('Tem certeza que deseja remover este atleta?')) {
                removerAtleta(atletaId);
                if (String(atletaEmEdicaoId) === String(atletaId)) {
                    entrarModoNovoCadastro();
                }
                renderizarListaAtletas();
            }
        }

        if (event.target.classList.contains('btn-editar-categoria')) {
            abrirEdicaoAtleta(event.target.dataset.id);
        }
    });

    formAtleta.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome-atleta').value.trim();
        const sexoSelecionado = document.querySelector('input[name="sexo"]:checked');
        const anoNascimento = parseInt(anoNascimentoInput.value, 10);

        if (!nome) {
            alert('Por favor, preencha o nome do atleta.');
            return;
        }

        if (!clubeSelect.value) {
            alert('Por favor, selecione um clube.');
            return;
        }

        if (!sexoSelecionado) {
            alert('Por favor, selecione o sexo do atleta.');
            return;
        }

        if (!categoriaAtualId) {
            alert('Categoria não pôde ser determinada. Verifique o ano de nascimento.');
            return;
        }

        if (atletaEmEdicaoId) {
            const atletaDuplicado = getAtletas().some(atleta =>
                String(atleta.id) !== String(atletaEmEdicaoId)
                && atleta.nome.toLowerCase() === nome.toLowerCase()
                && String(atleta.clubeId) === String(clubeSelect.value)
            );

            if (atletaDuplicado) {
                alert('Erro: Já existe outro atleta com este nome neste clube.');
                return;
            }

            const atletaAtualizado = {
                id: atletaEmEdicaoId,
                nome: nome,
                clubeId: clubeSelect.value,
                sexo: sexoSelecionado.value,
                anoNascimento: anoNascimento,
                categoriaId: categoriaAtualId
            };

            const sucessoAtualizacao = atualizarAtleta(atletaEmEdicaoId, atletaAtualizado);
            if (!sucessoAtualizacao) {
                alert('Não foi possível atualizar o atleta.');
                return;
            }

            removerMelhoresTemposAtleta(atletaEmEdicaoId);
            if (temposSelecionados.length > 0) {
                salvarMelhoresTemposlista(atletaEmEdicaoId, temposSelecionados);
            }

            alert('Atleta atualizado com sucesso!');
            entrarModoNovoCadastro();
            renderizarListaAtletas();
            return;
        }

        const novoAtleta = {
            id: Date.now().toString(),
            nome: nome,
            clubeId: clubeSelect.value,
            sexo: sexoSelecionado.value,
            anoNascimento: anoNascimento,
            categoriaId: categoriaAtualId
        };

        const sucesso = salvarAtleta(novoAtleta);
        if (!sucesso) {
            alert('Erro: Este atleta já está cadastrado neste clube!');
            return;
        }

        // Salvar melhores tempos para novo atleta
        if (temposSelecionados.length > 0) {
            salvarMelhoresTemposlista(novoAtleta.id, temposSelecionados);
        }

        alert('Atleta cadastrado com sucesso!');
        entrarModoNovoCadastro();
        renderizarListaAtletas();
    });

    carregarClubes();
    carregarProvas();
    carregarEventosInscricao();
    entrarModoNovoCadastro();
    renderizarListaAtletas();
});
