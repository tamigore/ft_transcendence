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
import { defineComponent } from "vue";

// declare interface Message {
//     user: string;
//     text: string;
//     object: string;
//     channel: string;
// }

// function createMessageStack()
// {
//     const message = {} as Message;
//     const messageStack = [] as Message[];
//     console.log(state.msgEvents);
//     for (const msg of state.msgEvents) {
//         message.user = JSON.parse(JSON.stringify(msg)).user;
//         message.text = JSON.parse(JSON.stringify(msg)).text;
//         message.object = JSON.parse(JSON.stringify(msg)).object;
//         message.channel = JSON.parse(JSON.stringify(msg)).channel;
//         console.log(message);
//         messageStack.push(message);
//     }
//     console.log("end of createMessageStack");
//     return messageStack;
// }

// function add2MessageStack(messageStack: Message[], msg: string)
// {
//     const message = {} as Message;
//     console.log(msg);
//     message.user = JSON.parse(JSON.stringify(msg)).user;
//     message.text = JSON.parse(JSON.stringify(msg)).text;
//     message.object = JSON.parse(JSON.stringify(msg)).object;
//     message.channel = JSON.parse(JSON.stringify(msg)).channel;
//     console.log(message);
//     messageStack.push(message);
//     console.log("end of add2MessageStack");
//     return messageStack;
// }

export default defineComponent({
    name: "InputChat",

    data() {
        return {
            isLoading: false,
            value: "",
            // messageStack: [] as Message[],
            messageStack: state.msgEvents as string[],
        }
    },
    // mounted () {
    //     this.messageStack = createMessageStack();
    //     console.log("Chat Mounted");
    // },
    // updated() {
    //     this.messageStack = add2MessageStack(this.messageStack, state.msgEvents[state.msgEvents.length - 1]);
    //     console.log("Chat Updated");
    // },
    methods: {
        onSubmit() {
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