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
        details: `Using the best chat app`,
        state: "This app will never give you up",
        startTimestamp,
        instance: false,
        largeImageKey: "chat_logo_small_square",
        largeImageText: "Shitty lgo"
    });
}

rpc.on("ready", () => {
    setActivity();

    // activity can only be set every 15 seconds
    setInterval(() => {
        setActivity();
    }, 15e3);
});

module.exports = rpc
