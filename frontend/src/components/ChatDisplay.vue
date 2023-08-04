<template>
  <Toast />
  <div class="flex justify-content-center p-2">
    <div class="flex flex-column flex-wrap col">
      <div class="flex flex-row flex-wrap col-24 h-4rem justify-content-cente">
        <div class="flex flex-row flex-wrap col-2 justify-content-cente">
          <div v-if="connected">
            <Button icon="pi pi-check" rounded aria-label="Filter" />
          </div>
          <div v-else>
            <Button icon="pi pi-times" severity="danger" rounded aria-label="Cancel" />
          </div>
          <label for="ingredient1" class="ml-2">Connected</label>
        </div>
        <div class="flex justify-content-center">
          <form>
            <div class="p-inputgroup flex">
              <span class="p-inputgroup-addon">
                <i class="pi pi-user"></i>
              </span>
              <InputText v-model="roomName" placeholder="Name" />
              <span class="p-inputgroup-addon">
                <i class="pi pi-user"></i>
              </span>
              <InputText v-model="roomDescription" placeholder="Description" />
              <Button @click="createRoom()">Create Room</button>
            </div>
          </form>
        </div>
      </div>
      <div class="flex flex-row flex-wrap col">
        <TabView>
          <TabPanel header="Rooms">
            <div class="flex flex-column flex-wrap col-4 w-full" style="height: 70vh;">
              <div v-for="Room in Rooms" :key="Room.id" class="p-2">
                <div class="flex flex-row flex-grow-1" v-bind:class="[Room.id == selectedRoom.id  ? 'box-shadow' : 'box-shadow-dark']">
                  <div class="grid">
                    <div class="col-4">
                      <a href='#' v-if="isUserInRoom(Room)" @click.prevent="selectSet(Room)"></a>
                      {{ Room.name }}
                    </div>
                    <div class="col-4"></div>
                    <div class="col-4">
                      <Button label="Delete" severity="danger" raised v-if="owner(Room)" @click="deleteRoom(Room)" />
                      <Button label="Join" severity="success" raised v-if="!isUserInRoom(Room)" @click="joinRoom(Room)" />
                      <Button label="Leave" severity="warning" raised v-if="isUserInRoom(Room)" @click="leaveRoom(Room)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Private Message">
            <div class="flex flex-column flex-wrap col-4 w-full"  style="height: 70vh;">
              <div v-for="room in Private" :key="room.id" class="p-2">
                <div class="flex flex-row" v-bind:class="[room.id == selectedPrivate.id  ? 'box-shadow' : 'box-shadow-dark']">
                  <div class="flex flex-row">
                    <a href='#' @click.prevent="selectPrivate(room)">
                        {{ room.name }}
                      </a>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
        <div class="flex flex-row flex-wrap col-8" style="height: 70vh;">
          <div class="flex flex-column col" v-bind:class="[ selectedRoom && selectedRoom.id  ? 'box-shadow' : 'box-shadow-dark']">
            <div v-for="Room in Rooms" :key="Room.id">
              <div v-if="Room.name == selectedRoom.name">
                <div v-for="msg in Messages" :key="msg.id"> 
                  <div v-bind:class="[msg.userId === User.id  ? 'col-offset-6 right-100' : 'col-6']">
                    <div class="flex">
                      <div class="grid bubble" v-bind:class="[msg.userId === User.id  ? 'right' : 'left']">
                        <div v-if="msg.userId != User.id && msg.user && msg.user.username" class="col-2">{{ msg.user.username }}</div>
                        <div class="col-8">{{ msg.text }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-column-reverse col">
              <form>
                <div class="p-inputgroup flex-1">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-user"></i>
                  </span>
                  <InputText v-model="text" placeholder="Message" />
                  <Button @click="onSubmit()">Submit</button>
                </div>
              </form>
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
import { server } from "@/utils/helper";
import { useToast } from "primevue/usetoast";

export default defineComponent({
  name: "ChatDisplay",
  data() {
    return {
      toast: useToast(),
      roomName: "" as string,
      roomDescription: "" as string,
      selectedRoom: {} as Room,
      selectedPrivate: {} as Room,
      text: "" as string,
   };
  },
  computed: {
    Rooms () {
      return store.state.rooms as Room[];
    },
    Messages () {
      return store.state.messages as Message[];
    },
    lastMessage () {
      return store.state.lastMessage as Message;
    },
    connected () {
      return socket.connected as boolean;
    },
    User () {
      return store.state.user as User;
    },
    Private () {
      return store.state.private as Room[];
    }
  },
  created() {
    console.log("ChatDisplay created");
    this.getRooms();
    this.getPrivate();
  },
  methods: {
    onSubmit() {
      if (!this.selectedRoom || !this.selectedRoom.name || !this.text || this.text === "")
        return ;
      const message: Message = {
        id: 0,
        created_at: new Date(),
        text: this.text,
        roomId: this.selectedRoom.id,
        room: this.selectedRoom,
        userId: store.state.user.id,
        user: store.state.user,
      } as Message;
      socket.emit("cliMessage", message);
      this.text = "";
    },
    async getPrivate() {
      axios.defaults.baseURL = server.nestUrl;
      await axios.get(`api/room/private/${store.state.user.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          store.commit("setPrivate", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async getRooms() {
      axios.defaults.baseURL = server.nestUrl;
      await axios.get("api/room/all", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          store.commit("setRooms", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async getMessages(room: Room) {
      await axios.get(`api/chat/room/${room.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          store.commit("setMessages", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async createRoom() {
      if (this.roomName == "") {
        console.log("Room must have a valide name.");
        return;
      }
      const room = { ownerId: store.state.user.id, name: this.roomName, description: this.roomDescription } as Room;
      await axios.post(`api/room/create`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("createRoom success: " + response);
          socket.emit("join_room", { user: store.state.user, room: this.selectedRoom })
        })
        .catch((error: AxiosError) => { throw error; });
        this.getRooms();
    },
    async deleteRoom(room: Room) {
      await axios.post(`api/room/delete`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("deleteRoom success: " + response);
        })
        .catch((error: AxiosError) => { throw error; });
        this.getRooms();
    },
    joinRoom(room: Room) {
      const payload = {
        user: store.state.user,
        room: room,
      };
      socket.emit("join_room", payload);
    },
    leaveRoom(room: Room) {
      const payload = {
        user: store.state.user,
        room: room,
      };
      socket.emit("leave_room", payload);
    },
    isUserInRoom(room: Room) {
      try {
        if (!room || !room.users)
          return false;
        const user = room.users.find((user) => user.id === store.state.user.id);
        if (typeof(user) !== "undefined" && user)
          return true;
        return false;
      }
      catch (e) {
        console.log(e);
        return false;
      }
    },
    selectSet(value: Room) {
      this.selectedRoom = value;
      console.log(this.selectedRoom);
      store.commit("setLastRoom", this.selectedRoom);
      this.getMessages(this.selectedRoom);
    },
    selectPrivate(value: Room) {
      this.selectedPrivate = value;
      console.log(this.selectedPrivate);
      store.commit("setLastPrivate", this.selectedRoom);
      this.getPrivate();
    },
    owner(value: Room): boolean {
      return store.state.user.id === value.ownerId;
    }
  },
});
</script>

<style>
body {
  color: white;
}

.bubble {
  --r: 25px; /* the radius */
  --t: 25px; /* the size of the tail */
  
  padding: calc(2*var(--r)/3);
  mask: radial-gradient(var(--t) at var(--_d) 0,#0000 98%,#000 102%) 
      var(--_d) 100%/calc(100% - var(--r)) var(--t) no-repeat,
    conic-gradient(at var(--r) var(--r),#000 75%,#0000 0) 
      calc(var(--r)/-2) calc(var(--r)/-2) padding-box, 
    radial-gradient(50% 50%, #000 98%,#0000 101%) 
      0 0/var(--r) var(--r) space padding-box;
  -webkit-mask: 
    radial-gradient(var(--t) at var(--_d) 0,#0000 98%,#000 102%) 
      var(--_d) 100%/calc(100% - var(--r)) var(--t) no-repeat,
    conic-gradient(at var(--r) var(--r),#000 75%,#0000 0) 
      calc(var(--r)/-2) calc(var(--r)/-2) padding-box, 
    radial-gradient(50% 50%, #000 98%,#0000 101%) 
      0 0/var(--r) var(--r) space padding-box;
  background: linear-gradient(135deg,#ba00fe,#3d6ced) border-box;
  color: #fff;
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
