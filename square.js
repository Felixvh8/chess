class Square {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.index = (j * 8) + i;
    this.empty = true;
    this.selected = false;
    this.piece = 0;
    this.legal = false;
  }

  // Places a piece in a square
  setPiece(piece) {
    // Redundancy
    if (!piece || piece === 0) {
      this.unset();
      return;
    }

    if (typeof piece == "string") {
      this.empty = false;
      switch (piece) {
        case "K":
          this.piece = new Piece(Piece.White, Piece.King);
          break;
        case "k":
          this.piece = new Piece(Piece.Black, Piece.King);
          break;
        case "Q":
          this.piece = new Piece(Piece.White, Piece.Queen);
          break;
        case "q":
          this.piece = new Piece(Piece.Black, Piece.Queen);
          break;
        case "B":
          this.piece = new Piece(Piece.White, Piece.Bishop);
          break;
        case "b":
          this.piece = new Piece(Piece.Black, Piece.Bishop);
          break;
        case "N":
          this.piece = new Piece(Piece.White, Piece.Knight);
          break;
        case "n":
          this.piece = new Piece(Piece.Black, Piece.Knight);
          break;
        case "R":
          this.piece = new Piece(Piece.White, Piece.Rook);
          break;
        case "r":
          this.piece = new Piece(Piece.Black, Piece.Rook);
          break;
        case "P":
          this.piece = new Piece(Piece.White, Piece.Pawn);
          break;
        case "p":
          this.piece = new Piece(Piece.Black, Piece.Pawn);
          break;
        case "e":
          this.piece = 0;
          this.empty = true;
          break;
      }
    } else if (typeof piece == "object") {
      this.piece = piece;
      this.empty = false;
    } else {
      throw "Error: must specify the piece to set";
    }
  }

  // Removes the piece from the square
  unset() {
    this.piece = 0;
    this.empty = true;
  }
}