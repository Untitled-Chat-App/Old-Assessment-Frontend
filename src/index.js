// imports
const url = require("url");
const path = require("path");
const WebSocket = require("ws");
const electron = require("electron");

const { app, BrowserWindow, Menu, ipcMain } = electron;

if (require("electron-squirrel-startup")) {
    // This was recomended to be added for windows i think
    app.quit();
}

let mainWindow; // create window variable (will asign later)

function cleanupApp() {
    // Ill probably close webscokets and stuff here
}

// main menu
const mainWindowMenuTemplate = [
    {
        label: "Untitled-Chat",
        submenu: [
            {
                label: "Quit",
                accelerator:
                    process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                click() {
                    cleanupApp();
                    app.quit();
                },
            },
            {
                label: "Devtools",
                accelerator:
                    process.platform == "darwin" ? "Command+I" : "Ctrl+I",
                click(item, window) {
                    window.toggleDevTools();
                },
            },
        ],
    },
];

// since mac go weird sometimes I need add an empty item at the start of the menu so it starts from 2
if (process.platform == "darwin") {
    mainWindowMenuTemplate.unshift({ label: "" });
}

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
    mainWindow.loadFile(path.join(__dirname, "index.html"));

    // Create menu for app
    const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

// App events:

// Launch app when ready
app.on("ready", () => {
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
