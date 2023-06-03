export const server = {
    // inetUrl: new URL(location.href).hostname,
    nestUrl: "http://" + new URL(location.href).hostname + ":3000",
    baseUrl: new URL(location.href).hostname + ":8082"
}