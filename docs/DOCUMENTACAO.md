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

O sistema tem **dois tipos de usuário**, cada um com permissões próprias:

**Administrador: o bibliotecário.** Entra com o usuário `admin`. Gerencia o acervo, cadastra, edita e exclui leitores, registra empréstimos e devoluções e acompanha as notificações.

**Leitor:** alunos, professores e funcionários da Etec. **Cria a própria conta** com e-mail e senha e recebe automaticamente um **número de cartão da biblioteca** (credencial digital), que o identifica nos empréstimos. Pela sua área, ele pesquisa o acervo, acompanha os seus empréstimos, edita o seu perfil e as suas preferências e lê os avisos recebidos. O leitor **não** registra empréstimos: isso é feito pelo bibliotecário no balcão, na entrega do livro físico.

## C. Requisitos

### Requisitos funcionais (o que o sistema faz)

**Obrigatórios (versão de entrega):**

| Código | Requisito |
|---|---|
| RF01 | Cadastrar, editar e excluir livros (título, autor, gênero, ano, **quantidade de exemplares**). A **data de inclusão** é registrada automaticamente. O sistema já vem com um **acervo inicial de 50 livros** (25 brasileiros e 25 estrangeiros) |
| RF02 | Cadastrar leitores (nome, turma/função, **e-mail principal e secundário**, **telefone principal e secundário**) |
| RF03 | Gerar automaticamente um **número de cartão da biblioteca** para cada leitor cadastrado |
| RF04 | Realizar empréstimo de um livro para um leitor |
| RF05 | **Impedir o empréstimo de um livro que já está emprestado** |
| RF06 | Definir automaticamente a **data prevista de devolução** (7 dias após o empréstimo) |
| RF07 | Registrar a devolução de um livro |
| RF08 | Consultar os livros disponíveis |
| RF09 | Pesquisar livros por título ou autor |
| RF18 | **Login** de administrador (usuário e senha fixos) e de leitor (e-mail e senha) |
| RF19 | **Criação de conta** pelo próprio leitor, sem permitir e-mail repetido |
| RF20 | **Controle de acesso:** cada página só abre para o tipo de usuário certo; botão "Sair" |
| RF21 | **Área do leitor:** pesquisar o acervo, ver os livros que estão com ele e o seu histórico, editar o perfil (nome, contatos, preferências) e ver os seus avisos |
| RF22 | O leitor pode **alterar a senha**, informando a senha atual |
| RF23 | O leitor pode **excluir a própria conta**, confirmando com a senha, desde que não tenha pendências |
| RF24 | O leitor pode **pedir mais prazo** (1 a 7 dias, com motivo opcional); o admin **aceita ou recusa**, e o leitor recebe um aviso com a resposta |
| RF25 | O admin **registra o pagamento** das multas |

**Desejáveis (se der tempo):**

| Código | Requisito |
|---|---|
| RF10 | Listar os empréstimos **atrasados** (agenda de devoluções) |
| RF11 | Mostrar estatísticas: livros, autores e gêneros mais emprestados |
| RF12 | Calcular a multa por atraso (ex.: R$ 1,00 por dia) |

**Notificações por e-mail:**

| Código | Requisito |
|---|---|
| RF13 | Cadastrar as **preferências** do leitor: autores e gêneros favoritos |
| RF14 | Enviar e-mail de **lembrete** quando faltarem 2 dias para o fim do prazo do empréstimo |
| RF15 | Enviar e-mail de **atraso** quando o prazo do empréstimo for ultrapassado |
| RF16 | Enviar e-mail de **novidade** aos leitores cujas preferências combinam com o autor ou o gênero de um livro recém-cadastrado |
| RF17 | Usar **modelos de e-mail pré-programados** para cada tipo de aviso e registrar os e-mails enviados num histórico |

**Fora do escopo desta versão (melhorias futuras):**
- Multa por dano ao livro
- Acesso dos leitores ao sistema (login próprio)
- Banco de dados em servidor, para os dados serem compartilhados entre computadores
- Login seguro: nesta versão o login é simbólico (a senha do admin está no código e as senhas ficam no navegador). Um sistema real precisaria de um servidor com senhas criptografadas

### Regras de negócio dos empréstimos

| Código | Regra |
|---|---|
| RN01 | Cada livro tem uma quantidade de **exemplares** (cópias físicas). Só é possível emprestar se houver exemplar disponível: com 3 exemplares de *1984*, até 3 leitores podem estar com ele ao mesmo tempo |
| RN10 | Um leitor não pode pegar **dois exemplares do mesmo livro** ao mesmo tempo |
| RN11 | O total de exemplares não pode ser reduzido para menos do que os emprestados no momento |
| RN02 | Prazo de devolução: **7 dias** após o empréstimo |
| RN03 | Cada leitor pode ter no máximo **3 livros** ao mesmo tempo |
| RN04 | Leitor com livro **atrasado** não pode pegar outro até devolvê-lo |
| RN05 | Multa de **R$ 1,00 por dia** de atraso, calculada na devolução |
| RN06 | Livro emprestado **não pode ser excluído** |
| RN07 | **Pendência** = livro não devolvido ou multa não paga. Leitor com pendência não pode ter a conta excluída (nem por ele mesmo, nem pelo admin) |
| RN08 | Leitor com **multa não paga** não pode pegar novos livros |
| RN09 | Só é possível pedir mais prazo **antes do vencimento** e com um pedido por vez |

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
│  Nome:  [_______________________]  Turma/Função: [_______]  │
│  E-mail principal:  [______________]  Secundário: [_______] │
│  Telefone principal:[______________]  Secundário: [_______] │
│  Preferências                                               │
│  Autores: [ Machado de Assis, Tolkien ]                     │
│  Gêneros: [✓] Romance [ ] Fantasia [✓] Terror [ ] ...       │
│                                     [ Limpar ] [ Salvar ]   │
├─────────────────────────────────────────────────────────────┤
│  Cartão   │ Nome            │ Turma   │ E-mail         │    │
│  RE-0001  │ Ana Souza       │ 2º DS   │ ana@email.com  │✏️🗑│
│  RE-0002  │ Bruno Lima      │ Prof.   │ bruno@email.com│✏️🗑│
└─────────────────────────────────────────────────────────────┘
```
- O número do cartão (RE-0001, RE-0002...) é gerado automaticamente ao salvar.
- O e-mail principal é obrigatório; o secundário e os telefones são opcionais.
- Os avisos são enviados para os dois e-mails, quando houver.

### Tela 6: Notificações (RF14 a RF17)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Livros ] [ Leitores ] [ Empréstimos ] [ Pesquisa ] [■ Notificações ] │
├─────────────────────────────────────────────────────────────┤
│  [ Verificar prazos e enviar avisos ]                       │
├─────────────────────────────────────────────────────────────┤
│  Histórico de e-mails enviados                              │
│  Data  │ Tipo         │ Para           │ Assunto            │
│  02/11 │ ⏰ Lembrete  │ ana@email.com  │ Seu prazo vence... │
│  02/11 │ ⚠️ Atraso    │ bruno@email.com│ Livro em atraso    │
│  02/11 │ ✨ Novidade  │ ana@email.com  │ Novo livro de M... │
└─────────────────────────────────────────────────────────────┘
```
- Ao abrir o sistema (ou ao clicar no botão), os empréstimos são verificados e os avisos de lembrete e atraso são enviados.
- Ao cadastrar um livro, os leitores com preferência pelo autor ou gênero recebem o aviso de novidade.
- Cada aviso é enviado só uma vez, para o leitor não receber e-mails repetidos.

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
| 02/11 | Claude Code | Como enviar e-mails automáticos de prazo, atraso e novidades | O grupo definiu os requisitos; a IA explicou as limitações de um site estático e as opções de envio |
