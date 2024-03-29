class Board {
  constructor() {
    Board.PrecomputedMoveData();
    this.squares = new Array(BOARD_SIZE);
    this.lastMove = {};
    this.playedMoves = [];
    this.winner;

    // Creates the board, i indicates squares from the left, j indicates squares from the top
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        this.squares[j * 8 + i] = new Square(i, j);
      }
    }

    // Default turn is white
    this.turn = Piece.White;
  }

  static NumSquaresToEdge = new Array(BOARD_SIZE);

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

  displaySquares() {
    for (const square of this.squares) {
      ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#c2e1c2" : "#7dcd85";
      if (square.selected == true) {
        ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#d3f2d3" : "#9eeea6";
      } else if (square.legal == true) {
        ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#ab746e" : "#bc857f";
      }
      ctx.fillRect(square.i * SQUARE_SIZE, square.j * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

      let img;
      switch (square.piece.type) {
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

  setStartingPosition(fen) {
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

    this.displaySquares(ctx);
  }

  // Generates a fen from the current position
  generateFenString() {
    let fen = "";
    let emptySquares = 0;

    // Sets the absolute position
    for (const square of this.squares) {
      if (!square.piece.type) {
        emptySquares++;

        if (square.i == 7) {
          fen += emptySquares;
          emptySquares = 0;
        }
      } else {
        if (emptySquares != 0) fen += emptySquares;
        emptySquares = 0;
        fen += Piece.pieceToChar(square.piece.type, square.piece.colour);
      }

      if (square.i == 7 && square.j != 7) fen += "/";
    }

    // Sets who starts
    fen += this.turn == Piece.White ? " w " : " b ";

    // Sets castling availability
    let whiteKing = this.squares[60];
    let blackKing = this.squares[4];
    if (whiteKing.piece.type == Piece.King && whiteKing.piece.moveCount == 0) {
      if (this.squares[63].piece.type == Piece.Rook && this.squares[63].piece.moveCount == 0 && this.squares[63].piece.colour == Piece.White) {
        fen += "K";
      }
      if (this.squares[56].piece.type == Piece.Rook && this.squares[56].piece.moveCount == 0 && this.squares[56].piece.colour == Piece.White) {
        fen += "Q";
      }
    }
    if (blackKing.piece.type == Piece.King && blackKing.piece.moveCount == 0) {
      if (this.squares[7].piece.type == Piece.Rook && this.squares[7].piece.moveCount == 0 && this.squares[7].piece.colour == Piece.Black) {
        fen += "k";
      }
      if (this.squares[0].piece.type == Piece.Rook && this.squares[0].piece.moveCount == 0 && this.squares[0].piece.colour == Piece.Black) {
        fen += "q";
      }
    }
    if (fen[fen.length - 1] == " ") {
      fen += "- ";
    }

    console.log(fen);
  }

  // Alternates the game turn, because it is code that has been written a lot
  alternateTurn() {
    this.turn = this.turn === Piece.White ? Piece.Black : Piece.White;
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

  makeMove(startSquare, targetSquare, moveList, playerMove = false) {
    // Acts as a switch to see if the move is legal or en passant
    let legalMove = false;
    let isEnPassant = false;
    let isPromotion = false;
    let isCastle = false;

    for (const move of moveList) {
      if (startSquare != move.startSquare) continue;
      if (targetSquare != move.targetSquare) continue;
      legalMove = true;
      if (this.squares[startSquare].piece.type == Piece.Pawn) {
        if (move.enPassant) isEnPassant = true;
        if (move.promotion) isPromotion = true;
      } else if (this.squares[startSquare].piece.type == Piece.King) {
        if (move.castle) isCastle = true;
      }
      break;
    } 

    if (legalMove) {
      // Pieces involved for move logging
      let pieceMoved = this.squares[startSquare].piece;
      let colourInverter = board.turn == Piece.White ? 1 : -1;
      let takenPiece = isEnPassant ? this.squares[targetSquare - Move.PawnOffsets[0] * colourInverter].piece : this.squares[targetSquare].piece;

      pieceMoved.moveCount++;
      this.squares[targetSquare].piece = this.squares[startSquare].piece;
      this.squares[startSquare].unset();

      if (this.squares[targetSquare].piece.type == Piece.Pawn) {
        if (isEnPassant) {
          this.squares[targetSquare - Move.PawnOffsets[0] * colourInverter].unset();
        } else if (isPromotion) {
          this.promotion(targetSquare, playerMove);
        }
      } else if (this.squares[targetSquare].piece.type == Piece.King && (targetSquare == startSquare - 2 || targetSquare == startSquare + 2)) {
        this.castle(targetSquare);
      }

      this.lastMove = {
        startSquare: startSquare, 
        targetSquare: targetSquare,
        pieceMoved: pieceMoved,
        takenPiece: takenPiece,
        isEnPassant: isEnPassant,
        isPromotion: isPromotion,
        isCastle: isCastle
      };
      this.playedMoves.push(this.lastMove);

      this.alternateTurn();
    }
  }

  // Reverses a move
  unmakeMove() {
    // Error checking if no moves have been played
    if (this.playedMoves.length == 0 || !this.lastMove.hasOwnProperty("startSquare")) return;
    
    // Set target square (or en passant square) piece to taken piece
    if (this.lastMove.takenPiece == 0) {
      this.squares[this.lastMove.targetSquare].unset();
    } else if (!this.lastMove.isEnPassant) {
      this.squares[this.lastMove.targetSquare].piece = this.lastMove.takenPiece;
    } else {
      let colourInverter = this.turn === Piece.White ? -1 : 1;
      this.squares[this.lastMove.targetSquare - Move.PawnOffsets[0] * colourInverter].piece = this.lastMove.takenPiece;
      this.squares[this.lastMove.targetSquare].unset();
    }

    // Alternate whos turn it is and decrease the turn count for that piece
    this.alternateTurn();
    this.lastMove.pieceMoved.moveCount--;

    // Check for castling
    if (this.lastMove.isCastle) {
      // Move rook left 3 or right 2
      let startRookSquare = this.squares[this.lastMove.targetSquare].i == 2 ? this.lastMove.targetSquare - 2 : this.lastMove.targetSquare + 1;
      let currentRookSquare = this.squares[this.lastMove.targetSquare].i == 2 ? this.lastMove.targetSquare + 1 : this.lastMove.targetSquare - 1;

      this.squares[startRookSquare].piece = this.squares[currentRookSquare].piece;
      this.squares[currentRookSquare].unset();
    }

    // Set start square piece to target square piece
    this.squares[this.lastMove.startSquare].piece = this.lastMove.pieceMoved;

    // Remove move from played move list and set last move to previous move
    this.playedMoves.pop();
    this.lastMove = this.playedMoves.length == 0 ? {} : this.playedMoves[this.playedMoves.length - 1];
  }

  promotion(targetSquare, playerMove) {
    let newPiece = -1;

    if (!playerMove) {
      board.squares[targetSquare].setPiece(new Piece(this.turn, Piece.Queen));
      return;
    }

    while (newPiece != 'q' && newPiece != 'b' && newPiece != 'n' && newPiece != 'r' && newPiece != null && newPiece != "") {
      newPiece = prompt("What piece would you like to promote to? \nType (in lower case) the first letter of the piece you would like to promote to. \nIf that piece is a Knight, type 'n' \nThe default piece is a queen.");
    }

    if (newPiece == null || newPiece == "") newPiece = 'q';

    newPiece = this.turn == Piece.White ? newPiece.toUpperCase() : newPiece.toLowerCase();
    board.squares[targetSquare].setPiece(newPiece);
  }

  castle(targetSquare) {
    if (this.squares[targetSquare].i == 2) {
      this.squares[targetSquare + Move.DirectionOffsets[1]].piece = this.squares[targetSquare + Move.DirectionOffsets[3] * 2].piece;
      this.squares[targetSquare + Move.DirectionOffsets[3] * 2].unset();
    } else {
      this.squares[targetSquare + Move.DirectionOffsets[3]].piece = this.squares[targetSquare + Move.DirectionOffsets[1]].piece;
      this.squares[targetSquare + Move.DirectionOffsets[1]].unset();
    }
  }

  checkWinCondition() {
    // Checks for legal moves
    if (legalMoves.length != 0) return;

    // Inverts turn to see if there is an attack on the king
    this.alternateTurn();
    let moves = Move.GenerateLegalMoves();
    for (const move of moves) {
      if (this.squares[move.targetSquare].piece.type == Piece.King) {
        this.winner = this.turn == Piece.White ? "White" : "Black";
        alert(this.winner + " wins! Great Game!");
        this.alternateTurn();
        return;
      }
    }
    
    this.alternateTurn();
    this.winner = "Draw";
    alert("Stalemate! The games a draw!");

    if (timerID) clearInterval(timerID);
  }
}