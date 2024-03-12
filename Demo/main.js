const { app, BrowserWindow } = require("electron");
const path = require("node:path");

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
    createWindow();

    app.on("activate", () => {
        console.log("activate");
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
