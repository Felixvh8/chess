class Move {
  constructor(startingSquare, targetSquare) {
    this.startingSquare = startingSquare;
    this.targetSquare = targetSquare;
  }

  static Moves;

  static DirectionOffsets = [-8, 1, 8, -1, -7, 9, 7, -9];

  static GenerateMoves() {
    let moves = new Array;

    for (let startSquare = 0; startSquare < 64; startSquare++) {
      let piece = board.squares[startSquare].piece.type;
      if (board.squares[startSquare].piece.colour == board.turn) {
        if (piece == 2 || piece == 3 || piece == 5) {
          this.GenerateSlidingMoves(startSquare, piece);
        }
      }
    }

    this.Moves = moves;
  }

  static GenerateSlidingMoves(startSquare, piece) {

  }
}