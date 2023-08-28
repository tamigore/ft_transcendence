<template>
	<div v-show="inSolo || inGame">
		<div v-if="Pong" class="flex flex-column align-items-center justify-content-center">

			<div v-if="inSolo || inGame" class="flex p-4">
				<div v-if="inGame" class="flex px-2">
					<p style="color: aliceblue;">{{ Pong.scoreA }}</p>
				</div>
				<div v-if="inSolo" class="flex px-2">
					<div class="flex px-2">
						<Button @click="Pong.startMatchSolo()" :disabled="Pong.gameIsRunning">Solo</Button>
					</div>
					<div class="flex px-2">
						<Button @click="Pong.startWall()" :disabled="Pong.gameIsRunning">WALL</Button>
					</div>
					<div class="flex px-2">
						<Button @click="Pong.startMatchMultiLocal()"
							:disabled="Pong.gameIsRunning">MultiplayerLocal</Button>
					</div>
					<div class="flex px-2">
						<Button @click="Pong.startNoPlayer()" :disabled="Pong.gameIsRunning">NoPlayer</Button>
					</div>
					<div class="flex px-2">
						<Button @click="Pong.restartMatch(false)" :disabled="!Pong.gameIsRunning">Restart</Button>
					</div>
					<div class="flex px-2">
						<Button @click="Pong.setBlocks()" :disabled="Pong.gameIsRunning">{{ "BLOCKS " + Pong.blockStatus
						}}</Button>
					</div>
				</div>
				<Button @click="LeaveGame(),Pong.restartMatch(false) ">LeaveGame</Button>
				<div v-if="inGame" class="flex px-2">
					<p style="color: aliceblue;">{{ Pong.scoreB }}</p>
				</div>
			</div>

			<div class="flex align-items-center justify-content-center">
				<canvas ref="myCanvas" class="gameCanvasStyle" :style="computedCanvasStyle" :width="`${Pong.width}`"
					:height="`${Pong.height}`">
				</canvas>
			</div>
		</div>
	</div>
</template>

<style>
.flexContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 60vw;
	/* Set the container's width to the full viewport width */
	height: 60vh;
	/* Set the container's height to the full viewport height */
	border: 1px solid black;
	/* Just for visualization */
}

.gameCanvasStyle {
	flex: 1;
	z-index: 1;
	display: flex;
	position: relative;
	/* width: var(--canvasWidth, 10px);
  height: var(--canvasHeight, 10px); */
	border: 0.2rem solid #fff;
	border-radius: 1rem;
	box-shadow: 0 0 .2rem #fff,
		0 0 .2rem #fff,
		0 0 1.2rem #bc13fe,
		0 0 0.8rem #bc13fe,
		0 0 1.2rem #bc13fe,
		inset 0 0 1.2rem #bc13fe;
	margin: auto;
	background: rgba(0, 0, 0, 0.534);
	justify-content: center;
	/* Center Buttons horizontally */
	align-items: center;
	width: 100%;
	/* height: 100%; */
	object-fit: contain;
}

.info-container {
	position: absolute;
	top: 0;
	bottom: 5%;
	left: 1%;
	margin-top: 50px;
	height: 100px;
	width: 10%;
}

.Button-container {
	position: absolute;
	bottom: 100%;
	/* Make the Button container stick to the top of the game container */
	left: 0;
	/* Align to the left of the game container */
	height: auto;
	/* Let the height be determined by its content */
	width: 100%;
	/* Full width to match game container */
	display: flex;
	/* Make it a flex container */
	justify-content: center;
	/* Center Buttons horizontally */
	align-items: center;
	/* Center Buttons vertically */
	gap: 10px;
	/* Add some space between the Buttons */
}

.game-container {
	flex: 1;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-start;
	margin-top: 5%;
	margin-right: 5%;
	padding-top: 120px;
	/* Space for the Buttons. This should be greater than the height of the Buttons */
}

.pong-container {
	display: flex;
	align-items: center;
}

-paddle-width .input-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #fff;
}

.left-input,
.right-input {
	width: 150px;
}

.left-input {
	text-align: right;
}

.right-input {
	text-align: left;
}

.pong {
	position: relative;
	width: var(--width, 10px);
	height: var(--height, 10px);
	border: 1px solid #6b4d4d;
	background-color: #2b222e;
	overflow: hidden;
}
</style>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed } from 'vue';
import useFPS from '../class/useFPS';
import { PongGameClass } from '../class/PongClass';
import { gameTick } from '../class/PongSettings';
import store from "@/store";
import gameSocket from "@/utils/gameSocket";
import { GameMove, PaddleState, BallState, BlockState } from "@/utils/interfaces";
import { BallClass } from "../class/BallClass";
import { EffectBlock } from "../class/EffectBlock";
// import socket from '@/utils/socket';

export default defineComponent({
	name: 'FpsComponent',
	computed: {
		inGame() {
			return store.state.ingame;
		},
		inSolo() {
			return store.state.insolo;
		},
	},
	methods: {
		LeaveGame() {
			if (store.state.ingame && store.state.playerNum != 0) {
				//console.log(`Pong Game player1 = ${store.state.game.player1Id} || player2 = ${store.state.game.player2Id}`);
				let looser = store.state.game.player1Id;
				let winner = store.state.game.player2Id;
				if (store.state.game.player2Id === store.state.user.id) {
					looser = store.state.game.player2Id;
					winner = store.state.game.player1Id;
				}
				gameSocket.emit("endGame", { room: store.state.gameRoom, game: store.state.game, winner: winner, looser: looser, score: "forfeit" });
			}
			else if (store.state.inQueue) {
				gameSocket.emit("queueLeave", { gameId: store.state.game.id });
			}
			if (store.state.ingame || store.state.inQueue)
				gameSocket.emit("leaveGameRoom", { room: store.state.gameRoom });
			store.commit("setPlayerNum", 0);
			store.commit("setInQueue", false);
			store.commit("setGameConnect", false);
			store.commit("setGameRoom", "");
			store.commit("setInSolo", false);
		},
	},
	setup() {
		const myCanvas = ref<(HTMLCanvasElement | null)>(null);
		let ctx: CanvasRenderingContext2D | null = null;
		const { fps } = useFPS();
		const hitSound = new Audio();
		const Pong = ref(new PongGameClass(hitSound));
		const paddleSprite = new Image();
		let lastDate = Date.now();
		const lastBall = new BallClass(Pong.value, 0, 0, 0, 0, 0, 'blue', 0);
		let lastPoint = Date.now();
		
		const drawPaddle = (x: number, y: number, width: number, height: number, sprite: HTMLImageElement) => {
			if (!ctx)
				return;
			ctx.shadowColor = "rgb(" + 243 + "," + 243 + "," + 21 + ")";
			ctx.shadowBlur = 10;
			ctx.strokeStyle = "rgba(" + 243 + "," + 243 + "," + 21 + ",0.2)";
			ctx.drawImage(sprite, x, y, width, height);
		}

		const drawBlocks = () => {
			if (!ctx)
				return;
			for (const block of Pong.value.myBlocks) {
				ctx.drawImage(block.sprite, block.x, block.y, block.width, block.height)
			}
		}

		const drawBall = () => {
			if (!ctx)
				return;
			// if (Math.abs(lastBall.x - Pong.value.theBall.x) > 10)
			// {
			// 	console.log(" THE BALL WAS HERE : ");
			// 	console.log(lastBall.ballState());
			// 	console.log("THE BALL IS HERE : ", Pong.value.theBall.ballState());
			// } 
			lastBall.setBallState(Pong.value.theBall.ballState());
			ctx.beginPath();
			ctx.arc(Pong.value.theBall.x, Pong.value.theBall.y, Pong.value.theBall.radius, 0, Math.PI * 2);
			ctx.shadowColor = "rgb(" + 13 + "," + 213 + "," + 252 + ")";
			ctx.shadowBlur = 10;
			ctx.strokeStyle = "rgba(" + 13 + "," + 213 + "," + 252 + ",0.2)";
			// ctx.fillStyle = Pong.value.theBall.color;
			ctx.fill();
			ctx.closePath();
			for (const ball of Pong.value.myBalls) {
				//console.log("ANOTHER BALL IS HERERE");
				ctx.beginPath();
				ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
				ctx.shadowColor = "rgb(" + 13 + "," + 213 + "," + 252 + ")";
				ctx.shadowBlur = 10;
				ctx.strokeStyle = "rgba(" + 13 + "," + 213 + "," + 252 + ",0.2)";
				// ctx.fillStyle = ball.color;
				ctx.fill();
				ctx.closePath();
			}
		}

		const gameLoop = () => {
			if (!ctx)
				return;
			if ((Pong.value.inMultiplayer && !store.state.ingame) || (Pong.value.gameIsRunning && !store.state.insolo && !store.state.ingame))
				Pong.value.restartMatch();
			if (store.state.inInvite && !store.state.game && Date.now() - store.state.dateInvite > 10000) {
				store.commit("setInInvite", false);
				gameSocket.emit("leaveGameRoom", { room: store.state.gameRoom });
				store.commit("setPlayerNum", 0);
				store.commit("setInQueue", false);
				store.commit("setGameConnect", false);
				store.commit("setGameRoom", "");
				store.commit("setInSolo", false);
			}
				Pong.value.bot();
				Pong.value.moovePaddles();
				Pong.value.theBall.ballColision();
				const newDate = Date.now();
				if (store.state.ingame  && newDate - lastDate > 200) {
					console.log("clock setter : ",  Pong.value.theBall.ballState());
					// console.log("playerNum : ", store.state.playerNum);
					gameSocket.emit("ballSetter", { ballInfo: Pong.value.theBall.ballState(), room: store.state.gameRoom });
					lastDate = newDate;
				}
				for (const ball of Pong.value.myBalls) {
					ball.ballColision();
				}
				ctx.clearRect(0, 0, Pong.value.width, Pong.value.height);
			drawBlocks();
			drawBall();
			drawPaddle(Pong.value.paddleOffset, Pong.value.leftPaddleY, Pong.value.leftPaddleWidth, Pong.value.leftPaddleHeight,
				paddleSprite);
			drawPaddle(Pong.value.width - Pong.value.paddleOffset - Pong.value.rightPaddleWidth, Pong.value.rightPaddleY,
				Pong.value.rightPaddleWidth, Pong.value.rightPaddleHeight, paddleSprite);
			for (const ball of Pong.value.myBalls) {
				ball.ballColision();
			}
		}

		onMounted(() => {
			paddleSprite.src = require('@/assets/sprites/blanc.png'); // Adjust the path as needed
			hitSound.src = require('@/assets/sounds/hitSound.wav');
			hitSound.volume = 0.5;

			if (myCanvas.value) {
				ctx = myCanvas.value.getContext('2d');
				if (ctx) {
					window.addEventListener('keydown', Pong.value.handleKeyDown);
					window.addEventListener('keyup', Pong.value.handleKeyUp);
					setInterval(gameLoop, gameTick);
				}
			}


			gameSocket.on("gameRoomJoiner", (data) => {
				//console.log("===BEFORE CHECK gameRoomJoiner before ingame = ");
				if (store.state.ingame == true)
					return;
				//console.log("---gameRoomJoiner after ingame = ", store.state.ingame);
				if (store.state.playerNum == 1 && store.state.gameRoom != "")
					store.commit("setPlayer2Game", data.user);
				store.commit("setGameRoom", data.room);
				if (store.state.playerNum == 2) {
					//console.log("gameJoiner player 2");
					store.commit("setInQueue", false);
					Pong.value.startMultiOnline();
					gameSocket.emit("ReadyGame", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState() });
				}
			})

			gameSocket.on("LaunchGame", (e: BallState) => {
				//console.log("====LAUCNH GAME");
				store.commit("setGameConnect", true);
				store.commit("setInQueue", false);
				lastDate = Date.now();
				Pong.value.startMultiOnline();
				Pong.value.theBall.setBallState(e);
			});

			gameSocket.on("servMessage", (e: GameMove) => {
				Pong.value.handleKeyOnline(e.player, e.notPressed, e.key);
			});

			gameSocket.on("paddleStateMessage", (e: PaddleState) => {
				Pong.value.setPaddleState(e);
			});

			gameSocket.on("setBall", (e: BallState) => {
				// console.log("setBall", e);
				if (store.state.playerNum != e.player)
					if (e.ballId == 0)
						Pong.value.theBall.setBallState(e);
					else {
						for (const ball of Pong.value.myBalls) {
							if (ball.id == e.ballId)
								ball.setBallState(e);
						}
					}
			});

			gameSocket.on("scoreMessage", (e: number) => {
				console.log("---scoreMessage", e);
				if (Date.now() - lastPoint < 1000)
					return;
				lastPoint = Date.now();
				if (e == 1) {
					Pong.value.scoreA++;
					if (store.state.playerNum == 1)
						Pong.value.pointSounds[0].play();
				}
				else if (e == 2) {
					Pong.value.scoreB++;
					if (store.state.playerNum == 2)
						Pong.value.pointSounds[0].play();
				}
				if (Pong.value.scoreA >= 1000 || Pong.value.scoreB >= 1000) {
					Pong.value.endGameOnline();
					store.commit("setGameConnect", false);
				}
			});

			gameSocket.on("blockCreation", (block: BlockState) => {
				if (store.state.playerNum != 1) {
					Pong.value.myBlocks.push(new EffectBlock(Pong.value, block.x, block.y,
						block.width, block.height, block.effect, block.num, block.id));
				}
			});

			gameSocket.on("blockDestruction", (id: number) => {
				Pong.value.removeBlock(id);
			});


			gameSocket.on("ballCreation", (ball: BallState) => {
				if (store.state.playerNum != 1) {
					Pong.value.myBalls.push(new BallClass(Pong.value, ball.ballX, ball.ballY, ball.ballVeloX, ball.ballVeloY,
						Pong.value.ballRadius, 'blue', 1));
				}
			});

			gameSocket.on("ballDestruction", (id: number) => {
				Pong.value.removeBall(id);
			});

			gameSocket.on("gameEnder", () => {
				//console.log("gameEnder is started");
				Pong.value.inMultiplayer = false;
				Pong.value.gameIsRunning = false;
				store.commit("setGameRoom", "");
				store.commit("setGameConnect", false);
				store.commit("setPlayerNum", 0);
				store.commit("setGame", null);
				Pong.value.restartMatch();
				//console.log("gameEnder is ended");
			});

			gameSocket.on("servNewSpectator", (user) => {
				//console.log("=== start multi AVANT = ", Pong.value.theBall.ballState());
				if (store.state.user.id == user.id) {
					//console.log("=== start multi new spec ?");
					Pong.value.startMultiOnline();
				}
				if (store.state.playerNum != 1)
					return;
				//console.log("servNewSpectator", user);

				gameSocket.emit("onSpecBall", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState(), userId: user.id });
				//console.log("servNewSpectator the ball = ", Pong.value.theBall.ballState());
				for (const ball of Pong.value.myBalls) {
					gameSocket.emit("onSpecBall", { room: store.state.gameRoom, ball: ball.ballState(), userId: user.id });
				}
				gameSocket.emit("onSpecScore", { room: store.state.gameRoom, scoreA: Pong.value.scoreA, scoreB: Pong.value.scoreB, userId: user.id });
				gameSocket.emit("onSpecPaddle", { room: store.state.gameRoom, paddle: Pong.value.getPaddleState(1), userId: user.id });
				gameSocket.emit("onSpecPaddle", { room: store.state.gameRoom, paddle: Pong.value.getPaddleState(2), userId: user.id });
				for (const block of Pong.value.myBlocks) {
					gameSocket.emit("onSpecBlock", { room: store.state.gameRoom, block: block.getBlockState(), userId: user.id });
				}

			});

			gameSocket.on("servOnSpecBall", (data) => {
				if (store.state.user.id != data.userId)
					return;
				//console.log("servOnSpecBall", data);
				if (data.ball.ballId == 0)
					Pong.value.theBall.setBallState(data.ball);
				else {
					Pong.value.myBalls.push(new BallClass(Pong.value, data.ball.ballX, data.ball.ballY, data.ball.ballVeloX, data.ball.ballVeloY, Pong.value.ballRadius, 'blue', 1));
				}
			});

			gameSocket.on("servOnSpecPaddle", (data) => {
				if (store.state.user.id != data.userId)
					return;
				//console.log("servOnSpecPaddle", data);
				if (data.paddle.player == 1)
					Pong.value.setPaddleState(data.paddle);
				else {
					Pong.value.setPaddleState(data.paddle);
					store.commit("setGameConnect", true);
				}
			});

			gameSocket.on("servOnSpecScore", (data) => {
				if (store.state.user.id != data.userId)
					return;
				//console.log("servOnSpecScore", data);
				Pong.value.scoreA = data.scoreA;
				Pong.value.scoreB = data.scoreB;
			});

			gameSocket.on("servOnSpecBlock", (data) => {
				if (store.state.user.id != data.userId)
					return;
				//console.log("servOnSpecBlock", data);
				Pong.value.myBlocks.push(new EffectBlock(Pong.value, data.block.x, data.block.y,
					data.block.width, data.block.height, data.block.effect, data.block.num, data.block.id));
			});

			// if (store.state.ingame == true)
			// 		return;
			// 	//console.log("---gameRoomJoiner after ingame = ", store.state.ingame);
			// 	if (store.state.playerNum == 1 && store.state.gameRoom != "")
			// 		store.commit("setPlayer2Game", data.user);
			// 	store.commit("setGameRoom", data.room);
			// 	if (store.state.playerNum == 2) {
			// 		//console.log("gameJoiner player 2");
			// 		store.commit("setInQueue", false);
			// 		Pong.value.startMultiOnline();
			// 		gameSocket.emit("ReadyGame", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState() });
			// 	}

			gameSocket.on("servInviteGame", (data) => {
				//console.log("servInviteGame :", data.game);
				if (store.state.ingame == true)
					return;
				store.commit("setGame", data.game);
				store.commit("setGameConnect", true);
				store.commit("setInQueue", false);
				if (data.game.player2Id == store.state.user.id)
					store.commit("setPlayerNum", 2);
				else if (data.game.player1Id == store.state.user.id)
					store.commit("setPlayerNum", 1);
				console.log("servInviteGame playerNum = ", store.state.playerNum, " ROOM : ", store.state.gameRoom);
				if (store.state.playerNum == 2)
				{
					Pong.value.startMultiOnline();
					gameSocket.emit("ReadyGame", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState() });
				}
			})
		});

		onUnmounted(() => {
			window.removeEventListener('keydown', Pong.value.handleKeyDown);
			window.removeEventListener('keyup', Pong.value.handleKeyUp);
			store.commit("setGameConnect", false);
			store.commit("setInQueue", false);
			store.commit("setGameRoom", "");
			store.commit("setPlayerNum", 0);
		});

		const pongStyle = computed(() => ({
			'--width': `${Pong.value.width * 3}px`,
			'--height': `${Pong.value.height * 3}px`,
		}));

		const computedCanvasStyle = computed(() => ({
			'--canvasWidth': `${Pong.value.width}px`,
			'--canvasHeight': `${Pong.value.height}px`,
		}));

		return {
			Pong,
			pongStyle,
			myCanvas,
			computedCanvasStyle,
			fps,
		};
	}
},
);
</script>
