const path = require("path");
const { WebSocket } = require("ws");
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer, contextBridge } = require("electron");

// Local imports
const { getAccessToken } = require("./scripts/requests");
const { firstTimeUserPage, createLoginWindow } = require("./scripts/windows");
const mainWindowMenuTemplate = require("./scripts/menu");

// This was recomended to be added for windows:
if (require("electron-squirrel-startup")) {
    app.quit();
}

// Load enviroment variables from .env file
require("dotenv").config();

/* Constants */
const API_URL = process.env.API_URL;
const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
Menu.setApplicationMenu(mainMenu);

// Make app global
global.app = app;

// Define for later
let firstTimeUserPageWindow, loginWindow;

/* Electron App Events: */

// Launch app when ready
app.on("ready", async () => {
    firstTimeUserPageWindow = firstTimeUserPage();
});

// if all windows are closed, close app. But since mac is special don't close it.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// If no windows are open launch one
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        firstTimeUserPageWindow = firstTimeUserPage();
    }
});

/* IPC Main Events */

// When someone hits login button with info
ipcMain.on("login-or-join:index", function (event) {
    firstTimeUserPageWindow.close();
    firstTimeUserPageWindow = null;
    loginWindow = createLoginWindow();
});

// When someone logs in
ipcMain.on("new-login:login", async function (event, data) {
    let token = await getAccessToken(data.username, data.password)
    if (token === undefined) {
        console.log("Wrong password skill issue")
    }
    
});
