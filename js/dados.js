// =====================================================================
// dados.js: funções para GUARDAR e LER dados no navegador
//
// O localStorage é uma "gaveta" do navegador que guarda textos.
// Ele só guarda TEXTO, então usamos:
//   JSON.stringify(lista) -> transforma a lista em texto para salvar
//   JSON.parse(texto)     -> transforma o texto de volta em lista
// =====================================================================

// Lista de gêneros usada nos livros (e depois nas preferências do leitor)
const GENEROS = [
  "Romance",
  "Fantasia",
  "Ficção científica",
  "Terror",
  "Suspense",
  "Aventura",
  "Biografia",
  "Poesia",
  "Didático",
  "Infantojuvenil",
  "Outro",
];

// Lê uma lista do localStorage. Se não existir nada ainda, devolve lista vazia.
function carregar(chave) {
  const texto = localStorage.getItem(chave);
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

// Salva uma lista no localStorage, substituindo o que havia antes.
function salvar(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

// Gera um identificador único para cada registro (livro, leitor, empréstimo).
// Date.now() = milissegundos desde 1970, e o número aleatório evita repetição.
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Protege o HTML: se alguém digitar <script> no título de um livro, isso vira
// texto comum em vez de ser executado como código. (Segurança: evita XSS.)
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// Transforma uma data salva ("2026-11-02T15:00:00.000Z") em "02/11/2026"
function formatarData(dataIso) {
  if (!dataIso) {
    return "-";
  }
  return new Date(dataIso).toLocaleDateString("pt-BR");
}

// Adiciona os livros de ACERVO_INICIAL (acervo-inicial.js) uma única vez.
// Uma "marca" no localStorage registra que isso já foi feito, assim os
// exemplos não voltam se o bibliotecário excluir algum deles.
function carregarAcervoInicial() {
  if (localStorage.getItem("acervoInicialCarregado") === "sim") {
    return;
  }

  const livros = carregar("livros");
  const hoje = new Date();

  ACERVO_INICIAL.forEach(function (exemplo, posicao) {
    // Não duplica um título que já tenha sido cadastrado à mão
    const jaExiste = livros.some(function (l) {
      return l.titulo.toLowerCase() === exemplo.titulo.toLowerCase();
    });
    if (jaExiste) {
      return;
    }

    // Datas de inclusão espalhadas: um livro a cada 7 dias para trás,
    // para o acervo parecer real (e servir depois para as estatísticas)
    const dataInclusao = new Date(hoje);
    dataInclusao.setDate(hoje.getDate() - posicao * 7);

    livros.push({
      id: gerarId(),
      titulo: exemplo.titulo,
      autor: exemplo.autor,
      genero: exemplo.genero,
      ano: exemplo.ano,
      criadoEm: dataInclusao.toISOString(),
    });
  });

  salvar("livros", livros);
  localStorage.setItem("acervoInicialCarregado", "sim");
}

// ---------------------------------------------------------------------
// LEITORES
// Cada leitor é um objeto assim:
//   { id, cartao: "RE-0001", nome, turma,
//     email1, email2, tel1, tel2,
//     preferencias: { autores: [...], generos: [...] },
//     senha, criadoEm }
// ---------------------------------------------------------------------

// Gera o próximo número de cartão: RE-0001, RE-0002...
// O contador fica salvo à parte, então um número NUNCA é reaproveitado,
// mesmo que um leitor seja excluído.
function proximoCartao() {
  const ultimo = Number(localStorage.getItem("ultimoCartao") || 0);
  const novo = ultimo + 1;
  localStorage.setItem("ultimoCartao", novo);
  return "RE-" + String(novo).padStart(4, "0");
}

function buscarLeitorPorId(id) {
  return carregar("leitores").find(function (l) {
    return l.id === id;
  });
}

// Procura pelo e-mail principal OU secundário (sem diferenciar maiúsculas)
function buscarLeitorPorEmail(email) {
  email = email.trim().toLowerCase();
  if (email === "") {
    return undefined;
  }
  return carregar("leitores").find(function (l) {
    return l.email1 === email || l.email2 === email;
  });
}

// Diz se um e-mail já pertence a OUTRO leitor.
// "idIgnorado" serve para a edição: o próprio leitor pode manter o seu e-mail.
function emailEmUso(email, idIgnorado) {
  const dono = buscarLeitorPorEmail(email);
  return dono !== undefined && dono.id !== idIgnorado;
}

// Cria um leitor novo, salva e devolve o objeto criado
function criarLeitor(dados) {
  const leitores = carregar("leitores");

  const leitor = {
    id: gerarId(),
    cartao: proximoCartao(),
    nome: dados.nome.trim(),
    turma: (dados.turma || "").trim(),
    email1: dados.email1.trim().toLowerCase(),
    email2: (dados.email2 || "").trim().toLowerCase(),
    tel1: (dados.tel1 || "").trim(),
    tel2: (dados.tel2 || "").trim(),
    preferencias: dados.preferencias || { autores: [], generos: [] },
    senha: dados.senha,
    criadoEm: new Date().toISOString(),
  };

  leitores.push(leitor);
  salvar("leitores", leitores);
  return leitor;
}

// Diz se um livro está emprestado agora.
// Por enquanto ainda não existem empréstimos, então a lista vem vazia.
// Quando fizermos a aba Empréstimos, esta função já vai funcionar sozinha.
function livroEstaEmprestado(livroId) {
  const emprestimos = carregar("emprestimos");
  return emprestimos.some(function (emp) {
    return emp.livroId === livroId && emp.devolvidoEm === null;
  });
}
