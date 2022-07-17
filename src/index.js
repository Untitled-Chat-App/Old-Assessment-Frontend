// imports
const url = require("url");
const path = require("path");
const WebSocket = require("ws");
const rsa = require("node-rsa");
const { URL, URLSearchParams } = require("url");
const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain } = electron;
global.fetch = require("node-fetch");

require("dotenv").config();

if (require("electron-squirrel-startup")) {
    // This was recomended to be added for windows i think
    app.quit();
}

function cleanupApp() {
    // Ill probably close webscokets and stuff here
}

const apiUrl = process.env.API_URL;

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

ipcMain.on("open_signup_window", function (event, text) {
    createSignUpWindow();
});

ipcMain.on("signup", async function (event, data) {
    let token = await getAPIToken();
    signupUser(data, token);
    createSignUpWindow;
});

ipcMain.on("login", function (event, data) {
    signUpWindow.loadFile(path.join(__dirname, "html/login.html"));
});

async function getAPIToken() {
    let token;

    let login_details = new URLSearchParams({
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
    }).toString();

    await fetch(`${apiUrl}/token`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: login_details,
    })
        .then((response) => response.json())
        .then((data) => {
            token = data["access_token"];
        });
    return token;
}

function signupUser(data, token) {
    var key = new rsa().generateKeyPair();
    let publicKey = key.exportKey("public");

    // Create new user
    fetch(`${apiUrl}/api/users/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
            public_key: JSON.stringify(publicKey),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Request complete! response:", data);
            signUpWindow.close();
            signUpWindow = null;
        });
}
