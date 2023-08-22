// GAME CONTAINER PARAMETERS
export const SetPongWidth = 1200;
export const SetPongHeight = 700;

export const gameTick = 1000/120;
export const setVeloDiv = 2;

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

export const SetLeftPaddleSpeed = 14/setVeloDiv;

export const setLeftPaddleColor = "#147f83";


// RIGHT PADDLE PARAMETERS
export const SetRightPaddleWidth = 10;
export const SetRightPaddleHeight = 100;

export const SetRightPaddleY = SetPongHeight / 2 - SetRightPaddleHeight / 2;
export const SetRightPaddleX = SetPongWidth - (SetPaddleOffset + SetRightPaddleWidth);

export const SetRightPaddleSpeed = 14/setVeloDiv;

export const setRightPaddleColor = "#e9ec33";
// BALL PARAMETERS
export const setBallRadius = 8;

export const setBallStartSpeedX = 6/setVeloDiv;
export const setBallStartSpeedY = 6/setVeloDiv;

export const ballMaxSpeedX = 1000/setVeloDiv;
export const ballMaxSpeedY = 33/setVeloDiv;
export const SetBounce = 5;


// BALL PARAMETERS

export const setBlockSpace = 2;

export const SetBlockWidth = SetPongHeight /16;
export const SetBlockHeight =  SetPongWidth/16;



