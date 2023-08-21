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
import { BallClass } from './BallClass';
import { EffectBlock } from './EffectBlock';

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

  constructor() {
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
    this.blockId = 0;
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
  }

  /***********************START GAME***********************/
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
    if (x && y)
      this.myBalls.push(new BallClass(this, x, y, veloX,
        this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
        this.ballRadius, var_color, var_hp));
    else
      this.myBalls.push(new BallClass(this, this.width / 2, this.height / 2, veloX,
        this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
        this.ballRadius, var_color, var_hp));
  }

  restartMatch(gameIsRunnig?: boolean, rightBot?: boolean, wallIsUp?: boolean, bothBot?: boolean) {
    this.scoreA = 0;
    this.scoreB = 0;
    this.num_ping = 0;
    this.num_pong = 0;
    this.ballId = 0;
    this.myBalls = [];
    this.theBall.x = this.width / 2;
    this.theBall.y = this.height / 2;
    this.theBall.veloX = 0;
    this.theBall.veloY = 0;
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
      this.gameIsRunning = true;
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
    console.log("paleyr : " + player + " inerites : " + this.inertie[player]);

    return paddleY;
  }
  bot() {
    if (this.leftPlayerKeyDown == '')
      this.leftPaddleY = this.boting(this.leftPaddleY, this.leftPaddleX + this.leftPaddleWidth, this.leftPaddleHeight, 0);

    if (this.rightPlayerKeyDown == '')
      this.rightPaddleY = this.boting(this.rightPaddleY, this.rightPaddleX, this.rightPaddleHeight, 1);
  }
  /*******************Keys handelers*******************/
  moovePaddles() {
    if (this.leftArrowUp && this.leftPaddleY > 1 - this.leftPaddleHeight)
      this.leftPaddleY -= this.leftPaddleSpeed * this.leftArrowUp;
    else if (this.leftArrowDown && this.leftPaddleY < this.height - 1)
      this.leftPaddleY += this.leftPaddleSpeed * this.leftArrowDown;
    if (this.rightArrowUp && this.rightPaddleY > 1 - this.rightPaddleHeight)
      this.rightPaddleY -= this.rightPaddleSpeed * this.rightArrowUp;
    else if (this.rightArrowDown && this.rightPaddleY < this.height - 1)
      this.rightPaddleY += this.rightPaddleSpeed * this.rightArrowDown;
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === this.leftPlayerKeyUp)
      this.leftArrowUp = 1;
    else if (event.key === this.leftPlayerKeyDown)
      this.leftArrowDown = 1;

    if (event.key === this.rightPlayerKeyUp)
      this.rightArrowUp = 1;
    else if (event.key === this.rightPlayerKeyDown)
      this.rightArrowDown = 1;
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === this.leftPlayerKeyUp)
      this.leftArrowUp = 0;
    else if (event.key === this.leftPlayerKeyDown)
      this.leftArrowDown = 0;

    if (event.key === this.rightPlayerKeyUp)
      this.rightArrowUp = 0;
    else if (event.key === this.rightPlayerKeyDown)
      this.rightArrowDown = 0;
  };
  /*******************Blocks*******************/
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
    this.blockId++;
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
  }
  removeBlock = (blockId: number) => {
    this.myBlocks = this.myBlocks.filter(block => block.id !== blockId);
  }
}