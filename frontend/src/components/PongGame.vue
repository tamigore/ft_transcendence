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
    <button @click="startWall" :disabled="gameIsRunning">WALL</button>
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
}-paddle-width

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
  background-color: #2b222e;
  overflow: hidden;
}

.scores {
display: flex;
justify-content: center;
align-items: center;
height: 40px;
font-size: 24px;
color: #e9ec33;
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
  background-color: rgb(250, 250, 250);
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
  SetLeftPaddleX,
  SetLeftPaddleSpeed,
  SetRightPaddleWidth,
  SetRightPaddleHeight,
  SetRightPaddleY,
  SetRightPaddleX,
  SetRightPaddleSpeed,
  SetBallSize,
  SetPaddleOffset,
  ballMaxSpeedX,
  ballMaxSpeedY,
  gameTick,
  SetBounce,
  SetBlockWidth,
  SetBlockHeight,
  veloDiv,
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
const leftPaddleX = ref(SetLeftPaddleX);
const leftPaddleSpeed = ref(SetLeftPaddleSpeed);

const leftPaddleJustHit = ref(false);

//RIGHT PADDLE PARAMETERS
const rightPaddleWidth = ref(SetRightPaddleWidth);
const rightPaddleHeight = ref(SetRightPaddleHeight);

const rightPaddleY = ref(SetRightPaddleY);
const rightPaddleX = ref(SetRightPaddleX);
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

const myBlocks = ref<(EffectBlock)[]>([]);
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

const inertie = ref([0, 0]);

const wallIsUp = ref(false);

/***********************GAME FUNCTIONS***********************/


/***********************START GAME***********************/
const startMatchSolo = () => {
  if (!gameIsRunning.value)
  {
    const rand = 6 + Math.random() * 2 * Math.sign(Math.random() - 0.5);
    veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
    veloBallY.value = Math.random() * 6 - 3;
    veloBallX.value /= veloDiv;
    veloBallY.value /= veloDiv;

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;


    rightPlayerKeyDown.value = '';
    rightPlayerKeyUp.value = '';

    gameIsRunning.value = true;
  }
}

const startWall = () => {

  const rand = 6 + Math.random() * 2 * Math.sign(Math.random() - 0.5);
    veloBallX.value = rand;
    veloBallY.value = Math.random() * 6 - 3;
    veloBallX.value /= veloDiv;
    veloBallY.value /= veloDiv;

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;


    rightPlayerKeyDown.value = 'wawd';
    rightPlayerKeyUp.value = 'awdawdwad';

    rightPaddleY.value = pongHeight.value;
    wallIsUp.value = true;
    gameIsRunning.value = true;
}

const startNoPlayer = () => {
  const rand = 6 + Math.random() * 2 * Math.sign(Math.random() - 0.5);
    veloBallX.value = rand;
    veloBallY.value = Math.random() * 6 - 3;
    veloBallX.value /= veloDiv;
    veloBallY.value /= veloDiv;

    ballX.value = pongWidth.value/2 - ballSize.value/2;
    ballY.value = pongHeight.value/2 - ballSize.value/2;


    rightPlayerKeyDown.value = '';
    rightPlayerKeyUp.value = '';


    leftPlayerKeyDown.value = '';
    leftPlayerKeyUp.value = '';

    gameIsRunning.value = true;
}

const startMatchMultiLocal = () => {
  const rand = 6 + Math.random() * 2 * Math.sign(Math.random() - 0.5);
  veloBallX.value = rand + (rand / Math.abs(rand)) * 2;
  veloBallY.value = Math.random() * 6 - 3;
  veloBallX.value /= veloDiv;
  veloBallY.value /= veloDiv;

  ballX.value = pongWidth.value/2 - ballSize.value/2;
  ballY.value = pongHeight.value/2 - ballSize.value/2;

  gameIsRunning.value = true;
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

    inertie.value = [0,  0];

    wallIsUp.value = false;
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
      veloBallX.value /= veloDiv;
      veloBallY.value /= veloDiv;
    }
  if (ballX.value >= pongWidth.value - ballSize.value - 1)
    {
      if (wallIsUp.value)
      {
        veloBallX.value = -veloBallX.value;
        return ;
      }
      scoreA.value += 1;
      ballX.value = pongWidth.value/2 - ballSize.value/2;
      ballY.value = pongHeight.value/2 - ballSize.value/2;
      veloBallX.value = -(2 + Math.random());
      veloBallY.value = (Math.random() * 6) - 3;
      veloBallX.value /= veloDiv;
      veloBallY.value /= veloDiv;
    }
}

const ballPaddleColision =  (paddleX: number, paddleY: number, paddleHeight:number, sign: number):boolean => {
if (sign * ballX.value  <= paddleX)
{


  if (ballY.value >= paddleY && ballY.value  <= paddleY + paddleHeight)
  {
    veloBallX.value = sign * (Math.abs(veloBallX.value) + ((ballY.value - paddleY) / (paddleHeight / 2))/10);
    if (veloBallX.value >= ballMaxSpeedX || veloBallX.value <= -ballMaxSpeedX)
      veloBallX.value = ballMaxSpeedX * sign;
    veloBallY.value = (((ballY.value - (paddleY + paddleHeight/2)) / paddleHeight/2)  * bounce.value + Math.random());
    if (gameIsBlocks.value && Math.random() < 0.6)
      generateBlocks();
    return true;
  }
}
return false;
}

const ballBlockColision = () =>
{
  for (const block of myBlocks.value) {
    if (ballX.value <= block.x + block.width && ballX.value + ballSize.value >= block.x)
    {
      if (ballY.value <= block.y + block.height && ballY.value + ballSize.value >= block.y)
      {
        block.triggerEffect();
        removeBlock(block.id);
      }
    }
}
}

const preColision = ():boolean =>
{
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

const boting = (paddleY:number, paddleX:number, paddleHeight:number, player:number ):number => {

  const diff = paddleY + paddleHeight/2 - ballY.value - ballSize.value/2;
  console.log("inertie =  " + inertie.value[player]);

  if (inertie.value[player] < -1)
  {
    paddleY = paddleY + leftPaddleSpeed.value;
    inertie.value[player]++;
  }
  else if (inertie.value[player] > 1)
  {
    paddleY = paddleY - leftPaddleSpeed.value;
    inertie.value[player]--;
  }
  else
  {
    console.log("diff =  " + diff);

    // inertie.value[player] = diff / 20;
    console.log("inertie after diff =  " + inertie.value[player]);
    //inertie.value[player] = Math.floor((diff / leftPaddleSpeed.value) + 6*Math.random()*Math.sign(diff));
    inertie.value[player] =  Math.floor( (diff/leftPaddleSpeed.value)*0.8 + (Math.random() * diff/leftPaddleSpeed.value)*0.4 + Math.sign(diff));
  }

  return paddleY;
}

const bot = () => {
  if (leftPlayerKeyDown.value == '')
  {
    // if (veloBallX.value < 0 && inertie.value[1] - Math.sign(inertie.value[1])  == 0)
    //   inertie.value[1] = (Math.random() + 0.5) * 50 * Math.sign(Math.random() - 0.5);
    // else
      leftPaddleY.value = boting(leftPaddleY.value, leftPaddleX.value, leftPaddleHeight.value, 0);
  }
  if (rightPlayerKeyDown.value == '')
  {
    // if (veloBallX.value > 0  && inertie.value[0] - Math.sign(inertie.value[0]) == 0)
    //   inertie.value[0] = (Math.random() + 0.5) * 50 * Math.sign(Math.random() - 0.5);
    // else
      rightPaddleY.value = boting(rightPaddleY.value, rightPaddleX.value, rightPaddleHeight.value, 1);
    }
}

const gameLoop = () => {
  bot();
  moovePaddles();
  ballColision();
  

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



class EffectBlock{
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
        veloBallX.value /= -1.2;
        if (veloBallX.value > ballMaxSpeedX)
          veloBallX.value = ballMaxSpeedX;
      }
      if (this.effect === "SLOWn")
      {
        veloBallX.value /= 1.2;
        veloBallY.value /= 1.2;
      }
      if (this.effect === "SOLID")
      {
        veloBallX.value *= -1;
        veloBallY.value *= -1;
      }
      if (this.effect === "TP")
      {
        for (const block of myBlocks.value) {
          if (block.effect === "TP" && block.id != this.id)
          {
            ballX.value = block.x + block.width / 2
            ballY.value = block.y + block.height / 2;
            removeBlock(block.id);
            return;
          }
        }
      }

   
}
}

const checkBlockColi = (genX:number, genY:number, block: EffectBlock):boolean => {
if (Math.abs(genX - block.x) < (blockWidth.value) && Math.abs(genY - block.y) < (blockHeight.value))
        return true;
    return false;
}

const isValidGen = (genX:number, genY:number):boolean => {
  for (const block of myBlocks.value)
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
    genX.value = pongWidth.value*2/3 - pongWidth.value/3 * Math.random();
    genY.value = (pongHeight.value - 2*blockHeight.value)  - ((pongHeight.value - 4 * blockHeight.value) * Math.random());

    if (genX.value > pongWidth.value/2)
      genX.value -= genX.value % (blockWidth.value * 1.5);
    else
      genX.value += (blockWidth.value * 1.5) - genX.value % (blockWidth.value * 1.5);
    if (genX.value > pongHeight.value/2)
      genY.value -= genY.value % (blockHeight.value * 1.5 );
    else
      genY.value += (blockWidth.value * 1.5) - genY.value % (blockHeight.value * 1.5 );

    if (isValidGen(genX.value, genY.value))
      break ;
    j.value++;
  }
  if (j.value == 25)
    return ;
  switch ((Math.floor(100 * Math.random())) % 4)
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
      myBlocks.value.push(new EffectBlock(genX.value,
                            genY.value,
                            blockWidth.value, blockHeight.value, '#000000' , "SOLID"));
      break ;
    }
    case 3: {
      myBlocks.value.push(new EffectBlock(genX.value, genY.value, blockWidth.value, blockHeight.value, '#5a0899', "TP"));
      break;
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
  '--ball-size': `${ballSize.value}px`,
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
  startWall,
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




