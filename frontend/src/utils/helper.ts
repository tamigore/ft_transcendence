const hostname = window.location.hostname;
const protocol = window.location.protocol;
const base = `${protocol}//${hostname}`;

export const server = {
    nestUrl: `${base}:3000`,
    chatUrl: `${base}:8082`,
    gameUrl: `${base}:8081`
};
