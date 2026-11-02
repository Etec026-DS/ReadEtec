// =====================================================================
// area-leitor.js: área do leitor (leitor.html, RF21)
//
// Abas:
//   Acervo            -> pesquisa (componente de pesquisa.js)
//   Meus empréstimos  -> livros com o leitor, pedido de mais prazo e histórico
//   Meu perfil        -> dados, preferências, alterar senha e excluir conta
//   Meus avisos       -> cópia dos e-mails enviados ao leitor
// =====================================================================

const sessaoLeitor = sessaoAtual();

// Sempre lemos o leitor de novo do localStorage, para ter os dados mais recentes
function leitorAtual() {
  return sessaoLeitor ? buscarLeitorPorId(sessaoLeitor.leitorId) : null;
}

// Se o admin excluiu a conta (ou o próprio leitor excluiu em outra aba)
// enquanto esta página estava aberta, sai do sistema em vez de dar erro
function garantirSessaoValida() {
  if (leitorAtual()) {
    return true;
  }
  alert("Sua sessão não é mais válida: esta conta não existe mais.");
  encerrarSessao();
  return false;
}

// Mostra/esconde uma mensagem num parágrafo
function mensagem(idParagrafo, texto) {
  const p = document.getElementById(idParagrafo);
  p.textContent = texto;
  p.hidden = texto === "";
}

function atualizarSaudacao() {
  const leitor = leitorAtual();
  document.getElementById("saudacao").textContent =
    "Olá, " + leitor.nome.split(" ")[0] + " (" + leitor.cartao + ")";
}

// =====================================================================
// MEUS EMPRÉSTIMOS
// =====================================================================

function meusEmprestimos() {
  return carregar("emprestimos").filter(function (emp) {
    return emp.leitorId === sessaoLeitor.leitorId;
  });
}

function mostrarMeusEmprestimos() {
  const todos = meusEmprestimos();

  // ---------- Livros com o leitor agora ----------
  const abertos = todos
    .filter(function (e) {
      return e.devolvidoEm === null;
    })
    .sort(function (a, b) {
      return new Date(a.devolverAte) - new Date(b.devolverAte);
    });

  let temAtraso = false;

  document.getElementById("tabela-meus-abertos").innerHTML = abertos
    .map(function (emp) {
      const s = situacaoEmprestimo(emp);
      const sol = emp.solicitacao;
      if (s.classe === "atraso") temAtraso = true;

      // Resposta do último pedido de prazo, se houver
      let respostaPedido = "";
      if (sol && sol.status === "aceita") respostaPedido = '<br><small>✔ prazo estendido</small>';
      if (sol && sol.status === "recusada") respostaPedido = '<br><small>✖ pedido de prazo recusado</small>';

      // O que o leitor pode fazer com este empréstimo
      let acao;
      if (sol && sol.status === "pendente") {
        acao = `<small>⏳ Pediu +${sol.dias} dia(s).<br>Aguardando resposta.</small>`;
      } else if (s.classe === "atraso") {
        acao = "<small>Devolva na biblioteca</small>";
      } else {
        acao = `<button class="pequeno" onclick="abrirPedidoPrazo('${emp.id}')">Pedir mais prazo</button>`;
      }

      return `
        <tr class="linha-${s.classe}">
          <td>${escapar(tituloDoLivro(emp))}</td>
          <td>${formatarData(emp.emprestadoEm)}</td>
          <td>${formatarData(emp.devolverAte)}</td>
          <td><span class="etiqueta situacao-${s.classe}">${s.texto}</span>${respostaPedido}</td>
          <td>${s.multa > 0 ? formatarDinheiro(s.multa) : "-"}</td>
          <td>${acao}</td>
        </tr>`;
    })
    .join("");
  document.getElementById("meus-abertos-vazio").style.display = abertos.length === 0 ? "block" : "none";

  // ---------- Histórico ----------
  const devolvidos = todos
    .filter(function (e) {
      return e.devolvidoEm !== null;
    })
    .sort(function (a, b) {
      return new Date(b.devolvidoEm) - new Date(a.devolvidoEm);
    });

  document.getElementById("tabela-meu-historico").innerHTML = devolvidos
    .map(function (emp) {
      let situacao = '<span class="etiqueta situacao-ok">No prazo</span>';
      if (emp.multa > 0) {
        situacao = `<span class="etiqueta ${emp.multaPaga ? "situacao-alerta" : "situacao-atraso"}">
          ${emp.diasAtraso} dia(s) de atraso · multa ${formatarDinheiro(emp.multa)} ${emp.multaPaga ? "paga" : "a pagar"}</span>`;
      }
      return `
        <tr>
          <td>${escapar(tituloDoLivro(emp))}</td>
          <td>${formatarData(emp.emprestadoEm)}</td>
          <td>${formatarData(emp.devolvidoEm)}</td>
          <td>${situacao}</td>
        </tr>`;
    })
    .join("");
  document.getElementById("meu-historico-vazio").style.display = devolvidos.length === 0 ? "block" : "none";

  // ---------- Aviso de pendência no topo ----------
  const avisos = [];
  if (temAtraso) {
    avisos.push("Você tem livro em atraso: devolva na biblioteca o quanto antes.");
  }
  const multas = multasPendentesDoLeitor(sessaoLeitor.leitorId);
  if (multas.length > 0) {
    const total = multas.reduce(function (soma, e) {
      return soma + e.multa;
    }, 0);
    avisos.push("Você tem multa a pagar de " + formatarDinheiro(total) + ". Pague na biblioteca para pegar novos livros.");
  }
  mensagem("aviso-pendencia", avisos.join(" "));
}

// ---------- Pedido de mais prazo ----------
const cartaoPedirPrazo = document.getElementById("cartao-pedir-prazo");
const campoPrazoDias = document.getElementById("prazo-dias");
let emprestimoDoPedido = null; // o empréstimo para o qual o leitor está pedindo prazo

function atualizarNovaDataPedido() {
  const novaData = somarDias(new Date(emprestimoDoPedido.devolverAte), Number(campoPrazoDias.value));
  document.getElementById("prazo-nova-data").value = novaData.toLocaleDateString("pt-BR");
}

function abrirPedidoPrazo(id) {
  if (!garantirSessaoValida()) return;
  emprestimoDoPedido = meusEmprestimos().find(function (e) {
    return e.id === id;
  });
  document.getElementById("prazo-livro").textContent = tituloDoLivro(emprestimoDoPedido);
  document.getElementById("prazo-atual").textContent = formatarData(emprestimoDoPedido.devolverAte);
  document.getElementById("form-prazo").reset();
  atualizarNovaDataPedido();
  mensagem("meus-ok", "");
  cartaoPedirPrazo.hidden = false;
  cartaoPedirPrazo.scrollIntoView({ behavior: "smooth" });
}

function fecharPedidoPrazo() {
  cartaoPedirPrazo.hidden = true;
  emprestimoDoPedido = null;
}

campoPrazoDias.addEventListener("change", atualizarNovaDataPedido);
document.getElementById("prazo-cancelar").addEventListener("click", fecharPedidoPrazo);

document.getElementById("form-prazo").addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!garantirSessaoValida()) return;

  const emprestimos = carregar("emprestimos");
  const emp = emprestimos.find(function (e) {
    return e.id === emprestimoDoPedido.id;
  });

  // Confere de novo: o livro pode ter sido devolvido, ou o prazo vencido, nesse meio-tempo
  if (emp.devolvidoEm !== null || situacaoEmprestimo(emp).classe === "atraso") {
    alert("Não é mais possível pedir prazo para este empréstimo.");
    fecharPedidoPrazo();
    mostrarMeusEmprestimos();
    return;
  }

  emp.solicitacao = {
    dias: Number(campoPrazoDias.value),
    motivo: document.getElementById("prazo-motivo").value.trim(),
    pedidoEm: new Date().toISOString(),
    status: "pendente",
    respondidoEm: null,
  };
  salvar("emprestimos", emprestimos);

  fecharPedidoPrazo();
  mensagem("meus-ok", `Pedido enviado! Você será avisado em "Meus avisos" quando a biblioteca responder.`);
  mostrarMeusEmprestimos();
});

// =====================================================================
// MEU PERFIL
// =====================================================================

const preferenciasPerfil = criarSeletorPreferencias("perfil");

function preencherPerfil() {
  const leitor = leitorAtual();
  document.getElementById("perfil-cartao").textContent = "Cartão " + leitor.cartao;
  document.getElementById("perfil-nome").value = leitor.nome;
  document.getElementById("perfil-turma").value = leitor.turma;
  document.getElementById("perfil-email1").value = leitor.email1;
  document.getElementById("perfil-email2").value = leitor.email2;
  document.getElementById("perfil-tel1").value = leitor.tel1;
  document.getElementById("perfil-tel2").value = leitor.tel2;
  preferenciasPerfil.atualizarSugestoes();
  preferenciasPerfil.definir(leitor.preferencias);
  atualizarBloqueioExclusao();
}

document.getElementById("form-perfil").addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!garantirSessaoValida()) return;
  mensagem("perfil-erro", "");
  mensagem("perfil-ok", "");

  const id = sessaoLeitor.leitorId;
  const email1 = document.getElementById("perfil-email1").value.trim().toLowerCase();
  const email2 = document.getElementById("perfil-email2").value.trim().toLowerCase();

  if (estaEmBranco(document.getElementById("perfil-nome").value)) {
    mensagem("perfil-erro", "Preencha o nome (não vale só espaços).");
    return;
  }
  if (email1 === email2) {
    mensagem("perfil-erro", "O e-mail secundário deve ser diferente do principal.");
    return;
  }
  if (emailEmUso(email1, id) || (email2 !== "" && emailEmUso(email2, id))) {
    mensagem("perfil-erro", "Este e-mail já pertence a outra conta.");
    return;
  }

  const leitores = carregar("leitores");
  const leitor = leitores.find(function (l) {
    return l.id === id;
  });
  const emailMudou = leitor.email1 !== email1;

  Object.assign(leitor, {
    nome: document.getElementById("perfil-nome").value.trim(),
    turma: document.getElementById("perfil-turma").value.trim(),
    email1: email1,
    email2: email2,
    tel1: document.getElementById("perfil-tel1").value.trim(),
    tel2: document.getElementById("perfil-tel2").value.trim(),
    preferencias: preferenciasPerfil.obter(),
  });
  salvar("leitores", leitores);

  atualizarSaudacao();
  mensagem("perfil-ok", emailMudou
    ? "Dados salvos! Atenção: a partir de agora, entre com o novo e-mail principal."
    : "Dados salvos!");
});

// ---------- Alterar senha ----------
document.getElementById("form-senha").addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!garantirSessaoValida()) return;
  mensagem("senha-erro", "");
  mensagem("senha-ok", "");

  const atual = document.getElementById("senha-atual").value;
  const nova = document.getElementById("senha-nova").value;
  const confirmar = document.getElementById("senha-confirmar").value;

  // Pedir a senha atual garante que é o próprio leitor (e não alguém que
  // encontrou o computador com a conta aberta) quem está trocando a senha
  if (atual !== leitorAtual().senha) {
    mensagem("senha-erro", "A senha atual está incorreta.");
    return;
  }
  if (nova !== confirmar) {
    mensagem("senha-erro", "A nova senha e a confirmação não são iguais.");
    return;
  }
  if (nova === atual) {
    mensagem("senha-erro", "A nova senha deve ser diferente da atual.");
    return;
  }

  const leitores = carregar("leitores");
  leitores.find(function (l) {
    return l.id === sessaoLeitor.leitorId;
  }).senha = nova;
  salvar("leitores", leitores);

  document.getElementById("form-senha").reset();
  mensagem("senha-ok", "Senha alterada com sucesso!");
});

// ---------- Excluir conta ----------
// Bloqueada enquanto houver pendências (livro não devolvido ou multa não paga)
function atualizarBloqueioExclusao() {
  const pendencias = pendenciasDoLeitor(sessaoLeitor.leitorId);
  const bloqueada = pendencias.length > 0;

  mensagem("excluir-bloqueado", bloqueada
    ? "Você não pode excluir a conta agora. Pendências: " + pendencias.join(" e ") + "."
    : "");

  // Desativa todos os campos e botões do formulário de exclusão
  document.querySelectorAll("#form-excluir input, #form-excluir button").forEach(function (el) {
    el.disabled = bloqueada;
  });
}

document.getElementById("form-excluir").addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!garantirSessaoValida()) return;
  mensagem("excluir-erro", "");

  // Confere de novo na hora (as pendências podem ter mudado)
  if (pendenciasDoLeitor(sessaoLeitor.leitorId).length > 0) {
    atualizarBloqueioExclusao();
    return;
  }
  if (document.getElementById("excluir-senha").value !== leitorAtual().senha) {
    mensagem("excluir-erro", "Senha incorreta.");
    return;
  }
  if (!confirm("Tem certeza? Sua conta será apagada e isso não pode ser desfeito.")) {
    return;
  }

  // Apaga o leitor e os avisos dele. O histórico de empréstimos da biblioteca
  // continua existindo (com a cópia do nome), como registro da biblioteca.
  salvar("leitores", carregar("leitores").filter(function (l) {
    return l.id !== sessaoLeitor.leitorId;
  }));
  salvar("emails", carregar("emails").filter(function (e) {
    return e.leitorId !== sessaoLeitor.leitorId;
  }));

  alert("Sua conta foi excluída. Até logo!");
  encerrarSessao();
});

// =====================================================================
// MEUS AVISOS
// =====================================================================

const ICONES_AVISO = { prazo: "📅", lembrete: "⏰", atraso: "⚠️", novidade: "✨" };

function meusAvisos() {
  return carregar("emails")
    .filter(function (e) {
      return e.leitorId === sessaoLeitor.leitorId;
    })
    .sort(function (a, b) {
      return new Date(b.enviadoEm) - new Date(a.enviadoEm);
    });
}

// Mostra quantos avisos não lidos existem no botão da aba
function atualizarContadorAvisos() {
  const naoLidos = meusAvisos().filter(function (e) {
    return !e.lido;
  }).length;
  const contador = document.getElementById("contador-avisos");
  contador.textContent = naoLidos;
  contador.hidden = naoLidos === 0;
}

function mostrarAvisos() {
  const avisos = meusAvisos();

  document.getElementById("lista-avisos").innerHTML = avisos
    .map(function (e) {
      return `
        <article class="aviso ${e.lido ? "" : "nao-lido"}">
          <div class="aviso-topo">
            <strong>${ICONES_AVISO[e.tipo] || "✉️"} ${escapar(e.assunto)}</strong>
            <small>${new Date(e.enviadoEm).toLocaleString("pt-BR")}</small>
          </div>
          <small>Para: ${escapar(e.para.join(", "))}</small>
          <p>${escapar(e.corpo)}</p>
        </article>`;
    })
    .join("");
  document.getElementById("avisos-vazio").style.display = avisos.length === 0 ? "block" : "none";

  // Ao abrir a aba, marca todos os avisos como lidos
  const emails = carregar("emails");
  emails.forEach(function (e) {
    if (e.leitorId === sessaoLeitor.leitorId) e.lido = true;
  });
  salvar("emails", emails);
  atualizarContadorAvisos();
}

// =====================================================================
// INÍCIO
// =====================================================================

// Só monta a página se houver um leitor logado (senão o porteiro já
// está mandando a pessoa para o login)
if (leitorAtual()) {
  carregarAcervoInicial(); // caso este navegador ainda não tenha o acervo
  atualizarSaudacao();

  const pesquisaLeitor = criarPesquisa(document.getElementById("acervo"));

  mostrarMeusEmprestimos();
  preencherPerfil();
  atualizarContadorAvisos();

  // Atualiza cada aba quando ela é aberta
  document.addEventListener("abaAberta", function (evento) {
    if (!garantirSessaoValida()) return;
    if (evento.detail === "acervo") pesquisaLeitor.atualizar();
    if (evento.detail === "meus-emprestimos") mostrarMeusEmprestimos();
    if (evento.detail === "perfil") {
      preencherPerfil();
      ["perfil-erro", "perfil-ok", "senha-erro", "senha-ok", "excluir-erro"].forEach(function (id) {
        mensagem(id, "");
      });
    }
    if (evento.detail === "avisos") mostrarAvisos();
  });

  // A cada 30 segundos, confere se chegou aviso novo (ex.: resposta do admin)
  setInterval(atualizarContadorAvisos, 30000);
}
