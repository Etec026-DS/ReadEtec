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

// Diz se um livro está emprestado agora.
// Por enquanto ainda não existem empréstimos, então a lista vem vazia.
// Quando fizermos a aba Empréstimos, esta função já vai funcionar sozinha.
function livroEstaEmprestado(livroId) {
  const emprestimos = carregar("emprestimos");
  return emprestimos.some(function (emp) {
    return emp.livroId === livroId && emp.devolvidoEm === null;
  });
}
