<template>
  <div class="w-full h-full">
  <!-- Connexion et création de salle -->
  <div class="flex justify-content-center">
    <div class="flex flex-column flex-wrap col">
      <div class="flex flex-row flex-wrap col-24 h-4rem justify-content-left mb-2">
        <div class="flex flex-row flex-wrap col-2 justify-content-center">
          <div v-if="connected">
            <Tag class="pr-6" icon="pi pi-circle-fill" style="background-color: rgba(0, 0, 0, 0); color: rgb(102, 245, 102)"
                    value="Connected"></Tag>
          </div>
          <div v-else>
            <Tag class="pr-6" icon="pi pi-circle-fill" style="background-color: rgba(0, 0, 0, 0); color: rgb(245, 102, 102)"
                    value="Not Connected"></Tag>
          </div>
        </div>
        <div class="flex justify-content-center">
          <form v-on:submit.prevent>
            <div class="p-inputgroup flex">
              <span class="p-inputgroup-addon">
                <i class="pi pi-box"> Room </i>
              </span>
              <InputText v-model="roomName" placeholder="Name" @keyup.enter="createRoom()" />
              <span class="p-inputgroup-addon">
                <i class="pi pi-unlock"></i>
              </span>
              <InputText v-model="roomPassword" placeholder="Password" @keyup.enter="createRoom()" />
              <Button @click="createRoom()">Create Room</Button>
            </div>
          </form>
        </div>
      </div>

      <!-- Colonnes des salles et du chat -->
      <div class="flex border-round align-items-start justify-content-start pl-8 pr-8 m-4">
        <!-- Colonne des salles (1/4 de la largeur) -->
        <div class="flex flex-col w-4">
          <TabView class= "w-full">
            <TabPanel header="Rooms" >
              <div id="roomContainer" class="scroll" style="height: 69vh;">
              <div v-for="Room in Rooms" :key="Room.room.id" class="flex justify-content-between flex-wrap items-center py-2 ml-3 mr-4" >
                <div class="flex justify-between flex-wrap items-center w-full p-3 cursor-pointer myBackground1" :class="[Room.room.id == lastRoom.id ? 'box-shadow' : '']" @click="selectRoom(Room.room)">
                  <div class="flex items-center" style="max-width: 53%;">
                    <div class="p-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                      {{ Room.room.name }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-auto mr-2"> <!-- Ajout de la classe mr-2 -->
                    <Button class="text-sm ml-3" label="Join" severity="success" raised v-if="!Room.isIn" @click="joinRoom(Room.room)" />
                    <Button class="text-sm ml-3" label="Leave" severity="warning" raised v-else @click="leaveRoom(Room.room)" />
                    <Button class="text-sm ml-3" label="Delete" severity="danger" raised v-if="owner(Room.room)" @click="deleteRoom(Room.room)" />
                  </div>
                </div>
              </div>
              </div>
            </TabPanel>

            <TabPanel header="Private Message">
              <div id="roomContainer" class="scroll" style="height: 69vh;">
                <div v-for="Room in Private" :key="Room.id" class="flex justify-content-between flex-wrap items-center py-2 ml-3 mr-4">
                  <div class="flex justify-between flex-wrap items-center w-full p-3 cursor-pointer myBackground1" v-bind:class="[Room.id == lastPrivate.id ? 'box-shadow' : 'box-shadow-dark']"  @click="selectPrivate(Room)">
                    <div class="flex item-center" style="max-width: 50%;">
                      <div class="p-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {{ Room.name }}
                      </div>
                    </div>
                </div>
              </div>
            </div>
            </TabPanel>
          </TabView>
        </div>
            
        <!-- Colonne du chat (3/4 de la largeur) -->
        <div class="flex flex-col w-9">
          <div v-if="!isPrivate" class="flex flex-column col">
            <div class="flex flex-column col mt-6 myBackground2" style="height: 70vh" v-bind:class="[ lastRoom && lastRoom.id  ? 'box-shadow' : 'box-shadow-dark']">
              <div v-for="Room in Rooms" :key="Room.room.id">
                <div v-if="Room.room.name == lastRoom.name">
                  <div id="messageContainer" class="scroll" style="height: 60vh; overflow-y: auto;">
                    <div v-for="msg in Messages" :key="msg.id">
                      <div class="flex">
                        <ChatBubble :message="msg" :owner="msg.userId == User.id" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-column-reverse col">
                <form v-on:submit.prevent>
                  <div class="p-inputgroup flex-1">
                    <span class="p-inputgroup-addon">
                      <i class="pi pi-comment"></i>
                    </span>
                    <InputText v-model="text" placeholder="Message" @keyup.enter="onSubmit()" />
                    <Button @click="onSubmit()">Submit</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-column col">
            <div v-for="Room in Private" :key="Room.id">
              <div class="flex flex-column col mt-6 myBackground2" style="height: 70vh" v-bind:class="[ lastRoom && lastRoom.id  ? 'box-shadow' : 'box-shadow-dark']">
                <div v-if="Room.name == lastPrivate.name">
                  <div id="messageContainer" class="scroll" style="height: 60vh; overflow-y: auto;">
                    <div v-for="msg in Messages" :key="msg.id">
                      <div class="flex">
                        <ChatBubble :message="msg" :owner="msg.userId == User.id" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-column-reverse col">
                  <form v-on:submit.prevent>
                    <div class="p-inputgroup flex-1">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-comment"></i>
                      </span>
                      <InputText v-model="text" placeholder="Message" @keyup.enter="onSubmitPrivate()"/>
                      <Button @click="onSubmitPrivate()">Submit</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
            
<script lang="ts">
import socket from "@/utils/socket";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { defineComponent } from "vue";
import { Room, Message, User } from "@/utils/interfaces";
import store from "@/store";
import ChatBubble from "@/components/ChatBubble.vue"

export default defineComponent({
  name: "ChatDisplay",

  components: {
    ChatBubble,
  },

  data() {
    return {
      roomName: "" as string,
      roomPassword: "" as string,
      text: "" as string,
      toogle: false as boolean,
      password: "" as string,
      isPrivate: false as boolean,
   };
  },

  computed: {
    connected () {
      const connect = socket.connected;
      return connect as boolean;
    },

    lastRoom() {
      return store.state.lastRoom as Room;
    },

    lastPrivate() {
      return store.state.lastPrivate as Room;
    },

    lastMessage () {
      const message = store.state.lastMessage;
      console.log(`lastMessage: ${message}`);
      if (store.state.lastRoom.id !== message.room.id && store.state.lastPrivate.id !== message.room.id) {
        if ((store.state.lastRoom.mute && !store.state.lastRoom.mute.find(user => user.id === message.user.id))
          || (store.state.user.blocked && !store.state.user.blocked.find(user => user.id === message.user.id))) {
          console.log("message.room joined but not selected");
          if (message.room.private)
            this.$toast.add({severity: 'info', summary: 'New message',
              detail: `From user ${message.user.username}`,
              life: 3000 });
          else
            this.$toast.add({severity: 'info', summary: 'New message',
              detail: `In room ${message.room.name}`,
              life: 3000 });
        }
      }
      return message as Message;
    },

    Rooms () {
      const obj = [] as { isIn: boolean; room: Room; }[];
      for (let i = 0; i < store.state.rooms.length; i++) {
        if (store.state.rooms[i].users)
          obj[i] = { isIn: store.state.rooms[i].users.find(
            user => user.id === store.state.user.id) ? true : false, room : store.state.rooms[i]
          };
        else console.error("wrong get room");
      }
      console.log(`Rooms computed: ${obj}`); 
      return obj as { isIn: boolean; room: Room; }[];
    },

    Messages () {
      return store.state.messages as Message[];
    },

    User () {
      return store.state.user as User;
    },

    Private () {
      return store.state.private as Room[];
    },
  },

  created() {
    this.getRooms();
    this.getPrivate();
  },

  updated() {
    const objDiv = document.getElementById("messageContainer");
    if (objDiv)
      objDiv.scrollTop = objDiv.scrollHeight;
  },

  methods: {
    InRoom (room: Room) {
      console.log(`InRoom methods: ${room}`);
      if (!room || !room.users)
        return false;
      return room.users.find(user => user.id === store.state.user.id) ? true : false;
    },

    onSubmit() {
      if (!this.lastRoom || !this.lastRoom.name || !this.text || this.text === "")
        return ;
      const message: Message = {
        id: 0,
        created_at: new Date(),
        text: this.text,
        roomId: this.lastRoom.id,
        room: this.lastRoom,
        userId: store.state.user.id,
        user: store.state.user,
      } as Message;
      socket.emit("cliMessage", message);
      this.text = "";
    },

    onSubmitPrivate() {
      if (!this.lastPrivate || !this.lastPrivate.name || !this.text || this.text === "")
        return ;
      const message: Message = {
        id: 0,
        created_at: new Date(),
        text: this.text,
        roomId: this.lastPrivate.id,
        room: this.lastPrivate,
        userId: store.state.user.id,
        user: store.state.user,
      } as Message;
      socket.emit("cliMessage", message);
      this.text = "";
    },

    async getPrivate() {
      await axios.get(`api/room/private/${store.state.user.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(`getPrivate response: ${response.data}`);
          store.commit("setPrivate", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },

    async getRooms() {
      await axios.get("api/room/public", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(`getRooms response: ${response.data}`);
          store.commit("setRooms", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },

    async getMessages(room: Room) {
      await axios.get(`api/chat/room/${room.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(`getMessages response: ${response.data}`);
          store.commit("setMessages", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },

    async createRoom() {
      if (this.roomName == "") {
        this.$toast.add({severity: "error", summary: "Invalide Name", detail: "Room must have a valide name", life: 2000});
        return;
      }
      const room = { ownerId: store.state.user.id, name: this.roomName, hash: this.roomPassword } as Room;
      await axios.post(`api/room/create`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          if (!this.InRoom(response.data)) {
            this.$toast.add({severity: "warn", summary: "Room name invalid", detail: "Room must have a unique name", life: 2000});
            return ;
          }
          console.log(`createRoom response.data: ${response.data}`);
          store.commit("setLastRoom", response.data);
          socket.emit("join_room", { user: store.state.user, room:  response.data });
          store.commit("setMessages", []);
          this.getRooms();
        })
        .catch((error: AxiosError) => { throw error; });
        this.roomName = "";
        this.roomPassword = "";
    },

    async deleteRoom(room: Room) {
      await axios.delete(`api/room/${room.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(`deleteRoom response.data: ${response.data}`);
          socket.emit("leave_room", { user: store.state.user, room:  response.data });
          store.commit("setLastRoom", {});
          store.commit("delRoom", room);
        })
        .catch((error: AxiosError) => { throw error; });
    },

    async joinRoom(room: Room) {
      console.log(`joinRoom: ${room}`);
      let pwd = null as string | null;
      if (room.hash) pwd = prompt("Input the room password: ", "pwd");
      await axios.post(`api/room/addUser`, {
        userId: store.state.user.id,
        roomId: room.id,
        pwd: pwd ? pwd : "",
      }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
      .then((res) => {
        if (!res.data) return;
        console.log(`joinRoom response.data: ${res.data}`);
        const payload = {
          user: store.state.user,
          room: room,
        };
        socket.emit("join_room", payload);
        store.commit("setLastRoom", room);
        this.getRooms();
        this.getMessages(room);
      })
      .catch((error: AxiosError) => { throw error; });
    },

    async leaveRoom(room: Room) {
      await axios.post(`/api/room/delUser`, {
        userId: store.state.user.id as number,
        roomId: room.id as number,
        otherId: store.state.user.id as number,
      }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
      .then((res) => {
        console.log(`leaveRoom response.data: ${res.data}`);
        const payload = {
          user: store.state.user,
          room: room,
        };
        socket.emit("leave_room", payload);
        if (this.lastRoom && this.lastRoom.name == room.name)
        store.commit("setLastRoom", {} as Room);
        else if (this.lastPrivate && this.lastPrivate.name == room.name)
        store.commit("setLastPrivate", {} as Room);
        this.getRooms();
      })
      .catch((error: AxiosError) => { throw error; });
    },

    selectRoom(value: Room) {
      if (value.users.find(user => user.id === store.state.user.id))
      {
        store.commit("setLastRoom", value);
        this.getMessages(value);
        this.isPrivate = false;
      }
    },

    selectPrivate(value: Room) {
      store.commit("setLastPrivate", value);
      this.getMessages(value);
      this.isPrivate = true;
    },

    owner(value: Room): boolean {
      if (!value || typeof value === 'undefined' || !value.ownerId)
        return false;
      return store.state.user.id === value.ownerId;
    },
  },
});
</script>

<style scoped>
body {
  color: white;
}

.myBackground1 {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.39);
}

.myBackground2 {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.39);
}

.myBackground3 {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-color: #000;
  background-image: url(@/assets/neonPongBackground.jpg);
}

.scroll {
  max-height: 900px;
  padding: 1rem;
  overflow-y: auto;
  direction: ltr;
}

.scroll::-webkit-scrollbar {
  width: 16px;
}

.scroll::-webkit-scrollbar-track {
  background-color: #e4e4e43f;
  border-radius: 100px;
}

.scroll::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}

.bubble {
  --r: 25px; /* the radius */
  --t: 25px; /* the size of the tail */
  
  padding: calc(2*var(--r)/3);
  mask: radial-gradient(var(--t) at var(--_d) 0,#0000 98%,#000 102%) 
      var(--_d) 100%/calc(100% - var(--r)) var(--t) no-repeat,
    conic-gradient(at var(--r) var(--r),#000 75%,#0000 0) 
      calc(var(--r)/-2) calc(var(--r)/-2) padding-box, 
    radial-gradient(50% 50% at 50% 50%, #000 98%,#0000 101%) 
      0 0/var(--r) var(--r) space padding-box;
  -webkit-mask: 
    radial-gradient(var(--t) at var(--_d) 0,#0000 98%,#000 102%) 
      var(--_d) 100%/calc(100% - var(--r)) var(--t) no-repeat,
    conic-gradient(at var(--r) var(--r),#000 75%,#0000 0) 
      calc(var(--r)/-2) calc(var(--r)/-2) padding-box, 
    radial-gradient(50% 50% at 50% 50%, #000 98%,#0000 101%) 
      0 0/var(--r) var(--r) space padding-box;
  background: linear-gradient(135deg,#ba00fe,#3d6ced) border-box;
  color: #fff;
}

.box-shadow {
  border: 0.2rem solid #fff;
  border-radius: 1rem;
  box-shadow: 0 0 .2rem #fff,
              0 0 .2rem #fff,
              0 0 1.2rem #bc13fe,
              0 0 0.8rem #bc13fe,
              0 0 1.2rem #bc13fe,
              inset 0 0 1.2rem #bc13fe;
}

.left {
  --_d: 0%;
  border-left: var(--t) solid #0000;
  margin-right: var(--t);
  place-self: start;
}

.right {
  --_d: 100%;
  border-right: var(--t) solid #0000;
  margin-left: var(--t);
  place-self: end;
}
</style>
