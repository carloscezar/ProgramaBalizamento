// Módulo de Página - Cadastro de Clubes
window.ClubePageModule = {
    init: function() {
        const form = document.getElementById('form-clube');
        const listaClubsContainer = document.getElementById('lista-clubes');
        const mensagemContainer = document.getElementById('mensagem-container');

        let clubeEmEdicao = null; // Armazena ID do clube em edição

        if (!form || !listaClubsContainer) {
            return;
        }

        renderizarListaClubes();
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', () => { clubeEmEdicao = null; });

        function handleSubmit(e) {
            e.preventDefault();

            const nome = document.getElementById('nome-clube').value.trim();

            if (!nome) {
                exibirMensagem('Preencha o nome do clube!', 'erro');
                return;
            }

            if (clubeEmEdicao) {
                // Modo edição
                const clubeAtualizado = { id: clubeEmEdicao, nome };
                atualizarClube(clubeEmEdicao, clubeAtualizado);
                exibirMensagem('✓ Clube atualizado com sucesso!', 'sucesso');
                clubeEmEdicao = null;
            } else {
                // Modo criar
                const novoClube = {
                    id: `clu-${Date.now()}`,
                    nome
                };
                salvarClube(novoClube);
                exibirMensagem('✓ Clube salvo com sucesso!', 'sucesso');
            }

            form.reset();
            renderizarListaClubes();
        }

        function renderizarListaClubes() {
            const clubes = getClubes();
            listaClubsContainer.innerHTML = '';

            if (clubes.length === 0) {
                listaClubsContainer.innerHTML = '<p class="text-light">Nenhum clube cadastrado.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome do Clube</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            clubes
                .sort((a, b) => a.nome.localeCompare(b.nome))    
                .forEach(clube => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${clube.nome}</td>
                        <td>
                            <button class="btn btn-pequeno btn-primary" onclick="editarClube('${clube.id}')">Editar</button>
                            <button class="btn btn-pequeno btn-danger" onclick="removeClube('${clube.id}')">Remover</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

            listaClubsContainer.appendChild(tabela);
        }

        function exibirMensagem(texto, tipo = 'info') {
            if (!mensagemContainer) return;
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        window.editarClube = function(id) {
            const clubes = getClubes();
            const clube = clubes.find(c => c.id === id);
            if (clube) {
                document.getElementById('nome-clube').value = clube.nome;
                clubeEmEdicao = id;
                document.getElementById('nome-clube').focus();
            }
        };

        window.removeClube = function(id) {
            if (confirm('Remover este clube?')) {
                removerClube(id);
                exibirMensagem('✓ Clube removido!', 'sucesso');
                clubeEmEdicao = null;
                renderizarListaClubes();
            }
        };
    }
};


