class Board {
  constructor() {
    Board.PrecomputedMoveData();
    this.squares = new Array(64);

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

        this.NumSquaresToEdge[squareIndex] = {
          numNorth,
          numEast,
          numSouth,
          numWest,
          numNorEas: Math.min(numNorth, numEast),
          numSouEas: Math.min(numSouth, numEast),
          numSouWes: Math.min(numSouth, numWest),
          numNorEas: Math.min(numNorth, numWest)
        };
      }
    }
  }

  displaySquares(ctx) {
    if (!ctx) throw "Any display function requires a context!";

    for (const square of this.squares) {
      ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#c2e1c2" : "#7dcd85";
      if (square.selected == true) {
        ctx.fillStyle = (square.i + square.j) % 2 === 0 ? "#d2f1d2" : "#9deda5";
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
        if (square.i == 7 && square.j != 7) fen += "/"
      }
    }

    fen += this.turn == Piece.White ? " w" : " b";
    console.log(fen);
  }

  // Unselects every square
  unselectSquares() {
    for (const square of this.squares) {
      square.selected = false;
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

  makeMove(startingSquare, targetSquare) {
    console.log(`Starting Square: ${startingSquare.i + 1}, ${8 - startingSquare.j}. Target Square: ${targetSquare.i + 1}, ${8 - targetSquare.j}.`)
    // These functions check if the move is legal
    console.log("Move passes antogony check: " + this.checkAntagony(startingSquare, targetSquare));
    if (!this.checkAntagony(startingSquare, targetSquare)) return;
    if (!this.checkPieceMovement) return;

    startingSquare.piece.hasMoved = true;
    targetSquare.setPiece(startingSquare.piece);
    startingSquare.unset();

    this.turn = this.turn == Piece.White ? Piece.Black : Piece.White;
  }

  checkAntagony(startingSquare, targetSquare) {
    if (startingSquare.piece.colour == targetSquare.piece.colour) {
      return false;
    }
    return true;
  }

  checkPieceMovement(startingSquare, targetSquare) {
    switch (startingSquare.piece.type) {
      case 1:
        if (targetSquare.index == startingSquare.index)
        return true;
    }
  }
}