//Main node.js server file

// Constants to specify the difficulty level for the AI to choose the next move
const easyDifficultyLevel = 0;
const mediumDifficultyLevel = 1;
const hardDifficultyLevel = 2;

//Game board space indeces for player 2 (the computer)
const player2IndexMap = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 21];

const express = require("express");
//const bodyParser = require("body-parser"); Don't think I need this
// const https = require("https");

const port = 3000;

const app = express();

app.use(express.static("public")); //NEED??
app.use(express.static(__dirname + "/"));

//Need this to see the json in the body!!  This replaces the whole body-parser thing.
app.use(express.json());

app.get("/", function(req, res){
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
  console.log(data);
  var difficultyLevel = data.difficulty;
  var gameBoardArray = data.gameBoardArray;
  console.log("Difficulty: " + difficultyLevel);
  console.log("Length: ", gameBoardArray.length);

  var possibleMovesArray = setPossibleMovesArray(gameBoardArray);

  console.log("Possible Moves: ", possibleMovesArray);

  var nextMove = -1;

  // DON'T NEED BECAUSE DEFAULT MOVE IS -1
  // if (possibleMovesArray.length < 1) {
  //   //No possible next move
  //   nextMove = -1;
  //
  // } else
  if (possibleMovesArray.length === 1) {
    //Only one possible move - use that.
    nextMove = possibleMovesArray[0];

  } else {
    //More than 1 possible move.  Decide based on difficulty level we are using
    if (difficultyLevel === easyDifficultyLevel) {
      //Randomly pick which move to use
      nextMove = possibleMovesArray[getRandomInt(possibleMovesArray.length)];

    } else if (difficultyLevel === mediumDifficultyLevel) {
      //TBD  medium difficulty processing
      nextMove = findNextSpaceMediumDifficulty(gameBoardArray, possibleMovesArray);

    } else {
      //TBD  hard difficulty processing
    }
  } //more than one possible next move


  // console.log("JSON parse: ", JSON.parse(req.body));
  // var gameBoardArray = JSON.parse(req.body);
  // console.log(gameBoardArray);

  // var dataArray = JSON.parse(req.body);
  // console.log("Data? ", JSON.parse(req.data));
  var response = {
    result: "success",
    message: "next move found",
    nextMove: nextMove
  }
  // res.write("string");
  res.send(response);
  // console.log("Response: ", res);
});

function setPossibleMovesArray(boardArray) {
  var possibleMovesArray = [];
  for (var i = 0; i < boardArray.length; i++) {
    if (boardArray[i].canBeMovedTo) {
      // movesAvailable += 1;
      possibleMovesArray.push(boardArray[i].spaceNumber);
    }
  } //for

  return possibleMovesArray;
  // if (possibleMovesArray.length > 0) {
  //   //For now, just randomly choose a space to move to.
  //   // this.determineNextMoveSpaceNumber();
  //   // this.nextGameSpaceToMoveTo = this.possibleMovesArray[this.getRandomInt(this.possibleMovesArray.length)];
  //   return possibleMovesArray;
  //
  // } else {
  //   //No moves available; do...what?
  // }
} //setPossibleMovesArray

function getRandomInt(max) {
  // Return a random integer between 0 and max
  var randomNumber = Math.floor(Math.random() * (max));
  // console.log("In getRandomInt: " + randomNumber);
  return randomNumber;

} //getRandomInt

function findNextSpaceMediumDifficulty(gameBoardArray, possibleMovesArray) {
  //Function to choose the next move based on where highest priority pieces are
  //If more than one piece meets the highest priority conditions, then it randomly chooses which move
  //within the priority, unless it's in priority 3, in which case the move closest to home wins.
  //Priorities:
  //One:  If a space is occupied by the other player, or is a rosette
  //Two:  Piece goes home
  //Three: Piece in "safe" zone (past shared spaces)  or put a new piece on the board (right priority?)
  //Four: Piece closest to home
  var priorityOneArray = [];
  var priorityTwoArray = [];
  var priorityThreeArray = [];
  var priorityFourArray = [];

  //Go through the possibleMovesArray and prioritize based on where the piece would go
  for (var i = 0; i < possibleMovesArray.length; i++) {
    console.log("In loop: ", possibleMovesArray[i], gameBoardArray[possibleMovesArray[i]].potentialPieceNumber);
    if (gameBoardArray[possibleMovesArray[i]].isRosette || gameBoardArray[possibleMovesArray[i]].playerOnSpace) {
      //This space is a rosette or the other player is on the space - this is a priority one move
      priorityOneArray.push(possibleMovesArray[i]);

    } else if (possibleMovesArray[i] === player2IndexMap[player2IndexMap.length - 1]) {
      //Piece would go home
      priorityTwoArray.push(possibleMovesArray[i]);

    } else if (player2IndexMap.includes(possibleMovesArray[i], (player2IndexMap.length - 2)) || gameBoardArray[possibleMovesArray[i]].potentialPieceNumber === -1) {
      //Piece would be in the "safe" zone OR it is a piece currently not on the board
      priorityThreeArray.push(possibleMovesArray[i]);

    } else {
      //Put the move in the fourth array - we'll eventually chose the one closest to home.
      priorityFourArray.push(possibleMovesArray[i]);
    }
  } //for

  if (priorityOneArray.length > 0) {
    //We have a priority one level move
    console.log("Before call to pickMoveFromPriorityArray with priorityOneArray: ", priorityOneArray);
    return pickMoveFromPriorityArray(priorityOneArray);

  } else if (priorityTwoArray.length > 0) {
    console.log("Before call to pickMoveFromPriorityArray with priorityTwoArray: ", priorityTwoArray);
    return pickMoveFromPriorityArray(priorityTwoArray);

  } else if (priorityThreeArray.length > 0) {
    console.log("Before call to pickMoveFromPriorityArray with priorityThreeArray: ", priorityThreeArray);
    return pickMoveFromPriorityArray(priorityThreeArray);

  } else if (priorityFourArray.length > 0) {
     //Pick the array item closest to home
     console.log("Before max pick from priorityFourArray: ", priorityFourArray);
     return Math.max.apply(null, priorityFourArray);

  } else {
    //Something weird happened if we got here - shouldn't happen
    console.log("In findNextSpaceMediumDifficulty:  no possible moves added to any array ");
    return -1;
  }

} //findNextSpaceMediumDifficulty

function pickMoveFromPriorityArray (priorityArray) {
  //Given the input priority array which should contain 1 or more elements,
  //pick one of the elements at random (or the only element if that's all we have)
  if (priorityArray.length > 1) {
    //More than one priority move.  Pick one at random (?)
    nextMove = priorityArray[getRandomInt(priorityArray.length)];

  } else {
    //Only one possible priority one move
    nextMove = priorityArray[0];
  }

  return nextMove;

} //pickMoveFromPriorityArray

function findNextSpaceHardDifficulty(gameBoardArray, possibleMovesArray) {
  //Much the same as medium difficulty but other considerations to consider ...
  // - give priority to knocking out other player if they are close to home (define what that means...)
  // - if currently on a rosette, don't move unless no other moves (maybe?)
  // ???


}

// app.get("/nextMove", function (req, res) {
//   console.log("In next move");
//   console.log("Request: ", req);
//   console.log("Response: ", res);
// });

app.listen(process.env.PORT || port, function(){
  console.log("Server started on port " + port);
});
