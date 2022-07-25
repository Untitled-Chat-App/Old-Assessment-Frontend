const path = require("path");
const { BrowserWindow, Menu } = require("electron");

const mainWindowMenuTemplate = require("./menu");
const mainMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
Menu.setApplicationMenu(mainMenu);

/* Window Creation */

// Define for later because JS IS WEIRD AF
let firstTimeWindow, loginWindow;

// Creates first time user page, Launched if first time opening
function firstTimeUserPage() {
    firstTimeWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        width: 1300,
        height: 760,
    });

    // load in index.html file
    firstTimeWindow.loadFile(path.join(__dirname, "../html/index.html"));

    return firstTimeWindow;
}

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        width: 1300,
        height: 760,
    });

    // load in index.html file
    loginWindow.loadFile(path.join(__dirname, "../html/login.html"));

    return loginWindow;
}

module.exports = {
    firstTimeUserPage,
    createLoginWindow,
};
