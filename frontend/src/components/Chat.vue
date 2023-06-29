<template>
    <p>State: {{ connected() }}</p>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
    <form @submit.prevent="onSubmit">
        <input v-model="channel" />
        <input v-model="value" />
        <button type="submit" :disabled="isLoading">Submit</button>
    </form>
    <div class="messageStack">
        <p v-for="message in messageStack" :key="message.text">{{ message }}</p>
    </div>
</template>

<script lang="ts">
import SocketioChat from "@/utils/socket";
import { defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
    name: "InputChat",
    created() {
        this.socketio.setupSocketConnection();
    },
    data() {
        return {
            channel: "general" as string,
            socketio: SocketioChat as typeof SocketioChat,
            isLoading: false as boolean,
            value: "" as string,
            messageStack: store.state.chat.messages as {username: string, text: string, object: string, channel: string}[],
        }
    },
    beforeUnmount() {
        this.socketio.socket.disconnect();
    },
    methods: {
        onSubmit() {
            this.isLoading = true;
            const message = {
                username: store.state.user.username,
                text: this.value,
                object: "message",
                channel: this.channel,
            }
            if (this.channel != "general")
                this.socketio.socket.emit("joinChan", {chan : this.channel});
            this.socketio.socket.timeout(1000).emit("cliMessage", message);
            this.isLoading = false;
            this.value = "";
        },
        connected() {
            return (store.state.chat.connected ? "Connected" : "Disconnected");
        },
        connect() {
            this.socketio.socket.connect();
        },
        disconnect() {
            this.socketio.socket.disconnect();
        },
    }
});
</script>

<style>
.messageStack {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 380px;
  overflow-y: auto;
}
</style>
