module.exports = {
    darkMode: "class",
    content: ["./src/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                taro: ["Taro"],
                aileron: ["Aileron"],
                aileron_light: ["Aileron-Light"]
            },
            backgroundImage: {
                light_mode_bg: "url('../images/light_gradient.jpeg')",
                dark_mode_bg: "url('../images/background_gradient.png')"
            }
        },
    }
};