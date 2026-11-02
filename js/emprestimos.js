// =====================================================================
// emprestimos.js: aba Empréstimos do admin (RF04 a RF07, RF10, RF12)
//
// Regras:
//   - só aparecem livros DISPONÍVEIS para emprestar (RF05);
//   - prazo de devolução = data do empréstimo + 7 dias (RF06);
//   - leitor com livro ATRASADO não pode pegar outro;
//   - cada leitor pode ter no máximo 3 livros ao mesmo tempo;
//   - multa de R$ 1,00 por dia de atraso (RF12).
// As constantes PRAZO_DIAS, MULTA_POR_DIA e MAX_EMPRESTIMOS_POR_LEITOR
// ficam em dados.js; basta mudar lá para mudar a regra no sistema todo.
// =====================================================================

const formEmprestimo = document.getElementById("form-emprestimo");
const campoEmpLeitor = document.getElementById("emp-leitor");
const campoEmpLivro = document.getElementById("emp-livro");
const campoEmpData = document.getElementById("emp-data");
const campoEmpDevolver = document.getElementById("emp-devolver");
const erroEmp = document.getElementById("emp-erro");
const okEmp = document.getElementById("emp-ok");
const resumoEmp = document.getElementById("emp-resumo");
const tabelaEmpAbertos = document.getElementById("tabela-emp-abertos");
const tabelaEmpHistorico = document.getElementById("tabela-emp-historico");

// Mostra uma mensagem de erro OU de sucesso (e esconde a outra)
function mensagemEmp(tipo, texto) {
  erroEmp.hidden = tipo !== "erro";
  okEmp.hidden = tipo !== "ok";
  (tipo === "erro" ? erroEmp : okEmp).textContent = texto;
}

// ---------- Listas de seleção ----------
function preencherSelectLeitores() {
  const leitores = carregar("leitores").sort(function (a, b) {
    return a.nome.localeCompare(b.nome);
  });
  campoEmpLeitor.innerHTML =
    '<option value="">Selecione o leitor...</option>' +
    leitores
      .map(function (l) {
        return `<option value="${l.id}">${l.cartao} - ${escapar(l.nome)}</option>`;
      })
      .join("");
}

function preencherSelectLivros() {
  const disponiveis = carregar("livros")
    .filter(function (livro) {
      return !livroEstaEmprestado(livro.id);
    })
    .sort(function (a, b) {
      return a.titulo.localeCompare(b.titulo);
    });
  campoEmpLivro.innerHTML =
    '<option value="">Selecione o livro...</option>' +
    disponiveis
      .map(function (livro) {
        return `<option value="${livro.id}">${escapar(livro.titulo)} (${escapar(livro.autor)})</option>`;
      })
      .join("");
}

// Calcula e mostra o "Devolver até" sempre que a data do empréstimo muda
function atualizarDataDevolucao() {
  if (campoEmpData.value === "") {
    campoEmpDevolver.value = "";
    return;
  }
  const prazo = somarDias(dataDoCampo(campoEmpData.value), PRAZO_DIAS);
  campoEmpDevolver.value = prazo.toLocaleDateString("pt-BR");
}

// ---------- Tabelas ----------
function mostrarEmprestimos() {
  const todos = carregar("emprestimos");

  // EM ABERTO, com os que vencem primeiro no topo (atrasados aparecem antes)
  const abertos = todos
    .filter(function (e) {
      return e.devolvidoEm === null;
    })
    .sort(function (a, b) {
      return new Date(a.devolverAte) - new Date(b.devolverAte);
    });

  let qtdAtrasados = 0;
  let totalMultas = 0;

  tabelaEmpAbertos.innerHTML = abertos
    .map(function (emp) {
      const s = situacaoEmprestimo(emp);
      if (s.classe === "atraso") {
        qtdAtrasados++;
        totalMultas += s.multa;
      }
      return `
        <tr class="linha-${s.classe}">
          <td>${escapar(emp.livroTitulo)}</td>
          <td>${escapar(nomeDoLeitor(emp))}<br><small>${emp.leitorCartao}</small></td>
          <td>${formatarData(emp.emprestadoEm)}</td>
          <td>${formatarData(emp.devolverAte)}</td>
          <td><span class="etiqueta situacao-${s.classe}">${s.texto}</span></td>
          <td>${s.multa > 0 ? formatarDinheiro(s.multa) : "-"}</td>
          <td><button onclick="devolverLivro('${emp.id}')">Devolver</button></td>
        </tr>`;
    })
    .join("");
  document.getElementById("emp-abertos-vazio").style.display = abertos.length === 0 ? "block" : "none";

  resumoEmp.innerHTML = `
    <span><strong>${abertos.length}</strong> em aberto</span>
    <span class="${qtdAtrasados > 0 ? "texto-atraso" : ""}"><strong>${qtdAtrasados}</strong> atrasado(s)</span>
    <span>Multas a receber: <strong>${formatarDinheiro(totalMultas)}</strong></span>`;

  // HISTÓRICO, com as devoluções mais recentes primeiro
  const devolvidos = todos
    .filter(function (e) {
      return e.devolvidoEm !== null;
    })
    .sort(function (a, b) {
      return new Date(b.devolvidoEm) - new Date(a.devolvidoEm);
    });

  tabelaEmpHistorico.innerHTML = devolvidos
    .map(function (emp) {
      let situacao = '<span class="etiqueta situacao-ok">No prazo</span>';
      if (emp.multa > 0 && emp.multaPaga) {
        situacao = `<span class="etiqueta situacao-alerta">${emp.diasAtraso} dia(s) de atraso · multa ${formatarDinheiro(emp.multa)} paga</span>`;
      } else if (emp.multa > 0) {
        situacao = `<span class="etiqueta situacao-atraso">${emp.diasAtraso} dia(s) de atraso · multa ${formatarDinheiro(emp.multa)}</span>
          <button class="pequeno" onclick="registrarPagamento('${emp.id}')">Registrar pagamento</button>`;
      }
      return `
        <tr>
          <td>${escapar(emp.livroTitulo)}</td>
          <td>${escapar(nomeDoLeitor(emp))}<br><small>${emp.leitorCartao}</small></td>
          <td>${formatarData(emp.emprestadoEm)}</td>
          <td>${formatarData(emp.devolvidoEm)}</td>
          <td>${situacao}</td>
        </tr>`;
    })
    .join("");
  document.getElementById("emp-historico-vazio").style.display = devolvidos.length === 0 ? "block" : "none";
}

// ---------- SOLICITAÇÕES DE MAIS PRAZO (feitas pelo leitor) ----------
// O pedido fica dentro do próprio empréstimo:
//   emp.solicitacao = { dias, motivo, pedidoEm, status, respondidoEm }
//   status: "pendente", "aceita", "recusada" ou "cancelada"
function solicitacoesPendentes() {
  return carregar("emprestimos").filter(function (emp) {
    return emp.devolvidoEm === null && emp.solicitacao && emp.solicitacao.status === "pendente";
  });
}

function mostrarSolicitacoes() {
  const pendentes = solicitacoesPendentes();
  const tabela = document.getElementById("tabela-solicitacoes");

  tabela.innerHTML = pendentes
    .map(function (emp) {
      const sol = emp.solicitacao;
      const novaData = somarDias(new Date(emp.devolverAte), sol.dias);
      return `
        <tr>
          <td>${escapar(emp.livroTitulo)}</td>
          <td>${escapar(nomeDoLeitor(emp))}<br><small>${emp.leitorCartao}</small></td>
          <td>${formatarData(emp.devolverAte)} → <strong>${formatarData(novaData)}</strong>
              <br><small>+${sol.dias} dia(s)</small></td>
          <td>${escapar(sol.motivo) || "-"}</td>
          <td class="acoes-solicitacao">
            <button onclick="responderSolicitacao('${emp.id}', true)">Aceitar</button>
            <button class="secundario" onclick="responderSolicitacao('${emp.id}', false)">Recusar</button>
          </td>
        </tr>`;
    })
    .join("");

  // O cartão inteiro só aparece quando existe algum pedido
  document.getElementById("cartao-solicitacoes").hidden = pendentes.length === 0;

  // Contador no botão da aba: "Empréstimos (2)"
  const contador = document.getElementById("contador-solicitacoes");
  contador.textContent = pendentes.length;
  contador.hidden = pendentes.length === 0;
}

function responderSolicitacao(id, aceitar) {
  const emprestimos = carregar("emprestimos");
  const emp = emprestimos.find(function (e) {
    return e.id === id;
  });
  const sol = emp.solicitacao;

  if (aceitar) {
    emp.devolverAte = somarDias(new Date(emp.devolverAte), sol.dias).toISOString();
  }
  sol.status = aceitar ? "aceita" : "recusada";
  sol.respondidoEm = new Date().toISOString();
  salvar("emprestimos", emprestimos);

  // Avisa o leitor (aparece em "Meus avisos" e, no futuro, por e-mail)
  if (aceitar) {
    registrarEmail(emp.leitorId, "prazo",
      `Pedido de prazo aceito: ${emp.livroTitulo}`,
      `Olá, ${nomeDoLeitor(emp)}! Seu pedido de mais ${sol.dias} dia(s) para devolver "${emp.livroTitulo}" foi ACEITO. ` +
      `A nova data de devolução é ${formatarData(emp.devolverAte)}.`);
  } else {
    registrarEmail(emp.leitorId, "prazo",
      `Pedido de prazo recusado: ${emp.livroTitulo}`,
      `Olá, ${nomeDoLeitor(emp)}. Seu pedido de mais prazo para "${emp.livroTitulo}" foi RECUSADO. ` +
      `A data de devolução continua sendo ${formatarData(emp.devolverAte)}.`);
  }

  mensagemEmp("ok", `Pedido de ${nomeDoLeitor(emp)} ${aceitar ? "aceito" : "recusado"}. O leitor foi avisado.`);
  atualizarAbaEmprestimos();
}

// ---------- PAGAMENTO DE MULTA ----------
function registrarPagamento(id) {
  const emprestimos = carregar("emprestimos");
  const emp = emprestimos.find(function (e) {
    return e.id === id;
  });
  if (!confirm(`Confirmar o pagamento da multa de ${formatarDinheiro(emp.multa)} de ${nomeDoLeitor(emp)}?`)) {
    return;
  }
  emp.multaPaga = true;
  salvar("emprestimos", emprestimos);
  mensagemEmp("ok", "Pagamento da multa registrado.");
  mostrarEmprestimos();
}

// Atualiza tudo da aba (listas e tabelas)
function atualizarAbaEmprestimos() {
  preencherSelectLeitores();
  preencherSelectLivros();
  mostrarSolicitacoes();
  mostrarEmprestimos();
}

// ---------- EMPRESTAR ----------
formEmprestimo.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const leitor = buscarLeitorPorId(campoEmpLeitor.value);
  const livro = carregar("livros").find(function (l) {
    return l.id === campoEmpLivro.value;
  });
  const dataEmprestimo = dataDoCampo(campoEmpData.value);

  // ---------- Validações ----------
  if (dataEmprestimo > new Date()) {
    mensagemEmp("erro", "A data do empréstimo não pode estar no futuro.");
    return;
  }
  // Conferimos de novo: o livro pode ter sido emprestado em outra aba do navegador
  if (livroEstaEmprestado(livro.id)) {
    mensagemEmp("erro", "Este livro já está emprestado.");
    atualizarAbaEmprestimos();
    return;
  }
  const abertos = emprestimosAbertosDoLeitor(leitor.id);
  const temAtraso = abertos.some(function (emp) {
    return situacaoEmprestimo(emp).classe === "atraso";
  });
  if (temAtraso) {
    mensagemEmp("erro", leitor.nome + " tem livro em atraso. Registre a devolução antes de um novo empréstimo.");
    return;
  }
  if (multasPendentesDoLeitor(leitor.id).length > 0) {
    mensagemEmp("erro", leitor.nome + " tem multa não paga. Registre o pagamento no histórico antes de um novo empréstimo.");
    return;
  }
  if (abertos.length >= MAX_EMPRESTIMOS_POR_LEITOR) {
    mensagemEmp("erro", leitor.nome + " já está com " + MAX_EMPRESTIMOS_POR_LEITOR + " livros, que é o limite.");
    return;
  }

  // ---------- Registra o empréstimo ----------
  const emprestimos = carregar("emprestimos");
  emprestimos.push({
    id: gerarId(),
    livroId: livro.id,
    leitorId: leitor.id,
    // Guardamos uma cópia do título e do nome: se o livro ou o leitor forem
    // excluídos no futuro, o histórico continua legível.
    livroTitulo: livro.titulo,
    leitorNome: leitor.nome,
    leitorCartao: leitor.cartao,
    emprestadoEm: dataEmprestimo.toISOString(),
    devolverAte: somarDias(dataEmprestimo, PRAZO_DIAS).toISOString(),
    devolvidoEm: null,
  });
  salvar("emprestimos", emprestimos);

  mensagemEmp("ok", `"${livro.titulo}" emprestado para ${leitor.nome}. Devolver até ${campoEmpDevolver.value}.`);
  campoEmpLivro.value = "";
  atualizarAbaEmprestimos();
});

// ---------- DEVOLVER ----------
function devolverLivro(id) {
  const emprestimos = carregar("emprestimos");
  const emp = emprestimos.find(function (e) {
    return e.id === id;
  });
  const s = situacaoEmprestimo(emp);

  let pergunta = `Confirmar a devolução de "${emp.livroTitulo}" por ${nomeDoLeitor(emp)}?`;
  if (s.multa > 0) {
    pergunta += `\n\n⚠️ ${s.diasAtraso} dia(s) de atraso: multa de ${formatarDinheiro(s.multa)}.`;
  }
  if (!confirm(pergunta)) {
    return;
  }

  emp.devolvidoEm = new Date().toISOString();
  // Guarda o atraso e a multa do momento da devolução, para o histórico
  emp.diasAtraso = s.diasAtraso;
  emp.multa = s.multa;
  emp.multaPaga = s.multa === 0; // se houve multa, ela fica pendente até ser paga
  // Um pedido de prazo que ainda estava esperando resposta perde o sentido
  if (emp.solicitacao && emp.solicitacao.status === "pendente") {
    emp.solicitacao.status = "cancelada";
  }
  salvar("emprestimos", emprestimos);

  mensagemEmp("ok", `Devolução de "${emp.livroTitulo}" registrada.`);
  atualizarAbaEmprestimos();
}

campoEmpData.addEventListener("change", atualizarDataDevolucao);

// Ao abrir a aba, recarrega as listas (pode haver leitores ou livros novos)
document.addEventListener("abaAberta", function (evento) {
  if (evento.detail === "emprestimos") {
    mensagemEmp("", "");
    atualizarAbaEmprestimos();
  }
});

// A cada 30 segundos, confere se chegou pedido novo de algum leitor
// (o leitor pode estar usando o sistema em outra aba deste navegador)
setInterval(mostrarSolicitacoes, 30000);

// Valores iniciais: data de hoje, e não deixa escolher datas futuras
campoEmpData.value = hojeParaCampo();
campoEmpData.max = hojeParaCampo();
atualizarDataDevolucao();
atualizarAbaEmprestimos();
