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
