// =====================================================================
// pesquisa.js: pesquisa do acervo (RF08, RF09)
//
// É um componente reaproveitável: criarPesquisa(caixa) monta a pesquisa
// inteira (campo de busca, filtros e tabela) dentro do elemento "caixa".
// Usado na aba Pesquisa do admin e, depois, na área do leitor.
//
// Regras da busca:
//   - procura no TÍTULO e no AUTOR;
//   - não diferencia maiúsculas/minúsculas nem acentos
//     ("DOSTOIEVSKI", "dostoiévski" e "Dostoiévski" acham o mesmo livro);
//   - cada palavra digitada precisa aparecer em algum lugar, em qualquer
//     ordem ("assis dom" encontra "Dom Casmurro", de Machado de Assis);
//   - filtros de gênero: pode marcar vários; sem nenhum marcado = todos.
// =====================================================================

function criarPesquisa(caixa) {
  // ---------- 1. Monta o HTML do componente ----------
  caixa.innerHTML = `
    <div class="cartao">
      <h2>Pesquisar no acervo</h2>
      <input type="search" class="pesquisa-campo"
             placeholder="🔍 Digite o título ou o autor (maiúsculas e acentos não importam)">

      <p class="rotulo">Filtrar por gênero</p>
      <div class="filtros-genero"></div>

      <label class="check pesquisa-disponiveis">
        <input type="checkbox"> Mostrar só disponíveis
      </label>
    </div>

    <div class="cartao">
      <p class="pesquisa-contagem"></p>
      <table>
        <thead>
          <tr><th>Título</th><th>Autor</th><th>Gênero</th><th>Ano</th><th>Situação</th></tr>
        </thead>
        <tbody class="pesquisa-resultados"></tbody>
      </table>
      <p class="vazio pesquisa-vazio">Nenhum livro encontrado.</p>
    </div>`;

  const campoBusca = caixa.querySelector(".pesquisa-campo");
  const caixaFiltros = caixa.querySelector(".filtros-genero");
  const caixaDisponiveis = caixa.querySelector(".pesquisa-disponiveis input");
  const contagem = caixa.querySelector(".pesquisa-contagem");
  const tabela = caixa.querySelector(".pesquisa-resultados");
  const avisoVazio = caixa.querySelector(".pesquisa-vazio");

  // Gêneros escolhidos no filtro. Um Set é uma lista que não repete itens.
  const generosEscolhidos = new Set();

  // ---------- 2. Botões de filtro de gênero ----------
  // "Todos" + um botão por gênero. Clicar liga/desliga o filtro.
  caixaFiltros.innerHTML =
    '<button type="button" class="filtro ativo" data-genero="">Todos</button>' +
    GENEROS.map(function (genero) {
      return `<button type="button" class="filtro" data-genero="${genero}">${genero}</button>`;
    }).join("");

  caixaFiltros.addEventListener("click", function (evento) {
    const botao = evento.target.closest(".filtro");
    if (!botao) {
      return;
    }
    const genero = botao.dataset.genero;

    if (genero === "") {
      generosEscolhidos.clear(); // "Todos" limpa os filtros
    } else if (generosEscolhidos.has(genero)) {
      generosEscolhidos.delete(genero);
    } else {
      generosEscolhidos.add(genero);
    }

    // Pinta os botões: "Todos" fica ativo quando nenhum gênero está escolhido
    caixaFiltros.querySelectorAll(".filtro").forEach(function (b) {
      const g = b.dataset.genero;
      const ativo = g === "" ? generosEscolhidos.size === 0 : generosEscolhidos.has(g);
      b.classList.toggle("ativo", ativo);
    });

    atualizar();
  });

  // ---------- 3. A busca em si ----------
  function livroCombina(livro, palavras) {
    // Junta título e autor num texto só, já normalizado
    const texto = normalizarTexto(livro.titulo + " " + livro.autor);
    // TODAS as palavras digitadas precisam aparecer no texto
    return palavras.every(function (palavra) {
      return texto.includes(palavra);
    });
  }

  function atualizar() {
    // "  Dom   CASMURRO " -> ["dom", "casmurro"]
    const palavras = normalizarTexto(campoBusca.value).split(/\s+/).filter(Boolean);
    const soDisponiveis = caixaDisponiveis.checked;

    const encontrados = carregar("livros")
      .filter(function (livro) {
        if (!livroCombina(livro, palavras)) return false;
        if (generosEscolhidos.size > 0 && !generosEscolhidos.has(livro.genero)) return false;
        if (soDisponiveis && livroEstaEmprestado(livro.id)) return false;
        return true;
      })
      .sort(function (a, b) {
        return a.titulo.localeCompare(b.titulo);
      });

    tabela.innerHTML = encontrados
      .map(function (livro) {
        const etiqueta = livroEstaEmprestado(livro.id)
          ? '<span class="etiqueta emprestado">Emprestado</span>'
          : '<span class="etiqueta disponivel">Disponível</span>';
        return `
          <tr>
            <td>${escapar(livro.titulo)}</td>
            <td>${escapar(livro.autor)}</td>
            <td>${escapar(livro.genero)}</td>
            <td>${livro.ano || "-"}</td>
            <td>${etiqueta}</td>
          </tr>`;
      })
      .join("");

    const n = encontrados.length;
    contagem.textContent = n === 1 ? "1 livro encontrado" : n + " livros encontrados";
    avisoVazio.style.display = n === 0 ? "block" : "none";
  }

  // "input" dispara a cada letra digitada: a busca acontece enquanto se digita
  campoBusca.addEventListener("input", atualizar);
  caixaDisponiveis.addEventListener("change", atualizar);

  atualizar();

  // Quem usar o componente pode pedir para atualizar (ex.: ao abrir a aba)
  return { atualizar: atualizar };
}
