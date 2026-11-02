// =====================================================================
// sessao.js: login, logout e proteção das páginas (o "porteiro")
//
// Quando alguém entra, guardamos no sessionStorage QUEM entrou:
//   { tipo: "admin" }                        -> bibliotecário
//   { tipo: "leitor", leitorId: "abc123" }   -> leitor
//
// sessionStorage x localStorage:
//   o sessionStorage é apagado quando a aba é fechada. Assim, num
//   computador compartilhado, o próximo aluno não encontra a conta
//   do anterior aberta.
//
// ⚠️ AVISO DE SEGURANÇA (para citar na apresentação):
//   Num site sem servidor, este login é apenas SIMBÓLICO: a senha do
//   admin está visível aqui no código, e as senhas dos leitores ficam
//   salvas no navegador. Um sistema real precisaria de um servidor
//   com senhas criptografadas.
// =====================================================================

const ADMIN_USUARIO = "admin";
const ADMIN_SENHA = "12345678";

// Devolve a sessão atual, ou null se ninguém estiver logado
function sessaoAtual() {
  const texto = sessionStorage.getItem("sessao");
  return texto ? JSON.parse(texto) : null;
}

// Tenta fazer login. Devolve true se deu certo, false se não.
// "usuario" pode ser "admin" ou o e-mail de um leitor.
function entrar(usuario, senha) {
  usuario = usuario.trim().toLowerCase();

  if (usuario === ADMIN_USUARIO && senha === ADMIN_SENHA) {
    sessionStorage.setItem("sessao", JSON.stringify({ tipo: "admin" }));
    return true;
  }

  const leitor = buscarLeitorPorEmail(usuario);
  if (leitor && leitor.senha === senha) {
    sessionStorage.setItem("sessao", JSON.stringify({ tipo: "leitor", leitorId: leitor.id }));
    return true;
  }

  return false;
}

// Manda cada tipo de usuário para a sua página
function irParaAreaDoUsuario() {
  const sessao = sessaoAtual();
  if (sessao && sessao.tipo === "admin") {
    location.replace("admin.html");
  } else if (sessao && sessao.tipo === "leitor") {
    location.replace("leitor.html");
  }
}

// Sai do sistema e volta para o login
function encerrarSessao() {
  sessionStorage.removeItem("sessao");
  location.replace("index.html");
}

// O PORTEIRO: chamado no topo de cada página protegida.
// Se a pessoa não estiver logada com o tipo certo, volta para o login.
function exigirSessao(tipoExigido) {
  const sessao = sessaoAtual();

  if (!sessao || sessao.tipo !== tipoExigido) {
    location.replace("index.html");
    return;
  }

  // Se o leitor foi excluído pelo admin enquanto estava logado, sai também
  if (sessao.tipo === "leitor" && !buscarLeitorPorId(sessao.leitorId)) {
    encerrarSessao();
  }
}
