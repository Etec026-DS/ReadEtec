// =====================================================================
// abas.js: troca de abas do menu
//
// Cada botão tem data-aba="nome", e cada seção tem id="nome".
// Ao clicar, tiramos a classe "ativa" de todos e colocamos só no escolhido.
// O CSS mostra apenas o que tem a classe "ativa".
// =====================================================================

const botoesAba = document.querySelectorAll(".aba");

botoesAba.forEach(function (botao) {
  botao.addEventListener("click", function () {
    const nomeAba = botao.dataset.aba;

    // Desativa todos os botões e todas as seções
    botoesAba.forEach(function (b) {
      b.classList.remove("ativa");
    });
    document.querySelectorAll(".conteudo-aba").forEach(function (secao) {
      secao.classList.remove("ativa");
    });

    // Ativa só o botão clicado e a seção correspondente
    botao.classList.add("ativa");
    document.getElementById(nomeAba).classList.add("ativa");
  });
});
