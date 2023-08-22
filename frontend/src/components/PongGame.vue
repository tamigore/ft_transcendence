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

export default defineComponent({
  name: 'PongGame',

  setup() {
    const myCanvas = ref<(HTMLCanvasElement | null)>(null);
    let ctx: CanvasRenderingContext2D | null = null;
    const Pong = ref(new PongGameClass());
    const { fps } = useFPS();
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

    const drawPaddle = (x: number, y: number, width: number, height: number, color: string) => {
      if (!ctx)
        return;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }

    const drawBlocks = () => {
      if (!ctx)
        return;
      for (const block of Pong.value.myBlocks) {
        ctx.beginPath();
        ctx.rect(block.x, block.y, block.width, block.height);
        ctx.fillStyle = block.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    const gameLoop = () => {
      if (!ctx)
        return;
      ctx.clearRect(0, 0, Pong.value.width, Pong.value.height);
      // Pong.value.generateBlocks();
      Pong.value.bot();
      Pong.value.moovePaddles();
      Pong.value.theBall.ballColision();
      for (const ball of Pong.value.myBalls) {
        ball.ballColision();
      }
      drawBlocks();
      drawBall();
      drawPaddle(Pong.value.paddleOffset, Pong.value.leftPaddleY, Pong.value.leftPaddleWidth, Pong.value.leftPaddleHeight, Pong.value.leftPaddleColor);
      drawPaddle(Pong.value.width - Pong.value.paddleOffset - Pong.value.rightPaddleWidth, Pong.value.rightPaddleY, Pong.value.rightPaddleWidth, Pong.value.rightPaddleHeight, Pong.value.rightPaddleColor);
      for (const ball of Pong.value.myBalls) {
        ball.ballColision();
      }
    }

    onMounted(() => {
      if (myCanvas.value) {
        ctx = myCanvas.value.getContext('2d');
        if (ctx) {
          window.addEventListener('keydown', Pong.value.handleKeyDown);
          window.addEventListener('keyup', Pong.value.handleKeyUp);
          setInterval(gameLoop, gameTick);
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', Pong.value.handleKeyDown);
      window.removeEventListener('keyup', Pong.value.handleKeyUp);
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
});
</script>
