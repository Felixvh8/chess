// CONSTANTS //
const SQUARE_SIZE = 50;
let selectedSquares = [];
let board;
let canvas;
let ctx;

// Called when the window fully loads, limit this
// function to things that require use of the document space
window.onload = function() {
  // Sets variables required for accessing the graphics
  canvas = document.getElementById("gameCanv");
  ctx = canvas.getContext("2d");

  board = new Board();
  board.setStartingPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", ctx);

  board.displaySquares(ctx);

  document.addEventListener("click", (e) => {
    //
    // Check this function
    //
    let square = board.getSelectedSquare(canvas, e);

    if (selectedSquares.length == 1 && selectedSquares[0].piece.colour != board.turn) {
      board.unselectSquares();
    }

    // Checks if the move is legal and makes the move if more than 1 square is selected
    if (selectedSquares.length > 1) {
      board.makeMove(selectedSquares[0], selectedSquares[1]);
      board.unselectSquares();
    }
    console.log(square); //---------------------------------------

    // Redraws the board after each click
    board.displaySquares(ctx);
  });
}

// Restarts the game
function newGame() {
  //if (window.confirm("Start a new game?")) window.location.reload();
  window.location.reload();
}