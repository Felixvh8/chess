class Piece {
  constructor(colour, type) {
    this.colour = colour;
    this.type = type;
    this.moveCount = 0;
  }

  // Piece dictionary, so the program can store the piece type as a integer to save space and time
  static Empty = 0;
  static King = 1;
  static Queen = 2;
  static Bishop = 3;
  static Knight = 4;
  static Rook = 5;
  static Pawn = 6;

  // Piece colour as integer
  static White = 0;
  static Black = 1;

  static pieceToChar(type, colour) {
    switch (type) {
      case 1: 
        return colour == Piece.White ? 'K' : 'k';
      case 2: 
        return colour == Piece.White ? 'Q' : 'q';
      case 3: 
        return colour == Piece.White ? 'B' : 'b';
      case 4: 
        return colour == Piece.White ? 'N' : 'n';
      case 5: 
        return colour == Piece.White ? 'R' : 'r';
      case 6: 
        return colour == Piece.White ? 'P' : 'p';
      default: 
        break;
    }
  }
}