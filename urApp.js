//Main node.js server file

// Constants to specify the difficulty level for the AI to choose the next move for computer
const easyDifficultyLevel = 0;
const mediumDifficultyLevel = 1;
const hardDifficultyLevel = 2;

// const moveDepth = 3; //number of moves to look ahead for hard difficulty play level
const numberGameSimulations = 500;
const numberTurnsToSimulate = 10;

const humanPlayer = 1;
const aiPlayer = 2;

const startSpace = -1 //game space number for pieces off the board

const numDice = 4;

//Game board space indeces for player 1 (human) and player 2 (the computer)
const player1IndexMap = [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20];
const player2IndexMap = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 21];

const maxGamePieces = 7;
// const maxGameSpacesOnBoard = 20;

class GameBoard {

  constructor(gameBoardArray, humanPlayerPiecesHome, aiPlayerPiecesHome, player) {
    this.gameBoardArray = [];
    this.gameBoardArray = gameBoardArray;
    // console.log("In constructor: gameBoardArray is ", this.gameBoardArray);
    this.possibleMovesArray = [];
    this.humanPlayerPiecesHome = humanPlayerPiecesHome;
    this.aiPlayerPiecesHome = aiPlayerPiecesHome;
    this.whoseTurn = player;
    this.boardScore = 0;

  } //constructor

  generatePossibleMovesArray() {
    //Create an array of possible moves by examining those identified in the gameBoardArray
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      if (this.gameBoardArray[i].canBeMovedTo) {
        // movesAvailable += 1;
        this.possibleMovesArray.push(this.gameBoardArray[i].spaceNumber);
      }
    } //for
  } //generatePossibleMovesArray

  setBoardScore() {
    // Provides a score for the input game board
    // The score is based on the difference in the  number of gameboard paces each
    // player's pieces have traveled, favoring the computer:
    // computer score - human player score
    // Each player's score is determined by determining the number of gameboard spaces each piece has traveled
    // A piece not yet on the board has traveled 0; a piece that has made it home as traveled 15;
    // A piece on the board has traveled its location within the board

    var humanPlayerScore = 0;
    var aiPlayerScore = 0;

    // Determine spaces moved for each piece on the board
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      if (this.gameBoardArray[i].playerOnSpace === humanPlayer) {
        humanPlayerScore += player1IndexMap.indexOf(this.gameBoardArray[i].spaceNumber) + 1;

      } else if (this.gameBoardArray[i].playerOnSpace === aiPlayer) {
        aiPlayerScore += player2IndexMap.indexOf(this.gameBoardArray[i].spaceNumber) + 1;

      }

    } //for

    // Add in spaces traveled for pieces off the board
    humanPlayerScore += this.humanPlayerPiecesHome * player1IndexMap.length;
    aiPlayerScore += this.aiPlayerPiecesHome * player2IndexMap.length;

    // Save the board score in the class object
    // The board score is number of spaces moved for ai = number of spaces moved for human
    // Bigger number favors ai
    this.boardScore = aiPlayerScore - humanPlayerScore;
    return this.boardScore;
    // console.log("In setBoardScore; ai score = " + aiPlayerScore + ", human score = " + humanPlayerScore);
    // console.log("In setBoardScore: gameboard is ", this.gameBoardArray);
    // console.log("In setBoardScore: score for this gameBoard is: " + this.boardScore);

  } //setBoardScore

  isGameOver() {
    // Return true if game is over (one player has all the pieces home; otherwise return false)

    return (this.aiPlayerPiecesHome === maxGamePieces || this.humanPlayerPiecesHome === maxGamePieces);

  } //isGameOver

  determinePossibleMoves(player, diceRoll) {

    // Loop through the board and see if current pieces on the board can move
    // (keeping track of how many pieces are on the board)
    var numPiecesOnBoard = 0;

    var indexMapToUse = [];
    var otherPlayer = 0;

    if (player === humanPlayer) {
      indexMapToUse = player1IndexMap;
      otherPlayer = aiPlayer;

    } else {
      indexMapToUse = player2IndexMap;
      otherPlayer = humanPlayer;
    }
    // console.log("In determinePossibleMoves " + player + ", dice roll " + diceRoll);

    // Loop through pieces already on board for this player and mark spaces they can move to
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      // console.log("In determinePossibleMoves loop i is " + i + " game board array row is ", this.gameBoardArray[i]);
      if (this.gameBoardArray[i].playerOnSpace === player) {
        // We've found a piece for the input player
        // Keep track of number of pieces we have on the board
        numPiecesOnBoard += 1;

        // See what would happen if we move it the number our dice gave us

        // Get the game board space index we might be able to move to
        // Get our current space value, and where numerically we are in our path
        var gameSpaceNumber = this.gameBoardArray[i].spaceNumber;
        var positionInPath = indexMapToUse.indexOf(this.gameBoardArray[i].spaceNumber);
        var newPositionInPath = positionInPath + diceRoll;
        // console.log("In determinePossibleMoves: diceRoll = " + diceRoll + " gameSpaceNumber = " + gameSpaceNumber + ", positionInPath = " + positionInPath + ", newPositionInPath = " + newPositionInPath);

        // Can only consider this piece if moving it doesn't push us past the end of the board
        if (newPositionInPath < indexMapToUse.length) {
          // So far we know that this doesn't move us illegally passed the edge of the board.

          // Get the game space number for this space
          var newGameSpaceNumber = indexMapToUse[newPositionInPath];

          // We can consider this space if we aren't already on it.
          if (this.gameBoardArray[i].playerOnSpace !== player) {

            // We can't move here if this is a rosette AND the opponent has a piece on this space
            if (this.gameBoardArray[i].isRosette && this.gameBoardArray.playerOnSpace === otherPlayer) {
              // We can't go here - rosette and other player
              this.gameBoardArray[i].canBeMovedTo = false;

            } else {
              // We should be able to move here - it isn't a rosette with the other player on it
              this.gameBoardArray[i].canBeMovedTo = true;
              this.gameBoardArray[i].potentialPreviousSpaceNumber = gameSpaceNumber;

            }
          } // we aren't already on space

        } // we aren't already on space

      } else {
        //We are already on ths space - can't move here
        this.gameBoardArray[i].canBeMovedTo = false;

      }
    } //for

    //Check if a piece off the board can move
    var piecesAtStart = 0;
    if (player === humanPlayer) {
      piecesAtStart = maxGamePieces - numPiecesOnBoard - this.humanPlayerPiecesHome;

    } else {
      piecesAtStart = maxGamePieces - numPiecesOnBoard - this.aiPlayerPiecesHome;
    }

    if (piecesAtStart > 0) {
      //Another possibility is to move one of our start pieces - see if it can move...
      // Get the game space number for this space - we will be in our "safe" zone, so
      // less checking required
      var newGameSpaceNumber = indexMapToUse[diceRoll - 1];

      // If we aren't already on this piece, we can move here
      if (this.gameBoardArray[newGameSpaceNumber].playerOnSpace !== player) {
        this.gameBoardArray[newGameSpaceNumber].canBeMovedTo = true;
        this.gameBoardArray[newGameSpaceNumber].potentialPreviousSpaceNumber = startSpace;

      } else {
        this.gameBoardArray[newGameSpaceNumber].canBeMovedTo = false;
      }
    }

  } //determinePossibleMoves


  movePiece(player, diceRoll) {
    // Move a piece on this game board for the input player the number of spaces given in diceRoll
    // Return TRUE if same player needs to go again (due to rosette)

    // var indexMapToUse = [];
    // var otherPlayer = 0;
    //
    // if (player === humanPlayer) {
    //   indexMapToUse = player1IndexMap;
    //   otherPlayer = aiPlayer;
    //
    // } else {
    //   indexMapToUse = player2IndexMap;
    //   otherPlayer = humanPlayer;
    // }

    // Mark possible moves on this game board for this player based on a given dice roll
    // console.log("In movePiece for player " + player + ", dice roll " + diceRoll);
    var goAgain = false;

    if (diceRoll > 0) {
      this.determinePossibleMoves(player, diceRoll);

      // Create an array of possible moves
      this.generatePossibleMovesArray();

      //Use the "medium" difficulty algorithm to pick which piece to move
      var nextMove = findNextSpaceMediumDifficulty(this, player);
      if (nextMove !== -1) {
        // Valid move found. Move the piece to the space.
        // The return value is true if we landed on a rosette (tells caller to go again with same player)
        goAgain = this.moveTo(nextMove, player);
      }
    }
    // } else {
    //   goAgain = false;
    // }

    return goAgain;

  } //movePieceBasedOnDiceRoll

  moveTo(nextMove, player) {
    // Move to the game space number indicated by nextMove for the input player
    // console.log("In moveTo: nextMove is " + nextMove + ", player is " + player);
    var goAgain = false;

    var indexMapToUse = [];
    var otherPlayer = 0;

    if (player === humanPlayer) {
      indexMapToUse = player1IndexMap;
      otherPlayer = aiPlayer;

    } else {
      indexMapToUse = player2IndexMap;
      otherPlayer = humanPlayer;
    }

    //Get the starting game space index
    var startingGameSpaceIndex = this.gameBoardArray[nextMove].potentialPieceNumber;

    //Move to the nextMove space
    if (startingGameSpaceIndex !== startSpace) {
      // The piece we are moving is already on the board; reset the values for the space we are starting from
      this.gameBoardArray[startingGameSpaceIndex].playerOnSpace = 0;
      this.gameBoardArray[startingGameSpaceIndex].canBeMovedTo = false;
      this.gameBoardArray[startingGameSpaceIndex].potentialPieceNumber = startSpace;
      this.gameBoardArray[startingGameSpaceIndex].potentialPreviousSpaceNumber = startSpace;
      this.gameBoardArray[startingGameSpaceIndex].pieceNumber = startSpace;

    } else {
      //Not already on the board - nothing to do (?)

    }

    //Determine if we are moving off the board or not
    if (nextMove === indexMapToUse[indexMapToUse.length - 1]) {

      //Moving piece off the game board
      if (player === humanPlayer) {
        this.humanPlayerPiecesHome += 1;
      } else {
        this.aiPlayerPiecesHome += 1;
      }

    } else {
      //piece is still on the game board

      //If there is another player on the space, send them home!
      if (this.gameBoardArray[nextMove].playerOnSpace === otherPlayer) {

        // What do I do here?  Anything??

      }

      // remember this new space index on the game board
      // this.gameBoardSpaceIndex = gameBoardSpaceIndex;

      //Remember which player is on the space associated with this piece.
      this.gameBoardArray[nextMove].playerOnSpace = player;

      //Reset other game board space properties
      this.gameBoardArray[nextMove].canBeMovedTo = false;
      this.gameBoardArray[nextMove].potentialPieceNumber = startSpace;
      this.gameBoardArray[nextMove].potentialPreviousSpaceNumber = startSpace;

      //Remember which piece this is in the game piece array
      // var gamePieceArray = game.getGamePieceArray();
      // game.gameBoard[this.gameBoardSpaceIndex].pieceNumber = gamePieceArray.indexOf(this);
      //
      // game.gameBoard[this.gameBoardSpaceIndex].showPlayerGamePiece(this.player);

    } //game piece still on board

    //WHAT DO WE DO IF WE MOVED TO A ROSETTE - AUTO GO AGAIN??
    if (this.gameBoardArray[nextMove].isRosette) {

      goAgain = true;

    } //landed on a rosette

    return goAgain;
  }

} //GameBoard class


// Server stuff
const express = require("express");
const port = 3000;
const app = express();

app.use(express.static("public")); //NEED??
app.use(express.static(__dirname + "/"));

//Need this to see the json in the body!!  This replaces the whole body-parser thing.
app.use(express.json());

app.get("/", function(req, res) {
  // res.send("Hello");
  res.sendFile(__dirname + "/index.html");
});

app.post("/nextMove", function(req, res) {
  //Receive client request to choose the computer's next game space to move to
  //The difficulty level and the game board will be passed in from the client
  //The server will return the game space number the computer should move to

  console.log("app post called");
  // console.log("Request.body: ", req.body);
  //req.body doesn't need to be parsed - already converted back to javascript object
  var data = req.body;
  // console.log(data);
  var difficultyLevel = data.difficulty;
  var gameBoard = new GameBoard(data.gameBoardArray, data.player1PiecesHome, data.player2PiecesHome, aiPlayer);
  gameBoard.generatePossibleMovesArray();

  // //TEMP TESTING
  // gameBoard.setBoardScore();

  // var gameBoardArray = data.gameBoardArray;
  // playerPiecesHome.player1PiecesHome = data.player1PiecesHome;
  // playerPiecesHome.player2PiecesHome = data.player2PiecesHome;
  console.log("Difficulty: " + difficultyLevel);
  console.log("num home player 1: ", gameBoard.humanPlayerPiecesHome, "num home player 2: ", gameBoard.aiPlayerPiecesHome);
  console.log("Length: ", gameBoard.gameBoardArray.length);

  console.log("Possible Moves: ", gameBoard.possibleMovesArray);

  var nextMove = -1;

  // DON'T NEED BECAUSE DEFAULT MOVE IS -1
  // if (possibleMovesArray.length < 1) {
  //   //No possible next move
  //   nextMove = -1;
  //
  // } else
  if (gameBoard.possibleMovesArray === 0) {
    //Shouldn't happen??
    console.log("In post for /nextMove - no possible moves");
    return nextMove;
  } //weird case

  if (gameBoard.possibleMovesArray.length === 1) {
    //Only one possible move - use that.
    nextMove = gameBoard.possibleMovesArray[0];

  } else {
    //More than 1 possible move.  Decide based on difficulty level we are using
    if (difficultyLevel === easyDifficultyLevel) {
      //Randomly pick which move to use
      nextMove = gameBoard.possibleMovesArray[getRandomInt(gameBoard.possibleMovesArray.length - 1)];

    } else if (difficultyLevel === mediumDifficultyLevel) {
      //TBD  medium difficulty processing
      nextMove = findNextSpaceMediumDifficulty(gameBoard, aiPlayer);

    } else {
      //hard difficulty processing
      nextMove = findNextSpaceHardDifficulty(gameBoard);

    }
  } //more than one possible next move

  // console.log("JSON parse: ", JSON.parse(req.body));
  // var gameBoardArray = JSON.parse(req.body);
  // console.log(gameBoardArray);

  // var dataArray = JSON.parse(req.body);
  // console.log("Data? ", JSON.parse(req.data));
  var response = {
    // result: "success",
    // message: "next move found",
    nextMove: nextMove
  }
  // res.write("string");
  res.send(response);
  // console.log("Response: ", res);
});


function getRandomInt(max) {
  // Return a random integer between 0 and max
  var randomNumber = Math.floor(Math.random() * (max + 1));
  // console.log("In getRandomInt: " + randomNumber);
  return randomNumber;

} //getRandomInt

function rollGameDice() {
  //Roll the 4 game dice; return the sum of the rolls
  var diceRoll = 0;

  for (var i = 0; i <= numDice; i++) {
    diceRoll += getRandomInt(1);
  }

  // console.log("In rollGameDice: roll is " + diceRoll);
  return diceRoll;

} //rollGameDice


function findNextSpaceMediumDifficulty(gameBoard, player) {
  //Function to choose the next move based on where highest priority pieces are
  //If more than one piece meets the highest priority conditions, then it randomly chooses which move
  //within the priority, unless it's in priority 3, in which case the move closest to home wins.
  //Priorities:
  //One:  If a space is occupied by the other player, or is a rosette
  //Two:  Piece goes home
  //Three: Piece in "safe" zone (past shared spaces)  or put a new piece on the board (right priority?)
  //Four: Piece closest to home
  var possibleMovesArray = gameBoard.possibleMovesArray;
  var gameBoardArray = gameBoard.gameBoardArray;
  var priorityOneArray = [];
  var priorityTwoArray = [];
  var priorityThreeArray = [];
  var priorityFourArray = [];
  var indexMapToUse = [];

  // Need to consider case where we have no or only one possible move (can happen during game simulations)
  if (possibleMovesArray.length < -0) {
    return -1;
  }
  if (possibleMovesArray.length === 1) {
    return possibleMovesArray[0];
  }

  if (player === humanPlayer) {
    indexMapToUse = player1IndexMap;
  } else {
    indexMapToUse = player2IndexMap;
  };

  //Go through the possibleMovesArray and prioritize based on where the piece would go
  for (var i = 0; i < possibleMovesArray.length; i++) {
    // console.log("In findNextSpaceMediumDifficulty loop, player is:", player, ", possible moves: ", possibleMovesArray[i], gameBoardArray[possibleMovesArray[i]].potentialPieceNumber);

    if (gameBoardArray[possibleMovesArray[i]].isRosette || gameBoardArray[possibleMovesArray[i]].playerOnSpace) {
      //This space is a rosette or the other player is on the space - this is a priority one move
      priorityOneArray.push(possibleMovesArray[i]);

    } else if (possibleMovesArray[i] === indexMapToUse[indexMapToUse.length - 1]) {
      //Piece would go home
      priorityTwoArray.push(possibleMovesArray[i]);

    } else if (indexMapToUse.includes(possibleMovesArray[i], (indexMapToUse.length - 2)) || gameBoardArray[possibleMovesArray[i]].potentialPreviousSpaceNumber === -1) {
      //Piece would be in the "safe" zone OR it is a piece currently not on the board
      priorityThreeArray.push(possibleMovesArray[i]);

    } else {
      //Put the move in the fourth array - we'll eventually chose the one closest to home.
      priorityFourArray.push(possibleMovesArray[i]);
    }
  } //for

  if (priorityOneArray.length > 0) {
    //We have a priority one level move
    // console.log("Before call to pickMoveFromPriorityArray with priorityOneArray: ", priorityOneArray);
    return pickMoveFromPriorityArray(priorityOneArray);

  } else if (priorityTwoArray.length > 0) {
    // console.log("Before call to pickMoveFromPriorityArray with priorityTwoArray: ", priorityTwoArray);
    return pickMoveFromPriorityArray(priorityTwoArray);

  } else if (priorityThreeArray.length > 0) {
    // console.log("Before call to pickMoveFromPriorityArray with priorityThreeArray: ", priorityThreeArray);
    return pickMoveFromPriorityArray(priorityThreeArray);

  } else if (priorityFourArray.length > 0) {
    //Pick the array item closest to home
    // console.log("Before max pick from priorityFourArray: ", priorityFourArray);
    return Math.max.apply(null, priorityFourArray);

  } else {
    //Something weird happened if we got here - shouldn't happen
    console.log("In findNextSpaceMediumDifficulty:  no possible moves added to any array ");
    return -1;
  }

} //findNextSpaceMediumDifficulty


function pickMoveFromPriorityArray(priorityArray) {
  //Given the input priority array which should contain 1 or more elements,
  //pick one of the elements at random (or the only element if that's all we have)
  if (priorityArray.length > 1) {
    //More than one priority move.  Pick one at random (?)
    nextMove = priorityArray[getRandomInt(priorityArray.length - 1)];

  } else {
    //Only one possible priority one move
    nextMove = priorityArray[0];
  }

  return nextMove;

} //pickMoveFromPriorityArray

function findNextSpaceHardDifficulty(gameBoard) {

  // Move based on monte carlo simulation results
  // Simulate game play m times looking ahead n moves

  // We only get here if there is more than one move so don't have to worry about trivial case of one (or no) possible move
  // (constants for number of simulations and number of moves is at top of file)

  // Initialize
  var nextMove = -1;
  var simGameResults = [];

  for (var i = 0; i < gameBoard.possibleMovesArray.length; i++) {
    //Simulate a game for a defined number of moves or if it ends - remember game score at end ...
    //Create a new game board to run the simulation based on the input gameboard
    // console.log("In findNextSpaceHardDifficulty for possible move " + gameBoard.possibleMovesArray[i]);

    var possibleMoveScoreResults = [];

    for (var j = 0; j < numberGameSimulations; j++) {
      // console.log("In findNextSpaceHardDifficulty simulating game loop, j is " + j);
      // Create a game board based on the input game board that we will use in the game simulations
      var simGameBoard = new GameBoard(gameBoard.gameBoardArray, gameBoard.humanPlayerPiecesHome, gameBoard.aiPlayerPiecesHome, aiPlayer);
      simGameBoard.generatePossibleMovesArray();

      //Have the ai make it's ith possible move, that is, determine results if we make this choice of move...
      simGameBoard.moveTo(gameBoard.possibleMovesArray[i], aiPlayer);

      //Now simulate other moves (or to the end of the game)
      var rollAgain = true;
      var gameEnded = false;

      for (k = 0; k < numberTurnsToSimulate; k++) {
        // console.log("In findNextSpaceHardDifficulty simulating turns loop, k is " + k);
        //for this turn, simulate the human player moving and then the ai moving
        gameEnded = takeTurn(simGameBoard, humanPlayer);

        if (gameEnded) {
          // Game is over; no more turn taking
          // console.log("In findNextSpaceHardDifficulty: game ended after HUMAN turn in game sim ");
          break;

        } else {
          // Give other player a turn
          gameEnded = takeTurn(simGameBoard, aiPlayer);

          if (gameEnded) {
            //Game is over; no more turn taking
            // console.log("In findNextSpaceHardDifficulty: game ended after AI turn in game sim ");
            break;
          }
        }

      } //for (simulate game moves)

      // Save the game board score for later comparison
      simGameBoard.setBoardScore();
      possibleMoveScoreResults.push(simGameBoard.boardScore);
      console.log("In findNextSpaceHardDifficulty; move results scores array: ", possibleMoveScoreResults);
    } // for game simulation loop

    // Average up the game board scores for this move path
    var avg = 0;
    for (m = 0; m < possibleMoveScoreResults.length; m++) {
      avg += possibleMoveScoreResults[m];
    }
    avg = avg / possibleMoveScoreResults.length;
    //Save the average for this path
    simGameResults.push(avg);
    // console.log("In findNextSpaceHardDifficulty; simGameResults array: ", simGameResults);
  } // for possible moves

  //Return the game space index of the move path that gave us the best (highest) results
  // var maxFromSimGameResults = simGameResults.indexOf(Math.max.apply(null, simGameResults));
  var nextMove = gameBoard.possibleMovesArray[simGameResults.indexOf(Math.max.apply(null, simGameResults))];
  console.log("In findNextSpaceHardDifficulty; possible moves: ", gameBoard.possibleMovesArray);
  console.log("In findNextSpaceHardDifficulty; max score: ", Math.max.apply(null, simGameResults), " possible moves array index: ", simGameResults.indexOf(Math.max.apply(null, simGameResults)));
  console.log("In findNextSpaceHardDifficulty: returning nextMove: " + nextMove);
  return nextMove;

} //findNextSpaceHardDifficulty


function takeTurn(gameBoard, player) {
  //Have the input player take a turn on the input game board

  var rollAgain = true;
  // var diceRoll = 0;
  while (rollAgain) {
    // diceRoll = rollGameDice();
    rollAgain = gameBoard.movePiece(player, rollGameDice());

  }

  // Return true if this turn ended the game; otherwise return false
  return gameBoard.isGameOver();

} //takeTurn

// function minimax(gameBoardArray, possibleMovesArray, depth, maxPlayer) {
//   // Determine the next best move for the input game board and possible moves array for the input player
//   // Depth indicates how many moves ahead we want to check
//   // Return the reconfigured gameboard as well as a "rating" for the goodness of a move
//
//   //The player can have 4 possible moves depending on the dice roll.
//   var nextMove = -1;
//   var moveRatingScore = 0;
//
//   if (depthLevel === 0 || isGameOver()) {
//     // we are at the bottom depth level or this move ends the game (?)
//     // Return the heuristic value of this node (use medium difficulty logic to help here )
//     nextMove = findNextSpaceMediumDifficulty(gameBoardArray, possibleMoveArray);
//
//     //Figure out score of this thing??
//     ratingScore = 1; //TODO figure this out
//
//     return {
//       next: nextMove,
//       ratingScore: moveRatingScore
//     };
//
//   } else {
//     // Find a score for this level, then look at the next...
//
//     // We want to look at the next level; use recursion
//     var moveValues = findNextSpaceHardDifficulty(gameBoardArray, possibleMovesArray, depthLevel - 1);
//   }
//
// } //minimax


app.listen(process.env.PORT || port, function() {
  console.log("Server started on port " + port);
});
