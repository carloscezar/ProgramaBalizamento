// /js/database.js - Database Layer com Normalização DER

// ===== FUNÇÕES DE GERENCIAMENTO DE CATEGORIAS =====

function getCategorias() {
    let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    if (categorias.length === 0) {
        categorias = [
            { id: "cat-001", nome: "Pré-Mirim", anoInicial: 2017, anoFinal: 2018, ativo: true },
            { id: "cat-002", nome: "Mirim 1", anoInicial: 2016, anoFinal: 2016, ativo: true },
            { id: "cat-003", nome: "Mirim 2", anoInicial: 2015, anoFinal: 2015, ativo: true },
            { id: "cat-004", nome: "Petiz 1", anoInicial: 2014, anoFinal: 2014, ativo: true },
            { id: "cat-005", nome: "Petiz 2", anoInicial: 2013, anoFinal: 2013, ativo: true },
            { id: "cat-006", nome: "Infantil 1", anoInicial: 2012, anoFinal: 2012, ativo: true },
            { id: "cat-007", nome: "Infantil 2", anoInicial: 2011, anoFinal: 2011, ativo: true },
            { id: "cat-008", nome: "Juvenil 1", anoInicial: 2010, anoFinal: 2010, ativo: true },
            { id: "cat-009", nome: "Juvenil 2", anoInicial: 2009, anoFinal: 2009, ativo: true },
            { id: "cat-010", nome: "Júnior", anoInicial: 2006, anoFinal: 2008, ativo: true },
            { id: "cat-011", nome: "Sênior", anoInicial: 1950, anoFinal: 2005, ativo: true }
        ];
        localStorage.setItem('categorias', JSON.stringify(categorias));
    }
    return categorias;
}

function getCategoriaAtleta(anoNascimento) {
    const categorias = getCategorias();
    const ano = parseInt(anoNascimento, 10);
    return categorias.find(cat => ano >= cat.anoInicial && ano <= cat.anoFinal);
}

function salvarCategoria(novaCategoria) {
    let categorias = getCategorias();
    const categoriaExistente = categorias.some(
        cat => cat.nome.toLowerCase() === novaCategoria.nome.toLowerCase()
    );
    if (categoriaExistente) {
        return false;
    }
    categorias.push(novaCategoria);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    return true;
}

function atualizarCategoria(categoriaAtualizada) {
    let categorias = getCategorias();
    const index = categorias.findIndex(c => c.id === categoriaAtualizada.id);
    if (index >= 0) {
        categorias[index] = categoriaAtualizada;
        localStorage.setItem('categorias', JSON.stringify(categorias));
        return true;
    }
    return false;
}

function removerCategoria(categoriaId) {
    let categorias = getCategorias();
    categorias = categorias.filter(cat => cat.id !== categoriaId);
    localStorage.setItem('categorias', JSON.stringify(categorias));
}

function verificarCategoriaAssociadaAAtleta(categoriaId) {
    const atletas = getAtletas();
    return atletas.some(atleta => atleta.categoriaId === categoriaId);
}

function verificarSobreposicaoAnos(anoInicial, anoFinal, categoriaIdExcluir = null) {
    const categorias = getCategorias();
    for (const cat of categorias) {
        if (categoriaIdExcluir && cat.id === categoriaIdExcluir) continue;
        if (anoInicial <= cat.anoFinal && anoFinal >= cat.anoInicial) {
            return true;
        }
    }
    return false;
}

// ===== FUNÇÕES DE GERENCIAMENTO DE CLUBES =====

function getClubes() {
    return JSON.parse(localStorage.getItem('clubes')) || [];
}

function salvarClube(novoClube) {
    let clubes = getClubes();
    const clubeExistente = clubes.some(c => c.nome.toLowerCase() === novoClube.nome.toLowerCase());
    if (clubeExistente) {
        return false;
    }
    clubes.push(novoClube);
    localStorage.setItem('clubes', JSON.stringify(clubes));
    return true;
}

function removerClube(clubeId) {
    let clubes = getClubes();
    clubes = clubes.filter(clube => clube.id !== clubeId);
    localStorage.setItem('clubes', JSON.stringify(clubes));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE ATLETAS =====

function getAtletas() {
    return JSON.parse(localStorage.getItem('atletas')) || [];
}

function salvarAtleta(novoAtleta) {
    const atletas = getAtletas();
    const atletaDuplicado = atletas.some(
        atleta => atleta.nome.toLowerCase() === novoAtleta.nome.toLowerCase() &&
                  atleta.clubeId === novoAtleta.clubeId
    );
    if (atletaDuplicado) {
        return false;
    }
    atletas.push(novoAtleta);
    localStorage.setItem('atletas', JSON.stringify(atletas));
    return true;
}

function atualizarAtleta(atletaId, atletaAtualizado) {
    let atletas = getAtletas();
    const index = atletas.findIndex(a => a.id === atletaId);
    if (index >= 0) {
        atletas[index] = atletaAtualizado;
        localStorage.setItem('atletas', JSON.stringify(atletas));
        return true;
    }
    return false;
}

function removerAtleta(atletaId) {
    let atletas = getAtletas();
    atletas = atletas.filter(atleta => atleta.id !== atletaId);
    localStorage.setItem('atletas', JSON.stringify(atletas));
    removerMelhoresTemposAtleta(atletaId);
    removerInscricoesPorAtleta(atletaId);
    removerBalizamentosPorAtleta(atletaId);
}

// ===== FUNÇÕES DE GERENCIAMENTO DE PROVAS =====

function getProvas() {
    return JSON.parse(localStorage.getItem('provas')) || [];
}

function salvarProva(novaProva) {
    const provas = getProvas();
    const provaExistente = provas.some(p => p.nome.toLowerCase() === novaProva.nome.toLowerCase());
    if (provaExistente) {
        return false;
    }
    provas.push(novaProva);
    localStorage.setItem('provas', JSON.stringify(provas));
    return true;
}

function removerProva(provaId) {
    let provas = getProvas();
    provas = provas.filter(prova => prova.id !== provaId);
    localStorage.setItem('provas', JSON.stringify(provas));
}

function removerTodasProvas() {
    localStorage.setItem('provas', JSON.stringify([]));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE EVENTOS =====

function getEventos() {
    return JSON.parse(localStorage.getItem('eventos')) || [];
}

function salvarEvento(novoEvento) {
    let eventos = getEventos();
    const eventoExistente = eventos.some(
        evt => evt.nome.toLowerCase() === novoEvento.nome.toLowerCase()
    );
    if (eventoExistente) {
        return false;
    }
    eventos.push(novoEvento);
    localStorage.setItem('eventos', JSON.stringify(eventos));
    return true;
}

function atualizarEvento(eventoId, eventoAtualizado) {
    let eventos = getEventos();
    const index = eventos.findIndex(e => e.id === eventoId);
    if (index >= 0) {
        eventos[index] = eventoAtualizado;
        localStorage.setItem('eventos', JSON.stringify(eventos));
        return true;
    }
    return false;
}

function removerEvento(eventoId) {
    let eventos = getEventos();
    eventos = eventos.filter(evt => evt.id !== eventoId);
    localStorage.setItem('eventos', JSON.stringify(eventos));
    removerEventosProvasPorEvento(eventoId);
    removerEventosCategoriasPorEvento(eventoId);
    removerInscricoesPorEvento(eventoId);
    removerProvasEventoPorEvento(eventoId);
    removerBalizamentosPorEvento(eventoId);
}

// ===== FUNÇÕES DE GERENCIAMENTO DE EVENTOPROVA =====

function getEventosProvas(eventoId = null) {
    let eventosProvas = JSON.parse(localStorage.getItem('eventosProvas')) || [];
    if (eventoId) {
        eventosProvas = eventosProvas.filter(ep => ep.eventoId === eventoId);
    }
    return eventosProvas;
}

function salvarEventosProvas(eventoId, listaProvas) {
    removerEventosProvasPorEvento(eventoId);
    const eventosProvas = getEventosProvas();
    listaProvas.forEach((prova) => {
        const novoEventoProva = {
            id: `evtprv-${Date.now()}-${Math.random()}`,
            eventoId: eventoId,
            provaId: prova.provaId,
            sexo: prova.sexo,
        };
        eventosProvas.push(novoEventoProva);
    });
    localStorage.setItem('eventosProvas', JSON.stringify(eventosProvas));
}

function removerEventosProvasPorEvento(eventoId) {
    const eventosProvas = getEventosProvas();
    const eventosProvasAtualizadas = eventosProvas.filter(ep => ep.eventoId !== eventoId);
    localStorage.setItem('eventosProvas', JSON.stringify(eventosProvasAtualizadas));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE EVENTOCATEGORIA =====

function getEventosCategorias(eventoId = null) {
    let eventosCategorias = JSON.parse(localStorage.getItem('eventosCategorias')) || [];
    if (eventoId) {
        eventosCategorias = eventosCategorias.filter(ec => ec.eventoId === eventoId);
    }
    return eventosCategorias;
}

function salvarEventosCategorias(eventoId, listaCategorias) {
    removerEventosCategoriasPorEvento(eventoId);
    const eventosCategorias = getEventosCategorias();
    listaCategorias.forEach((categoria) => {
        const novoEventoCategoria = {
            id: `evtcat-${Date.now()}-${Math.random()}`,
            eventoId: eventoId,
            categoriaId: categoria.categoriaId,
            sexo: categoria.sexo,
        };
        eventosCategorias.push(novoEventoCategoria);
    });
    localStorage.setItem('eventosCategorias', JSON.stringify(eventosCategorias));
}

function removerEventosCategoriasPorEvento(eventoId) {
    const eventosCategorias = getEventosCategorias();
    const eventosCatAtualizadas = eventosCategorias.filter(ec => ec.eventoId !== eventoId);
    localStorage.setItem('eventosCategorias', JSON.stringify(eventosCatAtualizadas));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE PROVAEVENTO =====

function getProvasEvento(eventoId = null) {
    let provasEvento = JSON.parse(localStorage.getItem('provasEvento')) || [];
    if (eventoId) {
        provasEvento = provasEvento.filter(pe => pe.eventoId === eventoId);
    }
    return provasEvento;
}

function gerarProvasEvento(eventoId) {
    const eventosProvas = getEventosProvas(eventoId);
    const eventosCategorias = getEventosCategorias(eventoId);

    let provasEvento = getProvasEvento();
    const provasDoEvento = provasEvento
        .filter(pe => pe.eventoId === eventoId)
        .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0));

    let proximoNumero = provasDoEvento.length > 0
        ? Math.max(...provasDoEvento.map(pe => pe.numeroProva || 0)) + 1
        : 1;

    eventosProvas.forEach((ep) => {
        eventosCategorias.forEach((ec) => {
            if (ep.sexo !== ec.sexo) return;

            const duplicado = provasDoEvento.some(pe =>
                pe.provaId === ep.provaId
                && pe.categoriaId === ec.categoriaId
                && pe.sexo === ep.sexo
            );

            if (!duplicado) {
                provasDoEvento.push({
                    id: `pve-${Date.now()}-${Math.random()}`,
                    eventoId: eventoId,
                    provaId: ep.provaId,
                    categoriaId: ec.categoriaId,
                    sexo: ep.sexo,
                    numeroProva: proximoNumero++,
                });
            }
        });
    });

    provasEvento = provasEvento.filter(pe => pe.eventoId !== eventoId);
    const atualizadas = [...provasEvento, ...provasDoEvento];
    localStorage.setItem('provasEvento', JSON.stringify(atualizadas));
    return provasDoEvento;
}

function removerProvasEventoPorEvento(eventoId) {
    const provasEvento = getProvasEvento();
    const provasEventoAtualizadas = provasEvento.filter(pe => pe.eventoId !== eventoId);
    localStorage.setItem('provasEvento', JSON.stringify(provasEventoAtualizadas));
}

function existeDuplicidadeProvaEvento(eventoId, provaId, categoriaId, sexo, idExcluir = null) {
    const provasEvento = getProvasEvento(eventoId);
    return provasEvento.some(pe =>
        pe.eventoId === eventoId
        && pe.provaId === provaId
        && pe.categoriaId === categoriaId
        && pe.sexo === sexo
        && pe.id !== idExcluir
    );
}

function adicionarProvaEvento(eventoId, provaId, categoriaId, sexo) {
    if (existeDuplicidadeProvaEvento(eventoId, provaId, categoriaId, sexo)) {
        return { sucesso: false, mensagem: 'Já existe registro com este evento, prova, categoria e sexo.' };
    }

    const provaExiste = getProvas().some(prova => prova.id === provaId);
    const categoriaSelecionada = getCategorias().find(categoria => categoria.id === categoriaId);

    if (!provaExiste) {
        return { sucesso: false, mensagem: 'Prova inválida.' };
    }

    if (!categoriaSelecionada || categoriaSelecionada.ativo === false) {
        return { sucesso: false, mensagem: 'Categoria inválida ou inativa.' };
    }

    // Garante consistência do setup do evento ao incluir manualmente uma prova do evento.
    let eventosProvas = getEventosProvas();
    let eventosCategorias = getEventosCategorias();

    const eventoProvaValido = eventosProvas.some(ep => ep.eventoId === eventoId && ep.provaId === provaId && ep.sexo === sexo);
    const eventoCategoriaValida = eventosCategorias.some(ec => ec.eventoId === eventoId && ec.categoriaId === categoriaId && ec.sexo === sexo);

    if (!eventoProvaValido) {
        eventosProvas.push({
            id: `evtprv-${Date.now()}-${Math.random()}`,
            eventoId,
            provaId,
            sexo,
        });
        localStorage.setItem('eventosProvas', JSON.stringify(eventosProvas));
    }

    if (!eventoCategoriaValida) {
        eventosCategorias.push({
            id: `evtcat-${Date.now()}-${Math.random()}`,
            eventoId,
            categoriaId,
            sexo,
        });
        localStorage.setItem('eventosCategorias', JSON.stringify(eventosCategorias));
    }

    const provasEvento = getProvasEvento();
    const provasDoEvento = provasEvento.filter(pe => pe.eventoId === eventoId);
    const proximoNumero = provasDoEvento.length > 0
        ? Math.max(...provasDoEvento.map(pe => pe.numeroProva || 0)) + 1
        : 1;

    provasEvento.push({
        id: `pve-${Date.now()}-${Math.random()}`,
        eventoId,
        provaId,
        categoriaId,
        sexo,
        numeroProva: proximoNumero,
    });

    localStorage.setItem('provasEvento', JSON.stringify(provasEvento));
    return { sucesso: true };
}

function removerProvaEvento(provaEventoId) {
    let provasEvento = getProvasEvento();
    const registro = provasEvento.find(pe => pe.id === provaEventoId);
    provasEvento = provasEvento.filter(pe => pe.id !== provaEventoId);

    if (registro) {
        const doEvento = provasEvento
            .filter(pe => pe.eventoId === registro.eventoId)
            .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0));

        doEvento.forEach((pe, index) => {
            pe.numeroProva = index + 1;
        });
    }

    localStorage.setItem('provasEvento', JSON.stringify(provasEvento));
}

function atualizarOrdemProvasEvento(eventoId, listaIdsEmOrdem) {
    const provasEvento = getProvasEvento();
    const mapOrdem = {};
    listaIdsEmOrdem.forEach((id, index) => {
        mapOrdem[id] = index + 1;
    });

    provasEvento.forEach(pe => {
        if (pe.eventoId === eventoId && mapOrdem[pe.id]) {
            pe.numeroProva = mapOrdem[pe.id];
        }
    });

    localStorage.setItem('provasEvento', JSON.stringify(provasEvento));
}

function getProvasEventoDetalhadas(eventoId) {
    const provas = getProvas();
    const categorias = getCategorias();
    const provasMap = {};
    const categoriasMap = {};

    provas.forEach(p => {
        provasMap[p.id] = p;
    });

    categorias.forEach(c => {
        categoriasMap[c.id] = c;
    });

    return getProvasEvento(eventoId)
        .map(pe => ({
            ...pe,
            provaNome: provasMap[pe.provaId]?.nome || pe.provaId,
            categoriaNome: categoriasMap[pe.categoriaId]?.nome || pe.categoriaId,
        }))
        .sort((a, b) => (a.numeroProva || 0) - (b.numeroProva || 0));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE MELHORTEMPOATLETA =====

function getMelhoresTempos(atletaId) {
    const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
    return melhoresTempos.filter(mt => mt.atletaId === atletaId);
}

function getMelhoresTemposAtleta(atletaId) {
    return getMelhoresTempos(atletaId);
}

function salvarMelhorTempo(atletaId, provaId, tempo) {
    const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
    
    const indice = melhoresTempos.findIndex(mt => mt.atletaId === atletaId && mt.provaId === provaId);
    
    if (indice >= 0) {
        melhoresTempos[indice].tempo = tempo;
    } else {
        melhoresTempos.push({
            id: `mt-${Date.now()}-${Math.random()}`,
            atletaId: atletaId,
            provaId: provaId,
            tempo: tempo
        });
    }
    
    localStorage.setItem('melhoresTempos', JSON.stringify(melhoresTempos));
    return true;
}

function salvarMelhoresTemposlista(atletaId, tempos) {
    tempos.forEach(t => {
        salvarMelhorTempo(atletaId, t.provaId, t.tempo);
    });
    return true;
}

function removerMelhorTempo(atletaId, provaId) {
    const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
    const melhoresTemposAtualizado = melhoresTempos.filter(mt => !(mt.atletaId === atletaId && mt.provaId === provaId));
    localStorage.setItem('melhoresTempos', JSON.stringify(melhoresTemposAtualizado));
}

function removerMelhoresTemposAtleta(atletaId) {
    const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
    const melhoresTemposAtualizado = melhoresTempos.filter(mt => mt.atletaId !== atletaId);
    localStorage.setItem('melhoresTempos', JSON.stringify(melhoresTemposAtualizado));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE INSCRICAO =====

function getInscricoes(eventoId = null, atletaId = null) {
    let inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    if (eventoId) {
        const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
        inscricoes = inscricoes.filter(i => provasDoEvento.includes(i.eventoProvaId));
    }
    if (atletaId) {
        inscricoes = inscricoes.filter(i => i.atletaId === atletaId);
    }
    return inscricoes;
}

function getInscricoesPorAtletaEvento(atletaId, eventoId) {
    const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
    const inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    return inscricoes.filter(i => i.atletaId === atletaId && provasDoEvento.includes(i.eventoProvaId));
}

function existeInscricaoDuplicada(atletaId, eventoProvaId) {
    const inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    return inscricoes.some(i => i.atletaId === atletaId && i.eventoProvaId === eventoProvaId);
}

function salvarInscricao(atletaId, eventoProvaId) {
    if (existeInscricaoDuplicada(atletaId, eventoProvaId)) {
        return { sucesso: false, mensagem: 'Atleta já inscrito nesta prova.' };
    }
    const inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    inscricoes.push({
        id: `insc-${Date.now()}-${Math.random()}`,
        atletaId,
        eventoProvaId,
    });
    localStorage.setItem('inscricoes', JSON.stringify(inscricoes));
    return { sucesso: true };
}

function removerInscricao(atletaId, eventoProvaId) {
    let inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    inscricoes = inscricoes.filter(i => !(i.atletaId === atletaId && i.eventoProvaId === eventoProvaId));
    localStorage.setItem('inscricoes', JSON.stringify(inscricoes));
}

function removerInscricoesPorEvento(eventoId) {
    const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
    let inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    inscricoes = inscricoes.filter(i => !provasDoEvento.includes(i.eventoProvaId));
    localStorage.setItem('inscricoes', JSON.stringify(inscricoes));
}

function removerInscricoesPorAtleta(atletaId) {
    let inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    inscricoes = inscricoes.filter(i => i.atletaId !== atletaId);
    localStorage.setItem('inscricoes', JSON.stringify(inscricoes));
}

// ===== FUNÇÕES DE GERENCIAMENTO DE BALIZAMENTO =====

function getBalizamentos(eventoId = null, provaEventoId = null) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    
    if (eventoId) {
        // Filtrar por evento: find all PROVAEVENTO que pertencem a este evento
        const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
        balizamentos = balizamentos.filter(b => provasDoEvento.includes(b.provaEventoId));
    }
    
    if (provaEventoId) {
        balizamentos = balizamentos.filter(b => b.provaEventoId === provaEventoId);
    }
    
    return balizamentos;
}

function salvarBalizamento(balizamento) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    
    // Verificar duplicidade: não permitir 2+ atletas na mesma prova+serie+raia
    const existe = balizamentos.some(b => 
        b.provaEventoId === balizamento.provaEventoId &&
        b.serie === balizamento.serie &&
        b.raia === balizamento.raia &&
        b.id !== balizamento.id // excluir o próprio registro se for update
    );
    
    if (existe) {
        return { sucesso: false, mensagem: 'Já existe um atleta nessa série/raia.' };
    }
    
    // Também verificar se o mesmo atleta já está balizado nesta prova
    const atletaJaBalizado = balizamentos.some(b =>
        b.provaEventoId === balizamento.provaEventoId &&
        b.atletaId === balizamento.atletaId &&
        b.id !== balizamento.id
    );
    
    if (atletaJaBalizado) {
        return { sucesso: false, mensagem: 'Atleta já está balizado nesta prova.' };
    }
    
    // Gerar ID se não existir
    if (!balizamento.id) {
        balizamento.id = `bal-${Date.now()}-${Math.random()}`;
    }
    
    // Verificar se é um update ou um novo registro
    const index = balizamentos.findIndex(b => b.id === balizamento.id);
    if (index >= 0) {
        balizamentos[index] = balizamento;
    } else {
        balizamentos.push(balizamento);
    }
    
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
    return { sucesso: true };
}

function removerBalizamento(balizamentoId) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    balizamentos = balizamentos.filter(b => b.id !== balizamentoId);
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
}

function removerBalizamentosPorEvento(eventoId) {
    const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    balizamentos = balizamentos.filter(b => !provasDoEvento.includes(b.provaEventoId));
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
}

function removerBalizamentosPorProvaEvento(provaEventoId) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    balizamentos = balizamentos.filter(b => b.provaEventoId !== provaEventoId);
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
}

function removerBalizamentosPorAtleta(atletaId) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    balizamentos = balizamentos.filter(b => b.atletaId !== atletaId);
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
}

function atualizarBalizamento(balizamentoId, serie, raia) {
    let balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    const index = balizamentos.findIndex(b => b.id === balizamentoId);
    
    if (index < 0) {
        return { sucesso: false, mensagem: 'Balizamento não encontrado.' };
    }
    
    const balizamento = balizamentos[index];
    
    // Verificar duplicidade na nova posição
    const existe = balizamentos.some(b => 
        b.provaEventoId === balizamento.provaEventoId &&
        b.serie === serie &&
        b.raia === raia &&
        b.id !== balizamentoId
    );
    
    if (existe) {
        return { sucesso: false, mensagem: 'Já existe um atleta nessa série/raia.' };
    }
    
    balizamentos[index].serie = serie;
    balizamentos[index].raia = raia;
    
    localStorage.setItem('balizamentos', JSON.stringify(balizamentos));
    return { sucesso: true };
}

function verificarBalizamentoDuplicado(provaEventoId, serie, raia, balizamentoIdExcluir = null) {
    const balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    return balizamentos.some(b =>
        b.provaEventoId === provaEventoId &&
        b.serie === serie &&
        b.raia === raia &&
        b.id !== balizamentoIdExcluir
    );
}

function getAtletasInscritosNaProva(provaEventoId) {
    const inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    const atletasInscritos = inscricoes
        .filter(i => i.eventoProvaId === provaEventoId)
        .map(i => i.atletaId);
    return atletasInscritos;
}

function existeAletaBalizadoEmProva(atletaId, provaEventoId) {
    const balizamentos = JSON.parse(localStorage.getItem('balizamentos')) || [];
    return balizamentos.some(b => b.atletaId === atletaId && b.provaEventoId === provaEventoId);
}

function converterTempoParaSegundos(tempo) {
    if (!tempo) return Infinity;
    
    // Se não contém ":", é apenas segundos (ex: "20.55")
    if (!tempo.includes(':')) {
        return parseFloat(tempo) || Infinity;
    }
    
    // Formato MM:SS.CC ou MM:SS
    const [minSeg, ms] = tempo.split('.');
    const [min, seg] = minSeg.split(':');
    return parseInt(min) * 60 + parseInt(seg) + (parseInt(ms) || 0) / 100;
}

// Nota: tempoParaSegundos também é definido abaixo. Usar as funções centralizadas de time-utils.js

function gerarBalizamentoAutomatico(eventoId) {
    const evento = getEventos().find(e => e.id === eventoId);
    if (!evento) {
        return { sucesso: false, mensagem: 'Evento não encontrado.' };
    }
    
    const provasEvento = getProvasEvento(eventoId);
    if (provasEvento.length === 0) {
        return { sucesso: false, mensagem: 'Este evento não possui provas configuradas. Configure as provas antes de gerar o balizamento.' };
    }
    
    // Limpar balizamentos anteriores do evento
    removerBalizamentosPorEvento(eventoId);
    
    const atletas = getAtletas();
    const atletasMap = {};
    atletas.forEach(a => atletasMap[a.id] = a);
    
    let totalBalizamentosGerados = 0;
    
    // Para cada PROVAEVENTO, gerar balizamentos
    provasEvento.forEach(provaEvento => {
        // 1. Obter atletas inscritos nesta prova
        const atletasInscritos = getAtletasInscritosNaProva(provaEvento.id);
        
        if (atletasInscritos.length === 0) {
            return; // Nenhum atleta inscrito nesta prova
        }
        
        // 2. Separar atletas com e sem melhor tempo
        const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
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
        
        // 3. Ordenar atletas com tempo (ascendente = mais rápidos primeiro, para comparação)
        atletasComTempo.sort((a, b) => converterTempoParaSegundos(a.tempo) - converterTempoParaSegundos(b.tempo));
        
        // 4. Configurar séries e raias (padrão: 8 raias por série)
        const qtdeRaias = evento.qtdeRaias || 8;
        const qtdeAtletas = atletasInscritos.length;
        const qtdeSeries = Math.ceil(qtdeAtletas / qtdeRaias);
        
        // 5. Função para calcular a melhor raia (centro alternando para fora)
        // Padrão: 8 raias → [4, 5, 3, 6, 2, 7, 1, 8]
        //         6 raias → [3, 4, 2, 5, 1, 6]
        const calcularRaiasParaSerie = (atletasParaSerie) => {
            if (atletasParaSerie.length === 0) return [];
            
            const raiasOrdenadas = [];
            
            // Calcular os dois centros
            const centroEsq = Math.ceil(qtdeRaias / 2);
            const centroDir = centroEsq + 1;
            
            // Adicionar centros primeiro
            raiasOrdenadas.push(centroEsq);
            if (centroDir <= qtdeRaias) {
                raiasOrdenadas.push(centroDir);
            }
            
            // Depois alternar para fora: esquerda, direita, esquerda, direita...
            let esq = centroEsq - 1;
            let dir = centroDir + 1;
            
            while (esq >= 1 || dir <= qtdeRaias) {
                if (esq >= 1) {
                    raiasOrdenadas.push(esq);
                    esq--;
                }
                if (dir <= qtdeRaias) {
                    raiasOrdenadas.push(dir);
                    dir++;
                }
            }
            
            // Pegar apenas quantas raias temos atletas
            return raiasOrdenadas.slice(0, atletasParaSerie.length);
        };
        
        // 6. Ordenar atletas: LENTOS PRIMEIRO, RÁPIDOS DEPOIS (regra oficial)
        // Atletas sem tempo vão para frente (série 1), atletas com tempo vão para trás (última série)
        // REVERTER atletasComTempo porque foram ordenados CRESCENTE (menores tempos = mais rápidos)
        // Precisamos INVERTER para ter MAIORES tempos (mais lentos) primeiro
        let atletasOrdenados = [
            ...atletasSemTempo,  // LENTOS (sem tempo de referência) - Série 1
            ...atletasComTempo.reverse().map(a => a.atletaId)  // REVERTER: LENTOS com tempo → RÁPIDOS com tempo
        ];
        
        // 7. Distribuir atletas em séries CRESCENTES (regra oficial natação)
        // Série 1 (LENTOS): MÍNIMA (2 atletas) - executada PRIMEIRA
        // Séries intermediárias: crescentes
        // Última série (RÁPIDOS): MÁXIMA/CHEIA - executada por ÚLTIMO
        // Ex: 7 atletas, 6 raias → Série 1: 2, Série 2: 5
        //     13 atletas, 6 raias → Série 1: 2, Série 2: 5, Série 3: 6 (cheia)
        //     4 atletas, 6 raias → Série 1: 4 (apenas 1 série, pois cabe tudo)
        
        // Primeiro, calcular quantas séries são REALMENTE necessárias
        const qtdeSeriesNecessarias = Math.ceil(qtdeAtletas / qtdeRaias);
        
        // Se apenas 1 série é necessária, usar distribuição simples
        let qtdeSeriesAjustada;
        const atletasPorSerie = {};
        
        if (qtdeSeriesNecessarias === 1) {
            // Apenas 1 série: todos os atletas nela
            qtdeSeriesAjustada = 1;
            atletasPorSerie[1] = qtdeAtletas;
        } else {
            // 2+ séries: aplicar regra de série 1 com mínimo 2, demais crescentes
            qtdeSeriesAjustada = 1 + Math.ceil((qtdeAtletas - 2) / qtdeRaias);
            atletasPorSerie[1] = Math.min(2, qtdeAtletas);  // Série 1: sempre 2
        }
        
        // Se temos mais de 1 série, distribuir os demais
        if (qtdeSeriesAjustada > 1) {
            let atletasParaOutrasSeries = qtdeAtletas - atletasPorSerie[1];
            let quantidadesCalculadas = {};
            
            // Distribuir demais séries de forma CRESCENTE
            for (let serie = 2; serie <= qtdeSeriesAjustada; serie++) {
                let seriesQueRestam = qtdeSeriesAjustada - serie + 1;  // Séries que ainda faltam (incluindo esta)
                
                // Para distribuição crescente: usar FLOOR para séries intermediárias, CEIL para última
                let qtdeNestaSerie;
                if (serie === qtdeSeriesAjustada) {
                    // Última série: recebe tudo que sobrou (até qtdeRaias)
                    qtdeNestaSerie = Math.min(qtdeRaias, atletasParaOutrasSeries);
                } else {
                    // Séries intermediárias: distribuição conservadora (floor)
                    qtdeNestaSerie = Math.floor(atletasParaOutrasSeries / seriesQueRestam);
                    qtdeNestaSerie = Math.max(2, qtdeNestaSerie);  // Mínimo 2 (ou valor anterior se aplicável)
                    
                    // Garantir crescimento: não diminuir em relação à série anterior
                    if (serie > 2 && quantidadesCalculadas[serie - 1]) {
                        qtdeNestaSerie = Math.max(qtdeNestaSerie, quantidadesCalculadas[serie - 1]);
                    }
                }
                
                // Capping: não pode exceder qtdeRaias
                qtdeNestaSerie = Math.min(qtdeNestaSerie, qtdeRaias);
                
                atletasPorSerie[serie] = qtdeNestaSerie;
                quantidadesCalculadas[serie] = qtdeNestaSerie;
                atletasParaOutrasSeries -= qtdeNestaSerie;
            }
            
            // Se sobraram atletas (ajuste final), distribuir nas últimas séries
            if (atletasParaOutrasSeries > 0) {
                for (let serie = qtdeSeriesAjustada; serie >= 2 && atletasParaOutrasSeries > 0; serie--) {
                    let capacidadeExtra = qtdeRaias - atletasPorSerie[serie];
                    if (capacidadeExtra > 0) {
                        let adicionar = Math.min(capacidadeExtra, atletasParaOutrasSeries);
                        atletasPorSerie[serie] += adicionar;
                        atletasParaOutrasSeries -= adicionar;
                    }
                }
            }
        }
        
        // Converter para array com índices corretos
        let indiceAtual = 0;
        for (let serie = 1; serie <= qtdeSeriesAjustada; serie++) {
            const qtdeNestaSerie = atletasPorSerie[serie] || 0;
            atletasPorSerie[serie] = atletasOrdenados.slice(indiceAtual, indiceAtual + qtdeNestaSerie);
            indiceAtual += qtdeNestaSerie;
        }
        
        // 8. Para cada série, ordenar atletas por tempo DENTRO DA SÉRIE e atribuir raias
        // Os MELHORES atletas da série vão para as RAIAS CENTRAIS
        for (let serie = 1; serie <= qtdeSeriesAjustada; serie++) {
            let atletasDaSerie = atletasPorSerie[serie];
            
            if (!atletasDaSerie || atletasDaSerie.length === 0) continue;
            
            // Ordenar atletas da série por tempo (melhor tempo primeiro para as raias centrais)
            atletasDaSerie.sort((idA, idB) => {
                const tempoA = melhoresTempos.find(mt => 
                    mt.atletaId === idA && mt.provaId === provaEvento.provaId
                )?.tempo;
                const tempoB = melhoresTempos.find(mt => 
                    mt.atletaId === idB && mt.provaId === provaEvento.provaId
                )?.tempo;
                
                // Atletas sem tempo vão para o fim da série (raias laterais)
                if (!tempoA && !tempoB) return 0;
                if (!tempoA) return 1;
                if (!tempoB) return -1;
                
                return converterTempoParaSegundos(tempoA) - converterTempoParaSegundos(tempoB);
            });
            
            const raiasDaSerie = calcularRaiasParaSerie(atletasDaSerie);
            
            atletasDaSerie.forEach((atletaId, index) => {
                const raia = raiasDaSerie[index] || (index + 1);
                const tempoRef = melhoresTempos.find(mt =>
                    mt.atletaId === atletaId && mt.provaId === provaEvento.provaId
                )?.tempo || '';
                
                const balizamento = {
                    id: `bal-${Date.now()}-${Math.random()}`,
                    provaEventoId: provaEvento.id,
                    atletaId: atletaId,
                    serie: serie,
                    raia: raia,
                    tempoReferencia: tempoRef,
                    tempoFinal: ''
                };
                
                const resultado = salvarBalizamento(balizamento);
                if (resultado.sucesso) {
                    totalBalizamentosGerados++;
                } else {
                                    }
            });
        }
    });
    
    if (totalBalizamentosGerados === 0) {
        return { 
            sucesso: false, 
            mensagem: 'Nenhum atleta inscrito encontrado. Registre inscrições antes de gerar o balizamento.' 
        };
    }
    
    return { 
        sucesso: true, 
        mensagem: `Balizamento gerado com sucesso! ${totalBalizamentosGerados} atleta(s) balizado(s).` 
    };
}

// ===== FUNÇÕES DE GERENCIAMENTO DE RESULTADOPROVA =====

function getResultadosProva(eventoId = null) {
    let resultadosProva = JSON.parse(localStorage.getItem('resultadosProva')) || [];
    
    if (eventoId) {
        // Filtrar por evento: find all PROVAEVENTO que pertencem a este evento
        const provasDoEvento = getProvasEvento(eventoId).map(pe => pe.id);
        resultadosProva = resultadosProva.filter(rp => provasDoEvento.includes(rp.provaEventoId));
    }
    
    return resultadosProva;
}

function obterOuCriarResultadoProva(provaEventoId) {
    let resultadosProva = JSON.parse(localStorage.getItem('resultadosProva')) || [];
    
    let resultado = resultadosProva.find(rp => rp.provaEventoId === provaEventoId);
    
    if (!resultado) {
        resultado = {
            id: `rp-${Date.now()}-${Math.random()}`,
            provaEventoId: provaEventoId,
            finalizada: false,
            impressa: false
        };
        resultadosProva.push(resultado);
        localStorage.setItem('resultadosProva', JSON.stringify(resultadosProva));
    }
    
    return resultado;
}

function atualizarResultadoProva(provaEventoId, finalizada, impressa) {
    let resultadosProva = JSON.parse(localStorage.getItem('resultadosProva')) || [];
    
    const index = resultadosProva.findIndex(rp => rp.provaEventoId === provaEventoId);
    
    if (index >= 0) {
        resultadosProva[index].finalizada = finalizada;
        resultadosProva[index].impressa = impressa;
    } else {
        resultadosProva.push({
            id: `rp-${Date.now()}-${Math.random()}`,
            provaEventoId: provaEventoId,
            finalizada: finalizada,
            impressa: impressa
        });
    }
    
    localStorage.setItem('resultadosProva', JSON.stringify(resultadosProva));
    return true;
}

// ===== FUNÇÕES DE GERENCIAMENTO DE RESULTADOPROVAATLETA =====

function getResultadosProvaAtleta(resultadoProvaId = null, provaEventoId = null) {
    let resultados = JSON.parse(localStorage.getItem('resultadosProvaAtleta')) || [];
    
    if (resultadoProvaId) {
        resultados = resultados.filter(rpa => rpa.resultadoProvaId === resultadoProvaId);
    }
    
    if (provaEventoId) {
        const resultadoProva = getResultadosProva().find(rp => rp.provaEventoId === provaEventoId);
        if (resultadoProva) {
            resultados = resultados.filter(rpa => rpa.resultadoProvaId === resultadoProva.id);
        }
    }
    
    return resultados;
}

// ===== FUNÇÕES AUXILIARES =====

// Wrapper para adicionarProvaEvento com nome alternativo
function salvarProvaEvento(eventoId, provaId, categoriaId, sexo) {
    return adicionarProvaEvento(eventoId, provaId, categoriaId, sexo);
}

// Versão com filtro de evento para inscrições
function removerInscricoesPorAtletaEvento(eventoId, atletaId) {
    let inscricoes = JSON.parse(localStorage.getItem('inscricoes')) || [];
    const provasDoEvento = getProvasEvento(eventoId);
    const provasEventoIds = provasDoEvento.map(pe => pe.id);
    inscricoes = inscricoes.filter(i => 
        !(i.atletaId === atletaId && provasEventoIds.includes(i.provaEventoId))
    );
    localStorage.setItem('inscricoes', JSON.stringify(inscricoes));
}

// ===== FUNÇÕES DE ATUALIZAÇÃO FALTANTES =====

function atualizarClube(clubeId, clubeAtualizado) {
    let clubes = getClubes();
    const index = clubes.findIndex(c => c.id === clubeId);
    if (index >= 0) {
        clubes[index] = clubeAtualizado;
        localStorage.setItem('clubes', JSON.stringify(clubes));
        return true;
    }
    return false;
}

function atualizarProva(provaId, provaAtualizada) {
    let provas = getProvas();
    const index = provas.findIndex(p => p.id === provaId);
    if (index >= 0) {
        provas[index] = provaAtualizada;
        localStorage.setItem('provas', JSON.stringify(provas));
        return true;
    }
    return false;
}

function salvarOuAtualizarResultadoAtleta(resultadoProvaId, atletaId, tempoFinal, desqualificado, posicao = 0) {
    let resultados = JSON.parse(localStorage.getItem('resultadosProvaAtleta')) || [];
    
    const index = resultados.findIndex(rpa => rpa.resultadoProvaId === resultadoProvaId && rpa.atletaId === atletaId);
    
    const registro = {
        id: `rpa-${Date.now()}-${Math.random()}`,
        resultadoProvaId: resultadoProvaId,
        atletaId: atletaId,
        posicao: desqualificado ? null : posicao,
        tempoFinal: desqualificado ? null : tempoFinal,
        desqualificado: desqualificado,
        impressa: false
    };
    
    if (index >= 0) {
        registro.id = resultados[index].id;
        resultados[index] = registro;
    } else {
        resultados.push(registro);
    }
    
    localStorage.setItem('resultadosProvaAtleta', JSON.stringify(resultados));
    return true;
}

function removerResultadosProvaAtleta(provaEventoId) {
    const resultadoProva = getResultadosProva().find(rp => rp.provaEventoId === provaEventoId);
    
    if (!resultadoProva) return;
    
    let resultados = JSON.parse(localStorage.getItem('resultadosProvaAtleta')) || [];
    resultados = resultados.filter(rpa => rpa.resultadoProvaId !== resultadoProva.id);
    
    localStorage.setItem('resultadosProvaAtleta', JSON.stringify(resultados));
}

// ===== FUNÇÕES AUXILIARES =====

function obterNomeClube(atletaId) {
    const atletas = getAtletas();
    const atleta = atletas.find(a => a.id === atletaId);
    if (!atleta) return '';
    const clubes = getClubes();
    return clubes.find(c => c.id === atleta.clubeId)?.nome || '';
}

function obterNomeAtleta(atletaId) {
    const atletas = getAtletas();
    return atletas.find(a => a.id === atletaId)?.nome || '';
}

// ===== FUNÇÕES PARA FINALIZAR PROVA =====

/**
 * Extrai provaId de um provaEventoId
 * @param {string} provaEventoId - ID da prova no evento
 * @returns {string} provaId
 */
function getProvaIdFromProvaEvento(provaEventoId) {
    const provasEvento = getProvasEvento();
    return provasEvento.find(pe => pe.id === provaEventoId)?.provaId || null;
}

/**
 * Converte tempo no formato MM:SS.ms para segundos
 * @param {string} tempoStr - Tempo em formato MM:SS.ms (ex: "01:05.50")
 * @returns {number} Tempo em segundos
 */
/**
 * Busca o melhor tempo de um atleta em uma prova
 * @param {string} atletaId - ID do atleta
 * @param {string} provaId - ID da prova
 * @returns {string} Melhor tempo em formato MM:SS.ms ou null
 */
function getMelhorTempoAtleta(atletaId, provaId) {
    const melhoresTempos = JSON.parse(localStorage.getItem('melhoresTempos')) || [];
    const melhorTempo = melhoresTempos.find(mt => mt.atletaId === atletaId && mt.provaId === provaId);
    return melhorTempo?.tempo || null;
}

/**
 * Compara dois tempos e retorna true se novoTempo é melhor (menor)
 * @param {string} novoTempo - Novo tempo em MM:SS.ms
 * @param {string} tempoAtual - Tempo atual em MM:SS.ms
 * @returns {boolean} true se novoTempo é melhor
 */

