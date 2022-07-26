require("dotenv").config();

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
                    app.quit();
                },
            },
        ],
    },
    {
        label: "Edit",
        submenu: [
            {
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                selector: "undo:",
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:",
            },
            {
                type: "separator",
            },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                selector: "cut:",
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                selector: "copy:",
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                selector: "paste:",
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:",
            },
        ],
    },
];

// If DEV = true in the .env file it enables dev tools (inspect element)
if (process.env.DEV == "true") {
    mainWindowMenuTemplate[0]["submenu"].push({
        label: "Devtools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, window) {
            window.toggleDevTools();
        },
    });
    // I LIKE IT OK
    mainWindowMenuTemplate[0]["submenu"].push({
        label: "Devtools",
        accelerator: process.platform == "darwin" ? "F12" : "F12",
        click(item, window) {
            window.toggleDevTools();
        },
        visible: false,
    });
}

// since mac go weird sometimes I need add an empty item at the start of the menu so it starts from 2
if (process.platform == "darwin") {
    mainWindowMenuTemplate.unshift({ label: "" });
}

module.exports = mainWindowMenuTemplate;
