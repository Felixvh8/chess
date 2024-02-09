class Board {
  constructor() {
    Board.PrecomputedMoveData();
    this.squares = new Array(64);
    this.lastMove = {};
    this.playedMoves = [];

    // Creates the board, i indicates squares from the left, j indicates squares from the top
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        this.squares[j * 8 + i] = new Square(i, j);
      }
    }

    // Default turn is white
    this.turn = Piece.White;
  }

  static NumSquaresToEdge = new Array(64);

  static PrecomputedMoveData() {
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        let numNorth = j;
        let numEast = 7 - i;
        let numSouth = 7 - j;
        let numWest = i;

        let squareIndex = (j * 8) + i;

        this.NumSquaresToEdge[squareIndex] = [
          numNorth,
          numEast,
          numSouth,
          numWest,
          Math.min(numNorth, numEast),
          Math.min(numSouth, numEast),
          Math.min(numSouth, numWest),
          Math.min(numNorth, numWest)
        ];
      }
    }
  }

  displaySquares(ctx) {
    if (!ctx) throw "Any display function requires a context!";

    for (const square of this.squares) {
      ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#c2e1c2" : "#7dcd85";
      if (square.selected == true) {
        ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#d2f1d2" : "#9deda5";
      } else if (square.legal == true) {
        ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#ab746e" : "#bc857f";
      }
      ctx.fillRect(square.i * SQUARE_SIZE, square.j * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

      let img;
      switch (square.piece.type) {
        case 0:
          break;
        case 1:
          img = square.piece.colour == Piece.White ? document.getElementById("kwhite") : document.getElementById("kblack");
          break;
        case 2:
          img = square.piece.colour == Piece.White ? document.getElementById("qwhite") : document.getElementById("qblack");
          break;
        case 3:
          img = square.piece.colour == Piece.White ? document.getElementById("bwhite") : document.getElementById("bblack");
          break;
        case 4:
          img = square.piece.colour == Piece.White ? document.getElementById("nwhite") : document.getElementById("nblack");
          break;
        case 5:
          img = square.piece.colour == Piece.White ? document.getElementById("rwhite") : document.getElementById("rblack");
          break;
        case 6:
          img = square.piece.colour == Piece.White ? document.getElementById("pwhite") : document.getElementById("pblack");
          break;
        default:
          break;
      }
      if (img) ctx.drawImage(img, square.i * 50 + 2, square.j * 50);
    }
  }

  setStartingPosition(fen, ctx) {
    if (!ctx) throw "Any display function requires a context!";
    let boardFen = fen.split(" ")[0];
    let arr = boardFen.split("");
    let index = 0;

    // Iterates over the board fen to place pieces accordingly
    for (const char of arr) {
      let c = parseInt(char, 10);

      if (typeof c === "number" && c > 0) {
        for (let i = 0; i < c; i++) {
          this.squares[index].unset();
          index++;
        }
      } else if (char == "/") {
        continue;
      } else {
        this.squares[index].setPiece(char);
        index++;
      }
    }

    // Sets whose turn it is when the game starts form the FEN position
    this.turn = fen.split(" ")[1] == "w" ? Piece.White : Piece.Black;
  }

  // Generates a fen from the current position
  generateFenString() {
    let fen = "";
    let emptySquares = 0;

    for (const square of this.squares) {

      if (square.empty) {
        emptySquares++;

        if (square.i == 7) {
          fen += square.j == 7 ? emptySquares : emptySquares + '/';
          emptySquares = 0;
        }

      } else {
        if (emptySquares != 0) fen += emptySquares;
        emptySquares = 0;
        fen += Piece.pieceToChar(square.piece.type, square.piece.colour);
        if (square.i == 7 && square.j != 7) fen += "/";
      }
    }

    fen += this.turn == Piece.White ? " w" : " b";
    console.log(fen);
  }

  // Unselects every square
  unselectSquares() {
    for (const square of this.squares) {
      square.selected = false;
      square.legal = false;
    }
    selectedSquares = [];
  }

  // Returns the clicked house
  getSelectedSquare(canvas, e) {
    const obj = this.getCursorPosition(canvas, e);
    if (obj == null) {
      this.unselectSquares();
      return null;
    }
    const x = Math.floor(obj.x / 50);
    const y = Math.floor(obj.y / 50);
    const index = (y * 8) + x;
    if (this.squares[index]) {
      this.squares[index].selected = true;
      selectedSquares.push(this.squares[index]);
    }
    return this.squares[index] || false;
  }

  getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x > canvas.width || y > canvas.height) return null;
    const result = {
      x: x,
      y: y
    }
    return result;
  }

  makeMove(startSquare, targetSquare) {
    console.log(`Starting Square: ${startSquare.i + 1}, ${8 - startSquare.j}. Target Square: ${targetSquare.i + 1}, ${8 - targetSquare.j}.`);
    // Acts as a switch to see if the move is legal or en passant
    let legalMove = false;
    let isEnPassant = false;
    let isPromotion = false;
    let isCastle = false;

    for (const move of Move.PseudoMoves) {
      if (startSquare.index != move.startSquare) continue;
      if (targetSquare.index != move.targetSquare) continue;
      legalMove = true;
      if (startSquare.piece.type == Piece.Pawn) {
        if (move.enPassant) isEnPassant = true;
        if (move.promotion) isPromotion = true;
      } else if (startSquare.piece.type == Piece.King) {
        if (move.castle) isCastle = true;
      }
      break;
    } 

    if (legalMove) {
      // Pieces involved for move logging
      let pieceMoved = startSquare.piece;
      let colourInverter = board.turn == Piece.White ? 1 : -1;
      let takenPiece = isEnPassant ? this.squares[targetSquare.index - Move.PawnOffsets[0] * colourInverter].piece : targetSquare.piece;

      startSquare.piece.hasMoved = true;
      targetSquare.setPiece(startSquare.piece);
      startSquare.unset();

      if (targetSquare.piece.type == Piece.Pawn) {
        if (isEnPassant) {
          this.squares[targetSquare.index - Move.PawnOffsets[0] * colourInverter].unset();
        } else if (isPromotion) {
          this.promotion(targetSquare,  newPiece);
        }
      } else if (targetSquare.piece.type == Piece.King && (targetSquare.index == startSquare.index - 2 || targetSquare.index == startSquare.index + 2)) {
        this.castle(targetSquare);
      }

      this.lastMove = {
        startSquare: startSquare.index, 
        targetSquare: targetSquare.index,
        pieceMoved: pieceMoved,
        takenPiece: takenPiece,
        isEnPassant: isEnPassant,
        isPromotion: isPromotion,
        isCastle: isCastle
      };
      this.playedMoves.push(this.lastMove);

      this.turn = this.turn == Piece.White ? Piece.Black : Piece.White;
      Move.GenerateMoves();
    }
  }

  /*
  makeMove(startSquare, targetSquare) {
    
  }
  */

  // Reverses a move
  unmakeMove() {
    // Error checking if no moves have been played
    if (this.playedMoves.length == 0 || !this.lastMove.hasOwnProperty("startSquare")) return;
    
    // Set target square (or en passant square) piece to taken piece
    if (!this.lastMove.isEnPassant) {
      this.squares[this.lastMove.targetSquare].piece = this.lastMove.takenPiece;
      this.squares[this.lastMove.targetSquare].empty = this.squares[this.lastMove.targetSquare].piece == 0 ? true : false;
    } else {
      let colourInverter = this.turn === Piece.White ? 1 : -1;
      this.squares[this.lastMove.targetSquare - Move.PawnOffsets[0] * colourInverter].piece = this.lastMove.takenPiece;
    }

    // Alternate whos turn it is
    this.turn = this.turn == Piece.White ? Piece.Black : Piece.White;

    // Check for castling
    if (this.lastMove.isCastle) {
      // Move rook left 3 or right 2
      let startRookSquare = this.squares[this.lastMove.targetSquare].i == 2 ? this.lastMove.targetSquare - 2 : this.lastMove.targetSquare + 1;
      let currentRookSquare = this.squares[this.lastMove.targetSquare].i == 2 ? this.lastMove.targetSquare + 1 : this.lastMove.targetSquare - 1;

      this.squares[startRookSquare].piece = this.squares[currentRookSquare].piece;
      this.squares[currentRookSquare].unset();
      this.lastMove.pieceMoved.hasMoved = false;
    }

    // Set start square piece to target square piece
    this.squares[this.lastMove.startSquare].piece = this.lastMove.pieceMoved;

    // Remove move from played move list and set last move to previous move
    this.playedMoves.pop();
    this.lastMove = this.playedMoves.length == 0 ? {} : this.playedMoves[this.playedMoves.length - 1];
  }

  promotion(targetSquare) {
    let newPiece = -1;

    while (newPiece != 'q' && newPiece != 'b' && newPiece != 'n' && newPiece != 'r' && newPiece != null && newPiece != "") {
      newPiece = prompt("What piece would you like to promote to? \nType (in lower case) the first letter of the piece you would like to promote to. \nThe default piece is a queen. \nIf that piece is a Knight, type 'n'");
    }

    if (newPiece == null || newPiece == "") newPiece = 'q';

    newPiece = this.turn == Piece.White ? input.toUpperCase() : input.toLowerCase();
    board.squares[targetSquare.index].setPiece(input);
  }

  castle(targetSquare) {
    if (targetSquare.i == 2) {
      this.squares[targetSquare.index + Move.DirectionOffsets[1]].piece = this.squares[targetSquare.index + Move.DirectionOffsets[3] * 2].piece;
      this.squares[targetSquare.index + Move.DirectionOffsets[3] * 2].unset();
    } else {
      this.squares[targetSquare.index + Move.DirectionOffsets[3]].piece = this.squares[targetSquare.index + Move.DirectionOffsets[1]].piece;
      this.squares[targetSquare.index + Move.DirectionOffsets[1]].unset();
    }
  }
}