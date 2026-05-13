// Módulo de Página - Cadastro de Categorias
window.CategoriaPage = {
    init: function() {
        const form = document.getElementById('form-categoria');
        const listaCategoriesContainer = document.getElementById('lista-categorias-container');
        const mensagemContainer = document.getElementById('mensagem-container');

        let categoriaEmEdicao = null; // Armazena ID da categoria em edição

        if (!form || !listaCategoriesContainer) {
            return;
        }

        renderizarListaCategorias();
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', () => { categoriaEmEdicao = null; });

        function handleSubmit(e) {
            e.preventDefault();

            const nome = document.getElementById('nome-categoria').value.trim();
            const anoInicial = parseInt(document.getElementById('ano-inicial').value, 10);
            const anoFinal = parseInt(document.getElementById('ano-final').value, 10);
            const ativo = document.getElementById('ativo-categoria').checked;

            if (!nome) {
                exibirMensagem('Preencha o nome da categoria!', 'erro');
                return;
            }

            if (anoInicial > anoFinal) {
                exibirMensagem('Ano inicial não pode ser maior que ano final!', 'erro');
                return;
            }

            if (categoriaEmEdicao) {
                // Modo edição
                const categoriaAtualizada = {
                    id: categoriaEmEdicao,
                    nome,
                    anoInicial,
                    anoFinal,
                    ativo
                };
                atualizarCategoria(categoriaAtualizada);
                exibirMensagem('✓ Categoria atualizada com sucesso!', 'sucesso');
                categoriaEmEdicao = null;
            } else {
                // Modo criar
                const novaCategoria = {
                    id: `cat-${Date.now()}`,
                    nome,
                    anoInicial,
                    anoFinal,
                    ativo
                };
                salvarCategoria(novaCategoria);
                exibirMensagem('✓ Categoria salva com sucesso!', 'sucesso');
            }

            form.reset();
            renderizarListaCategorias();
        }

        function renderizarListaCategorias() {
            const categorias = getCategorias();
            listaCategoriesContainer.innerHTML = '';

            if (categorias.length === 0) {
                listaCategoriesContainer.innerHTML = '<p class="text-light">Nenhuma categoria cadastrada.</p>';
                return;
            }

            const tabela = document.createElement('table');
            tabela.className = 'table';
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Anos</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');
            categorias.forEach(cat => {
                const tr = document.createElement('tr');
                const status = cat.ativo ? '<span class="badge finalizada">Ativa</span>' : '<span class="badge pendente">Inativa</span>';
                tr.innerHTML = `
                    <td>${cat.nome}</td>
                    <td>${cat.anoInicial} - ${cat.anoFinal}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-pequeno btn-primary" onclick="editarCategoria('${cat.id}')">Editar</button>
                        <button class="btn btn-pequeno btn-danger" onclick="removedCategoria('${cat.id}')">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            listaCategoriesContainer.appendChild(tabela);
        }

        function exibirMensagem(texto, tipo = 'info') {
            mensagemContainer.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
            setTimeout(() => {
                mensagemContainer.innerHTML = '';
            }, 4000);
        }

        window.editarCategoria = function(id) {
            const categorias = getCategorias();
            const categoria = categorias.find(c => c.id === id);
            if (categoria) {
                document.getElementById('nome-categoria').value = categoria.nome;
                document.getElementById('ano-inicial').value = categoria.anoInicial;
                document.getElementById('ano-final').value = categoria.anoFinal;
                document.getElementById('ativo-categoria').checked = categoria.ativo;
                categoriaEmEdicao = id;
                document.getElementById('nome-categoria').focus();
            }
        };

        window.removedCategoria = function(id) {
            if (confirm('Remover esta categoria?')) {
                removerCategoria(id);
                exibirMensagem('✓ Categoria removida!', 'sucesso');
                categoriaEmEdicao = null;
                renderizarListaCategorias();
            }
        };
    }
};


