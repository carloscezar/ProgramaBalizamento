// Módulo de Página - Cadastro de Atletas
window.AtletaPage = {
    init: function() {
        const listaAtletasContainer = document.getElementById('lista-atletas-container');
        const mensagemContainer = document.getElementById('mensagem-container');
        const btnNovoAtleta = document.getElementById('btn-novo-atleta');
        const modalAtletaForm = document.getElementById('modal-atletaForm');
        const modalMelhoresTempos = document.getElementById('modal-melhoresTempos');
        const modalInscricaoEvento = document.getElementById('modal-inscricao-evento');
        const formAtletaModal = document.getElementById('form-atleta-modal');
        const formTempoModal = document.getElementById('form-tempo-modal');
        const formInscricaoModal = document.getElementById('form-inscricao-modal');
        const clubeSelectModal = document.getElementById('clube-select-modal');
        const tempoProvaSelect = document.getElementById('tempo-prova-select');
        const inscricaoEventoSelect = document.getElementById('inscricao-evento-select');
        const inscricaoProvasList = document.getElementById('inscricao-provas-list');

        let atletaEmEdicao = null;
        let atletaSendoEditadoTempos = null;
        let atletaSendoInscrito = null;

        if (!listaAtletasContainer) {
            return;
        }

        carregarClubes();
        carregarProvas();
        renderizarListaAtletas();

        // Event listeners
        btnNovoAtleta.addEventListener('click', abrirModalNovoAtleta);
        formAtletaModal.addEventListener('submit', salvarAtletaModal);
        formTempoModal.addEventListener('submit', salvarTempoModal);

        // ===== FUNÇÕES DE CARREGAMENTO =====
        function carregarClubes() {
            const clubes = getClubes();
            clubeSelectModal.innerHTML = '<option value="">-- Selecione um clube --</option>';
            clubes.forEach(clube => {
                const option = document.createElement('option');
                option.value = clube.id;
                option.textContent = clube.nome;
                clubeSelectModal.appendChild(option);
            });
        }

        function carregarProvas() {
            const provas = getProvas();
            tempoProvaSelect.innerHTML = '<option value="">-- Selecione uma prova --</option>';
            provas.forEach(prova => {
                const option = document.createElement('option');
                option.value = prova.id;
                option.textContent = prova.nome;
                tempoProvaSelect.appendChild(option);
            });
        }



        // ===== FUNÇÕES DE RENDERIZAÇÃO =====
        function renderizarListaAtletas() {
            const atletas = getAtletas();
            const clubes = getClubes();
            listaAtletasContainer.innerHTML = '';

            if (atletas.length === 0) {
                listaAtletasContainer.innerHTML = '<p class="text-light">Nenhum atleta cadastrado.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Clube</th>
                        <th>Sexo</th>
                        <th>Nasc.</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            atletas.forEach(atleta => {
                const clube = clubes.find(c => c.id === atleta.clubeId)?.nome || 'S/ clube';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${atleta.nome}</td>
                    <td>${clube}</td>
                    <td>${atleta.sexo}</td>
                    <td>${atleta.anoNascimento}</td>
                    <td>
                        <button class="btn btn-pequeno btn-primary" onclick="abrirModalEditarAtleta('${atleta.id}')">✏️ Editar</button>
                        <button class="btn btn-pequeno btn-info" onclick="abrirModalTempos('${atleta.id}')">⏱️ Tempos</button>
                        <button class="btn btn-pequeno btn-warning" onclick="inscreverEvento('${atleta.id}')">📝 Inscrever</button>
                        <button class="btn btn-pequeno btn-danger" onclick="removerAtleta('${atleta.id}')">🗑️ Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            listaAtletasContainer.appendChild(tabela);
        }

        function renderizarTemposAtleta(atletaId) {
            const temposContainer = document.getElementById('tempos-container');
            const melhoresTempos = getMelhoresTempos(atletaId);
            const provas = getProvas();

            if (melhoresTempos.length === 0) {
                temposContainer.innerHTML = '<p style="color: #999; font-style: italic;">Nenhum tempo registrado ainda.</p>';
                return;
            }

            let html = '<table class="table" style="font-size: 0.9rem;"><thead><tr><th>Prova</th><th>Melhor Tempo</th><th>Ação</th></tr></thead><tbody>';
            melhoresTempos.forEach(mt => {
                const prova = provas.find(p => p.id === mt.provaId);
                const provaName = prova?.nome || 'Prova desconhecida';
                html += `
                    <tr>
                        <td>${provaName}</td>
                        <td><strong>${mt.tempo}</strong></td>
                        <td>
                            <button class="btn btn-pequeno btn-primary" onclick="editarTempoAtleta('${mt.provaId}', '${mt.tempo}')">Editar</button>
                            <button class="btn btn-pequeno btn-danger" onclick="removerTempoAtleta('${atletaId}', '${mt.provaId}')">Remover</button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
            temposContainer.innerHTML = html;
        }

        function exibirMensagem(texto, tipo = 'info') {
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        // ===== FUNÇÕES DE MODAL - ATLETA =====
        function abrirModalNovoAtleta() {
            atletaEmEdicao = null;
            document.getElementById('modal-atletaForm-titulo').textContent = 'Novo Atleta';
            document.getElementById('atleta-id-modal').value = '';
            formAtletaModal.reset();
            modalAtletaForm.style.display = 'flex';
            document.getElementById('nome-atleta-modal').focus();
        }

        function abrirModalEditarAtleta(id) {
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === id);
            if (atleta) {
                atletaEmEdicao = id;
                document.getElementById('modal-atletaForm-titulo').textContent = 'Editar Atleta';
                document.getElementById('atleta-id-modal').value = id;
                document.getElementById('nome-atleta-modal').value = atleta.nome;
                document.getElementById('clube-select-modal').value = atleta.clubeId;
                
                // Setar valor do radio button de sexo
                const radioSexo = document.querySelector(`input[name="sexo-modal"][value="${atleta.sexo}"]`);
                if (radioSexo) {
                    radioSexo.checked = true;
                }
                
                document.getElementById('ano-nascimento-modal').value = atleta.anoNascimento;
                modalAtletaForm.style.display = 'flex';
                document.getElementById('nome-atleta-modal').focus();
            }
        }

        function salvarAtletaModal(e) {
            e.preventDefault();

            const nome = document.getElementById('nome-atleta-modal').value.trim();
            const clubeId = document.getElementById('clube-select-modal').value;
            const sexo = document.querySelector('input[name="sexo-modal"]:checked')?.value;
            const anoNascimento = parseInt(document.getElementById('ano-nascimento-modal').value, 10);

            if (!nome || !clubeId || !sexo || !anoNascimento) {
                exibirMensagem('Preencha todos os campos!', 'erro');
                return;
            }

            if (atletaEmEdicao) {
                const atletaAtualizado = { id: atletaEmEdicao, nome, clubeId, sexo, anoNascimento };
                atualizarAtleta(atletaEmEdicao, atletaAtualizado);
                exibirMensagem('✓ Atleta atualizado!', 'sucesso');
            } else {
                const novoAtleta = { id: `atl-${Date.now()}`, nome, clubeId, sexo, anoNascimento };
                salvarAtleta(novoAtleta);
                exibirMensagem('✓ Atleta salvo!', 'sucesso');
            }

            window.fecharModalAtleta();
            renderizarListaAtletas();
        }

        // ===== FUNÇÕES DE MODAL - TEMPOS =====
        function abrirModalTempos(id) {
            atletaSendoEditadoTempos = id;
            const atletas = getAtletas();
            const atleta = atletas.find(a => a.id === id);
            if (atleta) {
                document.getElementById('modal-tempos-titulo').textContent = `Melhores Tempos - ${atleta.nome}`;
                document.getElementById('tempo-atleta-id').value = id;
                renderizarTemposAtleta(id);
                modalMelhoresTempos.style.display = 'flex';
            }
        }

        function salvarTempoModal(e) {
            e.preventDefault();

            const atletaId = document.getElementById('tempo-atleta-id').value;
            const provaId = document.getElementById('tempo-prova-select').value;
            const tempo = document.getElementById('tempo-value').value.trim();

            if (!provaId || !tempo) {
                exibirMensagem('Selecione a prova e preencha o tempo!', 'erro');
                return;
            }

            salvarMelhorTempo(atletaId, provaId, tempo);
            exibirMensagem('✓ Tempo salvo!', 'sucesso');
            formTempoModal.reset();
            renderizarTemposAtleta(atletaId);
        }

        // ===== FUNÇÕES GLOBAIS - Expor para onclick em HTML =====
        window.fecharModalAtleta = function() {
            modalAtletaForm.style.display = 'none';
            atletaEmEdicao = null;
        };

        window.fecharModalTempos = function() {
            modalMelhoresTempos.style.display = 'none';
            atletaSendoEditadoTempos = null;
        };

        window.fecharModalInscricao = function() {
            modalInscricaoEvento.style.display = 'none';
            atletaSendoInscrito = null;
        };

        window.abrirModalEditarAtleta = abrirModalEditarAtleta;
        window.abrirModalTempos = abrirModalTempos;

        window.editarTempoAtleta = function(provaId, tempoAtual) {
            document.getElementById('tempo-prova-select').value = provaId;
            document.getElementById('tempo-value').value = tempoAtual;
        };

        window.removerTempoAtleta = function(atletaId, provaId) {
            if (confirm('Remover este tempo?')) {
                removerMelhorTempo(atletaId, provaId);
                exibirMensagem('✓ Tempo removido!', 'sucesso');
                renderizarTemposAtleta(atletaId);
            }
        };

        window.removerAtleta = function(id) {
            if (confirm('Remover este atleta? Isto também removerá seus tempos registrados.')) {
                removerAtleta(id);
                exibirMensagem('✓ Atleta removido!', 'sucesso');
                renderizarListaAtletas();
            }
        };

        window.inscreverEvento = function(atletaId) {
            window.abrirModalInscricaoAtleta(atletaId);
        };
    }
};


