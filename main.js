// main.js — ponto de partida do programa desktop (Electron).
// Ele cria a janela do ReadEtec e carrega o index.html dentro dela.
const { app, BrowserWindow } = require("electron");
const path = require("path");

function criarJanela() {
  const janela = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "ReadEtec",
    autoHideMenuBar: true, // esconde a barra de menu (Arquivo, Editar...)
  });

  janela.loadFile(path.join(__dirname, "index.html"));
}

// Quando o Electron terminar de iniciar, abre a janela.
app.whenReady().then(criarJanela);

// Fecha o programa quando todas as janelas forem fechadas.
app.on("window-all-closed", () => {
  app.quit();
});
