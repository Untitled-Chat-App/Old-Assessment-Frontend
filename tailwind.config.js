module.exports = {
    darkMode: "class",
    content: ["./src/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                taro: ["Taro"],
                aileron: ["Aileron"]
            },
            backgroundImage: {
                light_mode_bg: "url('../images/light_gradient.jpeg')",
                dark_mode_bg: "url('../images/dark_gradient.jpeg')"
            }
        },
    }
};