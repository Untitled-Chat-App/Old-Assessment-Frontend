const rsa = require("node-rsa");

var key = new rsa().generateKeyPair();
var publicKey = key.exportKey("public");
var token = "The token";

fetch("http://192.168.68.125:443/api/users/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
        username: "cooldude69420",
        email: "lol@lol.com",
        password: "1234",
        public_key: JSON.stringify(publicKey),
    }),
})
    .then((response) => response.json())
    .then((data) => {
        console.log("Request complete! response:", data);
    });
