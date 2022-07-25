const path = require("path");
const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = electron;
const { WebSocket } = require("ws");

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
let mainWindow, roomWindow;
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
    mainWindow.loadFile(path.join(__dirname, "html/join.html"));

    // Create menu for app
    const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

//
function createRoomWindow() {
    roomWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    // load in index.html file
    roomWindow.loadFile(path.join(__dirname, "html/room.html"));
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

// When someone hits login button with info
ipcMain.on("login-and-join-room", async function (event, data) {
    createRoomWindow();
    mainWindow.close();

    const access_token = await getAccessToken(data.username, data.password);
    const room_id = data.room_id;

    var ws = new WebSocket(
        `ws://0.0.0.0:443/api/ws/chatroom?access_token=${access_token}&room_id=${room_id}`
    );

    ws.onmessage = function (event) {
        let msg = event.data;
        ipcRenderer.send("new-message-room-ws", msg);
    };

    ipcMain.on("send-message-ws", function (event, data) {
        ws.send(
            JSON.stringify({
                message_content: data,
                access_token: access_token,
            })
        );
    });
});
