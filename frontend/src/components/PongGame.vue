
<template>
  <div v-if="Pong" class="game-container">

    <div class="info-container">

      <div>FPS: {{ fps.toFixed(2) }}</div>
      <p>{{ "veloBall x-y " + Pong.theBall.veloX + " " + Pong.theBall.veloY }}</p>
      <p>{{ "posBall x-y " + Pong.theBall.x + " " + Pong.theBall.y }}</p>
      <p>{{ "scoreA " + Pong.scoreA }}</p>
      <p>{{ "scoreB " + Pong.scoreB }}</p>
    </div>

    <div v-if="!Pong.inMultiplayer" class="button-container">
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
import useFPS from './useFPS';
import store from "@/store";
import socket from "@/utils/gameSocket"
import { GameMove, PaddleState, BallState, BlockState } from "@/utils/interfaces"
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
  setBallRadius,
  SetPaddleOffset,
  ballMaxSpeedX,
  ballMaxSpeedY,
  gameTick,
  SetBounce,
  SetBlockWidth,
  SetBlockHeight,
  setVeloDiv,
  setBlockSpace,
  setBallStartSpeedX,
  setBallStartSpeedY,
  setRightPaddleColor,
  setLeftPaddleColor,

} from './PongSettings';



/*******************EffectBlock*******************/

class EffectBlock {
  effect: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: number;
  pong: PongGameClass;

  constructor(Pong: PongGameClass, x: number, y: number, width: number, height: number, color: string, effect: string, _id?: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.effect = effect;
    this.color = color;
    this.pong = Pong;
    if (_id !== undefined) {
      this.id = _id;
    }
    else {
      this.id = this.pong.blockId;
      if (store.state.ingame)
        socket.emit("createBlock", {room: store.state.gameRoom, block: this.getBlockState()});
    }
  }

getBlockState(): BlockState
{
  return (
    {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      color: this.color,
      effect: this.effect,
      id: this.id,
    } as BlockState
  );
}


  triggerEffect(ball: BallClass): void {
    if (this.effect === "R_SLOW") {
      ball.veloX /= -1.2;
    }
    else if (this.effect === "SLOWn") {
      ball.veloX /= 1.2;
      ball.veloY /= 1.2;
    }
    else if (this.effect === "WALL") {
      ball.veloX *= -1;
      ball.veloY *= -1;
    }
    else if (this.effect === "TP") {
      for (const block of ball.pong.myBlocks) {
        if (block.effect === "TP" && block.id != this.id) {
          ball.x = block.x + block.width / 2
          ball.y = block.y + block.height / 2;
          socket.emit("destroyBlock", {room: store.state.gameRoom, blockId: block.id});
          socket.emit("ballSetter", {ballInfo: ball.ballState(), room: store.state.gameRoom });
          ball.pong.removeBlock(block.id);
          return;
        }
      }
    }
    else if (this.effect === "newBall" && ball.pong.myBalls.length < 3 && store.state.playerNum == 1) {
      ball.pong.newBall('blue', this.x + this.width / 2, this.y + this.height / 2, 1, ball.veloX / Math.abs(ball.veloX));
    }


  }
}




/******************* BallClass *******************/
class BallClass {
  public x: number;
  public y: number;
  veloX: number;
  veloY: number;
  radius: number;
  color: string;
  id: number;
  hp: number;
  pong: PongGameClass;

  constructor(pong: PongGameClass, x: number, y: number, veloX: number, veloY: number, radius: number, color: string, hp?: number) {
    this.x = x;
    this.y = y;
    this.veloX = veloX;
    this.veloY = veloY;
    this.radius = radius;
    this.color = color;
    this.pong = pong;
    this.id = pong.ballId++;
    this.hp = -1;
    if (hp)
      this.hp = hp;
  }


  ballState(): BallState {
    return ({
      ballX: this.x,
      ballY: this.y,
      ballVeloX: this.veloX,
      ballVeloY: this.veloY,
      ballId: this.id,
      player: store.state.playerNum,
      ballHp: this.hp,
    } as BallState);
   
  }

  ballWallColision() {
    if (this.y <= 0) {
      this.veloY = Math.abs(this.veloY);
    }
    else if (this.y >= this.pong.height) {
      this.veloY = -Math.abs(this.veloY);
    }
    if (this.x <= 1) {
      if (!store.state.ingame)
      {
        this.hp--;
        this.pong.scoreB += 1;
        this.x = this.pong.width / 2;
        this.y = this.pong.height / 2;
        this.veloX = this.pong.randStartSpeedX();
        this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
      }
      else if (store.state.playerNum == 1)
      {
        this.hp--;
        this.x = this.pong.width / 2;
        this.y = this.pong.height / 2;
        this.veloX = this.pong.randStartSpeedX();
        this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
        this.onlinePoint(1);
      }
   }
    else if (this.x >= this.pong.width - 1) {
      if (!store.state.ingame )
      {
        if (this.pong.wallIsUp) {
          this.veloX = -this.veloX;
          return;
        }
        this.hp--;
        this.pong.scoreA += 1;
        this.x = this.pong.width / 2;
        this.y = this.pong.height / 2;
        this.veloX = -this.pong.randStartSpeedX();
        this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
      }
      else if (store.state.playerNum == 2)
      {
        this.x = this.pong.width / 2;
        this.y = this.pong.height / 2;
        this.veloX = -this.pong.randStartSpeedX();
        this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
        this.onlinePoint(2);
      }
    }
  }

  onlinePoint = (_player:number) => {
    console.log("onlinePoint-----------");
    socket.emit("ballSetter", {ballInfo: this.ballState(), room: store.state.gameRoom});
    socket.emit("goalMessage", {room: store.state.gameRoom, player: _player});
  }

  ballPaddleColision = (paddleX: number, paddleY: number, paddleHeight: number, paddleWidth: number, sign: number): boolean => {
    const dist_center = Math.abs(this.x - (this.pong.width / 2));

    if (dist_center + this.radius >= paddleX && dist_center - this.radius <= paddleX + paddleWidth) {
      if (this.y - this.radius <= paddleY + paddleHeight && this.y + this.radius >= paddleY) {
        this.veloX = sign * (Math.abs(this.veloX) + Math.random() / 3);
        if (this.veloX >= ballMaxSpeedX || this.veloX <= - ballMaxSpeedX)
          this.veloX = ballMaxSpeedX * sign;
        if (!store.state.ingame && this.pong.gameIsBlocks && Math.random() < 0.5)
          this.pong.generateBlocks();
        else if (store.state.ingame && this.pong.gameIsBlocks && store.state.playerNum == 1 && Math.random() < 0.5) //test gen Block
          this.pong.generateBlocks();
        this.veloY = -((paddleY + paddleHeight / 2 - this.y) / paddleHeight / 2 * ballMaxSpeedY + 0.1 - Math.random() / 5);
        // if (this.veloY > 0)
        // this.sendBallPaddle(paddleY, player);

        // const audio = new Audio(('@/assets/sounds/hitSound.wav'));
        // audio.play();
        
        return true;
      }
    }
    return false;
  }

  // sendBallPaddle = (paddleY: number, player) => {
  //   if (store.state.ingame)
  //     {
  //       console.log("OKKKKKK gameLoop socket = ", socket.id);
  //       socket.emit("pingMessage"
  //       {
  //        BallState:
  //         {
  //           ballX: this.x,
  //           ballY: this.y,
  //           ballVeloX: this.veloX,
  //           ballVeloY: this.veloY,
  //         } as BallState,
  //         PaddleState:
  //         {
  //           player: 0,
  //           posY: paddleY,
  //         } as PaddleState,
                  
  //       });
  //     }
  // }

  ballBlockColision = () => {
    for (const block of this.pong.myBlocks) {
      if (this.x + this.radius >= block.x && this.x - this.radius <= block.x + block.width) {
        if (this.y + this.radius >= block.y && this.y - this.radius <= block.y + block.height) {
          block.triggerEffect(this);
          socket.emit("destroyBlock", {room: store.state.gameRoom, blockId: block.id});
          socket.emit("ballSetter", {ballInfo: this.ballState(), room: store.state.gameRoom });
          this.pong.removeBlock(block.id);

          return;
        }
      }
    }
    return;
  }

  preColision = (): boolean => {
    const oldVeloX = this.veloX;
    const oldVeloY = this.veloY;

    if (this.ballPaddleColision(Math.abs(this.pong.paddleOffset + this.pong.leftPaddleWidth - this.pong.width / 2),
      this.pong.leftPaddleY, this.pong.leftPaddleHeight,
      this.pong.leftPaddleWidth, 1)
      ||
      this.ballPaddleColision(this.pong.rightPaddleX - this.pong.width / 2,
        this.pong.rightPaddleY, this.pong.rightPaddleHeight,
        this.pong.rightPaddleWidth, -1)) {
      if (this.x < 200) {
        this.pong.num_ping += 1;
        this.x = this.pong.paddleOffset + this.pong.leftPaddleWidth + this.radius / 2 + 1;
      }
      else {
        this.pong.num_pong += 1;
        this.x = this.pong.width - (this.pong.paddleOffset + this.radius + this.pong.rightPaddleWidth + 1);
      }
      return true;
    }
    this.veloX = oldVeloX;
    this.veloY = oldVeloY;
    return false;
  }

  ballColision = (): BallClass => {

    if (this.pong.alreadyComputed) {
      this.pong.alreadyComputed = false;
      this.x += this.veloX;
      this.y += this.veloY;

      return this;
    }

    this.ballBlockColision();
    // const nbr = this.pong.num_ping + this.pong.num_pong;
    this.ballWallColision();
    if (this.x < this.pong.width / 3 &&
      this.ballPaddleColision(Math.abs(this.pong.paddleOffset + this.pong.leftPaddleWidth - this.pong.width / 2),
        this.pong.leftPaddleY, this.pong.leftPaddleHeight,
        this.pong.leftPaddleWidth, 1)) {
        this.pong.num_ping += 1;
        if (store.state.playerNum == 1)
          socket.emit("ballSetter", {ballInfo: this.ballState(), room: store.state.gameRoom});
    }
    else if (this.x > this.pong.width / 2 / 3 &&
      this.ballPaddleColision(this.pong.rightPaddleX - this.pong.width / 2,
        this.pong.rightPaddleY, this.pong.rightPaddleHeight,
        this.pong.rightPaddleWidth, -1)) {
      this.pong.num_pong += 1;
      if (store.state.playerNum == 2)
          socket.emit("ballSetter", {ballInfo: this.ballState(), room: store.state.gameRoom});
    }
    if (this.hp == 0)
    {
      socket.emit("destroyBall", {room: store.state.gameRoom, ballId: this.id});
      this.pong.removeBall(this.id);
    }
    this.x += this.veloX;
    this.y += this.veloY;

    // if (nbr == this.pong.num_ping + this.pong.num_pong)
    //  this.pong.alreadyComputed = this.preColision();
    return this;
  }

  setBallState = (state: BallState) => {
    this.x = state.ballX;
    this.y = state.ballY;
    this.veloX = state.ballVeloX;
    this.veloY = state.ballVeloY;
  }

}



/*******************PongGameClass*******************/

export class PongGameClass {
  width: number;
  height: number;
  //CONTROL PARAMETERS
  rightPlayerKeyUp: string;
  rightPlayerKeyDown: string;
  leftPlayerKeyUp: string;
  leftPlayerKeyDown: string;
  //LEFT PADDLE PARAMETERS
  bounce: number;
  leftPaddleWidth: number;
  leftPaddleHeight: number;
  leftPaddleY: number;
  leftPaddleX: number;
  leftPaddleSpeed: number;
  leftPaddleColor: string;
  leftPaddleJustHit: boolean;
  //RIGHT PADDLE PARAMETERS
  rightPaddleWidth: number;
  rightPaddleHeight: number;
  rightPaddleY: number;
  rightPaddleX: number;
  rightPaddleSpeed: number;
  rightPaddleColor: string;
  rightPaddleJustHit: boolean;
  //BALL PARAMETERS
  theBall: BallClass;
  myBalls: BallClass[];
  ballRadius: number;
  paddleOffset: number;
  ballStartSpeedX: number;
  ballStartSpeedY: number;
  //BLOCKS PARAMETERS
  myBlocks: EffectBlock[];
  blockWidth: number;
  blockHeight: number;
  blockSpace: number;
  //VARIOUS PARAMETERS
  num_ping: number;
  num_pong: number;
  scoreA: number;
  scoreB: number;
  blockId: number;
  ballId: number;
  gameIsRunning: boolean;
  gameIsBlocks: boolean;
  blockStatus: string;
  alreadyComputed: boolean;
  leftArrowUp: number;
  leftArrowDown: number;
  rightArrowUp: number;
  rightArrowDown: number;
  x: number;
  inertie: number[];
  wallIsUp: boolean;
  veloDiv: number;

  inMultiplayer: boolean;
  // audioContext: AudioContext;
  // audioBuffer: null;


  constructor() {

    //AUDIO

    // this.audioContext = new window.AudioContext();
    // this.audioBuffer = null;
    //GAME PARAMETERS
    this.width = SetPongWidth;
    this.height = SetPongHeight;

    //CONTROL PARAMETERS
    this.rightPlayerKeyUp = SetRightPlayerKeyUp;
    this.rightPlayerKeyDown = SetRightPlayerKeyDown;

    this.leftPlayerKeyUp = SetLeftPlayerKeyUp;
    this.leftPlayerKeyDown = SetLeftPlayerKeyDown;

    //LEFT PADDLE PARAMETERS
    this.bounce = SetBounce;

    this.leftPaddleWidth = SetLeftPaddleWidth;
    this.leftPaddleHeight = SetLeftPaddleHeight;

    this.leftPaddleY = SetLeftPaddleY;
    this.leftPaddleX = SetLeftPaddleX;
    this.leftPaddleSpeed = SetLeftPaddleSpeed;

    this.leftPaddleColor = setLeftPaddleColor;

    this.leftPaddleJustHit = false;

    //RIGHT PADDLE PARAMETERS
    this.rightPaddleWidth = SetRightPaddleWidth;
    this.rightPaddleHeight = SetRightPaddleHeight;

    this.rightPaddleY = SetRightPaddleY;
    this.rightPaddleX = SetRightPaddleX;
    this.rightPaddleSpeed = SetRightPaddleSpeed;

    this.rightPaddleColor = setRightPaddleColor;
    this.rightPaddleJustHit = false;

    //BALL PARAMETERS

    this.myBalls = [];

    this.ballRadius = setBallRadius;
    this.paddleOffset = SetPaddleOffset;

    this.ballStartSpeedX = setBallStartSpeedX;
    this.ballStartSpeedY = setBallStartSpeedY;

    this.num_ping = 0;
    this.num_pong = 0;

    this.scoreA = 0;
    this.scoreB = 0;

    //BLOCKS PARAMETERS

    this.myBlocks = [];
    this.blockWidth = SetBlockWidth;
    this.blockHeight = SetBlockHeight;

    //VARIOUS PARAMETERS

    this.blockSpace = setBlockSpace;
    this.blockId = 1;
    this.ballId = 0;

    this.gameIsRunning = false;
    this.gameIsBlocks = false;
    this.blockStatus = 'DISABLED';

    this.alreadyComputed = false;

    this.leftArrowUp = 0;
    this.leftArrowDown = 0;

    this.rightArrowUp = 0;
    this.rightArrowDown = 0;


    this.inertie = [0, 0];

    this.wallIsUp = false;

    this.veloDiv = setVeloDiv;


    this.theBall = new BallClass(this, this.width / 2, this.height / 2, 0, 0, setBallRadius, 'white');

    this.inMultiplayer = false;
  }



  /***********************re-START GAME***********************/
    LeaveGame() {
      store.commit("setGameConnect", false);
    }
    
  startMatchSolo() {
    this.restartMatch(true, true);
  }

  startWall() {
    this.restartMatch(true, false, true);
  }

  startNoPlayer() {
    this.restartMatch(true, false, false, true);

  }

  startMatchMultiLocal() {
    this.restartMatch(true);

  }

  randStartSpeedX(): number {
    return (1 + Math.random());
  }

  randStartSpeedY(): number {
    return (1 - Math.random() * 2);
  }

  newBall(color?: string, x?: number, y?: number, hp?: number, direction?: number) {
    let veloX = this.randStartSpeedX() * Math.sign(Math.random() - 0.5)
    let var_color = 'white';
    let var_hp = -1;
    if (hp)
      var_hp = hp;
    if (color)
      var_color = color;
    if (direction)
      veloX = Math.abs(veloX) * direction;
    let newBall: BallClass;
    if (x && y)
    {
      newBall = new BallClass(this, x, y, veloX,
              this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
              this.ballRadius, var_color, var_hp)
      this.myBalls.push(newBall);
    }
    else
    {
      newBall = new BallClass(this, this.width / 2, this.height / 2, veloX,
        this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
        this.ballRadius, var_color, var_hp)
      this.myBalls.push(newBall);
    }
    if (store.state.ingame && store.state.playerNum == 1)
      socket.emit("createBall", {room: store.state.gameRoom, ball: newBall.ballState()});
  }

  restartMatch(gameIsRunnig?: boolean, rightBot?: boolean, wallIsUp?: boolean, bothBot?: boolean) {
    this.scoreA = 0;
    this.scoreB = 0;

    this.num_ping = 0;
    this.num_pong = 0;


    this.ballId = 1;
    this.myBalls = [];

    this.theBall.x = this.width / 2;
    this.theBall.y = this.height / 2;

    this.theBall.veloX = 0;
    this.theBall.veloY = 0;

    this.blockId = 1;
    this.myBlocks = [];

    this.inertie = [0, 0];

    this.rightPaddleHeight = 80;
    this.rightPaddleY = this.height / 2 - this.rightPaddleHeight / 2;

    this.rightPlayerKeyDown = 'ArrowDown';
    this.rightPlayerKeyUp = 'ArrowUp';

    this.leftPaddleHeight = 80;
    this.leftPaddleY = this.height / 2 - this.leftPaddleHeight / 2;

    this.leftPlayerKeyDown = 's';
    this.leftPlayerKeyUp = 'w';

    this.gameIsRunning = false;

    this.wallIsUp = false;
    if (gameIsRunnig != undefined && gameIsRunnig) {
      this.theBall.veloX = this.randStartSpeedX() * Math.sign(Math.random() - 0.5);
      this.theBall.veloY = this.randStartSpeedY() * Math.sign(Math.random() - 0.5);
      if (rightBot != undefined && rightBot) {
        this.rightPlayerKeyDown = '';
        this.rightPlayerKeyUp = '';
      }
      else if (wallIsUp != undefined && wallIsUp) {
        this.rightPlayerKeyDown = 'smthing';
        this.rightPlayerKeyUp = 'smthing';
        this.wallIsUp = true;
        this.rightPaddleY = this.height + 1000;
      }
      if (bothBot != undefined && bothBot) {
        this.rightPlayerKeyDown = '';
        this.rightPlayerKeyUp = '';
        this.leftPlayerKeyDown = '';
        this.leftPlayerKeyUp = '';
      }
    }
  }

  startMultiOnline() {
    this.restartMatch(true);
    this.inMultiplayer = true;
    this.gameIsRunning = true;
    store.commit("setGameConnect", true);
    console.log("startMultiOnline-----------");
    this.leftPlayerKeyDown = '';
    this.leftPlayerKeyUp = '';
    this.rightPlayerKeyDown = '';
    this.rightPlayerKeyUp = '';
    if (store.state.playerNum == 1)
    {
      this.leftPlayerKeyDown = 's';
      this.leftPlayerKeyUp = 'w';
      this.blockId = 1;
    }
    if (store.state.playerNum == 2)
    {
      this.rightPlayerKeyDown = 's';
      this.rightPlayerKeyUp = 'w';
      this.blockId = 2;
    }
    this.rightPaddleHeight = 600;
    this.leftPaddleHeight = 600;
    // this.newBall();
  }

  endGameOnline() {
    this.inMultiplayer = false;
    this.gameIsRunning = false;
    store.commit("setGameConnect", false);
    let winnerId = 0;
    let looserId = 0;
    if (this.scoreA > this.scoreB)
    {
      winnerId = 1;
      looserId = 2;
    }
    else
    {
      winnerId = 2;
      looserId = 1;
    }
    const theScore = this.scoreA + " - " + this.scoreB as string;
    console.log("endGameOnline----------- score  = ", theScore);
    socket.emit("endGame", {room: store.state.gameRoom,
      game: store.state.game, winner: winnerId, looser: looserId, score: theScore});
    this.restartMatch();
  }



  /*******************Bots*******************/

  boting = (paddleY: number, paddleX: number, paddleHeight: number, player: number): number => {

    let ballY = this.theBall.y;
    let ballX = this.theBall.x;


    for (const ball of this.myBalls) {
      if (Math.abs(ball.x + ball.veloX - paddleX) < Math.abs(ball.x - paddleX) && Math.abs(ball.x - paddleX) < Math.abs(ballX - paddleX)) {
        ballY = ball.y;
        ballX = ball.x;
      }
    }
    const diff = paddleY + paddleHeight / 2 - ballY - this.ballRadius / 2;

    if (this.inertie[player] < -1) {
      paddleY = paddleY + this.leftPaddleSpeed;
      this.inertie[player]++;
    }
    else if (this.inertie[player] > 1) {
      paddleY = paddleY - this.leftPaddleSpeed;
      this.inertie[player]--;
    }
    else {
      let inertie = (diff / this.leftPaddleSpeed) + (Math.random() * diff / this.leftPaddleSpeed) * 0.6 - (Math.random() * diff / this.leftPaddleSpeed) * 0.6
      this.inertie[player] += 2;
      if (inertie % 1 > 0.5)
        inertie += 1 - inertie % 1;
      else
        inertie -= inertie % 1;
      this.inertie[player] = inertie;

      if ((this.inertie[player] > 0 && paddleY <= 1)
        || (this.inertie[player] < 0 && paddleY > this.height - paddleHeight - 1))
        this.inertie[player] = 0;
    }

    return paddleY;
  }

  bot() {
    if (this.leftPlayerKeyDown == '' && !this.inMultiplayer)
      this.leftPaddleY = this.boting(this.leftPaddleY, this.leftPaddleX + this.leftPaddleWidth, this.leftPaddleHeight, 0);

    if (this.rightPlayerKeyDown == '' && !this.inMultiplayer)
      this.rightPaddleY = this.boting(this.rightPaddleY, this.rightPaddleX, this.rightPaddleHeight, 1);
  }



  /*******************Paddles Movements*******************/

  moovePaddles() {
    if (this.leftArrowUp && this.leftPaddleY > 1 - this.leftPaddleHeight) {
      // socket.socket.emit(up);
      this.leftPaddleY -= this.leftPaddleSpeed * this.leftArrowUp;
    }
    else if (this.leftArrowDown && this.leftPaddleY < this.height - 1) {
      // socket.socket.emit(down);
      this.leftPaddleY += this.leftPaddleSpeed * this.leftArrowDown;
    }

    if (this.rightArrowUp && this.rightPaddleY > 1 - this.rightPaddleHeight)
      this.rightPaddleY -= this.rightPaddleSpeed * this.rightArrowUp;
    else if (this.rightArrowDown && this.rightPaddleY < this.height - 1)
      this.rightPaddleY += this.rightPaddleSpeed * this.rightArrowDown;
  }


  setPaddleState = (paddleState : PaddleState) =>
  {
    if (paddleState.player == 1 && store.state.playerNum != 2)
      this.leftPaddleY = paddleState.posY;
    else if (paddleState.player == 2 && store.state.playerNum != 1)
      this.rightPaddleY = paddleState.posY;
  }

  /*******************Keys handelers*******************/


  handleKeyOnline = (player:number, notPressed:boolean, key:number) =>
  {
    if (notPressed)
      this.onlineKeyUp(player, key);
    else
      this.onlineKeyDown(player, key);
  }

  onlineKeyDown = (playerN:number, key:number) => {
    if (playerN != 2)
    {
      if (key == 1)
        this.leftArrowUp = 1;
      else if (key == 0)
        this.leftArrowDown = 1;
    }
    if (playerN != 1)
    {
      if (key == 1)
        this.rightArrowUp = 1;
      else if (key == 0)
        this.rightArrowDown = 1;
    }
  }

  onlineKeyUp = (playerN:number, key:number) => {
    if (playerN != 2)
    {
      if (key == 1)
        this.leftArrowUp = 0;
      else if (key == 0)
        this.leftArrowDown = 0;
    }
    if (playerN != 1)
    {
      if (key == 1)
        this.rightArrowUp = 0;
      else if (key == 0)
        this.rightArrowDown = 0;
    }
  }

  sendKey = (_player:number, _up:boolean, _key:number) =>
  {
    // console.log("game socket in game", store.state.gameSocket);

    // console.log("sendKey", store.state.ingame, this.inMultiplayer);
    if (store.state.ingame && this.inMultiplayer)
      {
        const gameMoveData = {
        player: _player,
        notPressed: _up,
        key: _key,
      } as GameMove;

        socket.emit("gameMessage", { moove: gameMoveData, room: store.state.gameRoom});

      if (_up == true)
      {
        let _posY = 0;
        if (_player == 1)
          _posY = this.leftPaddleY;
        else if (_player == 2)
          _posY = this.rightPaddleY;

        const paddleStateData = {
          player: _player,
          posY: _posY,
        } as PaddleState;


        socket.emit("paddlePosMessage", {state: paddleStateData, room: store.state.gameRoom })
      }
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
   
    if (event.key === this.leftPlayerKeyUp && this.leftArrowUp != 1)
    {
      this.leftArrowUp = 1;
      this.sendKey(1, false, 1);
    }
    else if (event.key === this.leftPlayerKeyDown && this.leftArrowDown !=  1)
    {
      this.leftArrowDown = 1;
      this.sendKey(1, false, 0);
    }
    else if (event.key === this.rightPlayerKeyUp && this.rightArrowUp != 1)
     { 
      this.rightArrowUp = 1;
      this.sendKey(2, false, 1);
     }
    else if (event.key === this.rightPlayerKeyDown && this.rightArrowDown != 1)
    {
        this.rightArrowDown = 1;
        this.sendKey(2, false, 0);
    }
  }



  handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === this.leftPlayerKeyUp && this.leftArrowUp != 0)
    {
      this.leftArrowUp = 0;
      this.sendKey(1, true, 1);
    }
    else if (event.key === this.leftPlayerKeyDown && this.leftArrowDown != 0)
    {
      this.leftArrowDown = 0;
      this.sendKey(1, true, 0);
    }
    else if (event.key === this.rightPlayerKeyUp && this.rightArrowUp != 0)
    {
      this.rightArrowUp = 0;
      this.sendKey(2, true, 1);
    }
      else if (event.key === this.rightPlayerKeyDown && this.rightArrowDown != 0)
    {
      this.rightArrowDown = 0;
      this.sendKey(2, true, 0);
    }
  }

 

  

  /*******************Blocks Functions*******************/

  checkBlockColi = (genX: number, genY: number, block: EffectBlock): boolean => {
    if (Math.abs(genX - block.x) < (this.blockWidth) && Math.abs(genY - block.y) < (this.blockHeight))
      return true;
    return false;
  }

  isValidGen = (genX: number, genY: number): boolean => {
    for (const block of this.myBlocks) {
      if (this.checkBlockColi(genX, genY, block))
        return (false);
    }
    return (true);
  }

  setBlocks() {
    if (!this.gameIsBlocks) {
      this.gameIsBlocks = true;
      this.blockStatus = 'ENABLED';
    }
    else {
      this.gameIsBlocks = false;
      this.blockStatus = 'DISABLED';
    }
  }

    /*******************Blocks Generation*******************/

  generateBlocks() {
    let genX = 0;
    let genY = 0;
    let j = 0;
    while (j < 25) {
      genX = this.width * 2 / 3 - this.width / 3 * Math.random();
      genY = (this.height - 1 * this.blockHeight) - ((this.height - 2 * this.blockHeight) * Math.random()) + 5;

      if (genX > this.width / 2)
        genX -= genX % (this.blockWidth * this.blockSpace);
      else
        genX += (this.blockWidth * this.blockSpace) - genX % (this.blockWidth * this.blockSpace);
      if (genX > this.height / 2)
        genY -= genY % (this.blockHeight * this.blockSpace);
      else
        genY += (this.blockWidth * this.blockSpace) - genY % (this.blockHeight * this.blockSpace);

      if (this.isValidGen(genX, genY))
        break;
      j++;
    }
    if (j == 25)
      return;
    this.blockId += 2;
    switch ((Math.floor(100 * Math.random())) % 5) {
      case 0:
        {
          this.myBlocks.push(new EffectBlock(this, genX,
            genY,
            this.blockWidth, this.blockHeight, '#deec1c', "R_SLOW"));
          break;
        }
      case 1:
        {
          this.myBlocks.push(new EffectBlock(this, genX,
            genY,
            this.blockWidth, this.blockHeight, '#d24dff', "SLOW"));
          break;
        }
      case 2:
        {
          this.myBlocks.push(new EffectBlock(this, genX,
            genY,
            this.blockWidth, this.blockHeight, '#c7911c', "WALL"));
          break;
        }
      case 3: {
        this.myBlocks.push(new EffectBlock(this, genX,
          genY,
          this.blockWidth, this.blockHeight, '#5a0899', "TP"));
        break;
      }
      case 4: {
        this.myBlocks.push(new EffectBlock(this, genX,
          genY,
          this.blockWidth, this.blockHeight, '#3fe6f2', "newBall"));
        break;
      }
    }
    // console.log("block created", this.myBlocks[this.myBlocks.length - 1].getBlockState());
    
  }

  removeBlock = (blockId: number) => {
    this.myBlocks = this.myBlocks.filter(block => block.id !== blockId);
  }

  removeBall = (ballId: number) => {
    this.myBalls = this.myBalls.filter(ball => ball.id !== ballId);
  }

}



/*******************End PongGameClass*******************/

export default defineComponent({
  name: 'FpsComponent',
  
  setup() {
    const myCanvas = ref<(HTMLCanvasElement | null)>(null);
    let ctx: CanvasRenderingContext2D | null = null;
    const { fps } = useFPS();
    // const hitSound = ref(null);
    let lastDate = Date.now();
    const Pong = ref(new PongGameClass());
    

//     const loadSound = (url) => {
//     return new Promise((resolve, reject) => {
//     const audio = new Audio(url);
//     audio.addEventListener("canplaythrough", () => resolve(audio));
//     audio.addEventListener("error", (error) => reject(error));
//   });
// }
    

    /*******************Game Loop*******************/
    
    const gameLoop = () => {
      // if (store.state.ingame && !Pong.value.gameIsRunning)
      // {
      //   console.log(Pong.value.gameIsRunning);
      //   Pong.value.startMultiOnline();
      // }
     if (store.state.ingame && store.state.playerNum == 1)
     {
      const nowDate = Date.now();
      if (lastDate + 250 > nowDate)
      {
        lastDate  = nowDate;
        socket.emit("ballSetter", {ballInfo: Pong.value.theBall.ballState(), room: store.state.gameRoom});
      }
     }

    if (Pong.value.inMultiplayer && !store.state.ingame)
     Pong.value.restartMatch();
      if (!ctx)
        return;

      ctx.clearRect(0, 0, Pong.value.width, Pong.value.height);
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


    

    /*******************Draw Functions*******************/
    
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


    /*******************Mounted and unMounted*******************/

    onMounted(() => {
 
      socket.on("gameRoomJoiner", (data) => {
        // console.log("GameRoomJoiner", data.room);
        store.commit("setGameRoom", data.room);
        if (store.state.playerNum == 2)
        {
          store.commit("setGameConnect", true);
          store.commit("setInQueue", false);
          Pong.value.startMultiOnline();
          socket.emit("ReadyGame", { room: store.state.gameRoom, ball: Pong.value.theBall.ballState() });
        }
      })

      socket.on("LaunchGame", (e: BallState) =>
      {

        store.commit("setGameConnect", true);
        store.commit("setInQueue", false);
        Pong.value.startMultiOnline();
        Pong.value.theBall.setBallState(e);
      });

      if (store.state.ingame)
      {
      
        socket.on("servMessage", (e:GameMove ) => {
          Pong.value.handleKeyOnline(e.player, e.notPressed, e.key);
        }); 

        socket.on("paddleStateMessage", (e: PaddleState) => {
          Pong.value.setPaddleState(e);
          
        });

        socket.on("setBall", (e: BallState) =>
        {
          if (store.state.playerNum != e.player)
            if (e.ballId == 0)
              Pong.value.theBall.setBallState(e);
          else
          {
            for (const ball of Pong.value.myBalls) {
              if (ball.id == e.ballId)
                ball.setBallState(e);
            }
          }
        });
      
        socket.on("scoreMessage", (e: number) =>
        {
          if (e == 2)
            Pong.value.scoreA++;
          else if (e == 1)
            Pong.value.scoreB++;
          if (Pong.value.scoreA >= 10 || Pong.value.scoreB >= 10)
          {
            Pong.value.endGameOnline();
            store.commit("setGameConnect", false);
          }
        });

        socket.on("blockCreation", (block: BlockState) => {

          if ( (block.id % 2 != 0 && store.state.playerNum != 1) || (block.id % 2 != 1 && store.state.playerNum != 2) )
          {
            Pong.value.myBlocks.push(new EffectBlock(Pong.value, block.x, block.y,
                                                    block.width, block.height, block.color, block.effect, block.id));
          }
        });

        socket.on("ballCreation", (ball: BallState) => {
          console.log("ballCreation", ball);
          if (store.state.playerNum != 1)
          {
            Pong.value.myBalls.push(new BallClass(Pong.value, ball.ballX, ball.ballY, ball.ballVeloX, ball.ballVeloY,
                                                  Pong.value.ballRadius, 'blue', 1));
          }
        });

        socket.on("ballDestruction", (id: number) => {
          console.log("ballDestruction", id);
          Pong.value.removeBall(id);
        });

        socket.on("gameEnder", () => {
          Pong.value.inMultiplayer = false;
          Pong.value.gameIsRunning = false;
          store.commit("setGameRoom", "");
          store.commit("setGameConnect", false);
          Pong.value.restartMatch();
          console.log("gameEnder is ended");
        });


      }


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

    /*******************Computed values*******************/

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
  },

});
</script>
