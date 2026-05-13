// js-temp/clube.js - Gerenciamento de Clubes

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-clube');
    const listaClubsContainer = document.getElementById('lista-clubes-container');
    const removerTodosClubsBtn = document.getElementById('remover-todos-clubes-btn');

    // Função para renderizar a lista de clubes
    function renderizarListaClubes() {
        const clubes = getClubes();
        listaClubsContainer.innerHTML = ''; // Limpa a lista antiga

        if (clubes.length === 0) {
            listaClubsContainer.innerHTML = '<p>Nenhum clube cadastrado.</p>';
            removerTodosClubsBtn.style.display = 'none'; // Esconde o botão de ação
            return;
        }

        removerTodosClubsBtn.style.display = 'inline-block'; // Mostra o botão de ação

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome do Clube</th>
                    <th>Ação</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement('tbody');

        clubes.forEach(clube => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${clube.nome}</td>
                <td><button class="btn-remover-clube" data-id="${clube.id}">Remover</button></td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        listaClubsContainer.appendChild(table);
    }

    // Renderiza a lista ao carregar a página
    renderizarListaClubes();

    // Evento para salvar um novo clube
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nomeClube = document.getElementById('nome-clube').value.trim();

        if (!nomeClube) {
            alert('Por favor, preencha o nome do clube.');
            return;
        }

        const novoClube = {
            id: Date.now(), // ID único baseado em timestamp
            nome: nomeClube
        };

        const sucesso = salvarClube(novoClube);
        if (sucesso) {
            alert('Clube salvo com sucesso!');
            form.reset();
            renderizarListaClubes(); // Atualiza a lista na tela
        }
    });

    // Evento para o botão "Remover Todos os Clubes"
    removerTodosClubsBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover TODOS os clubes? Os atletas associados a eles não poderão ser selecionados.')) {
            removerTodosClubes();
            renderizarListaClubes(); // Atualiza a lista na tela
            alert('Todos os clubes foram removidos.');
        }
    });

    // Evento para os botões individuais de remover clube
    listaClubsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover-clube')) {
            const clubeId = parseInt(event.target.dataset.id, 10);
            if (confirm('Tem certeza que deseja remover este clube?')) {
                removerClube(clubeId);
                renderizarListaClubes(); // Atualiza a lista na tela
                alert('Clube removido com sucesso.');
            }
        }
    });
});
