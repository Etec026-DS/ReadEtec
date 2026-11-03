// =====================================================================
// config-email.js: chaves do EmailJS (emailjs.com)
//
// Enquanto os três campos estiverem vazios, os e-mails são apenas
// SIMULADOS (ficam no histórico e em "Meus avisos" do leitor).
// Preenchendo os três, os e-mails passam a ser enviados de verdade.
//
// Onde achar cada valor no painel do EmailJS:
//   publicKey  -> Account > General > Public Key
//   serviceId  -> Email Services > (o serviço do Gmail) > Service ID
//   templateId -> Email Templates > (o modelo criado) > Template ID
//
// ⚠️ A "Public Key" é feita para ficar visível no navegador (por isso o
//    nome "pública"). A proteção é limitar, no painel do EmailJS, quais
//    sites podem usá-la (Account > Security > Allowed origins / domínios).
// =====================================================================

const CONFIG_EMAILJS = {
  publicKey: "etkLXL-KVRbMZvBq1",
  serviceId: "service_qgg2d0v",
  templateId: "template_pukwa7o",
};
