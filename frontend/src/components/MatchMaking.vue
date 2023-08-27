<template>
	<div class="surface-card p-4 shadow-8 border-round w-full">
		<div class="text-center mb-5">
			<img :src="require(`@/assets/pong.png`)" alt="Image" height="50" class="mb-3">
			<div class="text-900 text-3xl font-medium mb-3">Welcome to the Pong Game</div>
		</div>

		<div>
			<Button @click="SearchGame()"> Multiplayer </Button>
			<Button @click="LaunchSingle()"> Single Player </Button>
			<Button @click="inviteGame()"> invite </Button>
			<Button @click="acceptInvite()"> accept invite </Button>
			<!-- <Button @click="LeaveGame()"> Leave game </Button> -->

			<div class="flex align-items-center justify-content-between mb-6">
				<div class="flex align-items-center text-indigo-300">
					<Checkbox :binary="true" v-model="boxes" class="mr-2"></Checkbox>
					<label>Play with Boxes</label>
				</div>
			</div>
		</div>
	</div>
	<Accordion :activeIndex="0">
		<AccordionTab v-for="game in specGames" :key="game?.id" :header="game?.name">
			<p>{{ game?.player1?.username }} vs {{ game?.player2?.username }}</p>
			<Button @click="Spectate(game)"> Spectate </Button>
		</AccordionTab>
	</Accordion>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from '@/store';
import { server } from "@/utils/helper";
import gameSocket from '@/utils/gameSocket';
import { Game } from '@/utils/interfaces';

export default defineComponent({
	name: "MatchMaking",
	data() {
		return {
			boxes: false as boolean,
			solo: false as boolean,
			imageGrid: [
				{ id: "1", img: require('@/assets/profiles/profil_1.jpg') },
				{ id: "2", img: require('@/assets/profiles/profil_2.jpg') },
				{ id: "3", img: require('@/assets/profiles/profil_3.jpg') },
				{ id: "4", img: require('@/assets/profiles/profil_4.jpg') },
				{ id: "5", img: require('@/assets/profiles/profil_5.jpg') },
				{ id: "6", img: require('@/assets/profiles/profil_6.jpg') },
				{ id: "7", img: require('@/assets/profiles/profil_7.jpg') },
				{ id: "8", img: require('@/assets/profiles/profil_8.jpg') },
				{ id: "9", img: require('@/assets/profiles/profil_9.jpg') },
			],
		};
	},

	computed: {
		specGames() {
			return store.state.specGames as Game[];
		},
	},

	async mounted() {
		await this.getGames();
		console.log("mounted getGames: ", this.specGames);
	},

	methods: {
		
		async acceptInvite() {
			console.log("accept invite");
			store.commit("setInQueue", true);
			const userName = "eestela";
			store.commit("setGameRoom", userName);
			gameSocket.emit("inviteJoinGameRoom", { room: userName as string });
			gameSocket.emit("inviteGame", {
				user1username: userName,
				user2username: store.state.user.username,
			});
		},

		async inviteGame() {
			console.log("invite friend");
			store.commit("setInQueue", true);
			store.commit("setGameRoom", store.state.user.username);
			gameSocket.emit("inviteJoinGameRoom", { room: store.state.user.username as string });
			console.log("invite friend END");

		},

		async getGames() {
			await axios.get('/api/game/spectate', {
				headers: { "Authorization": `Bearer ${store.state.user.hash}` }
			})
				.then((response: AxiosResponse) => {
					console.log("getGames response.data: ", response.data);
					store.commit("setSpecGames", response.data);
				})
				.catch((error: AxiosError) => {
					console.log(error);
				});
		},

		async SearchGame() {
			console.log("searching game");
			gameSocket.connect();
			console.log("gameSocket id : ", gameSocket.id);
			axios.defaults.baseURL = server.nestUrl;
			await axios.post('/api/game/matchmaker', {
				userName: store.state.user.username as string,
				isBlocked: this.boxes,
			}, {
				headers: { "Authorization": `Bearer ${store.state.user.hash}` }
			})
				.then((response: AxiosResponse) => {
					console.log("response from Mathmaker : ", response.data.name);
					console.log("gameSocket connecting room : ", response.data.player1.username);
					console.log(" av join room gameSocket id : ", gameSocket.id);
					gameSocket.emit("joinGameRoom", {
						user: store.state.user,
						room: response.data.player1.username as string,
					});
					console.log(" apres join room gameSocket id : ", gameSocket.id);
					console.log("matchamking response :", response);
					if (response.data.player2)
						store.commit("setPlayerNum", 2);
					else
						store.commit("setPlayerNum", 1);
					store.commit("setInQueue", true);
					console.log("player num === ", store.state.playerNum);
					console.log("gameSocket id === ", gameSocket.id);
					store.commit("setGame", response.data);
				})
				.catch((error: AxiosError) => {
					console.log(error);
				});
		},

		LaunchSingle() {
			store.commit("setInSolo", true);
		},

		LeaveGame() {
			if (store.state.ingame && store.state.playerNum != 0) {
				console.log(`matchmaking player1 = ${store.state.game.player1Id} || player2 = ${store.state.game.player2Id}`);
				let looser = store.state.game.player1Id;
				let winner = store.state.game.player2Id;
				if (store.state.game.player2Id === store.state.user.id) {
					looser = store.state.game.player2Id;
					winner = store.state.game.player1Id;
				}
				gameSocket.emit("endGame", { room: store.state.gameRoom, game: store.state.game, winner: winner, looser: looser, score: "forfeit" });
			}
			else if (store.state.ingame && store.state.playerNum === 0) {
				console.log("spectator leave not done");
			}
			else if (store.state.inQueue) {
				gameSocket.emit("queueLeave", { gameId: store.state.game.id });
			}
			gameSocket.emit("leaveGameRoom", { room: store.state.gameRoom });
			store.commit("setInQueue", false);
			store.commit("setGameConnect", false);
			store.commit("setGameRoom", "");
			store.commit("setInsolo", false);
		},

		async Spectate(game: Game) {
			gameSocket.connect();
			store.commit("setUserGamegameSocket", gameSocket.id);
			axios.defaults.baseURL = server.nestUrl;
			await axios.post('/api/game/spectate', {
				userId: store.state.user.id as number,
				userName: store.state.user.username as string,
				gameId: game.id as number,
			}, {
				headers: { "Authorization": `Bearer ${store.state.user.hash}` }
			})
				.then((response: AxiosResponse) => {
					gameSocket.emit("joinGameRoom", {
						user: store.state.user,
						room: response.data.player1.username as string,
					});
					store.commit("setGameRoom", response.data.player1.username);
					console.log("spectator join room: ", response.data.player1.username);
					console.log("game id: ", response.data.id);
					gameSocket.emit("newSpectator", {
						room: response.data.player1.username as string,
						user: store.state.user,
					});
					store.commit("setPlayerNum", 0);
					//store.commit("setGameConnect", true);

				})
				.catch((error: AxiosError) => {
					console.log(error);
				});
		},

		getImageById(id: string | null) {
			if (!id) {
				return { id: 1, img: require('@/assets/welc.jpeg') };
			} else if (id && id.length < 2) {
				return this.imageGrid.find(image => image.id === id);
			} else {
				if (id.length > 2) {
					return { id: id, img: id };
				} else {
					return { id: 1, img: require('@/assets/welc.jpeg') };
				}
			}
		},
	},
});

</script>
  