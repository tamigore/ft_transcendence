<template>
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

class message {
    username: string;
    text: string;
    object: string;
    channel: string;
}

export default defineComponent({
    name: "InputChat",
    created() {
        SocketioChat.setupSocketConnection();
    },
    data() {
        return {
            isLoading: false,
            value: "",
            messageStack: SocketioChat.state.msgEvents as string[],
        }
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