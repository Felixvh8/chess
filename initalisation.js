// CONSTANTS //
const SQUARE_SIZE = 50;
let selectedSquares = [];
let board;
let canvas;
let ctx;
let DEVELOPER_FLAG = true;
let showLegalMoves = DEVELOPER_FLAG ? true : false;
let legalMoves;
let timerID;
let startTime, endTime;

// Called when the window fully loads, limit this
// function to things that require use of the document space
window.onload = function() {
  // Sets variables required for accessing the graphics
  canvas = document.getElementById("gameCanv");
  ctx = canvas.getContext("2d");

  board = new Board();
  board.setStartingPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  // Test starting positions
  // board.setStartingPosition("r1bq2kr/pppp1ppp/2n2n2/2b1p3/2B1P2P/5N2/PPPP1PP1/R3K2R w KQkq - 0 1");
  board.displaySquares();
  legalMoves = Move.GenerateLegalMoves();

  // For letting bots face eachother
  //timerID = setInterval(automate, 100);

  //start();
  //console.log(Move.MoveGenerationTest(5), end());

  document.addEventListener("click", (e) => {
    let square = board.getSelectedSquare(canvas, e);

    if (selectedSquares.length == 1 && selectedSquares[0].piece.colour != board.turn) {
      board.unselectSquares();
    }

    // Shows legal moves
    if (showLegalMoves && selectedSquares.length == 1) {
      Move.GenerateMovesForCurrentPiece(square.index);
    }

    // Checks if the move is legal and makes the move if more than 1 square is selected
    if (selectedSquares.length > 1) {
      board.makeMove(selectedSquares[0].index, selectedSquares[1].index, legalMoves, true);
      board.unselectSquares();
    }
    if (square) console.log(square); //---------------------------------------


    //if (board.turn == Piece.Black) automate();
    // Redraws the board after each click
    board.displaySquares();

    legalMoves = Move.GenerateLegalMoves();
    if (!board.winner) board.checkWinCondition();
  });
}

// Restarts the game
function newGame() {
  //if (window.confirm("Start a new game?")) window.location.reload();
  window.location.reload();
}

// Toggles the legal moves
function toggleLegalMoves() {
  showLegalMoves = showLegalMoves ? false : true;
}

function automate() {
  legalMoves = Move.GenerateLegalMoves();
  if (!board.winner) board.checkWinCondition();
  let moveIndex = Math.floor(legalMoves.length * Math.random());
  board.makeMove(legalMoves[moveIndex].startSquare, legalMoves[moveIndex].targetSquare, legalMoves);
  board.displaySquares();
}

function start() {
  startTime = performance.now();
};

function end() {
  endTime = performance.now();
  let timeDiff = endTime - startTime; //in ms
  
  return timeDiff + " milliseconds";
}