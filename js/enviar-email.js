// =====================================================================
// enviar-email.js: envio REAL de e-mails com o EmailJS (opção A)
//
// O EmailJS é um serviço que envia e-mails a partir do JavaScript do
// navegador, sem precisarmos de um servidor próprio. Ele usa a conta de
// e-mail (Gmail) que conectamos no painel dele.
//
// Plano grátis: 200 e-mails por mês. Por isso cada aviso é enviado uma
// única vez (ver js/notificacoes.js).
//
// O modelo (template) criado no painel do EmailJS recebe estas variáveis:
//   {{to_email}}  {{to_name}}  {{subject}}  {{message}}
// =====================================================================

function emailRealConfigurado() {
  return (
    typeof emailjs !== "undefined" && // a biblioteca do EmailJS carregou?
    CONFIG_EMAILJS.publicKey !== "" &&
    CONFIG_EMAILJS.serviceId !== "" &&
    CONFIG_EMAILJS.templateId !== ""
  );
}

if (emailRealConfigurado()) {
  emailjs.init({ publicKey: CONFIG_EMAILJS.publicKey });
}

// Atualiza a situação de envio de um e-mail salvo no histórico
function atualizarEnvio(idEmail, situacao, detalheErro) {
  const emails = carregar("emails");
  const email = emails.find(function (e) {
    return e.id === idEmail;
  });
  if (!email) return;
  email.envio = situacao;
  email.erroEnvio = detalheErro || null;
  salvar("emails", emails);
  // Avisa a tela de Notificações para redesenhar o histórico
  document.dispatchEvent(new CustomEvent("emailsAtualizados"));
}

// Chamada automaticamente por registrarEmail() (dados.js)
async function enviarEmailReal(registro) {
  if (!emailRealConfigurado()) {
    return; // sem configuração: fica como "simulado"
  }

  atualizarEnvio(registro.id, "enviando");
  try {
    await emailjs.send(CONFIG_EMAILJS.serviceId, CONFIG_EMAILJS.templateId, {
      to_email: registro.para.join(","), // os dois e-mails do leitor
      to_name: registro.leitorNome,
      subject: registro.assunto,
      message: registro.corpo,
    });
    atualizarEnvio(registro.id, "enviado");
  } catch (erro) {
    // O EmailJS devolve o motivo do erro em "text" (ex.: limite do mês atingido)
    atualizarEnvio(registro.id, "erro", (erro && (erro.text || erro.message)) || "erro desconhecido");
  }
}
