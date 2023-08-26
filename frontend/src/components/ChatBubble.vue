<template>
  <main class="msger-chat">
    <div class="msg" v-bind:class="[owner ? 'right-msg' : 'left-msg']"> 
      <Menu v-if="toggle && !owner" :model="items" />
        <LoadAvatar class="msg-img" @click="display" v-if="message.user" :user="message.user"></LoadAvatar>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">{{ message.user?.username }}</div>
          <div class="msg-info-time">{{ parsDate(new Date(message.created_at ? message.created_at : 0)) }}</div>
        </div>

        <div class="msg-text">
          {{ message.text }}
        </div>
      </div>
    </div>
  </main>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Message, Room } from "@/utils/interfaces";
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from "@/store";
import socket from '@/utils/socket';
import router from '@/router';
import LoadAvatar from '@/components/LoadAvatar.vue';

export default defineComponent({
  name: "ChatBubble",
  components: {
    LoadAvatar,
  },
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
              this.blockUser();
            },
            visible: () => !this.isBlock,
          },
          { label: 'Admin', icon: 'pi pi-fw pi-sign-out',
            command: () => {
              this.addAdmin();
            },
            visible: () => {
              if (!this.message || !this.room || !this.room.ownerId)
                return (false);
              return this.room.ownerId === store.state.user.id;
            },
          },
          { label: 'Kick', icon: 'pi pi-fw pi-sign-out',
            command: () => {
              this.kickUser();
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Ban', icon: 'pi pi-fw pi-trash',
            command: () => {
              this.banUser();
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Mute', icon: 'pi pi-fw pi-eye-slash',
            command: () => {
              this.muteUser();
            },
            visible: () => this.hasHigherRights(),
          },
          { label: 'Add Friend', icon: 'pi pi-fw pi-user-plus',
            command: () => {
              this.addFriend();
            },
            visible: () => !this.isFriend,
          },
          { label: 'Remove Friend', icon: 'pi pi-fw pi-user-minus',
            command: () => {
              this.removeFriend();
            },
            visible: () => this.isFriend,
          },
          { label: 'Invite Pong', icon: 'pi pi-fw pi-circle-fill',
            command: () => {
              this.invitePong();
            },
          },
          { label: 'Private Message', icon: 'pi pi-fw pi-comments',
            command: () => {
              this.privateMessage();
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
    room: {
      type: Object as () => Room,
      required: true,
    },
    owner: { type: Boolean, required: true},
  },
  computed: {
    isFriend(): boolean {
      if (!store.state.user.friend || store.state.user.friend.length == 0)
        return false;
      return store.state.user.friend.find(user => {user.id === this.message.userId}) ? true : false;
    },
    isBlock(): boolean {
      if (!store.state.user.blocked || store.state.user.blocked.length == 0)
        return false;
      return store.state.user.blocked.find(user => {user.id === this.message.userId}) ? true : false;
    },
  },
  methods: {
    hasHigherRights(): boolean {
      if (!this.message || !this.room || (!this.room.ownerId && !this.room.admin)
        || (!this.room.ownerId && this.room.admin?.find((user) => {user.id === store.state.user.id})))
        return false;
      if (this.room.ownerId === store.state.user.id
        || (this.room.admin
          && this.room.admin?.find((user) => {user.id === store.state.user.id})
          && !this.room.admin?.find((user) => {user.id === this.message.userId})
          && this.room.ownerId !== this.message.userId))
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
      if (this.message.user && this.message.user.username)
        router.push(`/profile/${this.message.user.username}`);
    },

    async blockUser(): Promise<void> {
      console.log("blockUser");
      await axios.post('/api/user/block/add', {
        id: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        if (res && res.data && res.data.blocked)
          store.commit("setBlocked", res.data.blocked);
        socket.emit("update", {room: this.room});
      })
      .catch(err => { throw new Error(err) });
    },

    async addAdmin(): Promise<void> {
      console.log("addAdmin");
      await axios.post('/api/room/addAdmin', {
        roomId: this.room.id,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        socket.emit("update", {room: this.room});
      })
      .catch(err => { throw new Error(err) });
    },

    async kickUser(): Promise<void> {
      console.log("kickUser");
      
      await axios.post('/api/room/delUser', {
        roomId: this.room.id,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        socket.emit("leave_room", {user: this.message.user, room: this.room});
      })
      .catch(err => { throw new Error(err) });
    },

    async banUser(): Promise<void> {
      console.log("banUser");
      
      await axios.post('/api/room/addBan', {
        roomId: this.room.id,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        if (res && res.data && res.data.ban) {
          store.commit("setBan", res.data.ban);
        }
        socket.emit("update", {room: this.room});
      })
      .catch(err => { throw new Error(err) });
    },

    async muteUser() {
      console.log("muteUser");
      await axios.post('/api/room/addMute', {
        roomId: this.room.id,
        userId: store.state.user.id,
        otherId: this.message.userId,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        await this.update();
        console.log(res);
      })
      .catch(err => { throw new Error(err) });
    },

    async addFriend(): Promise<void> {
      console.log("addFriend");
      await axios.post('/api/user/friends/add', this.message.user, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        if (res && res.data && res.data.friend)
          store.commit("setFriend", res.data.friend);
        await this.update();
      })
      .catch(err => { throw new Error(err) });
    },

    async removeFriend(): Promise<void> {
      console.log("removeFriend");
      await axios.post('/api/user/friends/del', this.message.user, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res) => {
        console.log(res);
        if (res && res.data && res.data.friend)
          store.commit("setFriend", res.data.friend);
        await this.update();
      })
      .catch(err => { throw new Error(err) });
    },

    invitePong(): void {
      console.log("invitePong");
      router.push({path: "/pong"});
    },

    async privateMessage(): Promise<void> {
      console.log("privateMessage");
      
      await axios.post('/api/room/private', {
        user1: store.state.user,
        user2: this.message.user,
      }, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (res: AxiosResponse) => {
        console.log(res);
        await axios.get(`api/room/private/${store.state.user.id}`, {
          headers: { "Authorization": `Bearer ${store.state.user.hash}` }
        })
          .then(async (response: AxiosResponse) => {
            console.log(`getPrivate response: ${response.data}`);
            store.commit("setPrivate", response.data);
          })
          .catch((error: AxiosError) => { throw error; });
        socket.emit("join_room", { user: store.state.user, room: res.data });
        socket.emit("join_room", { user: this.message.user, room: res.data });
      })
      .catch((err: AxiosError) => { throw err });
    },

    async update() {
      await axios.get("api/room/public", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then(async (response: AxiosResponse) => {
          const rooms = response.data;
          store.commit("setRooms", response.data);
          for (const room of rooms)
          {
            if (room.id === store.state.lastRoom.id)
            {
              await axios.get(`api/chat/room/${room.id}`, {
                headers: { "Authorization": `Bearer ${store.state.user.hash}` }
              })
                .then((response: AxiosResponse) => {
                  store.commit("setMessages", response.data);
                })
                .catch((error: AxiosError) => { throw error; });
            }
          }
        })
        .catch((error: AxiosError) => { throw error; });
    }
  }
})
</script>

<style>
:root {
  --body-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --msger-bg: #000000;
  --border: 2px solid #ddd;
  --left-msg-bg: #cb5aed8b;
  --right-msg-bg: #4c6fed96;
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
  box-shadow: 0 15px 15px -5px rgba(255, 255, 255, 0.2);
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

.msg {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}
.msg:last-of-type {
  margin: 0;
}

.msg-img {
  width: 80px;
  height: 80px;
  margin-right: 3%;
  border-radius: 50%;
  overflow: hidden;
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
  color:#000000;
}
.msg-info-time {
  font-size: 0.85em;
}

.right-msg {
  flex-direction: row-reverse;
}

.left-msg .msg-bubble {
  border-bottom-left-radius: 0;
  color: #ffffff;
}

.right-msg .msg-bubble {
  background: var(--right-msg-bg);
  color: #ffffff;
  border-bottom-right-radius: 0;
}
.right-msg .msg-img {
  margin: 0 0 0 10px;
  margin-left: 3%;
}

</style>
