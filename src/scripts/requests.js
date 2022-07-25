const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

require("dotenv").config();
const API_URL = process.env.API_URL;

async function getAccessToken(username = null, password = null) {
    let token;

    if (username == null && password == null) {
        username = process.env.USERNAME;
        password = process.env.PASSWORD;
    }

    // Format login details into query params
    let login_details = new URLSearchParams({
        username: username,
        password: password,
    }).toString();

    await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: login_details,
    })
        .then((response) => response.json())
        .then((data) => {
            token = data["access_token"];
        });

    return token;
}

async function signupUser(data) {
    let access_token = await getAccessToken();

    let key = new rsa().generateKeyPair();
    let publicKey = key.exportKey("public");

    // Create new user
    fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
            public_key: JSON.stringify(publicKey),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        });
}

module.exports = { getAccessToken, signupUser };
