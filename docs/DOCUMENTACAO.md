# ReadEtec: Documentação do Projeto

**Atividade:** Construção de Software com IA
**Autores:** Lucas Sotero, Isabelle Antunes e Caroline Cheminand
**Data:** 02/11/2026

---

## A. Problema

Uma biblioteca que não tem um sistema informatizado controla tudo em papel ou planilhas soltas, e isso causa vários problemas:

- **Dificuldade para catalogar o acervo:** não se sabe com facilidade quais livros existem, de que autor ou gênero são, nem quantos exemplares há.
- **Empréstimos sem controle:** um livro pode ser "emprestado" duas vezes, e fica difícil saber com quem ele está.
- **Prazos esquecidos:** não há aviso de quais livros já deveriam ter sido devolvidos, o que gera atrasos e perda de livros.
- **Cadastro de leitores desorganizado:** a identificação dos leitores (cartão da biblioteca) é manual e sujeita a erros.
- **Falta de informação para decisões:** a biblioteca não sabe quais livros, autores e gêneros são os mais procurados, e por isso não consegue planejar novas aquisições.

O **ReadEtec** resolve esses problemas centralizando o cadastro de livros e leitores, o controle de empréstimos e devoluções com prazos, e a consulta ao acervo.

## B. Público-alvo

**Usuário principal: o bibliotecário.** É ele quem opera o sistema: cadastra livros e leitores, registra empréstimos e devoluções e consulta o acervo.

**Beneficiados indiretos: os leitores** (alunos, professores e funcionários da Etec). Eles não acessam o sistema nesta versão, mas recebem do bibliotecário um **número de cartão da biblioteca** (credencial digital), que os identifica nos empréstimos.

## C. Requisitos

### Requisitos funcionais (o que o sistema faz)

**Obrigatórios (versão de entrega):**

| Código | Requisito |
|---|---|
| RF01 | Cadastrar, editar e excluir livros (título, autor, gênero, ano) |
| RF02 | Cadastrar leitores (nome, turma/função, contato) |
| RF03 | Gerar automaticamente um **número de cartão da biblioteca** para cada leitor cadastrado |
| RF04 | Realizar empréstimo de um livro para um leitor |
| RF05 | **Impedir o empréstimo de um livro que já está emprestado** |
| RF06 | Definir automaticamente a **data prevista de devolução** (7 dias após o empréstimo) |
| RF07 | Registrar a devolução de um livro |
| RF08 | Consultar os livros disponíveis |
| RF09 | Pesquisar livros por título ou autor |

**Desejáveis (se der tempo):**

| Código | Requisito |
|---|---|
| RF10 | Listar os empréstimos **atrasados** (agenda de devoluções) |
| RF11 | Mostrar estatísticas: livros, autores e gêneros mais emprestados |
| RF12 | Calcular a multa por atraso (ex.: R$ 1,00 por dia) |

**Fora do escopo desta versão (melhorias futuras):**
- Multa por dano ao livro
- Acesso dos leitores ao sistema (login próprio)
- Banco de dados em servidor, para os dados serem compartilhados entre computadores

### Requisitos não funcionais (como o sistema deve ser)

| Código | Requisito |
|---|---|
| RNF01 | Funcionar no navegador, sem instalação (HTML, CSS e JavaScript) |
| RNF02 | Guardar os dados no navegador (`localStorage`), sem necessidade de banco de dados |
| RNF03 | Interface simples e em português |
| RNF04 | Ficar publicado na internet (Render) e versionado no GitHub |

## D. Protótipo

O sistema tem **uma única página** com um menu de abas no topo. Cada aba mostra um formulário (em cima) e uma tabela com os registros (embaixo).

### Tela 1: Livros (RF01)

```
┌─────────────────────────────────────────────────────────────┐
│  📚 ReadEtec                                                │
│  [■ Livros] [ Leitores ] [ Empréstimos ] [ Pesquisa ]       │
├─────────────────────────────────────────────────────────────┤
│  Cadastrar livro                                            │
│  Título: [_____________________]  Autor: [_______________]  │
│  Gênero: [ Romance        ▼ ]     Ano:   [____]             │
│                                     [ Limpar ] [ Salvar ]   │
├─────────────────────────────────────────────────────────────┤
│  Título           │ Autor         │ Gênero  │ Situação  │   │
│  Dom Casmurro     │ M. de Assis   │ Romance │ 🟢 Disp.  │✏️🗑│
│  O Hobbit         │ J.R.R.Tolkien │ Fantasia│ 🔴 Empr.  │✏️🗑│
└─────────────────────────────────────────────────────────────┘
```
- ✏️ carrega o livro no formulário para editar; 🗑 exclui (pede confirmação).
- Um livro emprestado não pode ser excluído.

### Tela 2: Leitores (RF02, RF03)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Livros ] [■ Leitores ] [ Empréstimos ] [ Pesquisa ]      │
├─────────────────────────────────────────────────────────────┤
│  Cadastrar leitor                                           │
│  Nome:  [_______________________]                           │
│  Turma/Função: [____________]  Contato: [________________]  │
│                                     [ Limpar ] [ Salvar ]   │
├─────────────────────────────────────────────────────────────┤
│  Cartão   │ Nome            │ Turma   │ Contato        │    │
│  RE-0001  │ Ana Souza       │ 2º DS   │ ana@email.com  │✏️🗑│
│  RE-0002  │ Bruno Lima      │ Prof.   │ (11) 9999-0000 │✏️🗑│
└─────────────────────────────────────────────────────────────┘
```
- O número do cartão (RE-0001, RE-0002...) é gerado automaticamente ao salvar.

### Tela 3: Empréstimos e devoluções (RF04 a RF07, RF10)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Livros ] [ Leitores ] [■ Empréstimos ] [ Pesquisa ]      │
├─────────────────────────────────────────────────────────────┤
│  Novo empréstimo                                            │
│  Leitor: [ RE-0001 - Ana Souza      ▼ ]                     │
│  Livro:  [ Dom Casmurro (só disponíveis) ▼ ]                │
│  Devolver até: 09/11/2026 (automático: hoje + 7 dias)       │
│                                          [ Emprestar ]      │
├─────────────────────────────────────────────────────────────┤
│  Empréstimos em aberto                                      │
│  Livro       │ Leitor     │ Emprestado │ Devolver até │     │
│  O Hobbit    │ Bruno Lima │ 25/10      │ 01/11 ⚠️ATRASO│[Devolver]│
│  1984        │ Ana Souza  │ 01/11      │ 08/11        │[Devolver]│
└─────────────────────────────────────────────────────────────┘
```
- A lista de livros mostra **apenas os disponíveis**, o que garante o RF05.
- Empréstimos vencidos aparecem destacados em vermelho (RF10).

### Tela 4: Pesquisa (RF08, RF09)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Livros ] [ Leitores ] [ Empréstimos ] [■ Pesquisa ]      │
├─────────────────────────────────────────────────────────────┤
│  🔍 [ Digite o título ou o autor...           ]             │
│  [✓] Mostrar só disponíveis                                 │
├─────────────────────────────────────────────────────────────┤
│  Título           │ Autor         │ Gênero  │ Situação      │
│  Dom Casmurro     │ M. de Assis   │ Romance │ 🟢 Disponível │
│  Memórias Póstumas│ M. de Assis   │ Romance │ 🟢 Disponível │
└─────────────────────────────────────────────────────────────┘
```
- O resultado é filtrado enquanto o usuário digita.

### (Desejável) Tela 5: Estatísticas (RF11)

```
┌─────────────────────────────────────────────────────────────┐
│  Total de livros: 42   Emprestados: 7   Atrasados: 2        │
│  Mais emprestados:  1. O Hobbit (12)  2. 1984 (9)  ...      │
│  Autores top:       1. Machado de Assis (15)  ...           │
│  Gêneros top:       1. Romance ████████  2. Fantasia █████  │
└─────────────────────────────────────────────────────────────┘
```

## E. Registro de uso da IA

| Data | Ferramenta | O que foi solicitado | Como a resposta foi utilizada |
|---|---|---|---|
| 02/11 | Claude Code | Análise dos requisitos da atividade | Usado para entender as entregas e montar o cronograma |
| 02/11 | Claude Code | Escolha da tecnologia e configuração do Git/GitHub | Escolhemos HTML/CSS/JS com localStorage; repositório criado na organização |
| 02/11 | Claude Code | Revisão do texto de problema, público-alvo e requisitos | As ideias foram do grupo; a IA organizou o texto e ajudou a priorizar os requisitos |
| 02/11 | Claude Code | Rascunho do protótipo das telas | Usado como base; o grupo revisou e redesenhou as telas |
