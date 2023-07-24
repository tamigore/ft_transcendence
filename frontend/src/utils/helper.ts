export const server = {
    // inetUrl: new URL(location.href).hostname,
    nestUrl: "http://" + new URL(location.href).hostname + ":3000",
    chatUrl: new URL(location.href).hostname + ":8082",
    gameUrl: new URL(location.href).hostname + ":8081"
}