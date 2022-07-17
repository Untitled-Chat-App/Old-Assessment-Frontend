const rsa = require("node-rsa");
const { URL, URLSearchParams } = require("url");

var key = new rsa().generateKeyPair();
var apiUrl = "http://192.168.68.125:443";

let publicKey = key.exportKey("public");

let e = new URLSearchParams({
    username: "SpecialSkin",
    password: "dhruv12345678969"
}).toString()


fetch("http://192.168.68.125:443/token", {
  body: e,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  },
  method: "POST"
})
    .then((response) => response.json())
    .then((data) => {
        console.log("Request complete! response:", data);
    });

// let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGdXNpb25TaWQiLCJleHAiOjE2NTc5NTUzMTB9.0almlXjsM--8enAzplh_CcSlUuIb0ZMkwXjxhlvE5j0"

// // Create new user
// fetch(`${apiUrl}/api/users/signup`, {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//         username: "SpecialSkin",
//         email: "specialskin@gmail.com",
//         password: "dhruv12345678969",
//         public_key: JSON.stringify(publicKey),
//     }),
// })
//     .then((response) => response.json())
//     .then((data) => {
//         console.log("Request complete! response:", data);
//     });

// /*
// User -> /token
// access_token <- /token

// User + {token} -> /api/users/me
// */
