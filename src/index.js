const path = require("path");
const { WebSocket } = require("ws");
const Store = require("electron-store");
const rsa  = require("node-rsa")
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    ipcRenderer,
    contextBridge,
} = require("electron");

// Local imports
const { getAccessToken, signupUser, getUserWithToken, updateUserDetails} = require("./scripts/requests");
const {
    firstTimeUserPage,
    createLoginWindow,
    createSignedInWindow,
    createSignupWindow,
} = require("./scripts/windows");
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

const store = new Store();

// Make app global
global.app = app;

// Define for later
let firstTimeUserPageWindow, loginWindow, signupWindow, signedInWindow;

/* Electron App Events: */

async function checkIfFirstTimeUser() {
    let token = await getAccessToken(
        store.get("username"),
        store.get("password"),
    );
    if (token === undefined) {
        return false;
    } else {
        return true;
    }
}

function logOut() {
    try {
        store.delete("username");
        store.delete("password");
        store.delete("private_key");
        store.delete("access_token");
    } catch (e) {}
}

// Launch app when ready
app.on("ready", async () => {
    let isFirstTimeUser = await checkIfFirstTimeUser()
    if (isFirstTimeUser) {
        signedInWindow = createSignedInWindow();
    } else {
        firstTimeUserPageWindow = firstTimeUserPage();
    }
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
ipcMain.handle("new-login:login", async function (event, data) {
    let token = await getAccessToken(data.username, data.password);
    if (token === undefined) {
        return "Incorrect username or password (skill issue)"
    }

    store.set("username", data.username);
    store.set("password", data.password);

    store.set("access_token", token);


    let keys = new rsa().generateKeyPair();
    let publicKey = keys.exportKey("public");
    let privateKey = keys.exportKey("private");

    store.set("private_key", privateKey)

    let user = await getUserWithToken()
    let user_id = user.id

    await updateUserDetails(user_id, "public_key", publicKey)

    loginWindow.close();
    loginWindow = null;
    signedInWindow = createSignedInWindow();
});

ipcMain.on("open-signup:login", function (event) {
    loginWindow.close();
    loginWindow = null;
    signupWindow = createSignupWindow()

});

ipcMain.handle("new-signup:signup", async function (event, data) {
    let result = await signupUser(data)
    if (result.status_code === 409) {
        return `Failed to create user: ${result.detail}`
    }
    if (result.success === true) {
        console.log("New user created")
    }
    signupWindow.close()
    signupWindow = null
    signedInWindow = createSignedInWindow();
})

ipcMain.on("sign-out:signed_in", async function(event) {
    signedInWindow.close()
    signedInWindow = null
    logOut()
    firstTimeUserPageWindow = firstTimeUserPage();
})

ipcMain.on("join-room-window:signed_in", async function(event) {
    signedInWindow.close()
    signedInWindow=null
    console.log("e time")
})