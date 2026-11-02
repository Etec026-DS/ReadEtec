// =====================================================================
// dados.js: funções para GUARDAR e LER dados no navegador
//
// O localStorage é uma "gaveta" do navegador que guarda textos.
// Ele só guarda TEXTO, então usamos:
//   JSON.stringify(lista) -> transforma a lista em texto para salvar
//   JSON.parse(texto)     -> transforma o texto de volta em lista
// =====================================================================

// Lista de gêneros usada nos livros (e depois nas preferências do leitor)
const GENEROS = [
  "Romance",
  "Fantasia",
  "Ficção científica",
  "Terror",
  "Suspense",
  "Aventura",
  "Biografia",
  "Poesia",
  "Didático",
  "Infantojuvenil",
  "Outro",
];

// Lê uma lista do localStorage. Se não existir nada ainda, devolve lista vazia.
function carregar(chave) {
  const texto = localStorage.getItem(chave);
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

// Salva uma lista no localStorage, substituindo o que havia antes.
function salvar(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

// Gera um identificador único para cada registro (livro, leitor, empréstimo).
// Date.now() = milissegundos desde 1970, e o número aleatório evita repetição.
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Protege o HTML: se alguém digitar <script> no título de um livro, isso vira
// texto comum em vez de ser executado como código. (Segurança: evita XSS.)
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// Deixa um texto "comparável": tudo minúsculo e sem acentos.
//   "Fiódor DOSTOIÉVSKI" -> "fiodor dostoievski"
// Como funciona: normalize("NFD") separa cada letra do seu acento
// ("é" vira "e" + "´"), e o replace apaga os acentos que sobraram soltos.
function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Transforma uma data salva ("2026-11-02T15:00:00.000Z") em "02/11/2026"
function formatarData(dataIso) {
  if (!dataIso) {
    return "-";
  }
  return new Date(dataIso).toLocaleDateString("pt-BR");
}

// Adiciona os livros de ACERVO_INICIAL (acervo-inicial.js) uma única vez.
// Uma "marca" no localStorage registra que isso já foi feito, assim os
// exemplos não voltam se o bibliotecário excluir algum deles.
function carregarAcervoInicial() {
  if (localStorage.getItem("acervoInicialCarregado") === "sim") {
    return;
  }

  const livros = carregar("livros");
  const hoje = new Date();

  ACERVO_INICIAL.forEach(function (exemplo, posicao) {
    // Não duplica um título que já tenha sido cadastrado à mão
    const jaExiste = livros.some(function (l) {
      return l.titulo.toLowerCase() === exemplo.titulo.toLowerCase();
    });
    if (jaExiste) {
      return;
    }

    // Datas de inclusão espalhadas: um livro a cada 7 dias para trás,
    // para o acervo parecer real (e servir depois para as estatísticas)
    const dataInclusao = new Date(hoje);
    dataInclusao.setDate(hoje.getDate() - posicao * 7);

    livros.push({
      id: gerarId(),
      titulo: exemplo.titulo,
      autor: exemplo.autor,
      genero: exemplo.genero,
      ano: exemplo.ano,
      criadoEm: dataInclusao.toISOString(),
    });
  });

  salvar("livros", livros);
  localStorage.setItem("acervoInicialCarregado", "sim");
}

// ---------------------------------------------------------------------
// LEITORES
// Cada leitor é um objeto assim:
//   { id, cartao: "RE-0001", nome, turma,
//     email1, email2, tel1, tel2,
//     preferencias: { autores: [...], generos: [...] },
//     senha, criadoEm }
// ---------------------------------------------------------------------

// Gera o próximo número de cartão: RE-0001, RE-0002...
// O contador fica salvo à parte, então um número NUNCA é reaproveitado,
// mesmo que um leitor seja excluído.
function proximoCartao() {
  const ultimo = Number(localStorage.getItem("ultimoCartao") || 0);
  const novo = ultimo + 1;
  localStorage.setItem("ultimoCartao", novo);
  return "RE-" + String(novo).padStart(4, "0");
}

function buscarLeitorPorId(id) {
  return carregar("leitores").find(function (l) {
    return l.id === id;
  });
}

// Procura pelo e-mail principal OU secundário (sem diferenciar maiúsculas)
function buscarLeitorPorEmail(email) {
  email = email.trim().toLowerCase();
  if (email === "") {
    return undefined;
  }
  return carregar("leitores").find(function (l) {
    return l.email1 === email || l.email2 === email;
  });
}

// Diz se um e-mail já pertence a OUTRO leitor.
// "idIgnorado" serve para a edição: o próprio leitor pode manter o seu e-mail.
function emailEmUso(email, idIgnorado) {
  const dono = buscarLeitorPorEmail(email);
  return dono !== undefined && dono.id !== idIgnorado;
}

// Cria um leitor novo, salva e devolve o objeto criado
function criarLeitor(dados) {
  const leitores = carregar("leitores");

  const leitor = {
    id: gerarId(),
    cartao: proximoCartao(),
    nome: dados.nome.trim(),
    turma: (dados.turma || "").trim(),
    email1: dados.email1.trim().toLowerCase(),
    email2: (dados.email2 || "").trim().toLowerCase(),
    tel1: (dados.tel1 || "").trim(),
    tel2: (dados.tel2 || "").trim(),
    preferencias: dados.preferencias || { autores: [], generos: [] },
    senha: dados.senha,
    criadoEm: new Date().toISOString(),
  };

  leitores.push(leitor);
  salvar("leitores", leitores);
  return leitor;
}

// ---------------------------------------------------------------------
// EMPRÉSTIMOS
// Cada empréstimo é um objeto assim:
//   { id, livroId, leitorId,
//     livroTitulo, leitorNome, leitorCartao,  <- cópia, para o histórico
//     emprestadoEm, devolverAte, devolvidoEm } <- devolvidoEm = null enquanto não devolver
// ---------------------------------------------------------------------

const PRAZO_DIAS = 7; // RF06: prazo de devolução
const MULTA_POR_DIA = 1.0; // RF12: R$ 1,00 por dia de atraso
const MAX_EMPRESTIMOS_POR_LEITOR = 3;

// Converte "2026-11-02" (valor de um <input type="date">) numa data local.
// (new Date("2026-11-02") seria meia-noite em Londres, e no Brasil viraria o dia 01!)
function dataDoCampo(valor) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Data de hoje no formato do <input type="date">: "2026-11-02"
function hojeParaCampo() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

// Soma dias a uma data
function somarDias(data, dias) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

// Quantos dias faltam de "hoje" até "data" (negativo = já passou).
// Zeramos as horas para contar só os dias do calendário.
function diasAte(data) {
  const umDia = 24 * 60 * 60 * 1000;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / umDia);
}

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Diz a situação de um empréstimo EM ABERTO:
//   { texto: "Vence em 2 dias", classe: "alerta", diasAtraso: 0, multa: 0 }
// classe: "ok" (no prazo), "alerta" (vence em até 2 dias) ou "atraso"
function situacaoEmprestimo(emp) {
  const dias = diasAte(emp.devolverAte);

  if (dias < 0) {
    const atraso = -dias;
    return {
      texto: "Atrasado há " + atraso + (atraso === 1 ? " dia" : " dias"),
      classe: "atraso",
      diasAtraso: atraso,
      multa: atraso * MULTA_POR_DIA,
    };
  }
  if (dias === 0) {
    return { texto: "Vence hoje", classe: "alerta", diasAtraso: 0, multa: 0 };
  }
  if (dias <= 2) {
    return { texto: "Vence em " + dias + (dias === 1 ? " dia" : " dias"), classe: "alerta", diasAtraso: 0, multa: 0 };
  }
  return { texto: "No prazo", classe: "ok", diasAtraso: 0, multa: 0 };
}

// Nome do leitor de um empréstimo: o nome ATUAL (se ele mudou o nome no perfil),
// ou a cópia guardada no empréstimo, se o leitor já foi excluído
function nomeDoLeitor(emp) {
  const leitor = buscarLeitorPorId(emp.leitorId);
  return leitor ? leitor.nome : emp.leitorNome;
}

// Empréstimos ainda não devolvidos de um leitor
function emprestimosAbertosDoLeitor(leitorId) {
  return carregar("emprestimos").filter(function (emp) {
    return emp.leitorId === leitorId && emp.devolvidoEm === null;
  });
}

// Multas de livros já devolvidos que o leitor ainda não pagou
function multasPendentesDoLeitor(leitorId) {
  return carregar("emprestimos").filter(function (emp) {
    return emp.leitorId === leitorId && emp.devolvidoEm !== null && emp.multa > 0 && !emp.multaPaga;
  });
}

// Lista as pendências do leitor com a biblioteca (vazia = nenhuma pendência).
// Usada para bloquear a exclusão da conta e novos empréstimos.
function pendenciasDoLeitor(leitorId) {
  const pendencias = [];

  const abertos = emprestimosAbertosDoLeitor(leitorId);
  if (abertos.length > 0) {
    pendencias.push(abertos.length + " livro(s) ainda não devolvido(s)");
  }

  const multas = multasPendentesDoLeitor(leitorId);
  if (multas.length > 0) {
    const total = multas.reduce(function (soma, emp) {
      return soma + emp.multa;
    }, 0);
    pendencias.push("multa não paga de " + formatarDinheiro(total));
  }

  return pendencias;
}

// ---------------------------------------------------------------------
// E-MAILS / AVISOS (envio SIMULADO, ver docs: opção B)
// Cada e-mail é guardado na lista "emails":
//   { id, leitorId, tipo, para: [e-mails], assunto, corpo, enviadoEm, lido }
// Mais tarde, para enviar de verdade (EmailJS), basta mudar ESTA função.
// ---------------------------------------------------------------------
function registrarEmail(leitorId, tipo, assunto, corpo) {
  const leitor = buscarLeitorPorId(leitorId);
  if (!leitor) {
    return;
  }

  const emails = carregar("emails");
  emails.push({
    id: gerarId(),
    leitorId: leitorId,
    tipo: tipo, // "prazo", "lembrete", "atraso", "novidade"
    para: [leitor.email1, leitor.email2].filter(Boolean), // envia para os dois e-mails, se houver
    assunto: assunto,
    corpo: corpo,
    enviadoEm: new Date().toISOString(),
    lido: false,
  });
  salvar("emails", emails);
}

// Diz se um leitor está com algum livro emprestado (ainda não devolvido)
function leitorTemEmprestimoAberto(leitorId) {
  return carregar("emprestimos").some(function (emp) {
    return emp.leitorId === leitorId && emp.devolvidoEm === null;
  });
}

// Lista de autores do acervo, sem repetir, em ordem alfabética
function autoresDoAcervo() {
  const nomes = carregar("livros").map(function (l) {
    return l.autor;
  });
  return [...new Set(nomes)].sort(function (a, b) {
    return a.localeCompare(b);
  });
}

// Diz se um livro está emprestado agora.
// Por enquanto ainda não existem empréstimos, então a lista vem vazia.
// Quando fizermos a aba Empréstimos, esta função já vai funcionar sozinha.
function livroEstaEmprestado(livroId) {
  const emprestimos = carregar("emprestimos");
  return emprestimos.some(function (emp) {
    return emp.livroId === livroId && emp.devolvidoEm === null;
  });
}
