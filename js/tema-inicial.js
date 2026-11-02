// =====================================================================
// tema-inicial.js: aplica o tema ANTES de a página aparecer
//
// Fica no <head> de todas as páginas, para a tela não "piscar" branco.
// Usa o tema salvo; se não houver, segue o tema do sistema operacional.
// (O botão que troca o tema fica em tema.js.)
// =====================================================================

(function () {
  let tema = null;
  try {
    tema = localStorage.getItem("tema");
  } catch (e) {
    // Alguns navegadores bloqueiam o localStorage; nesse caso seguimos o sistema
  }
  if (!tema) {
    tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }
  document.documentElement.dataset.tema = tema;
})();
