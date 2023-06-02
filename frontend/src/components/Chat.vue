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
import { socket, state } from "@/socket";
import { defineComponent } from 'vue';

export default defineComponent({
    name: "InputChat",

    data() {
        return {
            isLoading: false,
            value: "",
            user: "",
            inputString: '',
            messageStack: state.msgEvents,
        }
    },

    socket: {
        onMessage(data: any) {
            console.log(data.content);
            this.messageStack.push(data.content);
        },

        SOCKET_onMessage(data: any) {
            console.log(data.content);
            this.messageStack.push(data.content);
        }
    },
    activate: {
    },
    methods: {
        onSubmit() {
            console.log("test : " + state.hostname);
            this.isLoading = true;
            socket.timeout(1000).emit("newMessage", this.value, () => {
                this.isLoading = false;
            });
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