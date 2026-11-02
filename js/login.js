// =====================================================================
// login.js: página de login (index.html)
//   - Entrar: admin ou leitor
//   - Criar conta: cadastro do próprio leitor
// =====================================================================

const painelEntrar = document.getElementById("painel-entrar");
const painelCriar = document.getElementById("painel-criar");

// ---------- Alternar entre "Entrar" e "Criar conta" ----------
document.getElementById("link-criar").addEventListener("click", function (evento) {
  evento.preventDefault(); // o link "#" não deve mudar a página
  painelEntrar.hidden = true;
  painelCriar.hidden = false;
  document.getElementById("criar-nome").focus();
});

document.getElementById("link-entrar").addEventListener("click", function (evento) {
  evento.preventDefault();
  painelCriar.hidden = true;
  painelEntrar.hidden = false;
  document.getElementById("entrar-usuario").focus();
});

// Mostra uma mensagem de erro num parágrafo (ou esconde, se a mensagem for vazia)
function mostrarErro(idParagrafo, mensagem) {
  const paragrafo = document.getElementById(idParagrafo);
  paragrafo.textContent = mensagem;
  paragrafo.hidden = mensagem === "";
}

// ---------- ENTRAR ----------
document.getElementById("form-entrar").addEventListener("submit", function (evento) {
  evento.preventDefault();

  const usuario = document.getElementById("entrar-usuario").value;
  const senha = document.getElementById("entrar-senha").value;

  if (entrar(usuario, senha)) {
    irParaAreaDoUsuario();
  } else {
    // Mensagem genérica de propósito: não contamos se o erro foi no e-mail
    // ou na senha, para não ajudar quem está tentando adivinhar contas.
    mostrarErro("entrar-erro", "Usuário ou senha incorretos.");
  }
});

// ---------- CRIAR CONTA ----------
document.getElementById("form-criar").addEventListener("submit", function (evento) {
  evento.preventDefault();

  const email = document.getElementById("criar-email").value;
  const senha = document.getElementById("criar-senha").value;
  const confirmar = document.getElementById("criar-confirmar").value;

  // Validações que o próprio HTML não faz sozinho
  if (senha !== confirmar) {
    mostrarErro("criar-erro", "As senhas não são iguais.");
    return;
  }
  if (emailEmUso(email)) {
    mostrarErro("criar-erro", "Já existe uma conta com este e-mail.");
    return;
  }

  criarLeitor({
    nome: document.getElementById("criar-nome").value,
    turma: document.getElementById("criar-turma").value,
    email1: email,
    tel1: document.getElementById("criar-tel").value,
    senha: senha,
  });

  // Já entra direto na conta recém-criada
  entrar(email, senha);
  irParaAreaDoUsuario();
});
