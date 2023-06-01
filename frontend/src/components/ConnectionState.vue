<template>
    <p>State: {{ connected }}</p>
</template>

<script lang="ts">
import { state } from "@/socket";
import { defineComponent } from "vue";

export default defineComponent ({
name: "ConnectionState",

computed: {
    connected() {
        return state.connected;
    }
}
});
</script>