fetch("http://192.168.68.125:443/api/users/me", {
    method: "GET",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer authtokenlmao",
    },
})
    .then((response) => response.json())
    .then((data) => {
        console.log("Request complete! response:", data);
    });

fetch("http://192.168.68.125:443/api/users/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer authtokenlmao",
    },
    body: JSON.stringify({
        username: "cooldude69",
        email: "lol@lol.com",
        password: "1234",
        public_key: "haha",
    }),
})
    .then((response) => response.json())
    .then((data) => {
        console.log("Request complete! response:", data);
    });
