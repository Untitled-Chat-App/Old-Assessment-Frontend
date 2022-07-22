const path = require("path");
const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain } = electron;

// Local imports
const { getAccessToken } = require("./scripts/requests");
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

/* Window Creation */
let mainWindow, signUpWindow;
// Creates main window, Launched on startup
function createMainWindow() {
    // Create window
    mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    // load in index.html file
    mainWindow.loadFile(path.join(__dirname, "html/index.html"));

    // Create menu for app
    const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

//
function createSignUpWindow() {
    signUpWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    // load in index.html file
    signUpWindow.loadFile(path.join(__dirname, "html/signup.html"));
}

/* Electron App Events: */

// Launch app when ready
app.on("ready", async () => {
    createMainWindow();
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
        createMainWindow();
    }
});

/* IPC Main Events */
// Launch login window when someone clicks the button on the home page
ipcMain.on("open-signup-login-window", function (event, text) {
    createSignUpWindow();
});

// When someone hits signup button with info
ipcMain.on("signup-new-user", async function (event, data) {
    let token = await getAPIToken();
    signupUser(data, token);
    signUpWindow = null;
});

// When someone hits login button with info
ipcMain.on("login-user", function (event, data) {
    signUpWindow.loadFile(path.join(__dirname, "html/login.html"));
});
