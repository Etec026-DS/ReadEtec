// =====================================================================
// livros.js: aba Livros (RF01: cadastrar, editar e excluir livros)
//
// Cada livro é um objeto assim:
//   { id: "abc123", titulo: "Dom Casmurro", autor: "Machado de Assis",
//     genero: "Romance", ano: 1899, criadoEm: "2026-11-02T15:00:00.000Z" }
// =====================================================================

// Pegamos os elementos do HTML uma vez só, para usar várias vezes
const formLivro = document.getElementById("form-livro");
const campoId = document.getElementById("livro-id");
const campoTitulo = document.getElementById("livro-titulo");
const campoAutor = document.getElementById("livro-autor");
const campoGenero = document.getElementById("livro-genero");
const campoAno = document.getElementById("livro-ano");
const botaoLimparLivro = document.getElementById("livro-limpar");
const tituloFormLivro = document.getElementById("titulo-form-livro");
const tabelaLivros = document.getElementById("tabela-livros");
const avisoLivrosVazio = document.getElementById("livros-vazio");

// Preenche o <select> de gênero com a lista GENEROS (que está em dados.js)
function preencherGeneros() {
  campoGenero.innerHTML = '<option value="">Selecione...</option>';
  GENEROS.forEach(function (genero) {
    campoGenero.innerHTML += `<option value="${genero}">${genero}</option>`;
  });
}

// Desenha a tabela com todos os livros salvos
function mostrarLivros() {
  const livros = carregar("livros");

  // Ordena em ordem alfabética pelo título
  livros.sort(function (a, b) {
    return a.titulo.localeCompare(b.titulo);
  });

  tabelaLivros.innerHTML = "";

  livros.forEach(function (livro) {
    const emprestado = livroEstaEmprestado(livro.id);
    const etiqueta = emprestado
      ? '<span class="etiqueta emprestado">Emprestado</span>'
      : '<span class="etiqueta disponivel">Disponível</span>';

    tabelaLivros.innerHTML += `
      <tr>
        <td>${escapar(livro.titulo)}</td>
        <td>${escapar(livro.autor)}</td>
        <td>${escapar(livro.genero)}</td>
        <td>${livro.ano || "-"}</td>
        <td>${formatarData(livro.criadoEm)}</td>
        <td>${etiqueta}</td>
        <td>
          <button class="icone" title="Editar" onclick="editarLivro('${livro.id}')">✏️</button>
          <button class="icone" title="Excluir" onclick="excluirLivro('${livro.id}')">🗑️</button>
        </td>
      </tr>`;
  });

  // Mostra a mensagem "Nenhum livro cadastrado" só quando a lista está vazia
  avisoLivrosVazio.style.display = livros.length === 0 ? "block" : "none";
}

// Volta o formulário ao estado de "cadastrar novo"
function limparFormLivro() {
  formLivro.reset();
  campoId.value = "";
  tituloFormLivro.textContent = "Cadastrar livro";
}

// Chamado quando o formulário é enviado (botão Salvar)
formLivro.addEventListener("submit", function (evento) {
  // Sem isso, o navegador recarregaria a página ao enviar o formulário
  evento.preventDefault();

  const livros = carregar("livros");

  const dados = {
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    genero: campoGenero.value,
    ano: campoAno.value ? Number(campoAno.value) : null,
  };

  if (campoId.value === "") {
    // NOVO livro: cria um id e adiciona na lista
    dados.id = gerarId();
    dados.criadoEm = new Date().toISOString();
    livros.push(dados);
  } else {
    // EDIÇÃO: procura o livro pelo id e atualiza os campos
    const livro = livros.find(function (l) {
      return l.id === campoId.value;
    });
    Object.assign(livro, dados);
  }

  salvar("livros", livros);
  limparFormLivro();
  mostrarLivros();
});

// Carrega os dados de um livro no formulário para editar
function editarLivro(id) {
  const livro = carregar("livros").find(function (l) {
    return l.id === id;
  });

  campoId.value = livro.id;
  campoTitulo.value = livro.titulo;
  campoAutor.value = livro.autor;
  campoGenero.value = livro.genero;
  campoAno.value = livro.ano || "";

  tituloFormLivro.textContent = "Editar livro";
  campoTitulo.focus();
}

// Exclui um livro, mas não deixa excluir se ele estiver emprestado
function excluirLivro(id) {
  if (livroEstaEmprestado(id)) {
    alert("Este livro está emprestado e não pode ser excluído. Registre a devolução primeiro.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este livro?")) {
    return;
  }

  const livros = carregar("livros").filter(function (l) {
    return l.id !== id;
  });
  salvar("livros", livros);

  // Se o livro excluído estava aberto no formulário, limpa o formulário
  if (campoId.value === id) {
    limparFormLivro();
  }
  mostrarLivros();
}

botaoLimparLivro.addEventListener("click", limparFormLivro);

// Ao voltar para a aba Livros, redesenha a tabela: a situação
// (Disponível/Emprestado) pode ter mudado na aba Empréstimos
document.addEventListener("abaAberta", function (evento) {
  if (evento.detail === "livros") {
    mostrarLivros();
  }
});

// Ao abrir a página: coloca os livros de exemplo (só na 1ª vez),
// monta o select de gêneros e desenha a tabela
carregarAcervoInicial();
preencherGeneros();
mostrarLivros();
