<template>
  <div v-if="Pong" class="game-container">
    <div class="info-container">
      <div>FPS: {{ fps.toFixed(2) }}</div>
      <p>{{ "veloBall x-y " + Pong.theBall.veloX + " " + Pong.theBall.veloY }}</p>
      <p>{{ "posBall x-y " + Pong.theBall.x + " " + Pong.theBall.y }}</p>
      <p>{{ "scoreA " + Pong.scoreA }}</p>
      <p>{{ "scoreB " + Pong.scoreB }}</p>
    </div>

    <div class="button-container">
      <button @click="Pong.startMatchSolo" :disabled="Pong.gameIsRunning">Solo</button>
      <button @click="Pong.startMatchMultiLocal" :disabled="Pong.gameIsRunning">MultiplayerLocal</button>
      <button @click="Pong.startNoPlayer" :disabled="Pong.gameIsRunning">NoPlayer</button>
      <button @click="Pong.startWall" :disabled="Pong.gameIsRunning">WALL</button>
      <button @click="Pong.restartMatch(false)" :disabled="!Pong.gameIsRunning">Restart</button>
      <button @click="Pong.setBlocks" :disabled="Pong.gameIsRunning">{{ "BLOCKS " + Pong.blockStatus }}</button>
    </div>
    <div class="pong-container">
      <div class="input-container">
        <div class="left-input">
          <p>{{ Pong.leftPlayerKeyUp }}</p>
          <p>{{ Pong.leftPlayerKeyDown }}</p>
        </div>
      </div>
      <canvas ref="myCanvas" class="gameCanvasStyle" :style="computedCanvasStyle" :width="`${Pong.width}`"
        :height="`${Pong.height}`">
      </canvas>
      <div class="input-container">
        <div class="right-input">
          <p>{{ Pong.rightPlayerKeyUp }}</p>
          <p>{{ Pong.rightPlayerKeyDown }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.gameCanvasStyle {
  z-index: 1;
  display: block;
  position: relative;
  width: var(--canvasWidth, 10px);
  height: var(--canvasHeight, 10px);
  border: 1px solid #000000;
  background-color: #55415a;
  margin: auto;

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

.button-container {
  position: absolute;
  bottom: 100%;
  /* Make the button container stick to the top of the game container */
  left: 0;
  /* Align to the left of the game container */
  height: auto;
  /* Let the height be determined by its content */
  width: 100%;
  /* Full width to match game container */
  display: flex;
  /* Make it a flex container */
  justify-content: center;
  /* Center buttons horizontally */
  align-items: center;
  /* Center buttons vertically */
  gap: 10px;
  /* Add some space between the buttons */
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
  /* Space for the buttons. This should be greater than the height of the buttons */
}

.pong-container {
  display: flex;
  align-items: center;
}

-paddle-width .input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

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

export default defineComponent({
  name: 'FpsComponent',

  setup() {
    const myCanvas = ref<(HTMLCanvasElement | null)>(null);
    let ctx: CanvasRenderingContext2D | null = null;
    const { fps } = useFPS();
    const hitSound = new Audio();
    const Pong = ref(new PongGameClass(hitSound));
    const paddleSprite = new Image();
    let lastDate = new Date();

    const drawPaddle = (x: number, y: number, width: number, height: number, sprite: HTMLImageElement) => {
      if (!ctx)
        return;
      ctx.drawImage(sprite, x, y, width, height)
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
      ctx.beginPath();
      ctx.arc(Pong.value.theBall.x, Pong.value.theBall.y, Pong.value.theBall.radius, 0, Math.PI * 2);
      ctx.fillStyle = Pong.value.theBall.color;
      ctx.fill();
      ctx.closePath();
      for (const ball of Pong.value.myBalls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    const gameLoop = () => {
      if (!ctx)
        return;
      if (Pong.value.inMultiplayer && !store.state.ingame)
        Pong.value.restartMatch();

      const newDate = new Date();
      if (store.state.ingame && store.state.playerNum == 1 && newDate.getTime() - lastDate.getTime() > 200)
      {
        gameSocket.emit("ballSetter", {  ballInfo: Pong.value.theBall.ballState(), room: store.state.gameRoom });
        lastDate = newDate;
      }
      ctx.clearRect(0, 0, Pong.value.width, Pong.value.height);
      Pong.value.bot();
      Pong.value.moovePaddles();
      Pong.value.theBall.ballColision();
      for (const ball of Pong.value.myBalls) {
        ball.ballColision();
      }
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

      if (myCanvas.value) {
        ctx = myCanvas.value.getContext('2d');
        if (ctx) {
          window.addEventListener('keydown', Pong.value.handleKeyDown);
          window.addEventListener('keyup', Pong.value.handleKeyUp);
          setInterval(gameLoop, gameTick);
        }
      }

      gameSocket.on("gameRoomJoiner", (data) => {
        if (store.state.ingame == true)
          return;
        console.log("---gameRoomJoiner after ingame = ", store.state.ingame);
        store.commit("setGameRoom", data.room);
        if (store.state.playerNum == 1 && store.state.gameRoom != "")
          store.commit("setPlayer2Game", data.user);
        if (store.state.playerNum == 2) {
          store.commit("setInQueue", false);
          Pong.value.startMultiOnline();
          gameSocket.emit("ReadyGame", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState() });
        }
      })

      gameSocket.on("LaunchGame", (e: BallState) => {
        store.commit("setGameConnect", true);
        store.commit("setInQueue", false);
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
        if (e == 2)
          Pong.value.scoreA++;
        else if (e == 1)
          Pong.value.scoreB++;
        if (Pong.value.scoreA >= 100 || Pong.value.scoreB >= 100) {
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
        Pong.value.inMultiplayer = false;
        Pong.value.gameIsRunning = false;
        store.commit("setGameRoom", "");
        store.commit("setGameConnect", false);
        store.commit("setPlayerNum", 0);
        Pong.value.restartMatch();
        console.log("gameEnder is ended");
      });

      gameSocket.on("servNewSpectator", (user) => {
        console.log("=== start multi AVANT = ", Pong.value.theBall.ballState());
      if (store.state.user.id == user.id)
      {
        console.log("=== start multi new spec ?");
        Pong.value.startMultiOnline();
      }
      if (store.state.playerNum != 1)
        return;
      console.log("servNewSpectator", user);

      gameSocket.emit("onSpecBall", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState(), userId: user.id });
      console.log("servNewSpectator the ball = ", Pong.value.theBall.ballState());
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
        console.log("servOnSpecBall", data);
        if (data.ball.ballId == 0)
          Pong.value.theBall.setBallState(data.ball);
        else {
          Pong.value.myBalls.push(new BallClass(Pong.value, data.ball.ballX, data.ball.ballY, data.ball.ballVeloX, data.ball.ballVeloY, Pong.value.ballRadius, 'blue', 1));
        }
      });

      gameSocket.on("servOnSpecPaddle", (data) => {
        if (store.state.user.id != data.userId)
          return;
        console.log("servOnSpecPaddle", data);
        if (data.paddle.player == 1)
          Pong.value.setPaddleState(data.paddle);
        else
        {
          Pong.value.setPaddleState(data.paddle);
          store.commit("setGameConnect", true);
        }
      });

      gameSocket.on("servOnSpecScore", (data) => {
        if (store.state.user.id != data.userId)
          return;
        console.log("servOnSpecScore", data);
        Pong.value.scoreA = data.scoreA;
        Pong.value.scoreB = data.scoreB;
      });

      gameSocket.on("servOnSpecBlock", (data) => {
        if (store.state.user.id != data.userId)
          return;
        console.log("servOnSpecBlock", data);
        Pong.value.myBlocks.push(new EffectBlock(Pong.value, data.block.x, data.block.y,
          data.block.width, data.block.height, data.block.effect, data.block.num, data.block.id));
      });
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
