import { PongGameClass } from "./PongClass";
import {
	ballMaxSpeedX,
	ballMaxSpeedY,
} from './PongSettings';
import store from '../store';
import gameSocket from "@/utils/gameSocket";
import { BallState } from "@/utils/interfaces";


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
	lastPoint: Date;

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
		this.lastPoint = new Date();
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
			if (Date.now() - this.pong.lastGoal[this.id] < 200)
			{
				this.pong.lastGoal[this.id] = Date.now();
				return;
			}
			if (!store.state.ingame) {
				this.hp--;
				this.pong.scoreB += 1;
				this.x = this.pong.width / 2;
				this.y = this.pong.height / 2;
				this.veloX = this.pong.randStartSpeedX();
				this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
				this.pong.pointSounds[1].play();
			}
			else if (store.state.playerNum == 1) {
				if (this.lastPoint.getMilliseconds() - Date.now() > -200)
					return;
				this.lastPoint = new Date();
				this.hp--;
				this.x = this.pong.width / 2;
				this.y = this.pong.height / 2;
				this.veloX = this.pong.randStartSpeedX();
				this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
				this.pong.pointSounds[1].play();
				this.onlinePoint(1);
			}
		}
		else if (this.x >= this.pong.width - 1) {
			if (!store.state.ingame) {
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
				this.pong.pointSounds[0].play();
			}
			else if (store.state.playerNum == 2) {
				if (this.lastPoint.getMilliseconds() - Date.now() > -200)
					return;
				this.lastPoint = new Date();
				this.x = this.pong.width / 2;
				this.y = this.pong.height / 2;
				this.veloX = -this.pong.randStartSpeedX();
				this.veloY = this.pong.randStartSpeedY() * Math.sign(Math.random() - 0.5);
				this.pong.pointSounds[1].play();
				this.onlinePoint(2);
			}
		}
	}

	onlinePoint = (_player: number) => {
		if (!store.state.ingame || store.state.playerNum != _player)
			return;
		//console.log("onlinePoint-----------");
		gameSocket.emit("ballSetter", { ballInfo: this.ballState(), room: store.state.gameRoom });
		gameSocket.emit("goalMessage", { room: store.state.gameRoom, player: _player });
	}

	ballPaddleColision = (paddleX: number, paddleY: number, paddleHeight: number, paddleWidth: number, sign: number): boolean => {
		const dist_center = Math.abs(this.x - (this.pong.width / 2));

		if (dist_center + this.radius >= paddleX && dist_center - this.radius <= paddleX + paddleWidth) {
			if (this.y - this.radius <= paddleY + paddleHeight && this.y + this.radius >= paddleY) {
				if (this.pong.lastHit.getMilliseconds() - Date.now() > -200)
					return false;
				this.veloX = sign * (Math.abs(this.veloX) + Math.random() / 2);
				if (this.veloX >= ballMaxSpeedX || this.veloX <= - ballMaxSpeedX)
					this.veloX = ballMaxSpeedX * sign;
				if (!store.state.ingame && this.pong.gameIsBlocks && Math.random() < 0.5) {
					this.pong.generateBlocks();
				}
				if (store.state.ingame && store.state.game.isBlocked && store.state.playerNum == 1 && Math.random() < 0.5) //test gen Block
					this.pong.generateBlocks();
				this.veloY = -((paddleY + paddleHeight / 2 - this.y) / paddleHeight / 2 * ballMaxSpeedY + 0.1 - Math.random() / 5);

				this.pong.hitSound.play();
				if (this.id == 0)
					this.pong.lastHit = new Date();
				return true;
			}
		}
		return false;
	}

	ballBlockColision = () => {
		for (const block of this.pong.myBlocks) {
			if (this.x + this.radius >= block.x && this.x - this.radius <= block.x + block.width) {
				if (this.y + this.radius >= block.y && this.y - this.radius <= block.y + block.height) {
					if (!store.state.ingame || store.state.playerNum == 1) {
						block.triggerEffect(this);
						// //console.log("ballBlockColision = ", block.id);
						gameSocket.emit("destroyBlock", { room: store.state.gameRoom, blockId: block.id });
						this.pong.removeBlock(block.id);
					}

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

		// if (this.pong.alreadyComputed) {
		// 	this.pong.alreadyComputed = false;
		// 	this.x += this.veloX;
		// 	this.y += this.veloY;

		// 	return this;
		// }

		this.ballBlockColision();
		// const nbr = this.pong.num_ping + this.pong.num_pong;
		this.ballWallColision();
		if (this.x < this.pong.width / 3 &&
			this.ballPaddleColision(Math.abs(this.pong.paddleOffset + this.pong.leftPaddleWidth - this.pong.width / 2),
				this.pong.leftPaddleY, this.pong.leftPaddleHeight,
				this.pong.leftPaddleWidth, 1)) {
			this.pong.num_ping += 1;
			if (store.state.playerNum == 1) {
				//console.log("ballsetter emit");
				gameSocket.emit("ballSetter", { ballInfo: this.ballState(), room: store.state.gameRoom });
			}
		}
		else if (this.x > this.pong.width / 2 / 3 &&
			this.ballPaddleColision(this.pong.rightPaddleX - this.pong.width / 2,
				this.pong.rightPaddleY, this.pong.rightPaddleHeight,
				this.pong.rightPaddleWidth, -1)) {
			this.pong.num_pong += 1;
			if (store.state.playerNum == 2) {
				//console.log("ballsetter emit");
				gameSocket.emit("ballSetter", { ballInfo: this.ballState(), room: store.state.gameRoom });
			}
		}
		if (this.hp == 0) {
			gameSocket.emit("destroyBall", { room: store.state.gameRoom, ballId: this.id });
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