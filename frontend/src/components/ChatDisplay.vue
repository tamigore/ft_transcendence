<template>
    <p style="color: blueviolet;">State: {{ connected() }}</p>
    <div class="grid">
        <div class="col-4">
            <div v-for="Room in Rooms" :key="Room.id"  >
                <div >
                    <div class= "box-shadow-dark" v-on:click="selectSet(Room)">{{Room.name}}</div>
                </div>
            </div>
        </div>
        <div class="col box-shadow-dark">
            <div v-for="Room in Rooms" :key="Room.id" >         
                <div v-if="Room.name == selected.name" >  
                    <div v-for="msg in Messages" :key="msg.id" >
                        <div class="box-shadow-dark col-6" :class="{ ' col-offset-6 ': msg.userId === User.id}">
                            {{msg.text}}  
                        </div>
                    </div>
                </div> 
            </div>
            <div>
                <form @submit.prevent="onSubmit">
                    <input v-model="text" />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
        <!-- <div class="grid col box-shadow-dark" v-if="Room.Name == this.selected">
            <div v-for="msg in Room.Messages" :key="msg.id">
                {{ msg.content }}
            </div>
        </div> -->
    </div>
</template>

<script lang="ts">
import socket from "@/utils/socket";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { defineComponent } from "vue";
import { Room, Message, User } from "@/utils/interfaces";
import store from "@/store";
import { server } from "@/utils/helper";
export default defineComponent({
    name: "ChatDisplay",
    data() {
        return {
            Rooms: [{}] as Room[],
            Messages: [{}] as Message[],
            selected: {} as Room,
            text: "" as string,
            channel: "" as string,
            User: {} as User,
        };
    },
    mounted() {
        this.getRooms();
        this.User = store.state.user;
    },
	methods: {
        onSubmit() {
            const message = {
                id: 0,
                created_at: new Date(),
                text: this.text,
                roomId: this.selected.id,
                room: this.selected,
                userId: store.state.user.id,
                user: store.state.user,
            } as Message;
            socket.emit("cliMessage", {user: store.state.user, room: this.selected, message: message});
            this.text = "";
        },
		async getRooms() {
            axios.defaults.baseURL = server.nestUrl;
            await axios.get("api/room", {
                headers: {"Authorization": `Bearer ${store.state.user.hash}`}
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
            await axios.get(`api/chat/room/?id=${room.id}`, {
                headers: {"Authorization": `Bearer ${store.state.user.hash}`}
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
        selectSet(value: Room) {
            this.selected = value
            console.log(this.selected);
            this.getMessages(this.selected);
        },
        connected() {
            return (socket.connected ? "Connected" : "Disconnected");
        },
    }
});
</script>

<style>
body{
    color: white;
}
</style>
