// ===== MÓDULO DE PÁGINA - UTILIDADES (BACKUP E RESTORE) =====

window.UtilidasPage = {
    init: function() {

        const btnExportar = document.getElementById('btn-exportar-dados');
        const btnImportar = document.getElementById('btn-importar-dados');
        const inputArquivo = document.getElementById('input-arquivo-import');
        const containerEstatisticas = document.getElementById('container-estatisticas');

        if (!btnExportar || !btnImportar) {
                        return;
        }

        // ===== FUNÇÕES LOCAIS COM CLOSURE =====

        function atualizarEstatisticas() {
            const stats = {
                clubes: getClubes().length,
                categorias: getCategorias().length,
                atletas: getAtletas().length,
                provas: getProvas().length,
                eventos: getEventos().length,
                eventosProvas: getEventosProvas().length,
                eventosCategorias: getEventosCategorias().length,
                provasEvento: getProvasEvento().length,
                inscricoes: getInscricoes ? getInscricoes().length : 0,
                balizamentos: getBalizamentos ? getBalizamentos().length : 0,
                melhoresTempos: getMelhoresTempos ? getMelhoresTempos().length : 0
            };

            let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">';
            
            Object.entries(stats).forEach(([chave, valor]) => {
                const nomeFormatado = chave
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                
                html += `
                    <div style="padding: 1rem; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: #0a9396;">${valor}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${nomeFormatado}</div>
                    </div>
                `;
            });
            
            html += '</div>';
            containerEstatisticas.innerHTML = html;
        }

        function exportarDados() {
                        const dados = {
                versao: '1.0',
                dataExportacao: new Date().toISOString(),
                tabelas: {
                    clubes: getClubes(),
                    categorias: getCategorias(),
                    atletas: getAtletas(),
                    provas: getProvas(),
                    eventos: getEventos(),
                    eventosProvas: getEventosProvas(),
                    eventosCategorias: getEventosCategorias ? getEventosCategorias() : [],
                    provasEvento: getProvasEvento(),
                    inscricoes: getInscricoes ? getInscricoes() : [],
                    balizamentos: getBalizamentos ? getBalizamentos() : [],
                    melhoresTempos: getMelhoresTempos ? getMelhoresTempos() : []
                }
            };

            const json = JSON.stringify(dados, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-balizamento-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

                        alert('✅ Backup exportado com sucesso!\nArquivo: ' + link.download);
        }

        function importarDados(event) {
            const arquivo = event.target.files[0];
            if (!arquivo) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const dados = JSON.parse(e.target.result);

                    if (!dados.tabelas) {
                        throw new Error('Formato inválido: arquivo não contém seção "tabelas"');
                    }

                    // Confirmar antes de restaurar
                    const confirmacao = confirm(
                        `⚠️ ATENÇÃO: Você está prestes a restaurar dados de um backup.\n\n` +
                        `Tabelas que serão restauradas:\n` +
                        `- Clubes: ${dados.tabelas.clubes?.length || 0}\n` +
                        `- Categorias: ${dados.tabelas.categorias?.length || 0}\n` +
                        `- Atletas: ${dados.tabelas.atletas?.length || 0}\n` +
                        `- Provas: ${dados.tabelas.provas?.length || 0}\n` +
                        `- Eventos: ${dados.tabelas.eventos?.length || 0}\n` +
                        `- Inscrições: ${dados.tabelas.inscricoes?.length || 0}\n\n` +
                        `TODOS OS DADOS ATUAIS SERÃO SUBSTITUÍDOS!\n` +
                        `Deseja continuar?`
                    );

                    if (!confirmacao) {
                                                return;
                    }

                    // Restaurar dados
                    if (dados.tabelas.clubes) localStorage.setItem('clubes', JSON.stringify(dados.tabelas.clubes));
                    if (dados.tabelas.categorias) localStorage.setItem('categorias', JSON.stringify(dados.tabelas.categorias));
                    if (dados.tabelas.atletas) localStorage.setItem('atletas', JSON.stringify(dados.tabelas.atletas));
                    if (dados.tabelas.provas) localStorage.setItem('provas', JSON.stringify(dados.tabelas.provas));
                    if (dados.tabelas.eventos) localStorage.setItem('eventos', JSON.stringify(dados.tabelas.eventos));
                    if (dados.tabelas.eventosProvas) localStorage.setItem('eventosProvas', JSON.stringify(dados.tabelas.eventosProvas));
                    if (dados.tabelas.eventosCategorias) localStorage.setItem('eventosCategorias', JSON.stringify(dados.tabelas.eventosCategorias));
                    if (dados.tabelas.provasEvento) localStorage.setItem('provasEvento', JSON.stringify(dados.tabelas.provasEvento));
                    if (dados.tabelas.inscricoes) localStorage.setItem('inscricoes', JSON.stringify(dados.tabelas.inscricoes));
                    if (dados.tabelas.balizamentos) localStorage.setItem('balizamentos', JSON.stringify(dados.tabelas.balizamentos));
                    if (dados.tabelas.melhoresTempos) localStorage.setItem('melhoresTempos', JSON.stringify(dados.tabelas.melhoresTempos));

                                        atualizarEstatisticas();
                    alert('✅ Backup restaurado com sucesso!\n\nPor favor, recarregue a página para ver as mudanças.');
                    
                    // Limpar input
                    inputArquivo.value = '';
                } catch (erro) {
                                        alert('❌ Erro ao importar arquivo:\n' + erro.message);
                    inputArquivo.value = '';
                }
            };

            reader.readAsText(arquivo);
        }

        // ===== EVENT LISTENERS =====

        btnExportar.addEventListener('click', exportarDados);
        btnImportar.addEventListener('click', () => inputArquivo.click());
        inputArquivo.addEventListener('change', importarDados);

        // Inicializar
        atualizarEstatisticas();
    }
};


