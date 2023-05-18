<template>

<p>{{ "veloBall x-y " + veloBallX + " " + veloBallY }}</p>
<p>{{ "Ping " + ping }}</p>
<p>{{ "Pong " + pong}}</p>

<div class="game-container">
  <div class="button-container">
    <button @click="startMatchSolo" :disabled="gameIsRunning">Solo</button>
    <button @click="startMatchMultiLocal" :disabled="gameIsRunning">MultiplayerLocal</button>
    <button @click="startNoPlayer" :disabled="gameIsRunning">NoPlayer</button>
    <button @click="restartMatch" :disabled="!gameIsRunning">Restart</button>
    </div>
<div class="pong-container">

    <div class="input-container">
      <div class="left-input">
        <p>{{ leftPlayerKeyUp }}</p>
        <p>{{ leftPlayerKeyDown }}</p>
      </div>
    </div>

  <div class="pong" :style="pongStyle">
  <div class="scores">
      <div class="scorePlayer">{{ "Score A : " + scoreA }}</div>
      <div class="scorePlayer">{{ "Score B : " + scoreB }}</div>
    </div>
  
    <div class="paddle" :style="leftPaddleStyle"></div>
    <div class="paddle" :style="rightPaddleStyle"></div>
    <div class="ball" :style="ballStyle"></div>
  </div>

  <div class="input-container">
    <div class="right-input">
        <p>{{ rightPlayerKeyUp }}</p>
        <p>{{ rightPlayerKeyDown }}</p>
      </div>
    </div>

</div>
</div>

</template>

<script lang="ts">

import { defineComponent,onMounted, ref, computed } from 'vue';

export default defineComponent({

    setup() {

//GAME CONTAINER PARAMETERS
const pongWidth = 600;
const pongHeight = 400;

//CONTROL PARAMETERS
const rightPlayerKeyUp = ref('ArrowUp');
const rightPlayerKeyDown = ref('ArrowDown');
const leftPlayerKeyUp = ref('w');
const leftPlayerKeyDown = ref('s');

//LEFT PADDLE PARAMETERS
const leftPaddleWidth = ref(10);
const leftPaddleHeight = ref(80);

const leftPaddleY = ref(pongHeight/2 - leftPaddleHeight.value/2);
const leftPaddleSpeed = ref(12);

const leftPaddleJustHit = ref(false);

//RIGHT PADDLE PARAMETERS
const rightPaddleWidth = ref(10);
const rightPaddleHeight = ref(80);

const rightPaddleY = ref(pongHeight/2 - rightPaddleHeight.value/2);
const rightPaddleSpeed = ref(12);

const rightPaddleJustHit = ref(false);

//BALL PARAMETERS
const ballSize = 10;
const paddleOffset = 10;

const ballX = ref(pongWidth/2 - ballSize/2);
const ballY = ref(pongHeight/2 - ballSize/2);

const ballStartSpeedX = -4;
const ballStartSpeedY = 2;

const veloBallX = ref(0);
const veloBallY = ref(0);

const ballMaxSpeedX = 20;
const ballMaxSpeedY = 10;

const ping = ref(0);
const pong = ref(0);

const scoreA = ref(0);
const scoreB = ref(0);



//VARIOUS PARAMETERS
const gameIsRunning = ref(false);

const leftArrowUp = ref(0);
const leftArrowDown = ref(0);

const rightArrowUp = ref(0);
const rightArrowDown = ref(0);

const x = ref(1);
const line = ref('');


//GAME FUNCTIONS
const startMatchSolo = () => {
  if (!gameIsRunning.value)
  {
    const rand = Math.random() * 2 - 1;
    veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
    veloBallY.value = Math.random() * 6 - 3;

    ballX.value = pongWidth/2 - ballSize/2;
    ballY.value = pongHeight/2 - ballSize/2;

    rightPaddleHeight.value = 400;
    rightPaddleY.value = 0;

    rightPlayerKeyDown.value = '';
    rightPlayerKeyUp.value = '';

    gameIsRunning.value = true;
  }
}


const startNoPlayer = () => {
  if (!gameIsRunning.value)
  {
    const rand = Math.random() * 2 - 1;
    veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
    veloBallY.value = Math.random() * 6 - 3;

    ballX.value = pongWidth/2 - ballSize/2;
    ballY.value = pongHeight/2 - ballSize/2;

    rightPaddleHeight.value = 400;
    rightPaddleY.value = 0;

    rightPlayerKeyDown.value = '';
    rightPlayerKeyUp.value = '';

    leftPaddleHeight.value = 400;
    leftPaddleY.value = 0;

    leftPlayerKeyDown.value = '';
    leftPlayerKeyUp.value = '';

    gameIsRunning.value = true;
  }
  }

const startMatchMultiLocal = () => {
  if (!gameIsRunning.value)
  {
    const rand = Math.random() * 2 - 1;
    veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
    veloBallY.value = Math.random() * 6 - 3;

    ballX.value = pongWidth/2 - ballSize/2;
    ballY.value = pongHeight/2 - ballSize/2;

    gameIsRunning.value = true;
  }
}

const restartMatch = () => {
  if (gameIsRunning.value) {
    scoreA.value = 0;
    scoreB.value = 0;

    veloBallX.value = 0;
    veloBallY.value = 0;

    rightPaddleHeight.value = 80;
    rightPaddleY.value = pongHeight/2 - rightPaddleHeight.value/2;

    rightPlayerKeyDown.value = 'ArrowDown';
    rightPlayerKeyUp.value = 'ArrowUp';

    ballX.value = pongWidth / 2 - ballSize / 2;
    ballY.value = pongHeight / 2 - ballSize / 2;

    ping.value = 0;
    pong.value = 0;

    gameIsRunning.value = false;
  }
}



const moovePaddles = () => {
  if (leftArrowUp.value && leftPaddleY.value > 1 - leftPaddleHeight.value)
    leftPaddleY.value -= leftPaddleSpeed.value * leftArrowUp.value;
  else if (leftArrowDown.value && leftPaddleY.value < pongHeight - 1)
    leftPaddleY.value += leftPaddleSpeed.value * leftArrowDown.value;

  if (rightArrowUp.value && rightPaddleY.value > 1 - rightPaddleHeight.value)
    rightPaddleY.value -= rightPaddleSpeed.value * rightArrowUp.value;
  else if (rightArrowDown.value && rightPaddleY.value < pongHeight - 1)
    rightPaddleY.value += rightPaddleSpeed.value * rightArrowDown.value;
}




const ballWallColistion = () => {
  if (ballY.value <= 0 )
    veloBallY.value = Math.abs(veloBallY.value);
  else if (ballY.value >= pongHeight - ballSize)
  veloBallY.value = -Math.abs(veloBallY.value);

  if (ballX.value <= 1)
    {
      scoreB.value += 1;
      ballX.value = pongWidth/2 - ballSize/2;
      ballY.value = pongHeight/2 - ballSize/2;
      veloBallX.value = -ballStartSpeedX;
      veloBallY.value = (Math.random() * 6) - 3;
    }
  if (ballX.value >= pongWidth - ballSize - 1)
    {
      scoreA.value += 1;
      ballX.value = pongWidth/2 - ballSize/2;
      ballY.value = pongHeight/2 - ballSize/2;
      veloBallX.value = ballStartSpeedX;
      veloBallY.value = (Math.random() * 6) - 3;
    }
}

const ballPaddleColision = (paddleX: number, paddleY: number, paddleHeight:number, sign: number) => {

const newVelo = ref(0);
if (sign * ballX.value <= paddleX)
{
  if (ballY.value >= paddleY && ballY.value <= paddleY + paddleHeight)
  {
    veloBallX.value = sign * (Math.abs(veloBallX.value) + ((ballY.value - paddleY) / (paddleHeight / 2)));
    if (veloBallX.value >= ballMaxSpeedX || veloBallX.value <= -ballMaxSpeedX)
      veloBallX.value = ballMaxSpeedX * sign;
    const Ysign = veloBallY.value / Math.abs(veloBallY.value);
    const bounce = ref(25);
    veloBallY.value = ( (ballY.value - (paddleY + paddleHeight/2)) / paddleHeight/2) * bounce.value;
    if (sign === 1)
      ping.value++;
    else
      pong.value++;
    return true;
  }
}
return false;
}

const gameLoop = () => {


ballWallColistion();
ballPaddleColision(paddleOffset + leftPaddleWidth.value, leftPaddleY.value,leftPaddleHeight.value, 1); 
ballPaddleColision( (paddleOffset + rightPaddleWidth.value + ballSize) - pongWidth, rightPaddleY.value, rightPaddleHeight.value, -1); 



ballX.value += veloBallX.value;
ballY.value += veloBallY.value;

moovePaddles();

};

//KEY HANDLING

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === leftPlayerKeyUp.value) 
    leftArrowUp.value = 1;
  else if (event.key === leftPlayerKeyDown.value)
    leftArrowDown.value = 1;

  if (event.key === rightPlayerKeyUp.value)
    rightArrowUp.value = 1;
  else if (event.key === rightPlayerKeyDown.value)
    rightArrowDown.value = 1;
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === leftPlayerKeyUp.value) {
  leftArrowUp.value = 0;
  } else if (event.key === leftPlayerKeyDown.value) {
  leftArrowDown.value = 0;
  }

  if (event.key === rightPlayerKeyUp.value) {
  rightArrowUp.value = 0;
  } else if (event.key === rightPlayerKeyDown.value) {
  rightArrowDown.value = 0;
  }
};

//COMPUTING

const leftPaddleStyle = computed(() => ({
  top: `${leftPaddleY.value}px`,
  left: `${paddleOffset}px`,
  '--paddle-width': `${leftPaddleWidth.value}px`,
  '--paddle-height': `${leftPaddleHeight.value}px`,
}));

const rightPaddleStyle = computed(() => ({
  top: `${rightPaddleY.value}px`,
  right: `${paddleOffset}px`,
  '--paddle-width': `${rightPaddleWidth.value}px`,
  '--paddle-height': `${rightPaddleHeight.value}px`,
}));

const pongStyle = computed(() => ({
  '--pongWidth': `${pongWidth}px`,
  '--pongHeight': `${pongHeight}px`,
}));

const ballStyle = computed(() => ({
  top: `${ballY.value}px`,
  left: `${ballX.value}px`,
}));

onMounted(() => {
  
  setInterval(gameLoop, 16);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

return {
  ballStyle,
  leftPaddleStyle,
  rightPaddleStyle,
  scoreA,
  scoreB,
  line,
  veloBallX,
  veloBallY,
  startMatchSolo,
  restartMatch,
  startMatchMultiLocal,
  startNoPlayer,
  gameIsRunning,
  leftPlayerKeyUp,
  leftPlayerKeyDown,
  rightPlayerKeyUp,
  rightPlayerKeyDown,
  pongStyle,
  ping,
  pong,
};


},

}



);
</script>




<style>

.button-container {
  position: absolute;
  top: 0;
  left: 5%;
  margin-top: 250px;
  height: 100px;
  width: 100%;
}

.game-container {

position :relative;
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
}

.pong-container {
display: flex;
align-items: center;
}

.input-container {
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
  width: var(--pongWidth, 10px);
  height: var(--pongHeight, 10px);
  border: 1px solid #6b4d4d;
  overflow: hidden;
}

.scores {
display: flex;
justify-content: center;
align-items: center;
height: 40px;
font-size: 24px;
color: #09024b;
text-align: center;
}

.scorePlayer {
flex: 1;
}

.paddle {
  position: absolute;
  width: var(--paddle-width, 10px);
  height: var(--paddle-height, 10px);
  background-color: #147f83;
}

.ball {
  position: absolute;
  width: var(--ball-size, 10px);
  height: var(--ball-size, 10px);
  background-color: rgba(247, 6, 166, 0.521);
  border-radius: 50%;
}



</style>