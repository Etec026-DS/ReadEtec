// =====================================================================
// mostrar-senha.js: coloca um botão 👁️ em TODOS os campos de senha
//
// Basta incluir este arquivo numa página: ele procura todos os
// <input type="password"> e adiciona o botão ao lado de cada um.
// Ao clicar, o campo alterna entre type="password" (••••) e type="text".
// =====================================================================

document.querySelectorAll('input[type="password"]').forEach(function (campo) {
  // Coloca o campo dentro de uma "caixa" para posicionar o botão por cima dele
  const caixa = document.createElement("div");
  caixa.className = "campo-senha";
  campo.parentNode.insertBefore(caixa, campo);
  caixa.appendChild(campo);

  const botao = document.createElement("button");
  botao.type = "button"; // "button" para NÃO enviar o formulário ao clicar
  botao.className = "botao-olho";
  botao.textContent = "👁️";
  botao.title = "Mostrar senha";
  botao.setAttribute("aria-label", "Mostrar senha");
  caixa.appendChild(botao);

  botao.addEventListener("click", function () {
    const estaEscondida = campo.type === "password";
    campo.type = estaEscondida ? "text" : "password";
    botao.textContent = estaEscondida ? "🙈" : "👁️";
    botao.title = estaEscondida ? "Esconder senha" : "Mostrar senha";
    botao.setAttribute("aria-label", botao.title);
    campo.focus();
  });
});
