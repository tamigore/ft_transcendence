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
          <TabPanel header="Romms">
            <div class="flex flex-column flex-wrap col-4">
              <div v-for="Room in Rooms" :key="Room.id" class="p-2">
                <div class="flex flex-row box-shadow-dark" v-on:click="selectSet(Room)">
                  <div class="flex flex-row">
                    {{ Room.name }}
                  </div>
                  <div class="flex flex-row">
                    <Button label="Delete" severity="danger" v-if="owner(Room)" @click="deleteRoom(Room)" />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Users">
            <div class="flex flex-column flex-wrap col-4">
              <div v-for="User in Users" :key="User.id" class="p-2">
                <div class="flex flex-row box-shadow-dark" v-on:click="selectUser(User)">
                  <div class="flex flex-row">
                    {{ User.username }}
                  </div>
                  <!-- <div class="flex flex-row">
                    <Button label="Leave" severity="danger" @click="deleteRoom(Room)" />
                  </div> -->
                </div>
              </div>
            </div>
          </TabPanel>
      </TabView>
        <div class="flex flex-row flex-wrap col-8">
          <div class="flex flex-column col box-shadow-dark">
            <div v-for="Room in Rooms" :key="Room.id">
              <div v-if="Room.name == selectedRoom.name">
                <div v-for="msg in Messages" :key="msg.id">
                  <div class="col-6" :class="{ ' col-offset-6 ': msg.userId === userId }">
                    <!-- <Message :closable="false" severity="success">{{ msg.text }}</Message> -->
                    <Message
                      :style="{
                          border: 'solid #696cff',
                          borderWidth: '0 0 0 0px',
                          color: '#696cff'
                      }"
                      class="border-primary w-full justify-content-start"
                      severity="info" :closable="false" :icon=undefined>
                      <div class="flex align-items-center">
                        <font-awesome-icon icon="fa-solid fa-message" />
                        <div class="ml-2">{{ msg.text }}</div>
                      </div>
                    </Message>
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
      Rooms: store.state.rooms as Room[],
      Messages: [{}] as Message[],
      selectedRoom: {} as Room,
      selectedUser: {} as User,
      text: "" as string,
      Users: [{}] as User[],
      connected: socket.connected as boolean,
      userId: store.state.user.id,
      usernamePM: "" as string,
    };
  },
  updated() {
    this.connected = socket.connected;
    console.log("updated");
  },
  mounted() {
    this.getRooms();
    this.getUsers();
    socket.on("servMessage", (e: {message: Message}) => {
      console.log("servMessage");
      if (socket.connected) {
        if (e && e.message && e.message.room.name && e.message.room.name === store.state.last_room.name) {
          console.log("add message to room");
          this.Messages.push(e.message);
        }
        else {
          console.log("add message to room");
          this.toast.add({ severity: 'success', summary: 'New Message', detail: `From ${e.message.room.name}`, life: 3000 });
        }
      }
    });
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
      socket.emit("cliMessage", { message: message });
      this.text = "";
    },
    privateMessage() {
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
      socket.emit("privMessage", { message: message });
      this.text = "";
    },
    async getUsers() {
      axios.defaults.baseURL = server.nestUrl;
      await axios.get(`api/user/private/${store.state.user.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.Users = response.data;
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async getRooms() {
      axios.defaults.baseURL = server.nestUrl;
      await axios.get("api/room", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.Rooms = response.data;
          store.commit("setRooms", this.Rooms);
        })
        .catch((error: AxiosError) => { throw error; });
    },
    async getMessages(room: Room) {
      await axios.get(`api/chat/room/${room.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.Messages = response.data;
          store.commit("setRooms", this.Rooms);
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
    selectSet(value: Room) {
      this.selectedRoom = value;
      console.log(this.selectedRoom);
      this.getMessages(this.selectedRoom);
    },
    selectUser(value: User) {
      this.selectedUser = value;
      console.log(this.selectedUser);
      this.getUsers();
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
</style>
