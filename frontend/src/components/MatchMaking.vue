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
      <Button @click="Spectate()"> Spectate </Button>

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
      console.log("searching game");
      await socket.connect();
      console.log("socket id : ", socket.id);

      // store.commit("setUserGameSocket", socket.id);
      // console.log(`typeof ${typeof(store.state.user.id)}`);
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/game/matchmaker', {
        userName: store.state.user.username as string,
        isBlocked: false as boolean,
      }, {
          headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then((response: AxiosResponse) => {
          console.log("response from Mathmaker : ", response.data.name);
          console.log("socket connecting room : ", response.data.player1.username);

          //rendre la room unique ?
          console.log(" av join room socket id : ", socket.id);
          socket.emit("joinGameRoom", {
            user: store.state.user,
            room: response.data.player1.username as string,
          });
          console.log(" apres join room socket id : ", socket.id);


          console.log(response);

          if (response.data.player2) 
          {
              store.commit("setPlayerNum", 2);
          }
          else
            store.commit("setPlayerNum", 1);

          store.commit("setGameConnect", false);
          store.commit("setInQueue", true);
          console.log("player num === ", store.state.playerNum);
          console.log("socket id === ", socket.id);
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
      if (store.state.ingame) {
        const looser = store.state.playerNum == 1 ? 2 : 1;
        const winner = store.state.playerNum == 1 ? 1 : 2;
        socket.emit("endGame", { room: store.state.gameRoom, game: store.state.game, winner: winner, looser: looser, score: "forfeit" });
      }
      store.commit("setInQueue", false);
      store.commit("setGameConnect", false);
      store.commit("setGameRoom", "");
    },
    async Spectate() {
      socket.connect();

      store.commit("setUserGameSocket", socket.id);
      // console.log(`typeof ${typeof(store.state.user.id)}`);
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/game/spectate', {
          userId: store.state.user.id as number,
          userName: store.state.user.username as string,
          userPlaying: 11 as number,
        }, 
          { headers: {"Authorization": `Bearer ${store.state.user.hash}`}
        })
        .then((response: AxiosResponse) => {
          socket.emit("joinGameRoom", {
            user: store.state.user,
            room: response.data.player1.username as string,
          });
          store.commit("setGameRoom", response.data.player1.username);
          console.log("spectator join room: ", response.data.player1.username);
          console.log("game id: ", response.data.id);
          //reucperer les infos de la game (tous les blocks)
          socket.emit("newSpectator", {
            room: response.data.player1.username as string,
            user: store.state.user,
          });
          store.commit("setPlayerNum", 0);
          store.commit("setGameConnect", true);
          
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
    }
  },
});
</script>
  