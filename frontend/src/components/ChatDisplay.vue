<template>
  <div class="myBackground1 w-full h-full">
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
              <InputText v-model="roomName" placeholder="Name" />
              <span class="p-inputgroup-addon">
                <i class="pi pi-unlock"></i>
              </span>
              <InputText v-model="roomPassword" placeholder="Password" />
              <Button @click="createRoom()">Create Room</Button>
            </div>
          </form>
        </div>
      </div>

      <!-- Colonnes des salles et du chat -->
      <div class="flex border-round align-items-start justify-content-start pl-8 pr-8 m-4">
        <!-- Colonne des salles (1/4 de la largeur) -->
        <div class="flex flex-col w-3">
          <TabView class= "w-full">


<TabPanel header="Rooms" >
  <div v-for="Room in Rooms" :key="Room.id" class="flex justify-content-between flex-wrap items-center py-2 mr-4" >
    <div class="flex justify-between flex-wrap items-center w-full p-3 cursor-pointer bg-gray-900" :class="[Room.id == lastRoom.id ? 'box-shadow' : 'box-shadow-dark']" @click="selectRoom(Room)">
      <div class="flex items-center" style="max-width: 56%;">
        <div class="p-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {{ Room.name }}
        </div>
      </div>
      <div class="flex items-center space-x-2 ml-auto mr-2"> <!-- Ajout de la classe mr-2 -->
        <Button class="text-sm ml-3" label="Join" severity="success" raised v-if="!InRoom(Room)" @click="joinRoom(Room)" />
        <Button class="text-sm ml-3" label="Leave" severity="warning" raised v-if="InRoom(Room)" @click="leaveRoom(Room)" />
        <Button class="text-sm ml-3" label="Delete" severity="danger" raised v-if="owner(Room)" @click="deleteRoom(Room)" />
      </div>
    </div>
  </div>
</TabPanel>





<TabPanel header="Private Message">
    <div v-for="Room in Private" :key="Room.id" class="flex justify-content-between flex-wrap items-center py-2 mr-4">
      <div class="flex justify-between flex-wrap items-center w-full p-3 cursor-pointer bg-gray-900" v-bind:class="[Room.id == lastPrivate.id ? 'box-shadow' : 'box-shadow-dark']"  @click="selectPrivate(Room)">
        <div class="flex item-center" style="max-width: 95%;">
          <div class="p-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
            {{ Room.name }}
          </div>
        </div>
    </div>
  </div>
</TabPanel>
          </TabView>
        </div>

        <!-- Colonne du chat (3/4 de la largeur) -->
        <div class="flex flex-col w-9">
          <div class="flex flex-column col mt-6 myBackground2" style="height: 70vh" v-bind:class="[ lastRoom && lastRoom.id  ? 'box-shadow' : 'box-shadow-dark']">
            <div v-for="Room in Rooms" :key="Room.id">
              <div v-if="Room.name == lastRoom.name">
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
                  <InputText v-model="text" placeholder="Message" />
                  <Button @click="onSubmit()">Submit</Button>
                </div>
              </form>
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
import { server } from "@/utils/helper";
import { useToast } from "primevue/usetoast";
import ChatBubble from "@/components/ChatBubble.vue"

export default defineComponent({
  name: "ChatDisplay",
  components: {
    ChatBubble,
  },
  data() {
    return {
      toast: useToast(),
      roomName: "" as string,
      roomPassword: "" as string,
      text: "" as string,
      toogle: false as boolean,
      password: "" as string,
   };
  },
  computed: {
    connected () {
      if (socket.connected)
        this.toast.add({severity: 'success', summary: 'Connected',
          detail: `The chat socket is lissening`,
          life: 3000 });
      else
        this.toast.add({severity: 'error', summary: 'Disconected',
          detail: `The chat socket isn't connected`,
          life: 3000 });
      return socket.connected as boolean;
    },
    lastRoom() {
      return store.state.lastRoom as Room;
    },
    lastPrivate() {
      return store.state.lastPrivate as Room;
    },
    lastMessage () { // TODO
      if (store.state.lastMessage.roomId !== store.state.lastRoom.id) 
      {
        if (store.state.lastMessage.room.private)
          this.toast.add({severity: 'info', summary: 'New message',
            detail: `From user ${store.state.lastMessage.user.username}`,
            life: 3000 });
        else
          this.toast.add({severity: 'info', summary: 'New message',
            detail: `In room ${store.state.lastMessage.room.name}`,
            life: 3000 });
      }
      return store.state.lastMessage as Message;
    },
    Rooms () {
      const obj = [] as { isIn: boolean; room: Room; }[];
      for (let i = 0; i < store.state.rooms.length; i++) {
        obj[i] = { isIn: store.state.rooms[i].users.find(
          user => user.id === store.state.user.id) ? true : false, room : store.state.rooms[i]
        };
      }
      console.log(obj); 
      return store.state.rooms as Room[];
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
    console.log("ChatDisplay created");
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
      await axios.get("api/room/public", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          store.commit("setRooms", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async getMessages(room: Room) {
      axios.defaults.baseURL = server.nestUrl;
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
        this.toast.add({severity: "error", summary: "Invalide Name", detail: "Room must have a valide name", life: 2000});
        return;
      }
      const room = { ownerId: store.state.user.id, name: this.roomName, hash: this.roomPassword } as Room;
      await axios.post(`api/room/create`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(`createRoom success: ${response.data}`);
          socket.emit("join_room", { user: store.state.user, room:  response.data });
          store.commit("setLastRoom", response.data);
          this.getRooms();
        })
        .catch((error: AxiosError) => { throw error; });
        this.roomName = "";
        this.roomPassword = "";
    },
    async deleteRoom(room: Room) {
      axios.defaults.baseURL = server.nestUrl;
      await axios.delete(`api/room/${room.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("deleteRoom success: " + response);
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
      axios.defaults.baseURL = server.nestUrl;
      await axios.post(`api/room/addUser`, {
        userId: store.state.user.id,
        roomId: room.id,
        pwd: pwd ? pwd : "",
      }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
      .then((res) => {
        console.log(`joinRoom success ${res.data}`);
        if (!res.data)
          return;
        const payload = {
          user: store.state.user,
          room: room,
        };
        socket.emit("join_room", payload);
        store.commit("setLastRoom", room);
        this.getMessages(room);
        this.getRooms();
      })
      .catch((error: AxiosError) => { throw error; });
    },
    async leaveRoom(room: Room) {
      axios.defaults.baseURL = server.nestUrl;
      await axios.post(`/api/room/delUser`, {
        userId: store.state.user.id as number,
        roomId: room.id as number,
        otherId: store.state.user.id as number,
      })
      .then((res) => {
        console.log(`leaveRoom success ${res.data}`);
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
      this.InRoom(room);
    },
    selectRoom(value: Room) {
      if (value.users.find(user => user.id === store.state.user.id))
      {
        store.commit("setLastRoom", value);
        this.getMessages(this.lastRoom);
      }
    },
    selectPrivate(value: Room) {
      console.log(value);
      store.commit("setLastPrivate", value);
      this.getMessages(this.lastPrivate);
    },
    owner(value: Room): boolean {
      return store.state.user.id === value.ownerId;
    },
  },
});
</script>

<style scoped>
body {
  color: white;
}

/* #messageContainer {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(@/assets/neonPongBackground.jpg);
} */
.myBackground1 {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  /* background-color: #000; */
  /* background-image: url(@/assets/pp.gif); */
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/012/732/670/large_2x/rainbow-leopard-seamless-pattern-colorful-neon-background-gradient-wallpaper-vector.jpg); */


  /* background-image: url(https://static.vecteezy.com/system/resources/previews/015/452/753/non_2x/abstract-technology-futuristic-neon-diagonal-glowing-blue-and-pink-square-shape-with-speed-motion-blur-effect-on-dark-blue-background-free-vector.jpg); */
  /* background-image: url(https://img.freepik.com/premium-vector/neon-leopard-pattern-rainbow-colored-spotted-background-vector-animal-print-wallpaper_501173-435.jpg); */
  background-image: url(@/assets/neonPongBackground.jpg);
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/010/407/104/large_2x/glowing-colourful-dots-circle-abstract-neon-lights-background-for-your-design-vector.jpg); */
  /* background-image: url('https://static.vecteezy.com/system/resources/previews/012/732/592/large_2x/rainbow-leopard-seamless-pattern-colorful-neon-background-gradient-wallpaper-free-vector.jpg'); */
}

.myBackground2 {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/014/456/982/large_2x/brick-wall-background-and-neon-light-vector.jpg); */
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/014/456/982/large_2x/brick-wall-background-and-neon-light-vector.jpg); */
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/012/732/670/large_2x/rainbow-leopard-seamless-pattern-colorful-neon-background-gradient-wallpaper-vector.jpg); */
  
  /* background-image: url(https://static.vecteezy.com/system/resources/previews/013/684/180/non_2x/set-of-glowing-neon-color-circles-round-smoke-shape-with-wavy-dynamic-lines-isolated-on-black-background-technology-concept-vector.jpg); */
  /* background-image: url('https://static.vecteezy.com/system/resources/previews/012/732/592/large_2x/rainbow-leopard-seamless-pattern-colorful-neon-background-gradient-wallpaper-free-vector.jpg'); */
  /* background-image: url(https://img.freepik.com/premium-vector/neon-leopard-pattern-rainbow-colored-spotted-background-vector-animal-print-wallpaper_501173-435.jpg); */
  background-image: url(@/assets/neonPongBackground.jpg);
  /* background-image: url(@/assets/pp.gif); */

}
.mimissicu {
  background-color: #000;
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
