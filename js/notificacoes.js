// =====================================================================
// notificacoes.js: avisos automáticos por e-mail (RF14 a RF17) e aba
// Notificações do admin
//
//   ⏰ LEMBRETE  -> faltam 2 dias (ou menos) para o fim do prazo
//   ⚠️ ATRASO    -> o prazo passou e o livro não foi devolvido
//   ✨ NOVIDADE  -> livro novo do gênero ou autor favorito do leitor
//   📅 PRAZO     -> resposta a um pedido de mais prazo (emprestimos.js)
//
// Site estático = não existe um "relógio" no servidor que rode sozinho.
// Por isso os prazos são verificados QUANDO O ADMIN ABRE O SISTEMA
// (e pelo botão "Verificar agora"). Cada aviso é enviado UMA vez só:
// o empréstimo guarda uma marca de que o aviso já foi enviado.
// =====================================================================

// ---------- Modelos de e-mail pré-programados (RF17) ----------
const MODELOS_EMAIL = {
  lembrete: function (emp, situacao) {
    return {
      assunto: `Lembrete: devolva "${tituloDoLivro(emp)}" até ${formatarData(emp.devolverAte)}`,
      corpo:
        `Olá, ${nomeDoLeitor(emp)}! O prazo para devolver "${tituloDoLivro(emp)}" está acabando ` +
        `(${situacao.texto.toLowerCase()}, em ${formatarData(emp.devolverAte)}). ` +
        `Se precisar de mais tempo, peça uma prorrogação em "Meus empréstimos" no ReadEtec. Boa leitura!`,
    };
  },
  atraso: function (emp) {
    return {
      assunto: `Livro em atraso: "${tituloDoLivro(emp)}"`,
      corpo:
        `Olá, ${nomeDoLeitor(emp)}. O prazo para devolver "${tituloDoLivro(emp)}" terminou em ` +
        `${formatarData(emp.devolverAte)}. Por favor, devolva o livro na biblioteca o quanto antes: ` +
        `a multa é de ${formatarDinheiro(MULTA_POR_DIA)} por dia de atraso.`,
    };
  },
  novidade: function (leitor, livro, motivo) {
    return {
      assunto: `Novo no acervo: "${livro.titulo}"`,
      corpo:
        `Olá, ${leitor.nome}! Chegou à biblioteca "${livro.titulo}", de ${livro.autor} ` +
        `(${livro.genero}), e achamos que você vai gostar porque ${motivo}. ` +
        `Já está disponível para empréstimo!`,
    };
  },
};

// ---------- Lembrete e atraso ----------
// Devolve quantos avisos de cada tipo foram enviados agora
function verificarPrazosEEnviarAvisos() {
  const emprestimos = carregar("emprestimos");
  const enviados = { lembrete: 0, atraso: 0 };
  const paraEnviar = [];

  emprestimos.forEach(function (emp) {
    if (emp.devolvidoEm !== null) return;
    const s = situacaoEmprestimo(emp);

    if (s.classe === "alerta" && !emp.avisoLembreteEnviado) {
      emp.avisoLembreteEnviado = true;
      paraEnviar.push({ emp: emp, tipo: "lembrete", modelo: MODELOS_EMAIL.lembrete(emp, s) });
    }
    if (s.classe === "atraso" && !emp.avisoAtrasoEnviado) {
      emp.avisoAtrasoEnviado = true;
      paraEnviar.push({ emp: emp, tipo: "atraso", modelo: MODELOS_EMAIL.atraso(emp) });
    }
  });

  // Salva as marcas ANTES de enviar: assim, mesmo se a página for fechada
  // no meio, ninguém recebe o mesmo aviso duas vezes
  salvar("emprestimos", emprestimos);

  paraEnviar.forEach(function (item) {
    registrarEmail(item.emp.leitorId, item.tipo, item.modelo.assunto, item.modelo.corpo);
    enviados[item.tipo]++;
  });
  return enviados;
}

// ---------- Novidade ----------
// Chamada quando o admin cadastra um livro NOVO (livros.js).
// Devolve quantos leitores foram avisados.
function avisarNovidade(livro) {
  let avisados = 0;
  carregar("leitores").forEach(function (leitor) {
    const prefs = leitor.preferencias || { generos: [], autores: [] };
    const gostaDoGenero = prefs.generos.includes(livro.genero);
    const gostaDoAutor = prefs.autores.some(function (autor) {
      return normalizarTexto(autor) === normalizarTexto(livro.autor);
    });
    if (!gostaDoGenero && !gostaDoAutor) return;

    const motivo = gostaDoAutor
      ? `${livro.autor} está entre os seus autores favoritos`
      : `você gosta de ${livro.genero}`;
    const modelo = MODELOS_EMAIL.novidade(leitor, livro, motivo);
    registrarEmail(leitor.id, "novidade", modelo.assunto, modelo.corpo);
    avisados++;
  });
  return avisados;
}

// ---------- Aba Notificações (admin) ----------
const ICONES_TIPO = { prazo: "📅 Prazo", lembrete: "⏰ Lembrete", atraso: "⚠️ Atraso", novidade: "✨ Novidade" };
const TEXTOS_ENVIO = {
  simulado: '<span class="etiqueta situacao-alerta" title="EmailJS não configurado">Simulado</span>',
  enviando: '<span class="etiqueta situacao-alerta">Enviando...</span>',
  enviado: '<span class="etiqueta situacao-ok">Enviado ✔</span>',
  erro: '<span class="etiqueta situacao-atraso">Erro</span>',
};

function mostrarHistoricoEmails() {
  const emails = carregar("emails").sort(function (a, b) {
    return new Date(b.enviadoEm) - new Date(a.enviadoEm);
  });

  document.getElementById("tabela-emails").innerHTML = emails
    .map(function (e) {
      const envio = (TEXTOS_ENVIO[e.envio] || TEXTOS_ENVIO.simulado) +
        (e.erroEnvio ? `<br><small>${escapar(e.erroEnvio)}</small>` : "");
      return `
        <tr>
          <td>${new Date(e.enviadoEm).toLocaleString("pt-BR")}</td>
          <td>${ICONES_TIPO[e.tipo] || e.tipo}</td>
          <td>${escapar(e.leitorNome || "")}<br><small>${escapar(e.para.join(", "))}</small></td>
          <td title="${escapar(e.corpo)}">${escapar(e.assunto)}</td>
          <td>${envio}</td>
        </tr>`;
    })
    .join("");
  document.getElementById("emails-vazio").style.display = emails.length === 0 ? "block" : "none";

  // Mostra se os e-mails estão indo de verdade ou só simulados
  const real = typeof emailRealConfigurado === "function" && emailRealConfigurado();
  document.getElementById("status-emailjs").innerHTML = real
    ? '✅ <strong>EmailJS configurado:</strong> os avisos são enviados de verdade para o e-mail dos leitores.'
    : '🧪 <strong>Modo simulado:</strong> os avisos ficam só no histórico e em "Meus avisos" do leitor. ' +
      "Para enviar de verdade, preencha js/config-email.js.";
}

function verificarAgora(mostrarResultado) {
  const r = verificarPrazosEEnviarAvisos();
  if (mostrarResultado) {
    const p = document.getElementById("notif-resultado");
    p.textContent = r.lembrete + r.atraso === 0
      ? "Tudo em dia: nenhum aviso novo para enviar."
      : `Enviados: ${r.lembrete} lembrete(s) e ${r.atraso} aviso(s) de atraso.`;
    p.hidden = false;
  }
  mostrarHistoricoEmails();
}

document.getElementById("botao-verificar-prazos").addEventListener("click", function () {
  verificarAgora(true);
});

document.addEventListener("abaAberta", function (evento) {
  if (evento.detail === "notificacoes") mostrarHistoricoEmails();
});
document.addEventListener("emailsAtualizados", mostrarHistoricoEmails);

// Ao abrir o sistema, o admin já dispara os avisos de prazo pendentes
verificarAgora(false);
