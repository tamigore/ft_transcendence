<template>
<p>{{ "veloBall x-y " + veloBallX + " " + veloBallY }}</p>
<div class="button-container">
      <button @click="startMatch" :disabled="gameIsRunning">Start</button>
      <button @click="restartMatch" :disabled="!gameIsRunning">Restart</button>
    </div>
<div class="game-container">
<div class="pong-container">
  <div class="pong">
    <div class="scores">
      <div class="scorePlayer">{{ "Score A : " + scoreA }}</div>
      <div class="scorePlayer">{{ "Score B : " + scoreB }}</div>
    </div>
    
    <div class="paddle" :style="leftPaddleStyle"></div>
    <div class="paddle" :style="rightPaddleStyle"></div>
    <div class="ball" :style="ballStyle"></div>
  </div>
</div>
</div>

</template>

<script lang="ts">

import { defineComponent,onMounted, ref, computed } from 'vue';

export default defineComponent({

    setup() {

//GAME CONTAINER PARAMETERS
const gameContainerWidth = 600;
const gameContainerHeight = 400;

//CONTROL PARAMETERS
const rightPlayerKeyUp = 'ArrowUp';
const rightPlayerKeyDown = 'ArrowDown';
const leftPlayerKeyUp = 'w';
const leftPlayerKeyDown = 's';

//LEFT PADDLE PARAMETERS
const leftPaddleWidth = ref(10);
const leftPaddleHeight = ref(80);

const leftPaddleY = ref(gameContainerHeight/2 - leftPaddleHeight.value/2);
const leftPaddleSpeed = ref(12);

const leftPaddleJustHit = ref(false);

//RIGHT PADDLE PARAMETERS
const rightPaddleWidth = ref(10);
const rightPaddleHeight = ref(400);

const rightPaddleY = ref(gameContainerHeight/2 - rightPaddleHeight.value/2);
const rightPaddleSpeed = ref(12);

const rightPaddleJustHit = ref(false);

//BALL PARAMETERS
const ballSize = 10;
const paddleOffset = 10;

const ballX = ref(gameContainerWidth/2 - ballSize/2);
const ballY = ref(gameContainerHeight/2 - ballSize/2);

const ballStartSpeedX = -4;
const ballStartSpeedY = 2;

const veloBallX = ref(0);
const veloBallY = ref(0);

const ballMaxSpeedX = 12;
const ballMaxSpeedY = 10;


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
const startMatch = () => {
  if (!gameIsRunning.value)
  {
    veloBallX.value = ballStartSpeedX;
    veloBallY.value = ballStartSpeedY;
    ballX.value = gameContainerWidth/2 - ballSize/2;
    ballY.value = gameContainerHeight/2 - ballSize/2;
    gameIsRunning.value = true;
  }
}

const restartMatch = () => {
  if (gameIsRunning.value)
  {
    scoreA.value = 0;
    scoreB.value = 0;
    veloBallX.value = 0;
    veloBallY.value = 0;
    ballX.value = gameContainerWidth/2 - ballSize/2;
    ballY.value = gameContainerHeight/2 - ballSize/2;
    gameIsRunning.value = false;
  }
}



const moovePaddles = () => {
  if (leftArrowUp.value && leftPaddleY.value > 1 - leftPaddleHeight.value)
    leftPaddleY.value -= leftPaddleSpeed.value * leftArrowUp.value;
  else if (leftArrowDown.value && leftPaddleY.value < gameContainerHeight - 1)
    leftPaddleY.value += leftPaddleSpeed.value * leftArrowDown.value;

  if (rightArrowUp.value && rightPaddleY.value > 1 - rightPaddleHeight.value)
    rightPaddleY.value -= rightPaddleSpeed.value * rightArrowUp.value;
  else if (rightArrowDown.value && rightPaddleY.value < gameContainerHeight - 1)
    rightPaddleY.value += rightPaddleSpeed.value * rightArrowDown.value;
}




const ballWallColistion = () => {
  if (ballY.value <= 0 )
    veloBallY.value = Math.abs(veloBallY.value);
  else if (ballY.value >= gameContainerHeight - ballSize)
  veloBallY.value = -Math.abs(veloBallY.value);

  if (ballX.value <= 1)
    {
      scoreB.value += 1;
      ballX.value = gameContainerWidth/2 - ballSize/2;
      ballY.value = gameContainerHeight/2 - ballSize/2;
      veloBallX.value = -ballStartSpeedX;
      veloBallY.value = ballStartSpeedY;
    }
  if (ballX.value >= gameContainerWidth - ballSize - 1)
    {
      scoreA.value += 1;
      ballX.value = gameContainerWidth/2 - ballSize/2;
      ballY.value = gameContainerHeight/2 - ballSize/2;
      veloBallX.value = ballStartSpeedX;
      veloBallY.value = -ballStartSpeedY;
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
    return true;
  }
}
return false;
}

const gameLoop = () => {


ballWallColistion();
ballPaddleColision(paddleOffset + leftPaddleWidth.value, leftPaddleY.value,leftPaddleHeight.value, 1); 
ballPaddleColision( (paddleOffset + rightPaddleWidth.value + ballSize) - gameContainerWidth, rightPaddleY.value, rightPaddleHeight.value, -1); 



ballX.value += veloBallX.value;
ballY.value += veloBallY.value;

moovePaddles();

};

//   if (ballX.value <= paddleOffset + leftPaddleWidth.value)
//     {
//       if (ballY.value >= leftPaddleY.value && ballY.value <= leftPaddleY.value + leftPaddleHeight.value)
//         {
//           if (ballY.value <= leftPaddleY.value + leftPaddleHeight.value/2)
//           {
//             veloBallX.value = -veloBallX.value + ((ballY.value - leftPaddleY.value) / (leftPaddleHeight.value / 2));
//             veloBallY.value = veloBallY.value - ( ((ballY.value - leftPaddleY.value) - leftPaddleHeight.value / 4) / leftPaddleHeight.value) ;
//           }
//           else
//           {
//             veloBallX.value = -veloBallX.value + ((ballY.value - (leftPaddleY.value + leftPaddleHeight.value/2)) / (leftPaddleHeight.value / 2));
//             veloBallY.value = veloBallY.value - ( ((ballY.value - (leftPaddleY.value + leftPaddleHeight.value/2)) - leftPaddleHeight.value/4) / leftPaddleHeight.value );
//           }
//         }
//     }

//     if (ballX.value >= gameContainerWidth - paddleOffset - rightPaddleWidth.value - ballSize)
//     {
//       if (ballY.value >= rightPaddleY.value && ballY.value <= rightPaddleY.value + rightPaddleHeight.value)
//         {
//           if (ballY.value <= rightPaddleY.value + rightPaddleHeight.value/2)
//           {
//             veloBallX.value = -(veloBallX.value + ((ballY.value - rightPaddleY.value) / (rightPaddleHeight.value / 2)));
//             veloBallY.value = veloBallY.value - ( ((ballY.value - rightPaddleY.value) - rightPaddleHeight.value / 4) / rightPaddleHeight.value) ;
//           }
//           else
//           {
//             veloBallX.value = -(veloBallX.value + ((ballY.value - (rightPaddleY.value + rightPaddleHeight.value/2)) / (rightPaddleHeight.value / 2)));
//             veloBallY.value = veloBallY.value - ( ((ballY.value - (rightPaddleY.value + rightPaddleHeight.value/2)) - rightPaddleHeight.value/4) / rightPaddleHeight.value );
//           }
//         }
//     }
// }



//KEY HANDLING

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === leftPlayerKeyUp) 
    leftArrowUp.value = 1;
  else if (event.key === leftPlayerKeyDown)
    leftArrowDown.value = 1;

  if (event.key === rightPlayerKeyUp )
    rightArrowUp.value = 1;
  else if (event.key === rightPlayerKeyDown )
    rightArrowDown.value = 1;
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === leftPlayerKeyUp) {
  leftArrowUp.value = 0;
  } else if (event.key === leftPlayerKeyDown) {
  leftArrowDown.value = 0;
  }

  if (event.key === rightPlayerKeyUp) {
  rightArrowUp.value = 0;
  } else if (event.key === rightPlayerKeyDown) {
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
  startMatch,
  restartMatch,
  gameIsRunning,
};


},

}



);
</script>




<style>

.game-container {
  position: flex; /* Set the container to absolute position */
  top: 0; /* Position the container at the top of its parent */
  right: 0;
  display: flex;
  background-color: #000;
}

.button-container {
  position: absolute; /* Set the container to absolute position */
top: 0; /* Position the container at the top of its parent */
left: 0;
display: flex;
align-items: center;
justify-content: center;
margin-top: 250px;
height: 100px; /* Set a fixed height for the pong container */
width: 100%;
 
}


  .button-container button {
    margin: 0 5px;
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

.pong-container {
position: absolute; /* Set the container to absolute position */
top: 0; /* Position the container at the top of its parent */
left: 0;
display: flex;
align-items: center;
justify-content: center;
margin-top: 320px;
height: 400px; /* Set a fixed height for the pong container */
width: 100%;
}

.pong {
position: relative;
width: 600px;
height: 400px;
border: 1px solid #6b4d4d;
overflow: hidden;
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