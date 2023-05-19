<template>
  <div class="game-container">

  <div class="info-container">
    <p>{{ "veloBall x-y " + veloBallX + " " + veloBallY }}</p>
    <p>{{ "Ping " + ping }}</p>
    <p>{{ "Pong " + pong}}</p>
  </div>

  <div class="button-container">
    <button @click="startMatchSolo" :disabled="gameIsRunning">Solo</button>
    <button @click="startMatchMultiLocal" :disabled="gameIsRunning">MultiplayerLocal</button>
    <button @click="startNoPlayer" :disabled="gameIsRunning">NoPlayer</button>
    <button @click="restartMatch" :disabled="!gameIsRunning">Restart</button>
    <button @click="setBlocks" :disabled="gameIsRunning">{{"BLOCKS "+blockStatus}}</button>
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
    <div
      v-for="block in blocks"
      :key="block.id"
      class="block"
      :style="{ top: block.y + 'px', left: block.x + 'px', width: block.width + 'px', height: block.height + 'px', backgroundColor: block.color}">
      <p>{{ block.id }}</p>
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

<style>

.block {
  position: absolute;
  z-index: 1; /* Ensure the block is positioned above the Pong game elements */
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
  bottom: 100%;  /* Make the button container stick to the top of the game container */
  left: 0;       /* Align to the left of the game container */
  height: auto;  /* Let the height be determined by its content */
  width: 100%;   /* Full width to match game container */
  display: flex; /* Make it a flex container */
  justify-content: center; /* Center buttons horizontally */
  align-items: center; /* Center buttons vertically */
  gap: 10px; /* Add some space between the buttons */
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
  padding-top: 120px; /* Space for the buttons. This should be greater than the height of the buttons */
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
color: #08225a;
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

<script lang="ts">

import { defineComponent,onMounted, ref, computed } from 'vue';
import {
  SetPongWidth,
  SetPongHeight,
  SetRightPlayerKeyUp,
  SetRightPlayerKeyDown,
  SetLeftPlayerKeyUp,
  SetLeftPlayerKeyDown,
  SetLeftPaddleWidth,
  SetLeftPaddleHeight,
  SetLeftPaddleY,
  SetLeftPaddleSpeed,
  SetRightPaddleWidth,
  SetRightPaddleHeight,
  SetRightPaddleY,
  SetRightPaddleSpeed,
  SetBallSize,
  SetPaddleOffset,
  ballMaxSpeedX,
  ballMaxSpeedY,
  gameTick,
  SetBounce,
  SetBlockWidth,
  SetBlockHeight,
} from './PongSettings'; 

export default defineComponent({




    setup() {

//GAME CONTAINER PARAMETERS
const pongWidth = ref(SetPongWidth);
const pongHeight = ref(SetPongHeight);

//CONTROL PARAMETERS
const rightPlayerKeyUp = ref(SetRightPlayerKeyUp);
const rightPlayerKeyDown = ref(SetRightPlayerKeyDown);

const leftPlayerKeyUp = ref(SetLeftPlayerKeyUp);
const leftPlayerKeyDown = ref(SetLeftPlayerKeyDown);

//LEFT PADDLE PARAMETERS
const bounce = ref(SetBounce);

const leftPaddleWidth = ref(SetLeftPaddleWidth);
const leftPaddleHeight = ref(SetLeftPaddleHeight);

const leftPaddleY = ref(SetLeftPaddleY);
const leftPaddleSpeed = ref(SetLeftPaddleSpeed);

const leftPaddleJustHit = ref(false);

//RIGHT PADDLE PARAMETERS
const rightPaddleWidth = ref(SetRightPaddleWidth);
const rightPaddleHeight = ref(SetRightPaddleHeight);

const rightPaddleY = ref(SetRightPaddleY);
const rightPaddleSpeed = ref(SetRightPaddleSpeed);

const rightPaddleJustHit = ref(false);

//BALL PARAMETERS
const ballSize = ref(SetBallSize);
const paddleOffset = ref(SetPaddleOffset);

const ballX = ref(pongWidth.value/2 - ballSize.value/2);
const ballY = ref(pongHeight.value/2 - ballSize.value/2);

const ballStartSpeedX = -4;
const ballStartSpeedY = 2;

const veloBallX = ref(0);
const veloBallY = ref(0);



const ping = ref(0);
const pong = ref(0);

const scoreA = ref(0);
const scoreB = ref(0);

//BLOCKS PARAMETERS

const myBlocks = ref<(SolidBlock | EffectBlock)[]>([]);
const blockWidth = ref(SetBlockWidth);
const blockHeight = ref(SetBlockHeight);

//VARIOUS PARAMETERS

const whatId = ref(0);

const gameIsRunning = ref(false);
const gameIsBlocks = ref(false);
const blockStatus = ref('DISABLED');

const alreadyComputed = ref(false);

const leftArrowUp = ref(0);
const leftArrowDown = ref(0);

const rightArrowUp = ref(0);
const rightArrowDown = ref(0);

const x = ref(1);
const line = ref('');


/***********************GAME FUNCTIONS***********************/


/***********************START GAME***********************/
const startMatchSolo = () => {
  if (!gameIsRunning.value)
  {
    const rand = Math.random() * 2 - 1;
    veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
    veloBallY.value = Math.random() * 6 - 3;

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;

    rightPaddleHeight.value = pongHeight.value;
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

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;

    rightPaddleHeight.value = pongHeight.value;
    rightPaddleY.value = 0;

    rightPlayerKeyDown.value = '';
    rightPlayerKeyUp.value = '';

    leftPaddleHeight.value = pongHeight.value;
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

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;

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
    rightPaddleY.value = pongHeight.value/2 - rightPaddleHeight.value/2;

    rightPlayerKeyDown.value = 'ArrowDown';
    rightPlayerKeyUp.value = 'ArrowUp';

    leftPaddleHeight.value = 80;
    leftPaddleY.value = pongHeight.value/2 - leftPaddleHeight.value/2;

    leftPlayerKeyDown.value = 's';
    leftPlayerKeyUp.value = 'w';

    ballX.value = pongWidth.value / 2 - ballSize.value / 2;
    ballY.value = pongHeight.value / 2 - ballSize.value / 2;

    ping.value = 0;
    pong.value = 0;

    gameIsRunning.value = false;

    myBlocks.value = [];
  }
}

const setBlocks = () => {
  if (!gameIsBlocks.value)
  {
    gameIsBlocks.value = true;
    blockStatus.value = 'ENABLED';
  }
  else
  {
    gameIsBlocks.value = false;
    blockStatus.value = 'DISABLED';
  }
}

/***********************BALL COLISIONS***********************/

const ballWallColision = () => {
  if (ballY.value <= 0 )
    veloBallY.value = Math.abs(veloBallY.value);
  else if (ballY.value >= pongHeight.value - ballSize.value)
  veloBallY.value = -Math.abs(veloBallY.value);

  if (ballX.value <= 1)
    {
      scoreB.value += 1;
      ballX.value = pongWidth.value/2 - ballSize.value/2;
      ballY.value = pongHeight.value/2 - ballSize.value/2;
      veloBallX.value = (2 + Math.random());
      veloBallY.value = (Math.random() * 6) - 3;
    }
  if (ballX.value >= pongWidth.value - ballSize.value - 1)
    {
      scoreA.value += 1;
      ballX.value = pongWidth.value/2 - ballSize.value/2;
      ballY.value = pongHeight.value/2 - ballSize.value/2;
      veloBallX.value = -(2 + Math.random());
      veloBallY.value = (Math.random() * 6) - 3;
    }
}

const ballPaddleColision =  (paddleX: number, paddleY: number, paddleHeight:number, sign: number):boolean => {
if (sign * ballX.value <= paddleX)
{
  if (ballY.value >= paddleY && ballY.value <= paddleY + paddleHeight)
  {
    veloBallX.value = sign * (Math.abs(veloBallX.value) + ((ballY.value - paddleY) / (paddleHeight / 2)));
    if (veloBallX.value >= ballMaxSpeedX || veloBallX.value <= -ballMaxSpeedX)
      veloBallX.value = ballMaxSpeedX * sign;
    veloBallY.value = ( (ballY.value - (paddleY + paddleHeight/2)) / paddleHeight/2)  * bounce.value + Math.random();
    if (gameIsBlocks.value && (ping.value + pong.value) % 10 < 5)
      generateBlocks();
    return true;
  }
}
return false;
}

const ballBlockColision = () =>
{
  for (let block of myBlocks.value) {
    if (ballX.value <= block.x + block.width && ballX.value + ballSize.value >= block.x)
    {
      if (ballY.value <= block.y + block.height && ballY.value + ballSize.value >= block.y)
      {
        if (block instanceof SolidBlock && block.isSolid)
          veloBallX.value = -veloBallX.value;
        else if (block instanceof EffectBlock)
          block.triggerEffect();
        removeBlock(block.id);
      }
    }
}
}

const preColision = ():boolean => {
  const oldVeloX = veloBallX.value;
  const oldVeloY = veloBallY.value;

  if (ballPaddleColision(paddleOffset.value + leftPaddleWidth.value, leftPaddleY.value,leftPaddleHeight.value, 1)
    || ballPaddleColision( (paddleOffset.value + rightPaddleWidth.value + ballSize.value) - pongWidth.value, rightPaddleY.value, rightPaddleHeight.value, -1))
  {
    if (ballX.value < 200)
    {
      ping.value += 1;
      ballX.value = paddleOffset.value + leftPaddleWidth.value + ballSize.value/2 + 1;
    }
    else
    {
      pong.value += 1;
      ballX.value = pongWidth.value - (paddleOffset.value + ballSize.value + rightPaddleWidth.value + 1);
    }
    return true;
  }
    veloBallX.value = oldVeloX;
    veloBallY.value = oldVeloY;
    return false;
}

const ballColision = () =>
{
  if (alreadyComputed.value)
  {
    alreadyComputed.value = false;
    ballX.value += veloBallX.value;
    ballY.value += veloBallY.value;

    return;
  }
  ballWallColision();
  ballBlockColision();
  const nbr = ping.value + pong.value;
  if (ballPaddleColision(paddleOffset.value + leftPaddleWidth.value, leftPaddleY.value,leftPaddleHeight.value, 1))
    ping.value += 1;
  else if (ballPaddleColision( (paddleOffset.value + rightPaddleWidth.value + ballSize.value) - pongWidth.value, rightPaddleY.value, rightPaddleHeight.value, -1))
    pong.value += 1;

  ballX.value += veloBallX.value;
  ballY.value += veloBallY.value;

  if (nbr == ping.value + pong.value)
    alreadyComputed.value = preColision();
  

}

const moovePaddles = () => {
  if (leftArrowUp.value && leftPaddleY.value > 1 - leftPaddleHeight.value)
    leftPaddleY.value -= leftPaddleSpeed.value * leftArrowUp.value;
  else if (leftArrowDown.value && leftPaddleY.value < pongHeight.value - 1)
    leftPaddleY.value += leftPaddleSpeed.value * leftArrowDown.value;

  if (rightArrowUp.value && rightPaddleY.value > 1 - rightPaddleHeight.value)
    rightPaddleY.value -= rightPaddleSpeed.value * rightArrowUp.value;
  else if (rightArrowDown.value && rightPaddleY.value < pongHeight.value - 1)
    rightPaddleY.value += rightPaddleSpeed.value * rightArrowDown.value;
}

const gameLoop = () => {

  ballColision();

  

  moovePaddles();

};

/***********************KEYBOARD EVENTS***********************/

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

/***********************BLOCKS***********************/

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: number;
}

class SolidBlock implements Block {
    isSolid: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    id: number;

    constructor(x: number, y: number, width: number, height: number, color: string, isSolid: boolean) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isSolid = isSolid;
        this.color = color;
        this.id = whatId.value++;
    }

 
}

class EffectBlock implements Block {
    effect: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    id: number;

    constructor(x: number, y: number, width: number, height: number, color: string, effect: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.effect = effect;
        this.color = color;
        this.id = whatId.value++;
    }

    triggerEffect(): void {
      if (this.effect === "PING")
      {
        veloBallX.value *= -1.5;
        if (veloBallX.value > ballMaxSpeedX)
          veloBallX.value = ballMaxSpeedX;
      }
      if (this.effect === "SLOWn")
      {
        veloBallX.value /= 2;
        veloBallY.value /= 2;
      }

   
}
}

const checkBlockColi = (genX:number, genY:number, block: Block):boolean => {
if (Math.abs(genX - block.x) < blockWidth.value && Math.abs(genY - block.y) < blockHeight.value)
        return true;
    return false;
}

const isValidGen = (genX:number, genY:number):boolean => {
  for (let block of myBlocks.value)
    {
      if (checkBlockColi(genX, genY, block))  
        return (false);
    }
    return (true);
  }

const generateBlocks = () => {

  const genX = ref(0);
  const genY = ref(0);
  const j = ref(0);
  while ( j.value < 25)
  {
    genX.value = pongWidth.value/3 + pongWidth.value/3 * Math.random();
    genY.value = pongHeight.value*3/4 - pongHeight.value * Math.random()/2;
    if (isValidGen(genX.value, genY.value))
      break ;
    j.value++;
  }
  if (j.value == 25)
    return ;
  switch ((ping.value + pong.value) % 3)
  {
    case 0:
    {
      myBlocks.value.push(new EffectBlock(genX.value,
                            genY.value,
                            blockWidth.value, blockHeight.value, '#deec1c' , "PING"));
      break ;
    }
    case 1:
    {
      myBlocks.value.push(new EffectBlock(genX.value,
                            genY.value,
                            blockWidth.value, blockHeight.value, '#d24dff' , "SLOW"));
      break ;
    }
    case 2:
    {
      myBlocks.value.push(new SolidBlock(genX.value,
                            genY.value,
                            blockWidth.value, blockHeight.value, '#ff0000' , true));
      break ;
    }
  }


  
}

const removeBlock = (blockId: number) => {
    myBlocks.value = myBlocks.value.filter(block => block.id !== blockId);
}
 

/***********************COMPUTED***********************/

const leftPaddleStyle = computed(() => ({
  top: `${leftPaddleY.value}px`,
  left: `${paddleOffset.value}px`,
  '--paddle-width': `${leftPaddleWidth.value}px`,
  '--paddle-height': `${leftPaddleHeight.value}px`,
}));

const rightPaddleStyle = computed(() => ({
  top: `${rightPaddleY.value}px`,
  right: `${paddleOffset.value}px`,
  '--paddle-width': `${rightPaddleWidth.value}px`,
  '--paddle-height': `${rightPaddleHeight.value}px`,
}));

const pongStyle = computed(() => ({
  '--pongWidth': `${pongWidth.value}px`,
  '--pongHeight': `${pongHeight.value}px`,
}));

const ballStyle = computed(() => ({
  top: `${ballY.value}px`,
  left: `${ballX.value}px`,
}));

const blocks = computed(() => myBlocks.value);

onMounted(() => {
  setInterval(gameLoop, gameTick);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
})


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
  blocks,
  setBlocks,
  blockStatus,
};
}

},




);
</script>




