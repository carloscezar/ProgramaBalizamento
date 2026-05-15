// ===== APP.JS - INICIALIZAÇÃO DA SPA =====

document.addEventListener('DOMContentLoaded', () => {

    // Registrar rotas
    router.register(
        '/home',
        'Sistema de Balizamento de Natação',
        'home',
        null
    );

    router.register(
        '/resultados',
        'Lançar Resultados das Provas',
        'resultados',
        () => {
            if (window.ResultadosPage && window.ResultadosPage.init) {
                window.ResultadosPage.init();
            }
        }
    );

    router.register(
        '/resultado-final',
        'Resultado Final das Provas',
        'resultado-final',
        () => {
            if (window.ResultadoFinalPage && window.ResultadoFinalPage.init) {
                window.ResultadoFinalPage.init();
            }
        }
    );

    router.register(
        '/balizamento',
        'Ver Balizamento',
        'balizamento',
        () => {
            if (window.BalizamentoPage && window.BalizamentoPage.init) {
                window.BalizamentoPage.init();
            }
        }
    );

    router.register(
        '/cadastro-clube',
        'Cadastrar Clube',
        'cadastro-clube',
        () => {
            if (window.ClubePageModule && window.ClubePageModule.init) {
                window.ClubePageModule.init();
            }
        }
    );

    router.register(
        '/cadastro-categoria',
        'Cadastrar Categoria',
        'cadastro-categoria',
        () => {
            if (window.CategoriaPage && window.CategoriaPage.init) {
                window.CategoriaPage.init();
            }
        }
    );

    router.register(
        '/cadastro-atleta',
        'Cadastrar Atleta',
        'cadastro-atleta',
        () => {
            if (window.AtletaPage && window.AtletaPage.init) {
                window.AtletaPage.init();
            }
        }
    );

    router.register(
        '/cadastro-prova',
        'Cadastrar Prova',
        'cadastro-prova',
        () => {
            if (window.ProvaPage && window.ProvaPage.init) {
                window.ProvaPage.init();
            }
        }
    );

    router.register(
        '/cadastro-evento',
        'Criar Evento',
        'cadastro-evento',
        () => {
            if (window.EventoPage && window.EventoPage.init) {
                window.EventoPage.init();
            }
        }
    );

    router.register(
        '/gerenciar-provas-evento',
        'Gerenciar Provas do Evento',
        'gerenciar-provas-evento',
        () => {
            if (window.GerenciarProvasEventoPage && window.GerenciarProvasEventoPage.init) {
                window.GerenciarProvasEventoPage.init();
            }
        }
    );

    router.register(
        '/inscricao',
        'Inscrições',
        'inscricao',
        () => {
            if (window.InscricaoPage && window.InscricaoPage.init) {
                window.InscricaoPage.init();
            }
        }
    );

    router.register(
        '/admin',
        'Adminstração - Backup e Restore',
        'admin',
        () => {
            if (window.AdministracaoPage && window.AdministracaoPage.init) {
                window.AdministracaoPage.init();
            }
        }
    );

    // Iniciar router
    router.start();
});

// ===== FUNÇÕES GLOBAIS PARA MODAL DE INSCRIÇÃO =====
// Podem ser chamadas de qualquer página

let atletaSendoInscritoGlobal = null;

window.abrirModalInscricaoAtleta = function(atletaId) {
    
    atletaSendoInscritoGlobal = atletaId;
    const modalInscricaoEvento = document.getElementById('modal-inscricao-evento');
    const inscricaoAtletaId = document.getElementById('inscricao-atleta-id');
    const inscricaoEventoSelect = document.getElementById('inscricao-evento-select');
    const inscricaoProvasList = document.getElementById('inscricao-provas-list');
    
    if (!modalInscricaoEvento || !inscricaoAtletaId) {
        return;
    }

    const atletas = getAtletas();
    const atleta = atletas.find(a => a.id === atletaId);
    
    if (!atleta) {
        return;
    }

    // Atualizar título e dados do modal
    document.getElementById('modal-inscricao-titulo').textContent = `Inscrever ${atleta.nome}`;
    inscricaoAtletaId.value = atletaId;
    inscricaoEventoSelect.value = '';
    inscricaoProvasList.innerHTML = '<p style="color: #999; font-size: 0.95rem;">Selecione um evento acima</p>';
    
    // Carregar eventos
    const eventos = getEventos().filter(e => !e.isFinalizado);
    inscricaoEventoSelect.innerHTML = '<option value="">-- Selecione um evento --</option>';
    eventos.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = `${evento.nome} (${evento.local})`;
        inscricaoEventoSelect.appendChild(option);
    });

    // Auto-selecionar se houver apenas 1 evento não finalizado
    if (eventos.length === 1) {
        inscricaoEventoSelect.value = eventos[0].id;
        inscricaoEventoSelect.dispatchEvent(new Event('change'));
    }
    
    // Mostrar modal
    modalInscricaoEvento.style.display = 'flex';
};

window.fecharModalInscricaoGlobal = function() {
    const modalInscricaoEvento = document.getElementById('modal-inscricao-evento');
    if (modalInscricaoEvento) {
        modalInscricaoEvento.style.display = 'none';
    }
    atletaSendoInscritoGlobal = null;
};

document.addEventListener('DOMContentLoaded', () => {
    // Listener global para carregar provas quando evento é selecionado
    const inscricaoEventoSelect = document.getElementById('inscricao-evento-select');
    const inscricaoProvasList = document.getElementById('inscricao-provas-list');
    const formInscricaoModal = document.getElementById('form-inscricao-modal');
    
    if (inscricaoEventoSelect) {
        inscricaoEventoSelect.addEventListener('change', function() {
            const eventoId = this.value;
            
            inscricaoProvasList.innerHTML = '';
            
            if (!eventoId || !atletaSendoInscritoGlobal) {
                inscricaoProvasList.innerHTML = '<p style="color: #999; font-size: 0.95rem;">Selecione um evento acima</p>';
                return;
            }

            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === atletaSendoInscritoGlobal);
            if (!atleta) return;

            // Usar a função pronta de database.js
            const provasEvento = getProvasEventoDetalhadas(eventoId);
            const provasFiltradas = provasEvento.filter(pe =>
                pe.sexo === atleta.sexo && pe.categoriaId === (atleta.categoriaId || getCategoriaAtleta(atleta.anoNascimento)?.id)
            );

            if (provasFiltradas.length === 0) {
                inscricaoProvasList.innerHTML = '<p style="color: #999; font-size: 0.95rem;">Nenhuma prova disponível para este atleta neste evento.</p>';
                return;
            }

            let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">';
            provasFiltradas.forEach(prova => {
                const inscricoes = getInscricoesPorAtletaEvento(atletaSendoInscritoGlobal, eventoId);
                const isInscrito = inscricoes.some(i => i.eventoProvaId === prova.id);
                html += `
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background-color: ${isInscrito ? '#e8f5e9' : '#f5f5f5'}; border-radius: 6px; cursor: pointer; border: 2px solid ${isInscrito ? '#66bb6a' : '#ddd'}; transition: all 0.2s;">
                        <input type="checkbox" name="prova-inscricao" value="${prova.id}" ${isInscrito ? 'checked' : ''} style="margin-top: 0.2rem; width: 18px; height: 18px;" />
                        <span style="font-size: 0.9rem; line-height: 1.4;"><strong>#${prova.numeroProva}</strong> - ${prova.provaNome}</span>
                    </label>
                `;
            });
            html += '</div>';
            inscricaoProvasList.innerHTML = html;
        });
    }

    // Listener para salvar inscrição via modal
    if (formInscricaoModal) {
        formInscricaoModal.addEventListener('submit', function(e) {
            e.preventDefault();

            const atletaId = document.getElementById('inscricao-atleta-id').value;
            const eventoId = inscricaoEventoSelect.value;

            if (!eventoId) {
                alert('Selecione um evento!');
                return;
            }

            const provasSelecionadas = Array.from(document.querySelectorAll('input[name="prova-inscricao"]:checked'))
                .map(checkbox => checkbox.value);

            if (provasSelecionadas.length === 0) {
                alert('Selecione pelo menos uma prova!');
                return;
            }

            // Salvar inscrições
            provasSelecionadas.forEach(provaEventoId => {
                salvarInscricao(atletaId, provaEventoId);
            });

            alert(`✓ ${provasSelecionadas.length} prova(s) inscrita(s) com sucesso!`);
            
            // Atualizar resumo se estiver na página de inscrição
            if (window.InscricaoPage && window.InscricaoPage.atualizarResumo) {
                window.InscricaoPage.atualizarResumo();
            }
            
            window.fecharModalInscricaoGlobal();
        });
    }
});

// Override da função fecharModalInscricao para usar a global
window.fecharModalInscricao = window.fecharModalInscricaoGlobal;

// Função para fechar modal de melhores tempos
window.fecharModalTempos = function() {
    const modalTempos = document.getElementById('modal-melhoresTempos');
    if (modalTempos) {
        modalTempos.style.display = 'none';
    }
};

// Função para fechar modal de adicionar atleta no balizamento
window.fecharModalAdiconarBalizamento = function() {
    const modalBalizamento = document.getElementById('modal-adicionar-balizamento');
    if (modalBalizamento) {
        modalBalizamento.style.display = 'none';
    }
};
