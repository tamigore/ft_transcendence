<template>
  <main class="msger-chat">
    <div class="msg" v-bind:class="[owner ? 'right-msg' : 'left-msg']"> 
      <div
       class="msg-img"
       style="background-color: rgb(89, 151, 237);"
      ></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">{{ message?.user.username }}</div>
          <div class="msg-info-time">{{ parsDate(new Date(message?.created_at ? message?.created_at : 0)) }}</div>
        </div>

        <div class="msg-text">
          {{ message?.text }}
        </div>
      </div>
    </div>
  </main>
</template>

<style>
:root {
  --body-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --msger-bg: #fff;
  --border: 2px solid #ddd;
  --left-msg-bg: #d894e4;
  --right-msg-bg: #579ffb;
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: var(--body-bg);
  font-family: Helvetica, sans-serif;
}

.msger {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  width: 100%;
  max-width: 867px;
  margin: 25px 10px;
  height: calc(100% - 50px);
  border: var(--border);
  border-radius: 5px;
  background: var(--msger-bg);
  box-shadow: 0 15px 15px -5px rgba(0, 0, 0, 0.2);
}
.msg-text{
  display:block;
  width: auto;
  word-wrap:break-word;
}
.msger-chat {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.msger-chat::-webkit-scrollbar {
  width: 6px;
}
.msger-chat::-webkit-scrollbar-track {
  background: #ddd;
}
.msger-chat::-webkit-scrollbar-thumb {
  background: #bdbdbd;
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
  background: #ddd;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
}
.msg-bubble {
  max-width: 450px;
  padding: 15px;
  border-radius: 15px;
  background: var(--left-msg-bg);
}
.msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.msg-info-name {
  margin-right: 10px;
  font-weight: bold;
}
.msg-info-time {
  font-size: 0.85em;
}

.left-msg .msg-bubble {
  border-bottom-left-radius: 0;
}

.right-msg {
  flex-direction: row-reverse;
}
.right-msg .msg-bubble {
  background: var(--right-msg-bg);
  color: #ffffff;
  border-bottom-right-radius: 0;
}
.right-msg .msg-img {
  margin: 0 0 0 10px;
}

.msger-chat {
  background-color: #fcfcfe00;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import { Message } from "@/utils/interfaces"

export default defineComponent({
  name: "ChatBubble",
  props: {
    message: {
      type: Object as () => Message,
    },
    owner: { type: Boolean},
  },
  methods: {
    parsDate(date: Date) {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
      const h = "0" + d.getHours();
      const m = "0" + d.getMinutes();
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
      return [year, month, day].join('-') + ` ${h.slice(-2)}:${m.slice(-2)}`;
    },
  }
})
</script>