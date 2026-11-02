// =====================================================================
// capa-livro.js: cartão com CAPA e SINOPSE ao passar o mouse num livro
//
// Funciona em qualquer tabela: basta a linha ter data-livro-id="..."
//   <tr data-livro-id="abc123"> ... </tr>
// No celular (sem mouse), tocar na linha mostra o cartão.
//
// As capas vêm da Open Library (openlibrary.org), um acervo aberto e
// gratuito. Os 50 livros de exemplo já vêm com o número da capa; para os
// livros cadastrados pelo admin, a capa é procurada na primeira vez.
// =====================================================================

// Um único cartão para a página inteira, que muda de conteúdo e de lugar
const cartaoCapa = document.createElement("div");
cartaoCapa.className = "cartao-capa";
cartaoCapa.hidden = true;
document.body.appendChild(cartaoCapa);

let livroNoCartao = null; // id do livro mostrado agora
const capasProcurando = new Set(); // evita procurar a mesma capa duas vezes ao mesmo tempo

function htmlDaCapa(livro) {
  if (livro.capa) {
    // Se a imagem não carregar (sem internet), troca pelo desenho de livro
    return `<img src="${enderecoDaCapa(livro.capa)}" alt="Capa de ${escapar(livro.titulo)}"
              onerror="this.outerHTML='<div class=&quot;capa-vazia&quot;>📚</div>'">`;
  }
  if (livro.capa === undefined) {
    return '<div class="capa-vazia">⏳</div>'; // ainda procurando
  }
  return '<div class="capa-vazia">📚</div>'; // não existe capa
}

function desenharCartao(livro) {
  cartaoCapa.innerHTML = `
    ${htmlDaCapa(livro)}
    <div class="cartao-capa-texto">
      <strong>${escapar(livro.titulo)}</strong>
      <small>${escapar(livro.autor)}${livro.ano ? " · " + livro.ano : ""} · ${escapar(livro.genero)}</small>
      <p>${livro.sinopse ? escapar(livro.sinopse) : "<em>Sem sinopse cadastrada.</em>"}</p>
      ${etiquetaDisponibilidade(livro)}
    </div>`;
}

// Coloca o cartão perto do mouse, sem deixar que ele saia da tela
function posicionarCartao(x, y) {
  const margem = 16;
  const largura = cartaoCapa.offsetWidth;
  const altura = cartaoCapa.offsetHeight;
  let esquerda = x + margem;
  let topo = y + margem;
  if (esquerda + largura > window.innerWidth - 8) esquerda = x - largura - margem; // vira para a esquerda
  if (topo + altura > window.innerHeight - 8) topo = window.innerHeight - altura - 8; // sobe
  cartaoCapa.style.left = Math.max(8, esquerda) + "px";
  cartaoCapa.style.top = Math.max(8, topo) + "px";
}

async function mostrarCartao(livroId, x, y) {
  const livro = carregar("livros").find(function (l) {
    return l.id === livroId;
  });
  if (!livro) return;

  livroNoCartao = livroId;
  desenharCartao(livro);
  cartaoCapa.hidden = false;
  posicionarCartao(x, y);

  // Livro sem capa definida: procura na internet uma única vez e guarda o resultado
  if (livro.capa === undefined && !capasProcurando.has(livroId)) {
    capasProcurando.add(livroId);
    const numero = await buscarCapaNaInternet(livro);
    capasProcurando.delete(livroId);
    if (numero === null) return; // sem internet: não salva nada, tenta de novo depois

    const livros = carregar("livros");
    const atual = livros.find(function (l) {
      return l.id === livroId;
    });
    if (!atual) return;
    atual.capa = numero; // número da capa, ou 0 = "não existe"
    salvar("livros", livros);

    // Se o mouse ainda estiver no mesmo livro, atualiza o cartão
    if (livroNoCartao === livroId && !cartaoCapa.hidden) desenharCartao(atual);
  }
}

function esconderCartao() {
  cartaoCapa.hidden = true;
  livroNoCartao = null;
}

// ---------- Mouse (computador) ----------
// "Delegação de eventos": um único ouvinte no documento serve para todas as
// linhas, inclusive as que forem desenhadas depois (ex.: ao pesquisar).
document.addEventListener("mouseover", function (evento) {
  const linha = evento.target.closest("[data-livro-id]");
  if (!linha) return;
  if (linha.dataset.livroId !== livroNoCartao) {
    mostrarCartao(linha.dataset.livroId, evento.clientX, evento.clientY);
  }
});

document.addEventListener("mousemove", function (evento) {
  if (!cartaoCapa.hidden && evento.target.closest("[data-livro-id]")) {
    posicionarCartao(evento.clientX, evento.clientY);
  }
});

document.addEventListener("mouseout", function (evento) {
  const saiuDe = evento.target.closest("[data-livro-id]");
  const foiPara = evento.relatedTarget && evento.relatedTarget.closest
    ? evento.relatedTarget.closest("[data-livro-id]")
    : null;
  if (saiuDe && saiuDe !== foiPara) esconderCartao();
});

// ---------- Toque (celular) ----------
document.addEventListener("click", function (evento) {
  // Botões dentro da linha (editar, excluir) continuam funcionando normalmente
  if (evento.target.closest("button")) return;
  const linha = evento.target.closest("[data-livro-id]");
  if (linha) {
    mostrarCartao(linha.dataset.livroId, evento.clientX, evento.clientY);
  } else if (!evento.target.closest(".cartao-capa")) {
    esconderCartao();
  }
});

// Ao rolar a página, o cartão ficaria no lugar errado: esconde
window.addEventListener("scroll", esconderCartao, { passive: true });
