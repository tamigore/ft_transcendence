<template>
    <button @click="getMessages()">Old Messages</button>
    <button @click="getUserMessages()">Old Messages from user</button>
    <form @submit.prevent="onSubmit">
        <input v-model="value" />
        <button type="submit" :disabled="isLoading">Submit</button>
    </form>
    <div class="messageStack">
      <p v-for="message in messageStack" :key="message.text">{{ message }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";
import axios, { AxiosError } from 'axios';
import { server } from "@/helper";

interface message {
    username: string,
    text: string,
    object: string,
    channel: string
}

export default defineComponent({
    name: "GetMessages",
    data() {
        return {
            isLoading: false as boolean,
            value: "" as string,
            messageStack: store.state.chat.messages as message[],
        }
    },
    methods: {
        async getMessages() {
            axios.defaults.baseURL = server.nestUrl;
            const messages = await axios.get("api/chat")
                .catch((error: AxiosError) => {console.log(error);});
            if (messages)
                this.messageStack = messages.data as message[];
        },
        async getUserMessages() {
            axios.defaults.baseURL = server.nestUrl;
            const messages = await axios.get("api/chat/user", { params: { user : store.state.user.username } })
                .catch((error: AxiosError) => {console.log(error);});
            if (messages)
                this.messageStack = messages.data as message[];
        },
        async onSubmit() {
            this.isLoading = true;
            const messages = await axios.get("api/chat/channel", { params: { channel : this.value } })
                .catch((error: AxiosError) => {console.log(error);});
            if (messages)
                this.messageStack = messages.data as message[];
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