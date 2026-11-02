// =====================================================================
// preferencias.js: seletor de preferências de leitura (RF13)
//
// É um "componente" reaproveitável: o mesmo código monta as preferências
// no cadastro de leitores do admin e no "Meu perfil" do leitor.
//
// No HTML, ele precisa destes elementos (trocando "prefixo" pelo nome usado):
//   #prefixo-generos       -> onde ficam as caixinhas de gênero
//   #prefixo-autor-input   -> campo para digitar um autor
//   #prefixo-autor-add     -> botão "Adicionar"
//   #prefixo-autores       -> onde aparecem os autores escolhidos
//   #prefixo-lista-autores -> <datalist> com as sugestões de autores
// =====================================================================

function criarSeletorPreferencias(prefixo) {
  const caixaGeneros = document.getElementById(prefixo + "-generos");
  const campoAutor = document.getElementById(prefixo + "-autor-input");
  const botaoAdicionar = document.getElementById(prefixo + "-autor-add");
  const caixaAutores = document.getElementById(prefixo + "-autores");
  const listaSugestoes = document.getElementById(prefixo + "-lista-autores");

  let autoresEscolhidos = [];

  // Uma caixinha de marcar para cada gênero
  GENEROS.forEach(function (genero) {
    caixaGeneros.innerHTML += `
      <label class="check"><input type="checkbox" value="${genero}"> ${genero}</label>`;
  });

  // Sugestões do campo de autor = autores que existem no acervo.
  // Assim o nome fica escrito IGUAL ao do livro, e o aviso de novidade funciona.
  function atualizarSugestoes() {
    listaSugestoes.innerHTML = autoresDoAcervo()
      .map(function (nome) {
        return `<option value="${escapar(nome)}">`;
      })
      .join("");
  }

  // Desenha os autores escolhidos como "etiquetas" com um × para remover
  function desenharAutores() {
    if (autoresEscolhidos.length === 0) {
      caixaAutores.innerHTML = '<span class="dica">Nenhum autor adicionado.</span>';
      return;
    }
    caixaAutores.innerHTML = autoresEscolhidos
      .map(function (autor, posicao) {
        return `<span class="chip">${escapar(autor)}
          <button type="button" data-posicao="${posicao}" title="Remover">×</button></span>`;
      })
      .join("");
  }

  function adicionarAutor() {
    const nome = campoAutor.value.trim();
    if (nome === "") {
      return;
    }
    const jaTem = autoresEscolhidos.some(function (a) {
      return a.toLowerCase() === nome.toLowerCase();
    });
    if (!jaTem) {
      autoresEscolhidos.push(nome);
    }
    campoAutor.value = "";
    desenharAutores();
  }

  botaoAdicionar.addEventListener("click", adicionarAutor);

  // Enter no campo de autor adiciona o autor (em vez de enviar o formulário)
  campoAutor.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      adicionarAutor();
    }
  });

  // Clique no × de uma etiqueta remove aquele autor
  caixaAutores.addEventListener("click", function (evento) {
    const posicao = evento.target.dataset.posicao;
    if (posicao !== undefined) {
      autoresEscolhidos.splice(Number(posicao), 1);
      desenharAutores();
    }
  });

  // Devolve as preferências marcadas na tela
  function obter() {
    const generos = [];
    caixaGeneros.querySelectorAll("input:checked").forEach(function (caixa) {
      generos.push(caixa.value);
    });
    return { generos: generos, autores: [...autoresEscolhidos] };
  }

  // Coloca na tela as preferências de um leitor (usado ao editar)
  function definir(preferencias) {
    const prefs = preferencias || { generos: [], autores: [] };
    caixaGeneros.querySelectorAll("input").forEach(function (caixa) {
      caixa.checked = prefs.generos.includes(caixa.value);
    });
    autoresEscolhidos = [...prefs.autores];
    campoAutor.value = "";
    desenharAutores();
  }

  function limpar() {
    definir({ generos: [], autores: [] });
  }

  atualizarSugestoes();
  desenharAutores();

  // Estas são as funções que quem usar o componente pode chamar
  return { obter: obter, definir: definir, limpar: limpar, atualizarSugestoes: atualizarSugestoes };
}
