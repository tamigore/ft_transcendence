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
import store from "@/store";
import { BallClass } from './BallClass';
import { EffectBlock } from './EffectBlock';
import gameSocket from "@/utils/gameSocket";
import { GameMove, PaddleState } from "@/utils/interfaces";

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
	hitSound: HTMLAudioElement;
	blockSprites: [string, string, string, string, string];
	lastHit: Date;
	blockSounds: [string, string, string, string, string];
	pointSounds: [HTMLAudioElement, HTMLAudioElement];
	lastGoal: [number,number,number,number];

	constructor(_hitSound: HTMLAudioElement) {
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
		this.hitSound = _hitSound;
		this.lastHit = new Date();
		this.blockSprites = [
			require('@/assets/sprites/block.png'),
			require('@/assets/sprites/tp.png'),
			require('@/assets/sprites/newBall.png'),
			require('@/assets/sprites/larger.png'),
			require('@/assets/sprites/smaller.png'),
		];
		this.blockSounds = [
			require('@/assets/sounds/breakLego.mp3'),
			require('@/assets/sounds/tpEnderman.mp3'),
			require('@/assets/sounds/newBall.mp3'),
			require('@/assets/sounds/larger.mp3'),
			require('@/assets/sounds/smaller.mp3'),
		];
		this.pointSounds = [new Audio(), new Audio()];
		this.pointSounds[0].src = require('@/assets/sounds/GoodPoint.mp3');
		this.pointSounds[1].src = require('@/assets/sounds/BadPoint.mp3');
		this.pointSounds[0].volume = 0.5;
		this.lastGoal = [Date.now(),Date.now(),Date.now(),Date.now()];

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
		return (4 + Math.random() * 2) / this.veloDiv;
	}

	randStartSpeedY(): number {
		return (4 - Math.random() * 8) / this.veloDiv;
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
		if (x && y) {
			newBall = new BallClass(this, x, y, veloX,
				this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
				this.ballRadius, var_color, var_hp)
			this.myBalls.push(newBall);
		}
		else {
			newBall = new BallClass(this, this.width / 2, this.height / 2, veloX,
				this.randStartSpeedY() * Math.sign(Math.random() - 0.5),
				this.ballRadius, var_color, var_hp)
			this.myBalls.push(newBall);
		}
		if (store.state.ingame && store.state.playerNum == 1)
			gameSocket.emit("createBall", { room: store.state.gameRoom, ball: newBall.ballState() });
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

	startMultiOnline() {
		// if (store.state.playerNum == 2)
		this.restartMatch(true);
		gameSocket.emit("ballSetter", { ballInfo: this.theBall.ballState(), room: store.state.gameRoom });
		console.log("startMultiOnline----------- the ball : ", this.theBall.ballState());
		// else
		// 	this.restartMatch(false);
		this.inMultiplayer = true;
		this.gameIsRunning = true;
		//console.log("startMultiOnline-----------");
		//console.log("game", store.state.game);
		this.leftPlayerKeyDown = '';
		this.leftPlayerKeyUp = '';
		this.rightPlayerKeyDown = '';
		this.rightPlayerKeyUp = '';
		console.log("Start mluti online playerNUm = ", store.state.playerNum);
		if (store.state.playerNum == 1) {
			console.log("player 1 KEYS");
			this.leftPlayerKeyDown = 's';
			this.leftPlayerKeyUp = 'w';
			this.blockId = 1;
		}
		else if (store.state.playerNum == 2) {
			console.log("player 2 KEYS");
			this.rightPlayerKeyDown = 's';
			this.rightPlayerKeyUp = 'w';
			this.blockId = 2;
		}
		console.log("Start mluti online leftplayerKey :", this.leftPlayerKeyUp, this.leftPlayerKeyDown);
			console.log("Start mluti online rightplayerKey :", this.rightPlayerKeyUp, this.rightPlayerKeyDown);
		this.rightPaddleHeight = 80;
		this.leftPaddleHeight = 80;
		// this.newBall();
	}

	endGameOnline() {
		this.inMultiplayer = false;
		this.gameIsRunning = false;
		store.commit("setGameConnect", false);
		let winnerId = 0;
		let looserId = 0;
		if (this.scoreA > this.scoreB) {
			winnerId = 1;
			looserId = 2;
		}
		else {
			winnerId = 2;
			looserId = 1;
		}
		const theScore = this.scoreA + " - " + this.scoreB as string;
		//console.log("endGameOnline----------- score  = ", theScore);
		if (store.state.playerNum == 2)
			gameSocket.emit("endGame", {
				room: store.state.gameRoom,
				game: store.state.game,
				winner: winnerId,
				looser: looserId,
				score: theScore
			});
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
		const diff = paddleY + paddleHeight / 2 - ballY + this.ballRadius / 2;

		if (this.inertie[player] < -1) {
			paddleY = paddleY + this.leftPaddleSpeed;
			this.inertie[player]++;
		}
		else if (this.inertie[player] > 1) {
			paddleY = paddleY - this.leftPaddleSpeed;
			this.inertie[player]--;
		}
		else {
			let inertie = (diff / this.leftPaddleSpeed) + Math.sign(diff) * (Math.abs(diff) / 10 * (Math.random() * 0.3));
			// this.inertie[player] += 2;
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
			this.leftPaddleY -= this.leftPaddleSpeed * this.leftArrowUp;
		}
		else if (this.leftArrowDown && this.leftPaddleY < this.height - 1) {
			this.leftPaddleY += this.leftPaddleSpeed * this.leftArrowDown;
		}

		if (this.rightArrowUp && this.rightPaddleY > 1 - this.rightPaddleHeight)
			this.rightPaddleY -= this.rightPaddleSpeed * this.rightArrowUp;
		else if (this.rightArrowDown && this.rightPaddleY < this.height - 1)
			this.rightPaddleY += this.rightPaddleSpeed * this.rightArrowDown;
	}

	getPaddleState = (player: number): PaddleState => {
		if (player == 1)
			return ({
				player: player,
				posY: this.leftPaddleY,
				height: this.leftPaddleHeight
			} as PaddleState);
		else (player == 2)
		return ({
			player: player,
			posY: this.rightPaddleY,
			height: this.rightPaddleHeight
		} as PaddleState);
	}

	setPaddleState = (paddleState: PaddleState) => {
		if (paddleState.player == 1) {
			this.leftPaddleY = paddleState.posY;
			this.leftPaddleHeight = paddleState.height;
		}
		else if (paddleState.player == 2) {
			this.rightPaddleY = paddleState.posY;
			this.rightPaddleHeight = paddleState.height;
		}
	}

	/*******************Keys handelers*******************/
	handleKeyOnline = (player: number, notPressed: boolean, key: number) => {
		if (notPressed)
			this.onlineKeyUp(player, key);
		else
			this.onlineKeyDown(player, key);
	}

	onlineKeyDown = (playerN: number, key: number) => {
		if (playerN != 2) {
			if (key == 1)
				this.leftArrowUp = 1;
			else if (key == 0)
				this.leftArrowDown = 1;
		}
		if (playerN != 1) {
			if (key == 1)
				this.rightArrowUp = 1;
			else if (key == 0)
				this.rightArrowDown = 1;
		}
	}

	onlineKeyUp = (playerN: number, key: number) => {
		if (playerN != 2) {
			if (key == 1)
				this.leftArrowUp = 0;
			else if (key == 0)
				this.leftArrowDown = 0;
		}
		if (playerN != 1) {
			if (key == 1)
				this.rightArrowUp = 0;
			else if (key == 0)
				this.rightArrowDown = 0;
		}
	}

	sendKey = (_player: number, _up: boolean, _key: number) => {
		// console.log("sendKey plauer ", _player, " up :", _up, " key ", _key);
		if (store.state.ingame && this.inMultiplayer) {
			const gameMoveData = {
				player: _player,
				notPressed: _up,
				key: _key,
			} as GameMove;
			gameSocket.emit("gameMessage", { moove: gameMoveData, room: store.state.gameRoom });
			if (_up == true) {
				let _posY = 0;
				let _height = this.leftPaddleHeight;
				if (_player == 1)
					_posY = this.leftPaddleY;
				else if (_player == 2) {
					_posY = this.rightPaddleY;
					_height = this.rightPaddleHeight;
				}
				const paddleStateData = {
					player: _player,
					posY: _posY,
					height: _height
				} as PaddleState;
				gameSocket.emit("paddlePosMessage", { state: paddleStateData, room: store.state.gameRoom })
			}
		}
	}

	handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === this.leftPlayerKeyUp && this.leftArrowUp != 1) {
			this.leftArrowUp = 1;
			this.sendKey(1, false, 1);
		}
		else if (event.key === this.leftPlayerKeyDown && this.leftArrowDown != 1) {
			this.leftArrowDown = 1;
			this.sendKey(1, false, 0);
		}
		else if (event.key === this.rightPlayerKeyUp && this.rightArrowUp != 1) {
			this.rightArrowUp = 1;
			this.sendKey(2, false, 1);
		}
		else if (event.key === this.rightPlayerKeyDown && this.rightArrowDown != 1) {
			this.rightArrowDown = 1;
			this.sendKey(2, false, 0);
		}
	}

	handleKeyUp = (event: KeyboardEvent) => {
		if (event.key === this.leftPlayerKeyUp && this.leftArrowUp != 0) {
			this.leftArrowUp = 0;
			this.sendKey(1, true, 1);
		}
		else if (event.key === this.leftPlayerKeyDown && this.leftArrowDown != 0) {
			this.leftArrowDown = 0;
			this.sendKey(1, true, 0);
		}
		else if (event.key === this.rightPlayerKeyUp && this.rightArrowUp != 0) {
			this.rightArrowUp = 0;
			this.sendKey(2, true, 1);
		}
		else if (event.key === this.rightPlayerKeyDown && this.rightArrowDown != 0) {
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
		const numb = (Math.floor(100 * Math.random())) % 7;
		switch (numb) {
			case 0:
				{
					this.myBlocks.push(new EffectBlock(this, genX,
						genY,
						this.blockWidth, this.blockHeight, "WALL", numb));
					break;
				}
			case 1:
				{
					this.myBlocks.push(new EffectBlock(this, genX,
						genY,
						this.blockWidth, this.blockHeight, "TP", numb));
					break;
				}
			case 2: {
				this.myBlocks.push(new EffectBlock(this, genX,
					genY,
					this.blockWidth, this.blockHeight, "newBall", numb));
				break;
			}
			case 3: {
				this.myBlocks.push(new EffectBlock(this, genX,
					genY,
					this.blockWidth, this.blockHeight, "biggerPaddle", numb));
				break;
			}
			case 4: {
				this.myBlocks.push(new EffectBlock(this, genX,
					genY,
					this.blockWidth, this.blockHeight, "smallerPaddle", numb));
				break;
			}
		}
	}

	removeBlock = (blockId: number) => {
		this.myBlocks = this.myBlocks.filter(block => block.id !== blockId);
	}

	removeBall = (ballId: number) => {
		this.myBalls = this.myBalls.filter(ball => ball.id !== ballId);
	}
}