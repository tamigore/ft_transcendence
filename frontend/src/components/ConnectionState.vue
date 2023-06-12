<template>
    <p>State: {{ connected }}</p>
</template>

<script lang="ts">
import SocketioChat from "@/socket";
import { defineComponent } from "vue";

export default defineComponent ({
    name: "ConnectionState",

    computed: {
        connected() {
            return SocketioChat.state.connected;
        }
    }
});
</script>