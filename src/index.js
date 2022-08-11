const path = require("path");
const { WebSocket } = require("ws");
const Store = require("electron-store");
const rsa = require("node-rsa");
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    ipcRenderer,
    contextBridge,
} = require("electron");
const rpc = require("./scripts/discord_presence")

// Local imports
const {
    getAccessToken,
    signupUser,
    getUserWithToken,
    updateUserDetails,
    getRoomById,
    createNewRoom,
} = require("./scripts/requests");
const {
    firstTimeUserPage,
    createLoginWindow,
    createSignedInWindow,
    createSignupWindow,
    createRoomWindow,
    createEnterRoomIDWindow,
    createNewRoomWindow,
} = require("./scripts/windows");
const mainWindowMenuTemplate = require("./scripts/menu");

// This was recomended to be added for windows:
if (require("electron-squirrel-startup")) {
    app.quit();
}

// Load enviroment variables from .env file
require("dotenv").config();

/* Constants */
const API_URL = "https://chatapi.fusionsid.xyz";
const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
Menu.setApplicationMenu(mainMenu);

const store = new Store();

// Make app global
global.app = app;

// Define for later
let firstTimeUserPageWindow,
    loginWindow,
    signupWindow,
    signedInWindow,
    enterRoomIDWindow,
    roomWindow,
    newRoomWindow;

/* Electron App Events: */

async function checkIfFirstTimeUser() {
    let token = await getAccessToken(
        store.get("username"),
        store.get("password")
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
    let isFirstTimeUser = await checkIfFirstTimeUser();
    if (isFirstTimeUser) {
        signedInWindow = createSignedInWindow();
    } else {
        firstTimeUserPageWindow = firstTimeUserPage();
    }
    const clientId = "1007041141029474424";
    rpc.login({ clientId }).catch(console.error);

});

// if all windows are closed, close app. But since mac is special don't close it.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// If no windows are open launch one
app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        let isFirstTimeUser = await checkIfFirstTimeUser();
        if (isFirstTimeUser) {
            signedInWindow = createSignedInWindow();
        } else {
            firstTimeUserPageWindow = firstTimeUserPage();
        }
    }
});

/* IPC Main Events */

// When someone hits login button with info
ipcMain.on("login-or-join:index", function (event) {
    firstTimeUserPageWindow.close();
    firstTimeUserPageWindow = null;
    loginWindow = createLoginWindow();
});

ipcMain.on("go-back-signup:signup", function (event) {
    try {
        signupWindow.close()
    } catch {}
    signupWindow = null;
    loginWindow = createLoginWindow();
});

// When someone logs in
ipcMain.handle("new-login:login", async function (event, data) {
    let token = await getAccessToken(data.username, data.password);
    if (token === undefined) {
        return "Incorrect username or password (skill issue)";
    }

    store.set("username", data.username);
    store.set("password", data.password);

    store.set("access_token", token);

    let keys = new rsa().generateKeyPair();
    let publicKey = keys.exportKey("public");
    let privateKey = keys.exportKey("private");

    store.set("private_key", privateKey);

    await updateUserDetails("public_key", publicKey);

    loginWindow.close();
    loginWindow = null;
    signedInWindow = createSignedInWindow();
});

ipcMain.on("open-signup:login", function (event) {
    loginWindow.close();
    loginWindow = null;
    signupWindow = createSignupWindow();
});

ipcMain.handle("new-signup:signup", async function (event, data) {
    let result = await signupUser(data);
    if (result.status_code === 409) {
        return `Failed to create user: ${result.detail}`;
    }
    signupWindow.close();
    signupWindow = null;
    signedInWindow = createSignedInWindow();
});

ipcMain.on("sign-out:signed_in", async function (event) {
    signedInWindow.close();
    signedInWindow = null;
    logOut();
    firstTimeUserPageWindow = firstTimeUserPage();
});

ipcMain.on("join-room-window:signed_in", async function (event) {
    signedInWindow.close();
    signedInWindow = null;
    enterRoomIDWindow = createEnterRoomIDWindow();
});

ipcMain.handle("join-new-room:join_room", async function (event, room_id) {
    let room = null;
    try {
        room = await getRoomById(room_id);
    } catch (e) {
        // "Skill gap"
    }
    if (room === null || room === undefined) {
        return "Room not found (lil' dif in skill level ngl)";
    }
    try {
        enterRoomIDWindow.close();
        enterRoomIDWindow = null;
    }
    catch (e) {}

    try {
        newRoomWindow.close();
        newRoomWindow = null;
    }
    catch (e) {}

    connect_to_room(room.room_id);
});

// The real stuff
async function connect_to_room(room_id) {
    let access_token = await getAccessToken(
        store.get("username"),
        store.get("password")
    );

    roomWindow = createRoomWindow();

    ipcMain.handle("gimme-connection:room", async function (event) {
        let user = await getUserWithToken(access_token);
        let room_data = await getRoomById(room_id);
        data = {
            user: user,
            access_token: access_token,
            room_data: room_data,
        };
        return data;
    });
}

ipcMain.on("create-room:signed_in", function (event) {
    signedInWindow.close();
    signedInWindow = null;
    newRoomWindow = createNewRoomWindow();
});

ipcMain.handle("new-room-create:create_room", async function (event, data) {
    let room_id;
    room = await createNewRoom(data.room_name, data.room_description);
    room_id = room.room_id;
    if (room_id === undefined || room_id === null) {
        return ["red", "failed to create room"]
    }
    return ["green", `Room created successfully: ${room_id}`, room_id];
});

ipcMain.on("go-back-to-normal:room", async function (event, data) {
    try {
        roomWindow.close()
    } catch {}
    
    roomWindow = null 

    let isFirstTimeUser = await checkIfFirstTimeUser();
    if (isFirstTimeUser) {
        signedInWindow = createSignedInWindow();
    } else {
        firstTimeUserPageWindow = firstTimeUserPage();
    }
})