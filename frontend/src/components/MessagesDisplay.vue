<template>
  <div class="msger">

    <main class="msger-chat"></main>

    <form class="msger-inputarea" @submit="onSubmit">
      <input type="text" class="msger-input" placeholder="Enter your message...">
      <button type="submit" class="msger-send-btn">Send</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent ({
  name : "BubbleChat",
  data() {
    return {
      msgerForm: null as Element | null,
      msgerInput: null as HTMLInputElement | null,
      msgerChat: null as Element | null,
      PERSON_NAME: "Elodie"
    };
  },
  mounted() {
    this.msgerForm =  this.$el.querySelector(".msger-inputarea");
    this.msgerInput = this.$el.querySelector(".msger-input");
    this.msgerChat = this.$el.querySelector(".msger-chat");
    if (this.msgerForm)
      this.msgerForm.addEventListener("submit", this.onSubmit);
  },
  methods: {
    onSubmit(event: Event) {
      event.preventDefault();
      console.log("Event in chat: " + event);
      let msgText;
      if (this.msgerInput != null)
        msgText = this.msgerInput.value;
      if (!msgText) return;

      this.appendMessage(this.PERSON_NAME, "left", msgText);
      if (this.msgerInput != null)
        this.msgerInput.value = "";
    },
    
    appendMessage(name: string, side: string, text: string) {
      const msgHTML = `
        <div class="msg ${side}-msg">
         
          <div class="msg-bubble">
            <div class="msg-info">
              <div class="msg-info-name">${name}</div>
              <div class="msg-info-time">${this.formatDate(new Date())}</div>
            </div>
            <div class="msg-text">${text}</div>
          </div>
        </div>
      `;
      if (this.msgerChat != null)
      {
        this.msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        this.msgerChat.scrollTop += 500;
      }
    },
    
    formatDate(date: Date) {
      const h = "0" + date.getHours();
      const m = "0" + date.getMinutes();

      return `${h.slice(-2)}:${m.slice(-2)}`;
    }
  }
});
</script>

<style>
:root {
  --left-msg-bg: red;
  --right-msg-bg: red;
}

.msger {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  width: 100%;
  max-width: 900px;
  margin: 25px 10px;
  height: 70vh; /* Hauteur de 50% de la hauteur de l'Ã©cran */
  border: var(--border);
  border-radius: 0px;
  background: GreenYellow;
  box-shadow: 0 15px 15px -5px rgba(0, 100, 20, 20);
}

.msger-chat {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  width: 100%;
  height: 100%; /* Occupera toute la hauteur disponible */
  background: Dodgerblue;
}

.msger-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: var(--border);
  color: green;
}

.msger-chat {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  width: 100%;
}
.msger-chat::-webkit-scrollbar {
  width: 5px;
}
.msger-chat::-webkit-scrollbar-track {
  background: green;
}
.msger-chat::-webkit-scrollbar-thumb {
  background: red;
}
.msg {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}
.msg:last-of-type {
  margin: 0;
}
.msg-img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  background: red;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
}
.msg-bubble {
  max-width: 450px;
  padding: 10px;
  border-radius: 15px;
  background: var(--left-msg-bg);
}
.msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.msg-info-name {
  margin-right: 10px;
  font-weight: bold;
}
.msg-info-time {
  font-size: 0.80em;
}

.left-msg .msg-bubble {
  border-bottom-left-radius: 0;
}

.right-msg {
  flex-direction: row-reverse;
}

.right-msg .msg-bubble {
  background: var(--right-msg-bg);
  color: black;
  border-bottom-right-radius: 0;
}
.right-msg .msg-img {
  margin: 0 0 0 10px;
}

.msger-inputarea {
  display: flex;
  padding: 6px;
  border-top: var(--border);
  background: yellow;
}
.msger-inputarea * {
  padding: 10px;
  border: none;
  border-radius: 30px;
  font-size: 0.8em;
}
.msger-input {
  flex: 1;
  background: whie;
  color: black;
  font-weight: bold;
}
.msger-send-btn {
  margin-left: 10px;
  background: black;
  color: red;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.23s;
}
.msger-send-btn:hover {
  background: red;
  color: yellow;
}
</style>
