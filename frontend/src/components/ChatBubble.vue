<template>
  <main class="msger-chat">
    <div class="msg" v-bind:class="[owner ? 'right-msg' : 'left-msg']"> 
      <Menu v-if="toggle && !owner" :model="items" />
      <div class="msg-img" @click="display">
      </div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">{{ message.user.username }}</div>
          <div class="msg-info-time">{{ parsDate(new Date(message.created_at ? message.created_at : 0)) }}</div>
        </div>

        <div class="msg-text">
          {{ message.text }}
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
  background-image: url("https://assets.codepen.io/6093409/sprocket.svg");
  background-size: contain
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
import { defineComponent, ref } from 'vue'
import { Message } from "@/utils/interfaces"
import axios from 'axios';
import store from "@/store";
import { server } from '@/utils/helper';

export default defineComponent({
  name: "ChatBubble",
  data() {
    return {
      toggle: false,
      items: ref([
          { label: 'View Profile', icon: 'pi pi-fw pi-search',
            command: () => {
              this.searchUser(this.message.user);
            },
          },
          { label: 'Block', icon: 'pi pi-fw pi-lock',
            command: () => {
              this.blockUser(this.message.user);
            },
            visible: () => !this.isBlock,
          },
          { label: 'Admin', icon: 'pi pi-fw pi-sign-out',
            command: () => {
              this.addAdmin(this.message.user);
            },
            visible: () => store.state.lastRoom.ownerId === store.state.user.id,
          },
          { label: 'Kick', icon: 'pi pi-fw pi-sign-out',
            command: () => {
              this.kickUser(this.message.user);
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Ban', icon: 'pi pi-fw pi-trash',
            command: () => {
              this.banUser(this.message.user);
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Mute', icon: 'pi pi-fw pi-eye-slash',
            command: () => {
              this.muteUser(this.message.user);
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Invite Friend', icon: 'pi pi-fw pi-user-plus',
            command: () => {
              if (this.isFriend)
                this.inviteFriend(this.message.user);
            },
            visible: () => !this.isFriend,
          },
          { label: 'Remove Friend', icon: 'pi pi-fw pi-user-minus',
            command: () => {
              if (this.isFriend)
                this.removeFriend(this.message.user);
            },
            visible: () => this.isFriend,
          },
          { label: 'Invite Pong', icon: 'pi pi-fw pi-circle-fill',
            command: () => {
              this.invitePong(this.message.user);
            },
          },
          { label: 'Private Message', icon: 'pi pi-fw pi-comments',
            command: () => {
              this.privateMessage(this.message.user);
            },
          },
      ]),
    }
  },
  props: {
    message: {
      type: Object as () => Message,
      required: true,
    },
    owner: { type: Boolean, required: true},
  },
  computed: {
    isFriend(): boolean {
      if (!store.state.user.friend)
        return false;
      return store.state.user.friend.find(user => {user.id === this.message.userId}) ? true : false;
    },
    isBlock(): boolean {
      if (!store.state.user.blocked)
        return false;
      return store.state.user.blocked.find(user => {user.id === this.message.userId}) ? true : false;
    },
  },
  methods: {
    hasHigherRights(): boolean {
      if (store.state.lastRoom.ownerId === store.state.user.id
        || (store.state.lastRoom.admin
          && store.state.lastRoom.admin?.find((user) => {user.id === store.state.user.id})
          && !store.state.lastRoom.admin?.find((user) => {user.id === this.message.userId})
          && store.state.lastRoom.ownerId !== this.message.userId))
        return true;
      return false;
    },
    parsDate(date: Date): string {
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
    display(): void {
      this.toggle = !this.toggle;
    },
    async searchUser(): Promise<void> {
      console.log("searchUser");
      // await axios.post('', {
      //   id: this.message.userId,
      // }, {
      //   headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      // });
    },
    async blockUser(): Promise<void> {
      console.log("blockUser");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/user/block/add', {
        id: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
    async addAdmin(): Promise<void> {
      console.log("addAdmin");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/room/addAdmin', {
        roomId: this.message.roomId,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
    kickUser(): void {
      console.log("kickUser");
    },
    async banUser(): Promise<void> {
      console.log("banUser");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/room/addBan', {
        roomId: this.message.roomId,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
    muteUser(): void {
      console.log("muteUser");
    },
    async inviteFriend(): Promise<void> {
      console.log("inviteFriend");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/user/friends/add', {
        id: this.message.user,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
    async removeFriend(): Promise<void> {
      console.log("inviteFriend");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/user/friends/del', {
        id: this.message.user,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
    invitePong(): void {
      console.log("invitePong");
    },
    async privateMessage(): Promise<void> {
      console.log("privateMessage");
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/room/private', {
        user1: store.state.user,
        user2: this.message.user,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((res) => {
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },
  }
})
</script>