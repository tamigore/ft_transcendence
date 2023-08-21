import { PongGameClass } from "./PongClass";
import {
    ballMaxSpeedX,
    ballMaxSpeedY,
} from './PongSettings';

/******************* BallClass *******************/
export class BallClass {
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

  ballWallColision() {
    if (this.y <= 0) {
      this.veloY = Math.abs(this.veloY);
    }
    else if (this.y >= this.pong.height) {
      this.veloY = -Math.abs(this.veloY);
    }
    if (this.x <= 1) {
      this.hp--;
      this.pong.scoreB += 1;
      this.x = this.pong.width / 2;
      this.y = this.pong.height / 2;
      this.veloX = this.pong.randStartSpeedX();
      this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
    }
    else if (this.x >= this.pong.width - 1) {
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
  }

  ballPaddleColision = (paddleX: number, paddleY: number, paddleHeight: number, paddleWidth: number, sign: number): boolean => {
    const dist_center = Math.abs(this.x - (this.pong.width / 2));
    if (dist_center + this.radius >= paddleX && dist_center - this.radius <= paddleX + paddleWidth) {
      if (this.y - this.radius <= paddleY + paddleHeight && this.y + this.radius >= paddleY) {
        this.veloX = sign * (Math.abs(this.veloX) + Math.random() / 3);
        if (this.veloX >= ballMaxSpeedX || this.veloX <= - ballMaxSpeedX)
          this.veloX = ballMaxSpeedX * sign;
        if (this.pong.gameIsBlocks && Math.random() < 0.6)
          this.pong.generateBlocks();
        this.veloY = -((paddleY + paddleHeight / 2 - this.y) / paddleHeight / 2 * ballMaxSpeedY + 0.1 - Math.random() / 5);
        if (this.veloY > 0)
          console.log("ballPaddleColision \n veloy: " + this.veloY + " ratio: " + ((paddleY + paddleHeight / 2 - this.y) / paddleHeight / 2) + "\n");
        return true;
      }
    }
    return false;
  }

  ballBlockColision = () => {
    for (const block of this.pong.myBlocks) {
      if (this.x + this.radius >= block.x && this.x - this.radius <= block.x + block.width) {
        if (this.y + this.radius >= block.y && this.y - this.radius <= block.y + block.height) {
          block.triggerEffect(this);
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
    this.ballWallColision();
    if (this.x < this.pong.width / 3 &&
      this.ballPaddleColision(Math.abs(this.pong.paddleOffset + this.pong.leftPaddleWidth - this.pong.width / 2),
        this.pong.leftPaddleY, this.pong.leftPaddleHeight,
        this.pong.leftPaddleWidth, 1)) {
      this.pong.num_ping += 1;
    }
    else if (this.x > this.pong.width / 2 / 3 &&
      this.ballPaddleColision(this.pong.rightPaddleX - this.pong.width / 2,
        this.pong.rightPaddleY, this.pong.rightPaddleHeight,
        this.pong.rightPaddleWidth, -1)) {
      this.pong.num_pong += 1;
    }
    if (this.hp == 0)
      this.pong.myBalls.splice(this.pong.myBalls.indexOf(this), 1);
    this.x += this.veloX;
    this.y += this.veloY;
    return this;
  }
}