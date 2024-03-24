const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require("node:path");

async function handleFileOpen () {
    const { canceled, filePaths } = await dialog.showOpenDialog({})
    if (!canceled) {
      return filePaths[0]
    }
}

function handleSetTitle(event, title) {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    win.loadFile("index.html");
};

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen);
    ipcMain.on("set-title", handleSetTitle);

    createWindow();

    app.on("activate", () => {
        console.log("activate");
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
