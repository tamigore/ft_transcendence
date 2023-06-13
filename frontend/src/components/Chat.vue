<template>
    <p>State: {{ connected() }}</p>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
    <form @submit.prevent="onSubmit">
        <input v-model="value" />
        <button type="submit" :disabled="isLoading">Submit</button>
    </form>
    <div class="messageStack">
      <p v-for="message in messageStack" :key="message">{{ message }}</p>
    </div>
</template>

<script lang="ts">
import SocketioChat from "@/socket";
import { defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
    name: "InputChat",
    created() {
        SocketioChat.setupSocketConnection();
        SocketioChat.socketMessage();
    },
    data() {
        return {
            isLoading: false as boolean,
            value: "" as string,
            messageStack: SocketioChat.state.msgEvents as string[],
        }
    },
    beforeUnmount() {
        SocketioChat.socket.disconnect();
    },
    methods: {
        onSubmit() {
            this.isLoading = true;
            const message = {
                username: store.state.user.username,
                text: this.value,
                object: "message",
                channel: "general"
            }
            SocketioChat.socket.timeout(1000).emit("cliMessage", message);
            this.isLoading = false;
        },
        connected () {
            return (SocketioChat.state.connected ? "Connected" : "Disconnected");
        },
        connect() {
            SocketioChat.socket.connect();
        },
        disconnect() {
            SocketioChat.socket.disconnect();
        }
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