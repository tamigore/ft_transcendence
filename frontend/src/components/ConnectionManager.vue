<template>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { socket } from "@/socket";

export default defineComponent ({
    name: "ConnectionManager",

    methods: {
        connect() {
            socket.connect();
        },
        disconnect() {
            socket.disconnect();
        }
    }
});
</script>