import { PongGameClass } from "./PongClass";
import { BallClass } from "./BallClass";
import store from "@/store";
import gameSocket from "@/utils/gameSocket";
import { PaddleState, BlockState } from "@/utils/interfaces";

/*******************EffectBlock*******************/
export class EffectBlock {
  effect: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: number;
  num: number;
  pong: PongGameClass;
  sprite: HTMLImageElement = new Image();
  sound: HTMLAudioElement = new Audio();

  constructor(Pong: PongGameClass, x: number, y: number, width: number, height: number,
    effect: string, num: number, _id?: number) {
    //console.log("EffectBlock constructor");

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.effect = effect;
    this.pong = Pong;
    this.num = num;
    this.sprite.src = Pong.blockSprites[num];
    this.sound.src = Pong.blockSounds[num];
    if (_id !== undefined ) {
      this.id = _id;
    }
    else {
      this.id = this.pong.blockId;
    }
    if (store.state.ingame && store.state.playerNum == 1) {
      gameSocket.emit("createBlock", { room: store.state.gameRoom, block: this.getBlockState() });
    }
  }

  getBlockState(): BlockState {
    return (
      {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        num: this.num,
        effect: this.effect,
        id: this.id,
      } as BlockState
    );
  }

  triggerEffect(ball: BallClass): void {
      
    if (this.effect === "WALL") {
      this.sound.play();
      ball.veloX *= -1;
      ball.veloY *= -1;
      if (store.state.ingame)
        gameSocket.emit("ballSetter", { ballInfo: ball.ballState(), room: store.state.gameRoom });
    }
    else if (this.effect === "TP") {
      if (store.state.ingame && store.state.playerNum != 1)
        return;
      for (const block of ball.pong.myBlocks) {
        if (block.effect === "TP" && block.id != this.id) {
          this.sound.play();
          ball.x = block.x + block.width / 2
          ball.y = block.y + block.height / 2;
          if (store.state.ingame) {
            gameSocket.emit("destroyBlock", { room: store.state.gameRoom, blockId: block.id });
            gameSocket.emit("ballSetter", { ballInfo: ball.ballState(), room: store.state.gameRoom });
          }
          ball.pong.removeBlock(block.id);
          return;
        }
      }
    }
    else if (this.effect === "newBall" && ball.pong.myBalls.length < 3
      && !((store.state.ingame) && store.state.playerNum != 1)) {
      if (store.state.ingame && store.state.playerNum != 1)
        return;
      this.sound.volume = 0.4;
      this.sound.play();
      //console.log("newBall-----------------");
      ball.pong.newBall('blue', this.x + this.width / 2, this.y + this.height / 2, 1, ball.veloX / Math.abs(ball.veloX));
    }
    else if (this.effect === "biggerPaddle") {
      this.sound.play();
      //console.log("biggerPaddle");
      let paddleStateData: PaddleState;
      if (ball.veloX > 0) {
        ball.pong.leftPaddleHeight *= 1.2;
        paddleStateData = ball.pong.getPaddleState(2);
      }
      else {
        ball.pong.rightPaddleHeight *= 1.2;
        paddleStateData = ball.pong.getPaddleState(1);
      }
      gameSocket.emit("paddlePosMessage", { state: paddleStateData, room: store.state.gameRoom })

    }
    else if (this.effect === "smallerPaddle") {
      this.sound.play();
      //console.log("smallerPaddle");
      let paddleStateData: PaddleState;
      if (ball.veloX > 0) {
        ball.pong.leftPaddleHeight /= 1.1;
        paddleStateData = ball.pong.getPaddleState(2);
      }
      else {
        ball.pong.rightPaddleHeight /= 1.1;
        paddleStateData = ball.pong.getPaddleState(1);
        gameSocket.emit("paddlePosMessage", { state: paddleStateData, room: store.state.gameRoom })
      }
    }
  }
}