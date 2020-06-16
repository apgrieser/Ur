//Main node.js server file

// Constants to specify the difficulty level for the AI to choose the next move for computer
const easyDifficultyLevel = 0;
const mediumDifficultyLevel = 1;
const hardDifficultyLevel = 2;

// const moveDepth = 3; //number of moves to look ahead for hard difficulty play level
const numberGameSimulations = 1000;
const numberTurnsToSimulate = 10;

const humanPlayer = 1;
const aiPlayer = 2;

const startSpace = -1 //game space number for pieces off the board

const numDice = 4;

//Game board space indeces for player 1 (human) and player 2 (the computer)
const player1IndexMap = [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20];
const player2IndexMap = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 21];

const sharedRosetteSpace = 11;

const maxGamePieces = 7;

// When playing in medium mode, number of different priority levels
const numPriorities = 4;

class GameBoard {

  constructor(gameBoardArray, humanPlayerPiecesHome, aiPlayerPiecesHome, player) {
    // this.gameBoardArray = [];
    // Make a copy of the array one level deep (should be enough!)
    this.gameBoardArray = [...gameBoardArray];
    // console.log("In constructor: gameBoardArray is ", this.gameBoardArray);
    this.possibleMovesArray = [];
    this.humanPlayerPiecesHome = humanPlayerPiecesHome;
    this.aiPlayerPiecesHome = aiPlayerPiecesHome;
    this.whoseTurn = player;
    this.boardScore = 0;

  } //constructor

  generatePossibleMovesArray() {
    //Create an array of possible moves by examining those identified in the gameBoardArray
    this.possibleMovesArray = [];
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      if (this.gameBoardArray[i].canBeMovedTo) {
        // movesAvailable += 1;
        this.possibleMovesArray.push(this.gameBoardArray[i].spaceNumber);
      }
    } //for
  } //generatePossibleMovesArray


  setBoardScore() {
    // Provides a score for the input game board

    // Each player's board score is determined by calculating the number of gameboard spaces each piece has traveled
    // A piece not yet on the board has traveled 0; a piece that has made it home has traveled 15;
    // A piece on the board has traveled its location within the board
    // The score is based on the difference in the number of gameboard spaces each player's pieces have traveled,
    //favoring the computer:  computer score - human player score

    var humanPlayerScore = 0;
    var aiPlayerScore = 0;

    // Determine spaces moved for each piece on the board
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      if (this.gameBoardArray[i].playerOnSpace === humanPlayer) {
        humanPlayerScore += this.incrementBoardScore(player1IndexMap, i);

      } else if (this.gameBoardArray[i].playerOnSpace === aiPlayer) {
        aiPlayerScore += this.incrementBoardScore(player2IndexMap, i);

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


  incrementBoardScore(playerIndexMap, index) {
    // Calculate the score of the board for the given row of the gameboard

    var score = 0;

    score += playerIndexMap.indexOf(this.gameBoardArray[index].spaceNumber) + 1;

    if (this.gameBoardArray[index].isRosette) {
      //Give another point of weight to this score to encourage rosettes (maybe?)
      score += 1;
      // Give more weight if it's the shared rosette
      if (index === sharedRosetteSpace) {
        score += 1;
      }
    }

    return score;

  } //incrementBoardScore


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

    // Initialize potential moves to false;
    for (var i = 0; i < this.gameBoardArray.length; i++) {
      this.gameBoardArray[i].canBeMovedTo = false;
    }

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
        var positionInPath = indexMapToUse.indexOf(gameSpaceNumber);
        var newPositionInPath = positionInPath + diceRoll;
        // console.log("In determinePossibleMoves: diceRoll = " + diceRoll + " gameSpaceNumber = " + gameSpaceNumber + ", positionInPath = " + positionInPath + ", newPositionInPath = " + newPositionInPath);

        // Can only consider this piece if moving it doesn't push us past the end of the board
        if (newPositionInPath < indexMapToUse.length) {
          // So far we know that this doesn't move us illegally passed the edge of the board.

          // Get the game space number for this space
          var newGameSpaceNumber = indexMapToUse[newPositionInPath];

          // We can consider this space if we aren't already on it.
          if (this.gameBoardArray[newGameSpaceNumber].playerOnSpace !== player) {

            // We can't move here if this is a rosette AND the opponent has a piece on this space
            if (this.gameBoardArray[newGameSpaceNumber].isRosette && this.gameBoardArray[newGameSpaceNumber].playerOnSpace === otherPlayer) {
              // We can't go here - rosette and other player
              this.gameBoardArray[newGameSpaceNumber].canBeMovedTo = false;

            } else {
              // We should be able to move here - it isn't a rosette with the other player on it
              this.gameBoardArray[newGameSpaceNumber].canBeMovedTo = true;
              this.gameBoardArray[newGameSpaceNumber].potentialPreviousSpaceNumber = gameSpaceNumber;

            }
          } // we aren't already on space
        } // we aren't already on space

      } else {
        //We are already on ths space - can't move here
        //Nothing to do? (don't set canMoveTo false...might have previously been set by previous test )
        // this.gameBoardArray[i].canBeMovedTo = false; DON'T DO THIS

      }
    } //for

    //Check if a piece off the board can move
    var piecesAtStart = 0;

    piecesAtStart = (player === humanPlayer) ?
      maxGamePieces - numPiecesOnBoard - this.humanPlayerPiecesHome :
      maxGamePieces - numPiecesOnBoard - this.aiPlayerPiecesHome;
    // if (player === humanPlayer) {
    //   piecesAtStart = maxGamePieces - numPiecesOnBoard - this.humanPlayerPiecesHome;
    //
    // } else {
    //   piecesAtStart = maxGamePieces - numPiecesOnBoard - this.aiPlayerPiecesHome;
    // }

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

    // Mark possible moves on this game board for this player based on a given dice roll
    // console.log("In movePiece for player " + player + ", dice roll " + diceRoll);
    var goAgain = false;

    if (diceRoll > 0) {
      this.determinePossibleMoves(player, diceRoll);

      // Create an array of possible moves
      this.generatePossibleMovesArray();

      //Use the "medium" difficulty algorithm to pick which piece to move
      var nextMove = -1;

      // if (level === 1  || level < numberTurnsToSimulate) {
      nextMove = findNextSpaceMediumDifficulty(this, player);

      // } else {
      //   nextMove = findNextSpaceHardDifficulty(this, player, level - 1);
      // }

      if (nextMove !== -1) {
        // Valid move found. Move the piece to the space.
        // The return value is true if we landed on a rosette (tells caller to go again with same player)
        goAgain = this.moveTo(nextMove, player);
        return goAgain;
      }

    }
  } //movePiece


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
    var startingGameSpaceIndex = this.gameBoardArray[nextMove].potentialPreviousSpaceNumber;

    //Move to the nextMove space
    if (startingGameSpaceIndex !== startSpace) {
      // The piece we are moving is already on the board; reset the values for the space we are starting from
      this.gameBoardArray[startingGameSpaceIndex].playerOnSpace = 0;
      this.gameBoardArray[startingGameSpaceIndex].canBeMovedTo = false;
      this.gameBoardArray[startingGameSpaceIndex].potentialPieceNumber = startSpace;
      this.gameBoardArray[startingGameSpaceIndex].potentialPreviousSpaceNumber = startSpace;
      this.gameBoardArray[startingGameSpaceIndex].pieceNumber = startSpace;
    }
    // } else {
    //Not already on the board - nothing to do (?)

    // }

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
      // if (this.gameBoardArray[nextMove].playerOnSpace === otherPlayer) {
      //
      //   // Don't think I need to do anything here?
      //
      // }

      //Remember which player is on the space associated with this piece then reset other space properties.
      this.gameBoardArray[nextMove].playerOnSpace = player;
      this.gameBoardArray[nextMove].canBeMovedTo = false;
      this.gameBoardArray[nextMove].potentialPieceNumber = startSpace;
      this.gameBoardArray[nextMove].potentialPreviousSpaceNumber = startSpace;

    } //game piece still on board

    //We moved to a rosette - we get to go again
    if (this.gameBoardArray[nextMove].isRosette) {
      goAgain = true;
    } //landed on a rosette

    return goAgain;
  } //moveTo

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

  // console.log("app post called");

  // Create a GameBoard object based on the data passed from the client in the request
  var data = req.body;
  var difficultyLevel = data.difficulty;
  var gameBoard = new GameBoard(data.gameBoardArray, data.player1PiecesHome, data.player2PiecesHome, aiPlayer);
  gameBoard.generatePossibleMovesArray();

  console.log("Difficulty: " + difficultyLevel);
  console.log("num home player 1: ", gameBoard.humanPlayerPiecesHome, "num home player 2: ", gameBoard.aiPlayerPiecesHome);
  console.log("Length: ", gameBoard.gameBoardArray.length);
  console.log("Possible Moves: ", gameBoard.possibleMovesArray);

  var nextMove = -1;

  if (gameBoard.possibleMovesArray.length === 0) {
    //Weird case - shouldn't happen??
    console.log("In post for /nextMove - no possible moves");

  } else if (gameBoard.possibleMovesArray.length === 1) {
    //Only one possible move - use that.
    nextMove = gameBoard.possibleMovesArray[0];

  } else if (difficultyLevel === easyDifficultyLevel) {
    //More than 1 possible move.  Decide based on difficulty level we are using

    //Randomly pick which move to use
    nextMove = gameBoard.possibleMovesArray[getRandomInt(gameBoard.possibleMovesArray.length - 1)];

  } else if (difficultyLevel === mediumDifficultyLevel) {
    //medium difficulty processing (use heuristic logic to figure out move)
    nextMove = findNextSpaceMediumDifficulty(gameBoard, aiPlayer);

  } else {
    //simulation difficulty processing - lookahead many different times to choose next move
    nextMove = findNextSpaceHardDifficulty(gameBoard, aiPlayer);
    // console.log("After findNextSpaceHardDifficulty: nextMove is " + nextMove);

  }

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

  // Send back response
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
  //Function to choose the next move based on where highest priority pieces are;
  //If more than one piece meets the highest priority conditions, then it randomly chooses which move
  //within the priority, unless it's in priority 3, in which case the move closest to home wins.
  //Unless it is the lowest priority - it will usually choose the piece most close to home unless that piece is on
  //the rosette in the "danger" zone - it will only move that if there are no other options
  //Priorities:
  //One:  If a space is occupied by the other player, or is a rosette
  //Two:  Piece goes home
  //Three: Piece in "safe" zone (past shared spaces)  or put a new piece on the board (right priority?)
  //Four: Piece closest to home (unless it is on the shared rosette in the "danger zone"; that is last choice to move)
  var possibleMovesArray = gameBoard.possibleMovesArray;
  var gameBoardArray = gameBoard.gameBoardArray;
  var priorityArray = [];
  var indexMapToUse = [];

  // Need to consider case where we have no or only one possible move (can happen during game simulations)
  if (possibleMovesArray.length <= 0) {
    return -1;
  }
  if (possibleMovesArray.length === 1) {
    return possibleMovesArray[0];
  }

  //If we get here we have more than one possible move.  Decide which one to use by building priority arrays
  //containing the possible moves

  //If the rosette in the danger zone is a possible move, go there (seems to always be a good idea??)!
  // console.log("medium difficulty: moving to shared rosette space");
  if (possibleMovesArray.includes(sharedRosetteSpace)) {
    return sharedRosetteSpace;
  }

  // Use correct game board space indeces for the current player
  indexMapToUse = (player === humanPlayer) ? player1IndexMap : player2IndexMap;

  //Add an array to each row of our priority array to represent
  for (var i = 0; i < numPriorities; i++) {
    priorityArray.push([]);
  }

  //Go through the possibleMovesArray and prioritize based on where the piece would go
  //It will create a priorty array; each row of the array corresponds with moves for each priority -
  //row 0 is for priority 1 possible moves, row 1 is for priority 2 possible moves, etc.
  for (var i = 0; i < possibleMovesArray.length; i++) {
    // console.log("In findNextSpaceMediumDifficulty loop, player is:", player, ", possible moves: ", possibleMovesArray[i], gameBoardArray[possibleMovesArray[i]].potentialPieceNumber);

    if (gameBoardArray[possibleMovesArray[i]].isRosette || gameBoardArray[possibleMovesArray[i]].playerOnSpace) {
      //This space is a rosette or the other player is on the space - this is a priority one move
      // priorityOneArray.push(possibleMovesArray[i]);
      priorityArray[0].push(possibleMovesArray[i]);

    } else if (possibleMovesArray[i] === indexMapToUse[indexMapToUse.length - 1]) {
      //Piece would go home
      // priorityTwoArray.push(possibleMovesArray[i]);
      priorityArray[1].push(possibleMovesArray[i]);

    } else if (indexMapToUse.includes(possibleMovesArray[i], (indexMapToUse.length - 2)) || gameBoardArray[possibleMovesArray[i]].potentialPreviousSpaceNumber === -1) {
      //Piece would be in the "safe" zone OR it is a piece currently not on the board
      // priorityThreeArray.push(possibleMovesArray[i]);
      priorityArray[2].push(possibleMovesArray[i]);

    } else {
      //Put the move in the fourth array - we'll eventually chose the one closest to home.
      // priorityFourArray.push(possibleMovesArray[i]);
      priorityArray[3].push(possibleMovesArray[i]);
    }
  } //for

  //Check the priority arrays to determine our next move
  //We loop through until we find the highest priority move; then we can exit the loop
  if (priorityArray.length === 0) {
    //There are no moves?  Shouldn't happen - log
    console.log("ERROR In server findNextSpaceMediumDifficulty; could not determine priorities for ", possibleMovesArray);
    return -1;
  }

  nextMove = -1;
  for (var i = 0; i < priorityArray.length; i++) {

    if (priorityArray[i].length > 0) {

      if (priorityArray[i].length === 1) {
        //If the ith array we look at only has one element,
        //that's our next move; we can end the loop
        nextMove = priorityArray[i][0];
        break;
      }

      if (i === (priorityArray.length - 1)) {
        // We made it to the last priority (that is, no better moves found); this is a special case
        // We want to pick the piece closest to home UNLESS it is the shared rosette piece in the
        // danger zone - if we have a choice (that is, there are other moves in this priority),
        // take the shared rosette space out of the possibilities (splicing it out of our choices)
        for (var j = 0; j < priorityArray[i].length; j++) {
          if (gameBoardArray[priorityArray[i][j]].potentialPreviousSpaceNumber === sharedRosetteSpace) {
            //We would be moving a piece on the shared rosette in the danger zone -
            //prevent this from happening by taking it out of the possible moves for this priority
            priorityArray[i].splice(j, 1);
            // console.log("medium - removed the shared rosette from possible move ", priorityFourArray);
          }
        } //for

        //Choose the piece closest to home (highest gameboard space number)
        nextMove = Math.max.apply(null, priorityArray[i]);
        break;
      }

      //If we get here, we aren't checking the lowest priority
      //Take a random move in the highest priority that has values, then exit the loop
      nextMove = priorityArray[i][getRandomInt(priorityArray[i].length - 1)];
      break;
    }
  } //for

  return nextMove;

} //findNextSpaceMediumDifficulty


function findNextSpaceHardDifficulty(gameBoard, player) {

  // Move based on monte carlo simulation results
  // Simulate game play m times looking ahead n moves

  // We only get here if there is more than one move so don't have to worry about trivial case of one (or no) possible move
  // (constants for number of simulations and number of moves is at top of file)
  //   if (level !== 1) {
  //   console.log("findNextSpaceHardDifficulty player " + player + ", level " + level);
  // }
  // Initialize
  var nextMove = -1;
  var simGameResults = [];

  var otherPlayer = (player === aiPlayer) ? humanPlayer : aiPlayer;

  // Need to consider case where we have no or only one possible move (needed when called during game simulations)
  if (gameBoard.possibleMovesArray.length <= 0) {
    return -1;
  }
  if (gameBoard.possibleMovesArray.length === 1) {
    return gameBoard.possibleMovesArray[0];
  }

  for (var i = 0; i < gameBoard.possibleMovesArray.length; i++) {
    //Simulate a game for a defined number of moves or if it ends - remember game score at end ...
    //Create a new game board to run the simulation based on the input gameboard
    // console.log("In findNextSpaceHardDifficulty for possible move " + gameBoard.possibleMovesArray[i]);
    var possibleMoveScoreResults = [];

    for (var j = 0; j < numberGameSimulations; j++) {

      //Now simulate other moves (or to the end of the game)
      // var rollAgain = true;
      var gameEnded = false;

      // console.log("In findNextSpaceHardDifficulty simulating game loop, j is " + j);
      // Create a game board based on the input game board that we will use in the game simulations
      var simGameBoard = new GameBoard(gameBoard.gameBoardArray, gameBoard.humanPlayerPiecesHome, gameBoard.aiPlayerPiecesHome, aiPlayer);
      simGameBoard.generatePossibleMovesArray();

      //Have the ai make it's ith possible move, that is, determine results if we make this choice of move...
      simGameBoard.moveTo(gameBoard.possibleMovesArray[i], player);

      for (k = 0; k < numberTurnsToSimulate; k++) {

        // console.log("In findNextSpaceHardDifficulty simulating turns loop, k is " + k);
        //for this turn, simulate the human player moving and then the ai moving
        gameEnded = takeTurn(simGameBoard, otherPlayer);

        if (gameEnded) {
          // Game is over; no more turn taking
          // console.log("In findNextSpaceHardDifficulty: game ended after HUMAN turn in game sim ");
          break;

        } else {
          // Give other player a turn
          gameEnded = takeTurn(simGameBoard, player);

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

    } // for game simulation loop

    //console.log("In findNextSpaceHardDifficulty; move results scores array: ", possibleMoveScoreResults);

    // Average up the game board scores for this move path
    var avg = 0;
    if (possibleMoveScoreResults.length > 0) {
      avg = possibleMoveScoreResults.reduce(function(sum, x) {
        return sum + x
      }, 0) / possibleMoveScoreResults.length;
      // for (m = 0; m < possibleMoveScoreResults.length; m++) {
      //   avg += possibleMoveScoreResults[m];
      // }
      // avg = avg / possibleMoveScoreResults.length;
      // } else {
      //   //There were not possible moves so set average to 0 (?)
      //   avg = 0;
      // }
      // console.log("Average of ", possibleMoveScoreResults, " is ", avg);
    }
    //Save the average for this path
    simGameResults.push(avg);
    // console.log("simGameResults: ", simGameResults);
    // console.log("In findNextSpaceHardDifficulty; simGameResults array: ", simGameResults);
  } // for possible moves

  //Return the game space index of the move path that gave us the best (highest) results
  // var maxFromSimGameResults = simGameResults.indexOf(Math.max.apply(null, simGameResults));
  var nextMove = gameBoard.possibleMovesArray[simGameResults.indexOf(Math.max.apply(null, simGameResults))];
  // console.log("In findNextSpaceHardDifficulty; possible moves: ", gameBoard.possibleMovesArray);
  // console.log("In findNextSpaceHardDifficulty; max score: ", Math.max.apply(null, simGameResults), " possible moves array index: ", simGameResults.indexOf(Math.max.apply(null, simGameResults)));
  // console.log("In findNextSpaceHardDifficulty: returning nextMove: " + nextMove);
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


app.listen(process.env.PORT || port, function() {
  console.log("Server started on port " + port);
});
