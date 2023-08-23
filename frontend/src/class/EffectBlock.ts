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

  constructor(Pong: PongGameClass, x: number, y: number, width: number, height: number,
    effect: string, num: number, _id?: number) {
    console.log("EffectBlock constructor");

    const theRequire = Pong.blockSprites[num];
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.effect = effect;
    this.pong = Pong;
    this.num = num;
    this.sprite.src = theRequire;
    if (_id !== undefined) {
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
    if (this.effect === "R_SLOW") {
      ball.veloX /= -1.2;
      if (store.state.ingame)
        gameSocket.emit("ballSetter", { ballInfo: ball.ballState(), room: store.state.gameRoom });
    }
    else if (this.effect === "SLOWn") {
      ball.veloX /= 1.2;
      ball.veloY /= 1.2;
      if (store.state.ingame)
        gameSocket.emit("ballSetter", { ballInfo: ball.ballState(), room: store.state.gameRoom });
    }
    else if (this.effect === "WALL") {
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
      console.log("newBall-----------------");
      ball.pong.newBall('blue', this.x + this.width / 2, this.y + this.height / 2, 1, ball.veloX / Math.abs(ball.veloX));
    }
    else if (this.effect === "biggerPaddle") {
      console.log("biggerPaddle");
      let paddleStateData: PaddleState;
      if (ball.veloX > 0) {
        ball.pong.rightPaddleHeight *= 1.2;
        paddleStateData = ball.pong.getPaddleState(2);
      }
      else {
        ball.pong.leftPaddleHeight *= 1.2;
        paddleStateData = ball.pong.getPaddleState(1);
      }
      gameSocket.emit("paddlePosMessage", { state: paddleStateData, room: store.state.gameRoom })

    }
    else if (this.effect === "smallerPaddle") {
      console.log("smallerPaddle");
      let paddleStateData: PaddleState;
      if (ball.veloX > 0) {
        ball.pong.rightPaddleHeight /= 1.1;
        paddleStateData = ball.pong.getPaddleState(2);
      }
      else {
        ball.pong.leftPaddleHeight /= 1.1;
        paddleStateData = ball.pong.getPaddleState(1);
        gameSocket.emit("paddlePosMessage", { state: paddleStateData, room: store.state.gameRoom })
      }
    }
  }
}