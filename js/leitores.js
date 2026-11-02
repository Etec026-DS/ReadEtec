// =====================================================================
// leitores.js: aba Leitores do admin (RF02, RF03, RF13)
//
// Mostra TODOS os leitores: os que criaram a própria conta no login
// e os que o bibliotecário cadastrou aqui. Os dois ficam na mesma
// lista "leitores" do localStorage.
// =====================================================================

const formLeitor = document.getElementById("form-leitor");
const campoLeitorId = document.getElementById("leitor-id");
const campoLeitorNome = document.getElementById("leitor-nome");
const campoLeitorTurma = document.getElementById("leitor-turma");
const campoLeitorEmail1 = document.getElementById("leitor-email1");
const campoLeitorEmail2 = document.getElementById("leitor-email2");
const campoLeitorTel1 = document.getElementById("leitor-tel1");
const campoLeitorTel2 = document.getElementById("leitor-tel2");
const campoLeitorSenha = document.getElementById("leitor-senha");
const rotuloLeitorSenha = document.getElementById("rotulo-leitor-senha");
const tituloFormLeitor = document.getElementById("titulo-form-leitor");
const erroLeitor = document.getElementById("leitor-erro");
const tabelaLeitores = document.getElementById("tabela-leitores");
const avisoLeitoresVazio = document.getElementById("leitores-vazio");

// O componente de preferências (preferencias.js) com o prefixo "leitor"
const preferenciasLeitor = criarSeletorPreferencias("leitor");

function mostrarErroLeitor(mensagem) {
  erroLeitor.textContent = mensagem;
  erroLeitor.hidden = mensagem === "";
}

// Resume as preferências numa frase curta para a tabela
function resumoPreferencias(prefs) {
  if (!prefs) {
    return "-";
  }
  const partes = [...prefs.generos, ...prefs.autores];
  return partes.length > 0 ? partes.join(", ") : "-";
}

// Desenha a tabela com todos os leitores, ordenados pelo número do cartão
function mostrarLeitores() {
  const leitores = carregar("leitores");
  leitores.sort(function (a, b) {
    return a.cartao.localeCompare(b.cartao);
  });

  tabelaLeitores.innerHTML = "";

  leitores.forEach(function (leitor) {
    // Mostra o e-mail secundário embaixo do principal, se existir
    const emails = escapar(leitor.email1) +
      (leitor.email2 ? `<br><small>${escapar(leitor.email2)}</small>` : "");
    const telefones = (escapar(leitor.tel1) || "-") +
      (leitor.tel2 ? `<br><small>${escapar(leitor.tel2)}</small>` : "");

    tabelaLeitores.innerHTML += `
      <tr>
        <td><strong>${leitor.cartao}</strong></td>
        <td>${escapar(leitor.nome)}</td>
        <td>${escapar(leitor.turma) || "-"}</td>
        <td>${emails}</td>
        <td>${telefones}</td>
        <td><small>${escapar(resumoPreferencias(leitor.preferencias))}</small></td>
        <td>
          <button class="icone" title="Editar" onclick="editarLeitor('${leitor.id}')">✏️</button>
          <button class="icone" title="Excluir" onclick="excluirLeitor('${leitor.id}')">🗑️</button>
        </td>
      </tr>`;
  });

  avisoLeitoresVazio.style.display = leitores.length === 0 ? "block" : "none";
}

// Volta o formulário ao modo "cadastrar novo"
function limparFormLeitor() {
  formLeitor.reset();
  campoLeitorId.value = "";
  preferenciasLeitor.limpar();
  tituloFormLeitor.textContent = "Cadastrar leitor";
  rotuloLeitorSenha.textContent = "Senha inicial * (mínimo 6)";
  campoLeitorSenha.required = true; // ao CADASTRAR, a senha é obrigatória
  mostrarErroLeitor("");
}

formLeitor.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const id = campoLeitorId.value; // vazio = novo leitor
  const email1 = campoLeitorEmail1.value.trim().toLowerCase();
  const email2 = campoLeitorEmail2.value.trim().toLowerCase();

  // ---------- Validações ----------
  if (email1 === email2) {
    mostrarErroLeitor("O e-mail secundário deve ser diferente do principal.");
    return;
  }
  if (emailEmUso(email1, id)) {
    mostrarErroLeitor("O e-mail principal já pertence a outro leitor.");
    return;
  }
  if (email2 !== "" && emailEmUso(email2, id)) {
    mostrarErroLeitor("O e-mail secundário já pertence a outro leitor.");
    return;
  }

  const dados = {
    nome: campoLeitorNome.value.trim(),
    turma: campoLeitorTurma.value.trim(),
    email1: email1,
    email2: email2,
    tel1: campoLeitorTel1.value.trim(),
    tel2: campoLeitorTel2.value.trim(),
    preferencias: preferenciasLeitor.obter(),
  };

  if (id === "") {
    // NOVO leitor: criarLeitor() (dados.js) gera o id e o cartão RE-xxxx
    dados.senha = campoLeitorSenha.value;
    criarLeitor(dados);
  } else {
    // EDIÇÃO
    const leitores = carregar("leitores");
    const leitor = leitores.find(function (l) {
      return l.id === id;
    });
    Object.assign(leitor, dados);
    // Senha em branco = mantém a senha atual
    if (campoLeitorSenha.value !== "") {
      leitor.senha = campoLeitorSenha.value;
    }
    salvar("leitores", leitores);
  }

  limparFormLeitor();
  mostrarLeitores();
});

// Carrega um leitor no formulário para editar
function editarLeitor(id) {
  const leitor = buscarLeitorPorId(id);

  campoLeitorId.value = leitor.id;
  campoLeitorNome.value = leitor.nome;
  campoLeitorTurma.value = leitor.turma;
  campoLeitorEmail1.value = leitor.email1;
  campoLeitorEmail2.value = leitor.email2;
  campoLeitorTel1.value = leitor.tel1;
  campoLeitorTel2.value = leitor.tel2;
  campoLeitorSenha.value = "";
  preferenciasLeitor.definir(leitor.preferencias);

  // Ao EDITAR, a senha é opcional: só muda se o admin digitar uma nova
  campoLeitorSenha.required = false;
  rotuloLeitorSenha.textContent = "Nova senha (deixe em branco para manter)";
  tituloFormLeitor.textContent = "Editar leitor " + leitor.cartao;
  mostrarErroLeitor("");
  campoLeitorNome.focus();
}

// Exclui um leitor, mas não se ele estiver com algum livro emprestado
function excluirLeitor(id) {
  if (leitorTemEmprestimoAberto(id)) {
    alert("Este leitor está com um livro emprestado e não pode ser excluído. Registre a devolução primeiro.");
    return;
  }

  const leitor = buscarLeitorPorId(id);
  if (!confirm(`Excluir o leitor ${leitor.nome} (${leitor.cartao})?`)) {
    return;
  }

  const leitores = carregar("leitores").filter(function (l) {
    return l.id !== id;
  });
  salvar("leitores", leitores);

  if (campoLeitorId.value === id) {
    limparFormLeitor();
  }
  mostrarLeitores();
}

document.getElementById("leitor-limpar").addEventListener("click", limparFormLeitor);

// Sempre que a aba Leitores for aberta, atualiza a lista e as sugestões de autor.
// (Um leitor pode ter criado a conta em outra aba do navegador, ou um livro
// novo pode ter trazido um autor novo.)
document.addEventListener("abaAberta", function (evento) {
  if (evento.detail === "leitores") {
    preferenciasLeitor.atualizarSugestoes();
    mostrarLeitores();
  }
});

mostrarLeitores();
