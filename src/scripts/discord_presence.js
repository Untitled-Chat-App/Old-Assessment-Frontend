const DiscordRPC = require("discord-rpc");

const clientId = "1007041141029474424";
const rpc = new DiscordRPC.Client({ transport: "ipc" });
DiscordRPC.register(clientId);

const startTimestamp = new Date();

async function setActivity() {
    if (!rpc) {
        return;
    }

    rpc.setActivity({
        details: "This app is never gonna give you up",
        state: "It will however kill me with bugs and brain damage",
        startTimestamp,
        instance: false,
        largeImageKey: "chat_logo_small_square",
        largeImageText: "Shitty logo",
        buttons: [
            {
                label: "Github / Code",
                url: "https://github.com/Untitled-Chat-App",
            },
        ],
    });
}

rpc.on("ready", () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15e3);
});

module.exports = rpc;
