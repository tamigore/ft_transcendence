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
          <div class="flex justify-content-center">
            <form>
              <div class="p-inputgroup flex">
                <span class="p-inputgroup-addon">
                  <i class="pi pi-user"></i>
                </span>
                <InputText v-model="usernamePM" placeholder="Private Message" />
                <span class="p-inputgroup-addon">
                  <i class="pi pi-user"></i>
                </span>
                <Button @click="privateMessage()">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="flex flex-row flex-wrap col">
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
        <div class="flex flex-row flex-wrap col-8">
          <div class="flex flex-column col box-shadow-dark">
            <div v-for="Room in Rooms" :key="Room.id">
              <div v-if="Room.name == selected.name">
                <div v-for="msg in Messages" :key="msg.id">
                  <div class="col-6" :class="{ ' col-offset-6 ': msg.userId === User.id }">
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
      selected: {} as Room,
      text: "" as string,
      User: store.state.user as User,
      connected: socket.connected as boolean,
      usernamePM: "" as string,
    };
  },
  mounted() {
    this.connected = socket.connected;
    this.getRooms();
    this.User = store.state.user;
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
      if (!this.selected || !this.selected.name || !this.text || this.text === "")
        return ;
      const message: Message = {
        id: 0,
        created_at: new Date(),
        text: this.text,
        roomId: this.selected.id,
        room: this.selected,
        userId:this.User.id,
        user: this.User,
      } as Message;
      socket.emit("cliMessage", { message: message });
      this.text = "";
    },
    privateMessage() {
      if (!this.selected || !this.selected.name || !this.text || this.text === "")
        return ;
      const message: Message = {
        id: 0,
        created_at: new Date(),
        text: this.text,
        roomId: this.selected.id,
        room: this.selected,
        userId:this.User.id,
        user: this.User,
      } as Message;
      socket.emit("privMessage", { message: message });
      this.text = "";
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
        .catch((error: AxiosError) => {
          console.log(error);
        });
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
        .catch((error: AxiosError) => {
          console.log(error);
        });
    },
    async createRoom() {
      if (this.roomName == "") {
        console.log("Room must have a valide name.");
        return;
      }
      const room = { ownerId: this.User.id, name: this.roomName, description: this.roomDescription } as Room;
      await axios.post(`api/room/create`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("createRoom success: " + response);
        })
        .catch((error: AxiosError) => {
          console.log(error);
          throw error;
        });
        this.getRooms();
    },
    async deleteRoom(room: Room) {
      await axios.post(`api/room/delete`, room, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("deleteRoom success: " + response);
        })
        .catch((error: AxiosError) => {
          console.log(error);
          throw error;
        });
        this.getRooms();
    },
    selectSet(value: Room) {
      this.selected = value;
      console.log(this.selected);
      this.getMessages(this.selected);
    },
    owner(value: Room): boolean {
      return this.User.id === value.ownerId;
    }
  },
});
</script>

<style>
body {
  color: white;
}
</style>
