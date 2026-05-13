// ===== ROUTER SPA - SUPORTE A TEMPLATES INLINE (HTML PURO) =====

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.appContent = document.getElementById('app-content');
        this.pageTitle = document.getElementById('page-title');
        this.pageHeader = document.getElementById('page-header');
        
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    register(path, title, templateId, initFunction) {
        this.routes[path] = {
            title,
            templateId,
            initFunction
        };
    }

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/home';
        const route = this.routes[path];

        if (!route) {
            this.loadRoute('/home');
            return;
        }

        // Atualizar menu ativo
        this.updateActiveMenu(path);

        // Atualizar título da página
        this.pageTitle.textContent = route.title;

        try {
            // Carregar de <template id="..."> (ÚNICA FORMA SUPORTADA)

            const templateElement = document.getElementById(route.templateId);
            
            if (!templateElement) {
                const allTemplates = Array.from(document.querySelectorAll('template')).map(t => t.id);
                throw new Error(`Template #${route.templateId} não encontrado. Templates disponíveis: ${allTemplates.join(', ')}`);
            }

            if (templateElement.tagName !== 'TEMPLATE') {
                throw new Error(`Elemento #${route.templateId} não é um <template>`);
            }

            // ✅ Template inline encontrado - clonar e renderizar
            const clone = templateElement.content.cloneNode(true);
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clone);
            const html = tempDiv.innerHTML;

            // Renderizar
            this.appContent.innerHTML = html;

            // 3. Executar inicialização da página
            if (route.initFunction && typeof route.initFunction === 'function') {
                route.initFunction();
            }

            this.currentRoute = path;
            window.scrollTo(0, 0);

        } catch (error) {
            this.appContent.innerHTML = `
                <div class="alert alert-error">
                    <strong>Erro ao carregar página:</strong> ${error.message}
                </div>
            `;
        }
    }

    updateActiveMenu(path) {
        // Remover classe active de todos os links
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });

        // Adicionar classe active ao link atual
        const activeLink = document.querySelector(`a[href="#${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    loadRoute(path) {
        window.location.hash = path;
    }

    start() {
        // Carregar rota inicial ou home
        this.handleRoute();
    }
}

// Exportar para uso global
window.router = new Router();
