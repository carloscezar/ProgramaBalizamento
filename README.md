# Sistema de Balizamento de Natação 🏊

![Status](https://img.shields.io/badge/Status-Ativo-brightgreen)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-blue)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green)

Aplicação web para gerenciamento completo de competições de natação, desde o cadastro de atletas até a publicação de resultados finais.

## 📋 Funcionalidades Principais

- ✅ **Gerenciamento de Clubs** - Cadastro e administração de clubes participantes
- ✅ **Gerenciamento de Atletas** - Registro de atletas com informações completas
- ✅ **Categorias** - Definição de categorias de competição
- ✅ **Eventos** - Criação e gerenciamento de eventos/competições
- ✅ **Provas** - Cadastro de provas por evento
- ✅ **Inscrições** - Sistema de inscrição de atletas em provas
- ✅ **Resultados** - Registro de tempos e posições finais
- ✅ **Balizamento** - Sistema de marcação e validação de resultados
- ✅ **Exportação** - Export de dados para Excel com formatação automática
- ✅ **Interface Responsiva** - Funciona em desktop e dispositivos móveis

## 🚀 Início Rápido

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Não requer servidor ou instalação

### Como Usar

1. **Clone ou baixe o projeto**

   ```bash
   git clone https://github.com/carloscezar/ProgramaBalizamento.git
   cd ProgramaBalizamento
   ```

2. **Abra o arquivo `index.html`**

   ```bash
   # No Windows
   start index.html

   # No macOS
   open index.html

   # No Linux
   xdg-open index.html
   ```

3. **Ou acesse através de um servidor local** (recomendado)

   ```bash
   # Com Python 3
   python -m http.server 8000

   # Com Node.js (http-server)
   npx http-server
   ```

## 🎯 Fluxo de Uso

```
1. Cadastro Inicial
   ├── Clubs
   ├── Atletas
   └── Categorias

2. Preparação do Evento
   ├── Criar Evento
   ├── Definir Provas
   └── Abrir Inscrições

3. Execução
   ├── Registrar Inscrições
   ├── Registrar Resultados
   └── Validar Balizamento

4. Resultados
   ├── Visualizar Resultados por Prova
   ├── Resultado Final por Atleta
   └── Exportar para Excel
```

## 📁 Estrutura do Projeto

```
ProgramaBalizamento/
├── index.html                 # Arquivo principal da aplicação
├── README.md                  # Este arquivo
├── DER.md                     # Diagrama de Entidade-Relacionamento
├── EXCEL_FORMATTING.md        # Documentação de formatação Excel
├── ANALISE_LIMPEZA.md         # Análise de código e limpeza
├── seed-data.json             # Dados de exemplo/sementes
│
├── css/                       # Estilos CSS modularizados
│   ├── reset.css              # Reset de estilos padrão
│   ├── layout.css             # Layout e grid
│   ├── components.css         # Componentes reutilizáveis
│   ├── sidebar.css            # Barra lateral de navegação
│   ├── theme.css              # Tema e variáveis de cor
│   └── modal-functionality.css # Funcionalidade de modais
│
└── js/                        # JavaScript modularizado
    ├── app.js                 # Inicialização da aplicação
    ├── router.js              # Sistema de roteamento SPA
    ├── database.js            # Gerenciamento de dados (localStorage)
    ├── exceljs.min.js         # Biblioteca ExcelJS
    ├── xlsx.min.js            # Biblioteca XLSX
    │
    ├── utils/                 # Utilitários compartilhados
    │   ├── export-utils.js    # Funções de exportação para Excel
    │   └── time-utils.js      # Utilitários de manipulação de tempo
    │
    └── pages/                 # Módulos de páginas
        ├── clube-page.js      # Gerenciamento de clubs
        ├── categoria-page.js  # Gerenciamento de categorias
        ├── atleta-page.js     # Gerenciamento de atletas
        ├── prova-page.js      # Gerenciamento de provas
        ├── evento-page.js     # Gerenciamento de eventos
        ├── inscricao-page.js  # Sistema de inscrições
        ├── resultados-page.js # Visualização de resultados
        ├── resultado-final-page.js    # Resultado final consolidado
        ├── balizamento-page.js        # Sistema de balizamento
        ├── gerenciar-provas-evento-page.js  # Gerenciamento de provas por evento
        └── utilidades-page.js # Ferramentas e utilitários
```

## 💾 Armazenamento de Dados

- **Tecnologia**: localStorage do navegador
- **Persistência**: Dados persistem mesmo após fechamento da aba
- **Sincronização**: Todos os dados armazenados localmente (sem servidor)
- **Backup**: Use a função de exportação para criar backups em Excel

### Estrutura de Dados

- **Clubs** - Nome, localização e dados do clube
- **Atletas** - Nome, idade, gênero, filiação ao clube
- **Categorias** - Faixa etária e descrição
- **Eventos** - Data, local, responsável
- **Provas** - Distância, estilo, categoria
- **Inscrições** - Atleta, prova, status
- **Resultados** - Tempo, posição, data

## 🎨 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Armazenamento**: localStorage
- **Exportação**: ExcelJS, XLSX
- **Arquitetura**: Single Page Application (SPA) com hash-based routing

## 🔧 Desenvolvimento

### Estrutura de Código

- **Modular**: Cada página é um módulo independente
- **Router SPA**: Navegação sem recarga de página
- **CRUD Operations**: Create, Read, Update, Delete padronizados
- **Reutilização**: Utilitários compartilhados entre módulos

### Console Limpo

- Sem console.log/error/warn em produção
- Código otimizado para performance
- Sem arquivos obsoletos ou duplicados

## 📊 Recursos Avançados

### Exportação para Excel

- Formatação automática de células
- Cores e estilos profissionais
- Múltiplas abas por relatório
- Exportação de resultados por prova

### Validação de Dados

- Campos obrigatórios validados
- Formatação de tempo consistente
- Prevenção de inscrições duplicadas

## 🐛 Troubleshooting

**Dados desaparecem ao recarregar?**

- Verifique se localStorage está ativado no navegador
- Tente importar dados de um backup em Excel

**Exportação não funciona?**

- Verifique se as bibliotecas XLSX/ExcelJS carregaram
- Tente em outro navegador

## 📚 Documentação Adicional

- **[DER.md](DER.md)** - Diagrama de Entidade-Relacionamento do banco de dados
- **[EXCEL_FORMATTING.md](EXCEL_FORMATTING.md)** - Detalhes de formatação de exportação

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Carlos Cezar Campos**

- GitHub: [@carloscezar](https://github.com/carloscezar)

**Davi Fernandes**

- GitHub: [@davifernandes095](https://github.com/davifernandes095)

## 📞 Suporte

Para dúvidas, sugestões ou relatar bugs, abra uma [Issue](https://github.com/carloscezar/ProgramaBalizamento/issues) no GitHub.

---

**Última atualização**: Maio 2026 | **Status**: Ativo e em desenvolvimento ✨
# ProgramaBalizamento
