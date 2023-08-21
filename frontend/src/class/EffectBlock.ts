import { PongGameClass } from "./PongClass";
import { BallClass } from "./BallClass";

/*******************EffectBlock*******************/
export class EffectBlock {
  effect: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: number;
  pong: PongGameClass;

  constructor(Pong: PongGameClass, x: number, y: number, width: number, height: number, color: string, effect: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.effect = effect;
    this.color = color;
    this.pong = Pong;
    this.id = this.pong.blockId;
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
          ball.pong.removeBlock(block.id);
          return;
        }
      }
    }
    else if (this.effect === "newBall") {
      ball.pong.newBall('blue', this.x + this.width / 2, this.y + this.height / 2, 1, ball.veloX / Math.abs(ball.veloX));
    }
  }
}