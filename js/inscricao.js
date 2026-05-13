// js-temp/inscricao.js - Gerenciamento de Inscrições no Evento

let eventoSelecionadoId = null;

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();

    document.getElementById('select-evento').addEventListener('change', onEventoChange);
    document.getElementById('filtro-clube').addEventListener('change', () => {
        carregarFiltroAtletas();
        renderizarClubesAtletas();
    });
    document.getElementById('filtro-atleta').addEventListener('change', renderizarClubesAtletas);
});

// ===== CARREGAMENTO DE DADOS =====

function carregarEventos() {
    const select = document.getElementById('select-evento');
    const eventos = getEventos();
    select.innerHTML = '<option value="">-- Selecione um evento --</option>';
    eventos.forEach(evt => {
        const opt = document.createElement('option');
        opt.value = evt.id;
        opt.textContent = evt.nome + (evt.isFinalizado ? ' [Finalizado]' : '');
        select.appendChild(opt);
    });
}

function onEventoChange() {
    eventoSelecionadoId = document.getElementById('select-evento').value;
    const painel = document.getElementById('painel-inscricoes');

    if (!eventoSelecionadoId) {
        painel.style.display = 'none';
        return;
    }

    painel.style.display = 'block';
    mostrarInfoEvento();
    carregarFiltroClubes();
    carregarFiltroAtletas();
    renderizarClubesAtletas();
}

function mostrarInfoEvento() {
    const eventos = getEventos();
    const evento = eventos.find(e => e.id === eventoSelecionadoId);
    if (!evento) return;

    const provasEvento = getProvasEvento(eventoSelecionadoId);
    const infoBox = document.getElementById('info-evento');
    infoBox.innerHTML = `
        <strong>${evento.nome}</strong> &nbsp;|&nbsp;
        ${evento.local} &nbsp;|&nbsp;
        ${evento.dataEvento ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não informada'} &nbsp;|&nbsp;
        <strong>${provasEvento.length}</strong> prova(s) cadastrada(s)
        ${evento.isFinalizado ? '<span class="badge-finalizado">FINALIZADO</span>' : ''}
    `;
}

function carregarFiltroClubes() {
    const clubes = getClubes();

    const filtro = document.getElementById('filtro-clube');
    const valorAtual = filtro.value;
    filtro.innerHTML = '<option value="">Todos os clubes</option>';

    clubes
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(clube => {
            const opt = document.createElement('option');
            opt.value = clube.id;
            opt.textContent = clube.nome;
            filtro.appendChild(opt);
        });

    // Mantém a seleção anterior quando possível
    if (valorAtual && clubes.some(clube => clube.id === valorAtual)) {
        filtro.value = valorAtual;
    }
}

function carregarFiltroAtletas() {
    const filtroAtleta = document.getElementById('filtro-atleta');
    const valorAtual = filtroAtleta.value;
    const filtroClube = document.getElementById('filtro-clube').value;

    filtroAtleta.innerHTML = '<option value="">Todos os atletas</option>';

    if (!eventoSelecionadoId) {
        return;
    }

    const atletas = getAtletas();
    const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);

    const atletasElegiveis = atletas
        .filter(atleta => !filtroClube || atleta.clubeId === filtroClube)
        .filter(atleta => {
            if (provasEvento.length === 0) {
                return true;
            }
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

// ===== RENDERIZAÇÃO =====

function renderizarClubesAtletas() {
    const container = document.getElementById('lista-clubes-atletas');
    container.innerHTML = '';

    if (!eventoSelecionadoId) return;

    const filtroClube = document.getElementById('filtro-clube').value;
    const filtroAtleta = document.getElementById('filtro-atleta').value;
    const atletas = getAtletas();
    const clubes = getClubes();
    const provasEvento = getProvasEventoDetalhadas(eventoSelecionadoId);
    const evento = getEventos().find(e => e.id === eventoSelecionadoId);
    const finalizado = evento && evento.isFinalizado;

    if (provasEvento.length === 0) {
        container.innerHTML = '<p class="msg-vazio">Este evento não possui provas geradas. Acesse "Gerenciar Provas do Evento" antes de realizar inscrições.</p>';
        return;
    }

    const clubesMap = {};
    clubes.forEach(c => { clubesMap[c.id] = c; });

    // Agrupa atletas por clube, filtrando apenas elegíveis
    const atletasPorClube = {};
    atletas
        .filter(atleta => !filtroClube || atleta.clubeId === filtroClube)
        .filter(atleta => !filtroAtleta || atleta.id === filtroAtleta)
        .forEach(atleta => {
            const categoriaAtleta = atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id;
            const provasAtleta = provasEvento.filter(pe =>
                pe.sexo === atleta.sexo && pe.categoriaId === categoriaAtleta
            );
            if (provasAtleta.length === 0) return; // Atleta sem provas compatíveis

            if (!atletasPorClube[atleta.clubeId]) {
                atletasPorClube[atleta.clubeId] = { clube: clubesMap[atleta.clubeId], atletas: [] };
            }
            atletasPorClube[atleta.clubeId].atletas.push({ atleta, provasAtleta });
        });

    if (Object.keys(atletasPorClube).length === 0) {
        container.innerHTML = '<p class="msg-vazio">Nenhum atleta elegível encontrado para este evento.</p>';
        return;
    }

    Object.values(atletasPorClube)
        .sort((a, b) => (a.clube?.nome || '').localeCompare(b.clube?.nome || ''))
        .forEach(({ clube, atletas: atletasList }) => {
            const secaoClube = document.createElement('div');
            secaoClube.className = 'clube-section';

            const totalInscritos = atletasList.filter(({ atleta }) =>
                getInscricoesPorAtletaEvento(atleta.id, eventoSelecionadoId).length > 0
            ).length;

            secaoClube.innerHTML = `
                <div class="clube-header">
                    <h3>${clube?.nome || 'Clube desconhecido'}</h3>
                    <span class="clube-stats">${atletasList.length} atleta(s) elegível(is) | ${totalInscritos} com inscrição</span>
                </div>
            `;

            const tabelaAtletas = document.createElement('div');
            tabelaAtletas.className = 'atletas-inscricao-lista';

            atletasList
                .sort((a, b) => a.atleta.nome.localeCompare(b.atleta.nome))
                .forEach(({ atleta, provasAtleta }) => {
                    tabelaAtletas.appendChild(
                        renderizarAtletaInscricao(atleta, provasAtleta, finalizado)
                    );
                });

            secaoClube.appendChild(tabelaAtletas);
            container.appendChild(secaoClube);
        });
}

function renderizarAtletaInscricao(atleta, provasAtleta, finalizado) {
    const inscricoesAtleta = getInscricoesPorAtletaEvento(atleta.id, eventoSelecionadoId);
    const idsInscritos = new Set(inscricoesAtleta.map(i => i.eventoProvaId));
    const qtdInscricoes = inscricoesAtleta.length;

    const card = document.createElement('div');
    card.className = 'atleta-inscricao-card';
    card.dataset.atletaId = atleta.id;

    card.innerHTML = `
        <div class="atleta-inscricao-header" onclick="toggleAtletaProvas('${atleta.id}')">
            <div class="atleta-inscricao-info">
                <span class="atleta-nome">${atleta.nome}</span>
                <span class="atleta-detalhes">${atleta.sexo} &bull; Nasc. ${atleta.anoNascimento}</span>
            </div>
            <div class="atleta-inscricao-status">
                <span class="badge-inscricoes ${qtdInscricoes > 0 ? 'ativo' : ''}">${qtdInscricoes} prova(s)</span>
                <span class="toggle-icon">&#9660;</span>
            </div>
        </div>
        <div class="atleta-provas-container" id="provas-${atleta.id}" style="display:none">
            <div class="provas-grid">
                ${provasAtleta.map(pe => {
                    const inscrito = idsInscritos.has(pe.id);
                    const melhoresTempos = getMelhoresTempos(atleta.id);
                    const melhorTempo = melhoresTempos.find(mt => mt.provaId === pe.provaId);
                    const tempoLabel = melhorTempo ? `<span class="tempo-ref">${melhorTempo.tempo}</span>` : '<span class="tempo-ref sem-tempo">s/tempo</span>';
                    const disabled = finalizado ? 'disabled' : '';
                    return `
                        <label class="prova-check-label ${inscrito ? 'inscrito' : ''}" id="label-${atleta.id}-${pe.id}">
                            <input type="checkbox"
                                ${inscrito ? 'checked' : ''}
                                ${disabled}
                                onchange="toggleInscricao('${atleta.id}', '${pe.id}', this.checked)"
                            />
                            <span class="prova-check-numero">#${pe.numeroProva}</span>
                            <span class="prova-check-nome">${pe.provaNome}</span>
                            <span class="prova-check-categoria">${pe.categoriaNome}</span>
                            ${tempoLabel}
                        </label>
                    `;
                }).join('')}
            </div>
            ${!finalizado ? `
            <div class="atleta-acoes-inscricao">
                <button class="btn-secondary btn-sm" onclick="inscreverTodasProvas('${atleta.id}')">Inscrever em Todas</button>
                <button class="btn-danger btn-sm" onclick="removerTodasInscricoes('${atleta.id}')">Remover Todas</button>
            </div>` : ''}
        </div>
    `;

    return card;
}

// ===== AÇÕES =====

function toggleAtletaProvas(atletaId) {
    const container = document.getElementById(`provas-${atletaId}`);
    const card = document.querySelector(`[data-atleta-id="${atletaId}"]`);
    const icon = card.querySelector('.toggle-icon');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.innerHTML = '&#9650;';
    } else {
        container.style.display = 'none';
        icon.innerHTML = '&#9660;';
    }
}

function toggleInscricao(atletaId, provaEventoId, checked) {
    if (checked) {
        const resultado = salvarInscricao(atletaId, provaEventoId);
        if (!resultado.sucesso) {
            alert(resultado.mensagem);
            // Reverte o checkbox
            const cb = document.querySelector(`input[onchange*="'${atletaId}', '${provaEventoId}'"]`);
            if (cb) cb.checked = false;
            return;
        }
    } else {
        removerInscricao(atletaId, provaEventoId);
    }
    atualizarBadgeAtleta(atletaId);
    atualizarLabelProva(atletaId, provaEventoId, checked);
    atualizarEstatisticasClube(atletaId);
}

function inscreverTodasProvas(atletaId) {
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
}

function removerTodasInscricoes(atletaId) {
    if (!confirm('Remover todas as inscrições deste atleta neste evento?')) return;
    const inscricoes = getInscricoesPorAtletaEvento(atletaId, eventoSelecionadoId);
    inscricoes.forEach(i => removerInscricao(atletaId, i.eventoProvaId));
    atualizarCardAtleta(atletaId);
}

// ===== ATUALIZAÇÃO PARCIAL DA UI =====

function atualizarBadgeAtleta(atletaId) {
    const inscricoes = getInscricoesPorAtletaEvento(atletaId, eventoSelecionadoId);
    const qtd = inscricoes.length;
    const badge = document.querySelector(`[data-atleta-id="${atletaId}"] .badge-inscricoes`);
    if (badge) {
        badge.textContent = `${qtd} prova(s)`;
        badge.className = `badge-inscricoes ${qtd > 0 ? 'ativo' : ''}`;
    }
}

function atualizarLabelProva(atletaId, provaEventoId, inscrito) {
    const label = document.getElementById(`label-${atletaId}-${provaEventoId}`);
    if (label) {
        if (inscrito) {
            label.classList.add('inscrito');
        } else {
            label.classList.remove('inscrito');
        }
    }
}

function atualizarEstatisticasClube(atletaId) {
    const atleta = getAtletas().find(a => a.id === atletaId);
    if (!atleta) return;
    const secaoClube = document.querySelector(`[data-atleta-id="${atletaId}"]`)?.closest('.clube-section');
    if (!secaoClube) return;
    const stats = secaoClube.querySelector('.clube-stats');
    if (!stats) return;

    const atletasList = Array.from(secaoClube.querySelectorAll('.atleta-inscricao-card'));
    const totalAtletas = atletasList.length;
    const comInscricao = atletasList.filter(card => {
        const aId = card.dataset.atletaId;
        return getInscricoesPorAtletaEvento(aId, eventoSelecionadoId).length > 0;
    }).length;

    stats.textContent = `${totalAtletas} atleta(s) elegível(is) | ${comInscricao} com inscrição`;
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
    // Mantém o painel de provas aberto após atualização
    const provasContainer = novoCard.querySelector(`#provas-${atletaId}`);
    if (provasContainer) provasContainer.style.display = 'block';
    const icon = novoCard.querySelector('.toggle-icon');
    if (icon) icon.innerHTML = '&#9650;';

    cardAntigo.replaceWith(novoCard);
    atualizarEstatisticasClube(atletaId);
}
