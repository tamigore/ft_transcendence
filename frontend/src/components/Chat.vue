<template>
    <p style="color: blueviolet;">State: {{ connected() }}</p>
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
    <div>
        <GetMessages />
    </div>
</template>

<script lang="ts">
import SocketioChat from "@/utils/socket";
import { defineComponent } from "vue";
import store from "@/store";
import GetMessages from "./GetMessages.vue";
import { Message } from "@/utils/interfaces";

export default defineComponent({
    name: "InputChat",
    components: {
        GetMessages
    },
    data() {
        return {
            channel: "general" as string,
            socketio: SocketioChat as typeof SocketioChat,
            isLoading: false as boolean,
            value: "" as string,
            messageStack: store.state.messages as Message[],
        }
    },
    mounted() {
        this.socketio.setupSocketConnection();
    },
    methods: {
        onSubmit() {
            this.isLoading = true;
            const message = {
                id: 0,
                created_at: new Date(),
                text: this.value,
                roomId: store.state.last_room.id,
                room: store.state.last_room,
                userId: store.state.user.id,
                user: store.state.user,
            } as Message;
            this.socketio.socket.emit("cliMessage", {user: store.state.user, room: store.state.last_room, message: message});
            this.isLoading = false;
            this.value = "";
        },
        connected() {
            return (store.state.connected ? "Connected" : "Disconnected");
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
  color: aliceblue;
}
</style>
