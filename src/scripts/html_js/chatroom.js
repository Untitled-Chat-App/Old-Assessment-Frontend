const { ipcRenderer } = require("electron");
var user, access_token, room_data, current_user;

ipcRenderer.invoke("gimme-connection:room").then((data) => {
    user = data.user;
    access_token = data.access_token;
    room_data = data.room_data;
    current_user = data.user

    const title = document.querySelector("#room-title-text");
    title.innerHTML = room_data.room_name;
    start(access_token);
});

function start(access_token) {
    ws = new WebSocket(
        `wss://chatapi.fusionsid.xyz/api/ws/chatroom?access_token=${access_token}&room_id=${room_data.room_id}`
    );

    ws.onmessage = function (event) {
        let msg = event.data;

        // Convert ws response to js object
        while (typeof msg !== "object") {
            msg = JSON.parse(msg);
        }
        try {
            user = msg["message_author"];
        }
        catch (e) {

        }

        var messages = document.getElementById("messages");
        
        // The div:
        var message = document.createElement("div");
        try {
            if (user["username"] === current_user["username"]) {
                message.className = "message-you";
            } else {
                message.className = "message-other";
            }
        } catch {message.className = "message-other";}

        var message_author_span = document.createElement("span");
        var message_content_span = document.createElement("span");
        var message_time_span = document.createElement("span");

        message_author_span.className = "message-author";
        message_time_span.className = "message-time";
        message_content_span.className = "message-content";

        // Time
        let now = new Date();

        let current_time = new Intl.DateTimeFormat("default", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
        }).format(now);

        var msgTime = document.createTextNode(current_time);
        message_time_span.appendChild(msgTime);


        if (msg["event"] !== undefined) {
            // On Events
            if (msg["event"] === "User Disconnect") {
                user = JSON.parse(msg["user"]);
                var what_happened = document.createTextNode(`${user["username"]} left the chat`);;
                message_author_span.style.color = "red";
                message_author_span.appendChild(what_happened);
            }
            if (msg["event"] === "User Join") {
                user = JSON.parse(msg["user"]);
                var what_happened = document.createTextNode(`${user["username"]} joined the chat`)
                message_author_span.style.color = "red";
                message_author_span.appendChild(what_happened);
            }
            var br = document.createElement("br");
            message.appendChild(br);
            message.appendChild(message_author_span);
            message.appendChild(message_time_span);
        } else {
            // On normal message:
            if (message.className === "message-you") {
                var msgAuthor = document.createTextNode(
                    "You"
                );
            } else {
                var msgAuthor = document.createTextNode(
                    msg["message_author"]["username"]
                );
            }
            var msgContent = document.createTextNode(msg["messsage_content"]);

            message_content_span.appendChild(msgContent);
            message_author_span.appendChild(msgAuthor);
            
            message.appendChild(message_author_span);
            var br = document.createElement("br");
            message.appendChild(br);
            var br = document.createElement("br");
            message.appendChild(br);
            message.appendChild(message_content_span);
            var br = document.createElement("br");
            message.appendChild(br);
            var br = document.createElement("br");
            message.appendChild(br);
            message.appendChild(message_time_span);
        }


        messages.appendChild(message);

        const scrollIntoViewOptions = { behavior: "smooth", block: "center" };
        message.scrollIntoView(scrollIntoViewOptions);
    };

    function sendMessage(event) {
        event.preventDefault();
        var input = document.getElementById("messageText");
        if (
            input.value === null ||
            input.value === undefined ||
            input.value.replace(" ", "") === ""
        ) {
        } else {
            ws.send(
                JSON.stringify({
                    message_content: input.value,
                    access_token: access_token,
                })
            );
        }
        input.value = "";
    }

    const form = document.querySelector("#message-send-div");
    form.addEventListener("submit", sendMessage);
}

/*
How it looks 

<div class="message">
    <span class="message-author"></span>
    <br>
    <br>
    <span class="message-content"></span>
    <br>
    <br>
    <span class="message-time"></span>
</div>
*/
