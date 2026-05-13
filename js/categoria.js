// js-temp/categoria.js - Gestão de Categorias
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-categoria');
    const listaCategoriasContainer = document.getElementById('lista-categorias-container');
    const removerTodasCategoriasBtn = document.getElementById('remover-todas-categorias-btn');
    const formTitulo = document.getElementById('form-titulo');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    const btnSalvarCategoria = document.getElementById('btn-salvar-categoria');

    let categoriaEmEdicao = null; // Rastreia se estamos editando

    // Função para renderizar a lista de categorias
    function renderizarListaCategorias() {
        const categorias = getCategorias();
        listaCategoriasContainer.innerHTML = '';

        if (categorias.length === 0) {
            listaCategoriasContainer.innerHTML = '<p>Nenhuma categoria cadastrada.</p>';
            removerTodasCategoriasBtn.style.display = 'none';
            return;
        }

        removerTodasCategoriasBtn.style.display = 'inline-block';

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Ano Inicial</th>
                    <th>Ano Final</th>
                    <th>Ativo</th>
                    <th>Ação</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement('tbody');
        categorias.forEach(categoria => {
            const statusAtivo = categoria.ativo ? '✓ Sim' : '✗ Não';
            const labelToggle = categoria.ativo ? 'Desativar' : 'Ativar';
            const classToggle = categoria.ativo ? 'btn-desativar' : 'btn-ativar';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${categoria.nome}</td>
                <td>${categoria.anoInicial}</td>
                <td>${categoria.anoFinal}</td>
                <td>${statusAtivo}</td>
                <td class="coluna-acoes">
                  <button class="btn-editar-categoria" data-id="${categoria.id}">Editar</button>
                  <button class="btn-toggle-categoria ${classToggle}" data-id="${categoria.id}">${labelToggle}</button>
                  <button class="btn-remover-categoria btn-perigo" data-id="${categoria.id}">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        listaCategoriasContainer.appendChild(table);
    }

    // ===== FUNÇÃO: ABRIR EDIÇÃO DE CATEGORIA =====
    function abrirEdicaoCategoria(categoriaId) {
        const categorias = getCategorias();
        const categoria = categorias.find(cat => cat.id === categoriaId);

        if (!categoria) {
            alert('Categoria não encontrada!');
            return;
        }

        categoriaEmEdicao = categoria;

        // Preenchendo o formulário com os dados da categoria
        document.getElementById('nome-categoria').value = categoria.nome;
        document.getElementById('ano-inicial').value = categoria.anoInicial;
        document.getElementById('ano-final').value = categoria.anoFinal;
        document.getElementById('ativo-categoria').checked = categoria.ativo;

        // Alterar título e botão
        formTitulo.textContent = 'Editar Categoria';
        btnSalvarCategoria.textContent = 'Salvar Alterações';
        btnCancelarEdicao.style.display = 'inline-block';

        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    // ===== FUNÇÃO: CANCELAR EDIÇÃO =====
    function cancelarEdicao() {
        categoriaEmEdicao = null;
        form.reset();
        document.getElementById('ativo-categoria').checked = true;
        formTitulo.textContent = 'Cadastrar Nova Categoria';
        btnSalvarCategoria.textContent = 'Salvar Categoria';
        btnCancelarEdicao.style.display = 'none';
    }

    // Evento para cancelar edição
    btnCancelarEdicao.addEventListener('click', () => {
        cancelarEdicao();
    });

    // Evento para salvar uma nova categoria ou editar existente
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome-categoria').value.trim();
        const anoInicial = parseInt(document.getElementById('ano-inicial').value, 10);
        const anoFinal = parseInt(document.getElementById('ano-final').value, 10);
        const ativo = document.getElementById('ativo-categoria').checked;

        if (!nome) {
            alert('Por favor, preencha o nome da categoria.');
            return;
        }

        if (anoInicial > anoFinal) {
            alert('O ano inicial não pode ser maior que o ano final.');
            return;
        }

        // ===== VALIDAR SOBREPOSIÇÃO DE ANOS =====
        const categoriaIdExcluir = categoriaEmEdicao ? categoriaEmEdicao.id : null;
        if (verificarSobreposicaoAnos(anoInicial, anoFinal, categoriaIdExcluir)) {
            alert('Erro: O intervalo de anos [' + anoInicial + ', ' + anoFinal + '] sobrepõe com outra categoria existente!\n\nAs categorias não podem ter períodos sobrepostos.');
            return;
        }

        const categorias = getCategorias();

        if (categoriaEmEdicao) {
            // MODO EDIÇÃO
            const nomeJaExiste = categorias.some(
                cat => cat.nome.toLowerCase() === nome.toLowerCase() && cat.id !== categoriaEmEdicao.id
            );

            if (nomeJaExiste) {
                alert('Erro: Outra categoria com este nome já existe!');
                return;
            }

            const categoriaAtualizada = {
                id: categoriaEmEdicao.id,
                nome: nome,
                anoInicial: anoInicial,
                anoFinal: anoFinal,
                ativo: ativo
            };

            atualizarCategoria(categoriaAtualizada);
            alert('Categoria atualizada com sucesso!');
            cancelarEdicao();
            renderizarListaCategorias();
        } else {
            // MODO NOVO REGISTRO
            const categoriaExistente = categorias.some(
                cat => cat.nome.toLowerCase() === nome.toLowerCase()
            );

            if (categoriaExistente) {
                alert('Erro: Uma categoria com este nome já existe!');
                return;
            }

            const novaCategoria = {
                id: `cat-${Date.now()}`,
                nome: nome,
                anoInicial: anoInicial,
                anoFinal: anoFinal,
                ativo: ativo
            };

            salvarCategoria(novaCategoria);
            alert('Categoria salva com sucesso!');
            form.reset();
            document.getElementById('ativo-categoria').checked = true;
            renderizarListaCategorias();
        }
    });

    // Evento para o botão "Remover Todas as Categorias"
    removerTodasCategoriasBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover TODAS as categorias? Isso afetará o cálculo de categoria dos atletas.')) {
            removerTodasCategorias();
            renderizarListaCategorias();
        }
    });

    // Evento para os botões de editar, toggle e remover categoria
    listaCategoriasContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-editar-categoria')) {
            const categoriaId = event.target.dataset.id;
            abrirEdicaoCategoria(categoriaId);
        }
        if (event.target.classList.contains('btn-toggle-categoria')) {
            const categoriaId = event.target.dataset.id;
            const categorias = getCategorias();
            const categoria = categorias.find(cat => cat.id === categoriaId);
            if (categoria) {
                categoria.ativo = !categoria.ativo;
                atualizarCategoria(categoria);
                renderizarListaCategorias();
            }
        }
        if (event.target.classList.contains('btn-remover-categoria')) {
            const categoriaId = event.target.dataset.id;
            
            // ===== VERIFICAR SE CATEGORIA ESTÁ ASSOCIADA A ATLETA =====
            const estaAssociada = verificarCategoriaAssociadaAAtleta(categoriaId);
            
            if (estaAssociada) {
                // Se está associada, apenas desativar
                const categorias = getCategorias();
                const categoria = categorias.find(cat => cat.id === categoriaId);
                if (categoria) {
                    categoria.ativo = false;
                    atualizarCategoria(categoria);
                    alert('⚠️ Esta categoria está associada a atletas cadastrados.\n\nEm vez de remover, ela foi DESATIVADA.\n\nAo desativar, a categoria não aparecerá em novas inscrições, mas mantém o histórico dos atletas já registrados.');
                    renderizarListaCategorias();
                }
            } else {
                // Se não está associada, perguntar se quer remover
                if (confirm('Tem certeza que deseja remover esta categoria? Esta ação é irreversível.')) {
                    removerCategoria(categoriaId);
                    alert('Categoria removida com sucesso!');
                    renderizarListaCategorias();
                }
            }
        }
    });

    // Carrega a lista ao iniciar
    renderizarListaCategorias();
});
