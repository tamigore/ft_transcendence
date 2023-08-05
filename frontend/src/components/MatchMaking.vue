<template>
  <div class="surface-card p-4 shadow-8 border-round w-full">
    <div class="text-center mb-5">
      <img :src="require(`@/assets/pong.png`)" alt="Image" height="50" class="mb-3">
      <div class="text-900 text-3xl font-medium mb-3">Welcome to the Pong Game</div>
    </div>

    <div>
      <Button @click="SearchGame()"> Multiplayer </Button>
      <Button @click="LaunchSingle()"> Single Player </Button>
      <Button @click="LeaveGame()"> Leave game </Button>

      <div class="flex align-items-center justify-content-between mb-6">
        <div class="flex align-items-center text-indigo-300">
          <Checkbox :binary="true" v-model="boxes" class="mr-2"></Checkbox>
          <label>Play with Boxes</label>
        </div>
        <div class="flex align-items-center text-indigo-300">
          <Checkbox :binary="true" v-model="wall" class="mr-2"></Checkbox>
          <label>Play with Wall</label>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from '@/store';
import { server } from "@/utils/helper";
import socket from '@/utils/gameSocket';


export default defineComponent({
  name: "MatchMaking",
  data() {
    return {
      boxes: false as boolean,
      solo: false as boolean,
      wall: false as boolean,
    };
  },
  methods: {
    async SearchGame() {
      console.log(`typeof ${typeof(store.state.user.id)}`);
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/game/matchmaker', {
          userId: store.state.user.id as number,
          gameSettings: false,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then((response: AxiosResponse) => {
          console.log("response from Mathmaker : ", response.data.name);
          socket.connect();
          console.log("socket connecting room : ", response.data.player1.name);
          socket.emit("joinGameRoom", {
          user : store.state.user,
          room : response.data.player1.name,
          });
          console.log(response);
          store.commit("setGameParam", {
            multi: true as boolean,
            boxe: false as boolean,
            solo: false as boolean,
            wall: false as boolean,
            noPlayer: false as boolean,
            score: [0, 0] as number[],
          });
          store.commit("setGameRoom", response.data.player1);
          if (response.data.player2)
          {
            if (store.state.user.id == response.data.player1.id)
              store.commit("setPlayerNum", 1);
            else  if (store.state.user.id == response.data.player2.id)
              store.commit("setPlayerNum", 2);

          
            store.commit("setGameConnect", true);
          }
          else
          {
            store.commit("setPlayerNum", 1);
            store.commit("setGameConnect", false);
            store.commit("setInQueue", true);
          }
          store.commit("setGame", response.data);
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
    },
    LaunchSingle() {
      store.commit("setGameConnect", true);
    },
    LeaveGame() {
      store.commit("setGameConnect", false);
    },
  },
});
</script>
  