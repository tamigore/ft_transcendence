import { reactive } from "vue";
import { io } from "socket.io-client";
import { server } from "@/helper";

export const state = reactive({
  connected: false as boolean,
  hostname: server.baseUrl,
  logEvents: [] as string[],
  msgEvents: [] as string[],
  gameEvents: [] as string[],
  errorEvents: [] as string[],
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://:3000";
const URL = server.baseUrl;
export const socket = io(URL, { transports : ['websocket', 'polling', 'flashsocket']});

socket.on("connect", () => {
  state.connected = true;
  console.log("Socket connect");
});

socket.on("disconnect", () => {
  state.connected = false;
  console.log("Socket disconnect");
});

socket.on("reconnect_attempt", (attempt: any) => {
  state.connected = false;
  console.log("Socket reconnect_attempt: ", attempt);
});

socket.on("reconnect", () => {
  state.connected = true;
  console.log("Socket reconnect");
});

socket.on("reconnect_failed", () => {
  state.connected = false;
  console.log("Socket reconnect_failed");
});

socket.on("connect_error", () => {
  console.log("connect_error");
});

socket.on("connect_failed", () => {
  console.log("connect_failed");
});

socket.on("ping", () => {
  state.logEvents.push("ping");
  console.log("ping");
});

socket.on("log", (...args: any) => {
  state.logEvents.push(args);
  console.log("Socket log");
});

socket.on("onMessage", (...args: any) => {
  state.msgEvents.push(args);
  console.log("Socket msg");
});

socket.on("game", (...args: any) => {
  state.gameEvents.push(args);
  console.log("Socket game");
});
