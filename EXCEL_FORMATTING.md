# 📊 Formatação do Excel - Balizamento

## ✨ Melhorias Implementadas

A exportação do Excel agora possui formatação visual **idêntica à tela**, com cores, bordas e estilos profissionais.

---

## 🎨 Paleta de Cores

| Cor          | Código HEX | Uso                                             |
| ------------ | ---------- | ----------------------------------------------- |
| Verde Escuro | #0a9396    | Headers principais (Raia, Atleta, Clube, Tempo) |
| Verde Claro  | #94d2bd    | Títulos de série                                |
| Azul Claro   | #f0f8ff    | Linhas alternadas (fundo)                       |
| Branco       | #ffffff    | Linhas alternadas (fundo)                       |
| Cinza        | #cccccc    | Bordas de todas as células                      |

---

## 📋 Estrutura Visual

### Linha 1: Título da Prova

```
╔══════════════════════════════════════════════════════════════╗
║  PROVA 1: Test 50m                                           ║  ← Verde Escuro (#0a9396)
║  Texto branco, Negrito, Tamanho 14, Centralizado            ║
║  Mesclado de A1 até D1                                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Linha 2: Categoria e Sexo

```
╔══════════════════════════════════════════════════════════════╗
║  Desconhecida | undefined                                   ║  ← Verde Claro (#94d2bd)
║  Texto escuro, Tamanho 11, Centralizado                     ║
║  Mesclado de A2 até D2                                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Linha 4: Título da Série

```
╔══════════════════════════════════════════════════════════════╗
║  SÉRIE 1                                                     ║  ← Verde Claro (#94d2bd)
║  Texto escuro, Negrito, Tamanho 12, Centralizado            ║
║  Mesclado de A4 até D4                                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Linha 5: Cabeçalho das Colunas

```
╔════════╦═════════════╦══════════════╦═══════════════╗
║ Raia   ║ Atleta      ║ Clube        ║ Melhor Tempo  ║  ← Verde Escuro
║ (8ch)  ║ (25ch)      ║ (20ch)       ║ (18ch)        ║
║ Centro │ Centro      │ Centro       ║ Centro        ║  Texto branco, Negrito
╚════════╩═════════════╩══════════════╩═══════════════╝
```

### Linhas 6+: Dados dos Atletas (Alternadas)

```
╔════════╦═════════════╦══════════════╦═══════════════╗
║   4    ║ Atleta 2    ║ Test Club    ║ 00:46:00      ║  ← Azul Claro (#f0f8ff)
╠════════╬═════════════╬══════════════╬═══════════════╣
║   5    ║ Atleta 1    ║ Test Club    ║ 00:47:00      ║  ← Branco (#ffffff)
╠════════╬═════════════╬══════════════╬═══════════════╣
║   1    ║ Atleta 3    ║ Test Club    ║ 00:45:00      ║  ← Azul Claro (#f0f8ff)
╚════════╩═════════════╩══════════════╩═══════════════╝
```

---

## 🔧 Recursos Implementados

✅ **Cores Customizadas**

- Headers em verde escuro com texto branco
- Linhas alternadas para melhor legibilidade
- Diferenciação visual entre seções

✅ **Bordas e Separadores**

- Todas as células possuem bordas cinzas
- Separação clara entre linhas

✅ **Tipografia**

- Títulos: Bold, 14px
- Subtítulos: 11px
- Headers de tabela: Bold, 11px
- Dados: 10px

✅ **Alinhamento**

- Raia: Centralizado
- Atleta/Clube/Tempo: Esquerda
- Headers: Centralizado

✅ **Dimensões**

- Coluna Raia: 8 caracteres
- Coluna Atleta: 25 caracteres
- Coluna Clube: 20 caracteres
- Coluna Tempo: 18 caracteres
- Altura Títulos: 28px
- Altura Categoria: 20px

✅ **Quebras de Página**

- 2 linhas em branco entre séries
- Ideal para impressão (1 série por página)

---

## 📊 Exemplo Completo

```
Aba: "P1 - Test 50m"

┌──────────────────────────────────────────────────┐
│ PROVA 1: Test 50m                                │
│ Desconhecida | undefined                         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ SÉRIE 1                                          │
├────┬──────────┬──────────┬─────────────────────┤
│Raia│ Atleta   │ Clube    │ Melhor Tempo        │
├────┼──────────┼──────────┼─────────────────────┤
│ 4  │ Atleta 2 │Test Club │ 00:46:00            │ ← Azul
├────┼──────────┼──────────┼─────────────────────┤
│ 5  │ Atleta 1 │Test Club │ 00:47:00            │ ← Branco
└────┴──────────┴──────────┴─────────────────────┘

[Espaço em branco para quebra de página]

┌──────────────────────────────────────────────────┐
│ SÉRIE 2                                          │
├────┬──────────┬──────────┬─────────────────────┤
│Raia│ Atleta   │ Clube    │ Melhor Tempo        │
├────┼──────────┼──────────┼─────────────────────┤
│ 1  │ Atleta 3 │Test Club │ 00:45:00            │ ← Azul
├────┼──────────┼──────────┼─────────────────────┤
│ 2  │ Atleta 5 │Test Club │ 00:43:00            │ ← Branco
├────┼──────────┼──────────┼─────────────────────┤
│ 3  │ Atleta 7 │Test Club │ 00:41:00            │ ← Azul
│...│...      │...      │...                  │
└────┴──────────┴──────────┴─────────────────────┘
```

---

## 🎯 Comparação: Antes vs Depois

### ❌ ANTES (Sem Formatação)

- Texto plano
- Sem cores
- Sem bordas
- Sem distinção visual
- Difícil de ler

### ✅ DEPOIS (Com Formatação)

- Headers em verde com texto branco
- Linhas com cores alternadas
- Bordas em todas as células
- Titulos destacados
- **Fácil de ler e profissional**
- **Idêntico ao layout da tela**

---

## 📥 Como Usar

1. Selecione um evento em "Selecione o Evento"
2. Clique em "Gerar Balizamento Automático"
3. Clique em "🖨️ Imprimir Balizamento"
4. O arquivo Excel será baixado automaticamente

**Nome do arquivo:** `Balizamento_{NomeEvento}_{Data}.xlsx`

---

## 💾 Arquivos Modificados

- ✅ [balizamento.html](balizamento.html) - Adição da biblioteca XLSX
- ✅ [balizamento.js](js/balizamento.js) - Implementação da formatação visual
- ✅ [xlsx.min.js](js-temp/xlsx.min.js) - Biblioteca SheetJS v0.18.5 (861KB)

---

**Status:** ✨ CONCLUÍDO E TESTADO
