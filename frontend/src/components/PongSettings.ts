// GAME CONTAINER PARAMETERS
export const SetPongWidth = 1200;
export const SetPongHeight = 700;

export const gameTick = 1;
export const veloDiv = 6;

// CONTROL PARAMETERS
export const SetRightPlayerKeyUp = 'ArrowUp';
export const SetRightPlayerKeyDown = 'ArrowDown';
export const SetLeftPlayerKeyUp = 'w';
export const SetLeftPlayerKeyDown = 's';


export const SetPaddleOffset = 20;
// LEFT PADDLE PARAMETERS
export const SetLeftPaddleWidth = 10;
export const SetLeftPaddleHeight = 100;

export const SetLeftPaddleY = SetPongHeight / 2 - SetLeftPaddleHeight / 2;
export const SetLeftPaddleX = SetPaddleOffset;

export const SetLeftPaddleSpeed = 12/veloDiv;


// RIGHT PADDLE PARAMETERS
export const SetRightPaddleWidth = 10;
export const SetRightPaddleHeight = 100;

export const SetRightPaddleY = SetPongHeight / 2 - SetRightPaddleHeight / 2;
export const SetRightPaddleX = SetPongWidth - (SetPaddleOffset + SetRightPaddleWidth);

export const SetRightPaddleSpeed = 12/veloDiv;


// BALL PARAMETERS
export const SetBallSize = 32;






export const ballMaxSpeedX = 1000;
export const ballMaxSpeedY = 11;
export const SetBounce = 5;

export const SetBlockWidth = SetPongHeight  * 0.05;
export const SetBlockHeight = SetPongWidth * 0.05;

