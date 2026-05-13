// Módulo de Página - Cadastro de Provas
window.ProvaPage = {
    init: function() {
        const form = document.getElementById('form-prova');
        const listaProvasContainer = document.getElementById('lista-provas-container');
        const mensagemContainer = document.getElementById('mensagem-container');

        let provaEmEdicao = null; // Armazena ID da prova em edição

        if (!form || !listaProvasContainer) {
                        return;
        }

        renderizarListaProvas();
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', () => { provaEmEdicao = null; });

        function handleSubmit(e) {
            e.preventDefault();

            const nome = document.getElementById('nome-prova').value.trim();

            if (!nome) {
                exibirMensagem('Preencha o nome da prova!', 'erro');
                return;
            }

            if (provaEmEdicao) {
                // Modo edição
                const provaAtualizada = { id: provaEmEdicao, nome };
                atualizarProva(provaEmEdicao, provaAtualizada);
                exibirMensagem('✓ Prova atualizada com sucesso!', 'sucesso');
                provaEmEdicao = null;
            } else {
                // Modo criar
                const novaProva = {
                    id: `prv-${Date.now()}`,
                    nome
                };
                salvarProva(novaProva);
                exibirMensagem('✓ Prova salva com sucesso!', 'sucesso');
            }

            form.reset();
            renderizarListaProvas();
        }

        function renderizarListaProvas() {
            const provas = getProvas();
            listaProvasContainer.innerHTML = '';

            if (provas.length === 0) {
                listaProvasContainer.innerHTML = '<p class="text-light">Nenhuma prova cadastrada.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome da Prova</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            provas.forEach(prova => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${prova.nome}</td>
                    <td>
                        <button class="btn btn-pequeno btn-primary" onclick="editarProva('${prova.id}')">Editar</button>
                        <button class="btn btn-pequeno btn-danger" onclick="removeProva('${prova.id}')">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            listaProvasContainer.appendChild(tabela);
        }

        function exibirMensagem(texto, tipo = 'info') {
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        window.editarProva = function(id) {
            const provas = getProvas();
            const prova = provas.find(p => p.id === id);
            if (prova) {
                document.getElementById('nome-prova').value = prova.nome;
                provaEmEdicao = id;
                document.getElementById('nome-prova').focus();
            }
        };

        window.removeProva = function(id) {
            if (confirm('Remover esta prova?')) {
                removerProva(id);
                exibirMensagem('✓ Prova removida!', 'sucesso');
                provaEmEdicao = null;
                renderizarListaProvas();
            }
        };
    }
};

