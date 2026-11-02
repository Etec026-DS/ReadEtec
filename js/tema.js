// =====================================================================
// tema.js: alterna entre tema claro e escuro
//
// O tema fica no atributo data-tema do <html> ("claro" ou "escuro").
// O CSS troca as cores conforme esse atributo (ver o início do style.css).
// A escolha é salva no localStorage para valer nas próximas visitas.
// =====================================================================

const botaoTema = document.getElementById("botao-tema");

// Mostra a lua no tema claro (para ir ao escuro) e o sol no escuro (para voltar ao claro)
function atualizarIconeTema() {
  const escuro = document.documentElement.dataset.tema === "escuro";
  botaoTema.textContent = escuro ? "☀️" : "🌙";
  botaoTema.title = escuro ? "Mudar para tema claro" : "Mudar para tema escuro";
}

botaoTema.addEventListener("click", function () {
  const novoTema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  document.documentElement.dataset.tema = novoTema;
  localStorage.setItem("tema", novoTema);
  atualizarIconeTema();
});

atualizarIconeTema();
