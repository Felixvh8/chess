class Move {
  constructor(startSquare, targetSquare, enPassant = false, isPromotion = false, castle = false) {
    this.startSquare = startSquare;
    this.targetSquare = targetSquare;
    this.enPassant = enPassant;
    this.promotion = isPromotion;
    this.castle = castle;
  }

  static PseudoLegalMoves;
  static DirectionOffsets = [-8, 1, 8, -1, -7, 9, 7, -9];
  static KnightOffsets = [-15, -6, 10, 17, 15, 6, -10, -17];
  static PawnOffsets = [-8, -16, -7, -9];

  // Finds and stores legal moves for the current position
  static GenerateMoves() {
    // console.log("Generating moves...")
    this.PseudoLegalMoves = new Array;

    for (let startSquare = 0; startSquare < 64; startSquare++) {
      if (board.squares[startSquare].piece == 0) continue;
      let piece = board.squares[startSquare].piece.type;

      if (board.squares[startSquare].piece.colour == board.turn) {
        if (piece == Piece.Pawn) {
          this.GeneratePawnMoves(startSquare);
        } else if (piece == Piece.Queen || piece == Piece.Bishop || piece == Piece.Rook || piece == Piece.King) {
          this.GenerateSlidingMoves(startSquare, piece);
        } else if (piece == Piece.Knight) {
          this.GenerateKnightMoves(startSquare);
        }
      }
    }

    return this.PseudoLegalMoves;
  }

  // Generates the moves for the queen, bishop and rook
  static GenerateSlidingMoves(startSquare, piece) {
    let startIndex = piece == Piece.Bishop ? 4 : 0;
    let endIndex = piece == Piece.Rook ? 4 : 8;

    for (let directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
      outerloop: for (let i = 0; i < Board.NumSquaresToEdge[startSquare][directionIndex]; i++) {
        // Gets the possible squares for each piece to move 
        let targetSquare = startSquare + this.DirectionOffsets[directionIndex] * (i + 1);
        let pieceOnTarget = board.squares[targetSquare].piece;

        // Stops the loop if the target square has a piece of the same colour
        if (pieceOnTarget.colour == board.turn) break;

        let castle = false;
        if (piece == Piece.King && i == 1) castle = true;
        this.PseudoLegalMoves.push(new Move(startSquare, targetSquare, false, false, castle));

        // Skips to the next directions if there is a opposite coloured piece on the target square
        if (pieceOnTarget.type) break;

        // Breaks the loop if the piece is a king as it can only move 1 square in each direction
        if (piece == Piece.King) {
          if (board.squares[startSquare].piece.moveCount != 0) break;
          if (directionIndex == 1 || directionIndex == 3) {
            if (i == 1) break;
            let gapToRook = directionIndex == 1 ? 3 : 4;
            let rookSquare = board.squares[startSquare + this.DirectionOffsets[directionIndex] * gapToRook];
            if (rookSquare.piece.moveCount != 0) break;
            if (rookSquare.piece == 0 || rookSquare.piece.type != Piece.Rook || rookSquare.piece.colour != board.turn) break;
            for (let j = 1; j < gapToRook; j++) {
              if (board.squares[startSquare + this.DirectionOffsets[directionIndex] * j].piece) break outerloop;
            }
          } else {
            break;
          }
        }
      }
    }
  }

  // Knight Moves Obvi
  static GenerateKnightMoves(startSquare) {
    for (const int of this.KnightOffsets) {
      let targetSquare = startSquare + int;
      if (targetSquare > 63 || targetSquare < 0) continue;

      let startSquareObj = board.squares[startSquare];
      let targetSquareObj = board.squares[targetSquare];

      // Checks if the target square contains a piece of the same colour
      if (targetSquareObj.piece.colour == board.turn) continue;

      if (startSquareObj.i + 2 >= targetSquareObj.i && startSquareObj.i - 2 <= targetSquareObj.i && startSquareObj.j + 2 >= targetSquareObj.j && startSquareObj.j - 2 <= targetSquareObj.j) {
        // Adds the move to the possible moves list
        this.PseudoLegalMoves.push(new Move(startSquare, targetSquare));
      }
    }
  }

  static GeneratePawnMoves(startSquare) {
    // Inverses the index offset for black pieces
    let colourInverter = board.turn == Piece.White ? 1 : -1;
    let isEnPassant;
    let isPromotion;

    for (let directionIndex = 0; directionIndex < this.PawnOffsets.length; directionIndex++) {
      isEnPassant = false;
      isPromotion = false;
      let targetSquare = startSquare + (this.PawnOffsets[directionIndex] * colourInverter);
      if (targetSquare < 0 || targetSquare > 63) continue;

      if (startSquare > 15 && startSquare < 48 && directionIndex == 1) continue;
      if (directionIndex == 1 && board.squares[startSquare + this.PawnOffsets[0] * colourInverter].piece != 0) continue;
      if (startSquare % 8 == 0 && targetSquare % 8 > 3 || startSquare % 8 == 7 && targetSquare % 8 < 4) continue;
      if (board.squares[targetSquare].piece.colour == board.turn) continue;
      if (board.squares[targetSquare].piece != 0 && directionIndex < 2) continue;
      if (board.squares[targetSquare].piece == 0 && directionIndex > 1) {
        if (board.lastMove == {}) continue;
        if (board.lastMove.targetSquare == targetSquare - this.PawnOffsets[0] * colourInverter && board.lastMove.startSquare == targetSquare + this.PawnOffsets[0] * colourInverter && board.lastMove.pieceMoved.type == Piece.Pawn) {
          isEnPassant = true;
        } else {
          continue;
        }
      }

      // Checks if the target square is a promotion square
      if (targetSquare < 8 || targetSquare > 55) {
        isPromotion = true;
      }

      this.PseudoLegalMoves.push(new Move(startSquare, targetSquare, isEnPassant, isPromotion));
    }
  }

  // Shows legal moves
  static GenerateMovesForCurrentPiece(startSquare) {
    let moves = this.GenerateLegalMoves();
    for (const move of moves) {
      if (move.startSquare != startSquare) continue;
      board.squares[move.targetSquare].legal = true;
    }
  }

  // Checks for checks lol
  static GenerateLegalMoves() {
    // Generate all possible movements for pieces
    let pseudoMoves = this.GenerateMoves();
    let legalMoves = new Array;

    // for move in moves
    for (const move of pseudoMoves) {
      if (this.TestMove(move.startSquare, move.targetSquare, pseudoMoves)) legalMoves.push(move);
    }
    
    // Return new legal moves array
    return legalMoves;
  }

  static TestMove(startSquare, targetSquare, moveList) {
    // Makes the move on the board
    board.makeMove(startSquare, targetSquare, moveList);

    // Generate the possible responses to our move
    let opponentResponses = this.GenerateMoves();

    for (const response of opponentResponses) {
      // If king is attacking
      if (board.squares[response.targetSquare].piece.type == Piece.King) {
        // Returns board to the current position
        board.unmakeMove();
        return false;
      }
    }

    // Returns board to the current position
    board.unmakeMove();
    return true;
  }

  static MoveGenerationTest(depth) {
    let moves = this.GenerateLegalMoves();
    if (depth == 1) {
      return moves.length;
    }
    let numPositions = 0;
    for (const move of moves) {
      board.makeMove(move.startSquare, move.targetSquare, moves);
      numPositions += this.MoveGenerationTest(depth - 1);
      board.unmakeMove();
    }
    return numPositions;
  }
}