<template>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SocketioChat from "@/socket";

export default defineComponent ({
    name: "ConnectionManager",
    methods: {
        connect() {
            SocketioChat.socket.connect();
        },
        disconnect() {
            SocketioChat.socket.disconnect();
        }
    }
});
</script>
