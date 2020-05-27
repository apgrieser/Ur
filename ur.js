// Royal Game of Ur
//
// Written by Andrea Grieser 2020
//

// Constant definitions

const numberOfDice = 4;
const numberOfPieces = 7;
const maxSpacesOnBoard = 22; //There are 22 spaces TOTAL on the board (8 spaces are shared between players); 2 are the home positions
const player1 = 1;
const player2 = 2;

// Constants used for game play modes
const twoPlayerGame = 0;
const onePlayerGameAgainstAI = 1;

// MAY NOT NEED THIS
// const player1SelectedClassName = "player1piece-pressed";
// const player2SelectedClassName = "player2piece-pressed";

//Value of the current player on space if no one is on the space
const noPlayerOnSpace = 0;

// Status messages
const yourTurnMsg = "Your Turn - Roll";
const waitMsg = "wait..."
const rolledMsg = "You rolled:  "
const rolledZero = "You rolled 0 - no pieces can move"
const noMoves = "You have no moves - other player goes"
const goAgain = "You go again!"
const playerWins = "You Win!!"
const loserMsg = "Better Luck Next Time"
const sentStart = "You were sent back to start"
const wentHome = "You made it home!"
const msgDelay = 1500;  //milliseconds to delay before moving on from some messages NOT USING?
const blinkInterval = 500; //milliseconds ot blink winner message

// Indeces where rosettes are located on the game board
const rosetteIndeces = [3, 7, 11, 17, 19];
// const sharedSpaceIndeces = [8, 9, 10, 11, 12, 13, 14, 15]; //need?

//Indeces for valid player locations on the game board
//The last index in each array is the "home" index (when going off the board)
const player1IndexMap = [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20];
const player2IndexMap = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 21];
//Trying to figure out if I need to count the "home" space, when user moves off board
const maxPlayerSpacesWithHome = player1IndexMap.length;
const maxPlayerSpacesWithoutHome = maxPlayerSpacesWithHome - 1; //14


// Constants for index into game array for pieces in start position
// and pieces that have finished
const pieceStartIndex = -1
const pieceEndIndex = maxPlayerSpacesWithHome; //NEED?? Does this need to be plus 1?  I think I do need this

const player1StartClassName = "player1piece";
const player1OnBoardClassName = "player1piece-board";
const player1HomeClassName = "player1piece-home";
const player2StartClassName = "player2piece";
const player2OnBoardClassName = "player2piece-board";
const player2HomeClassName = "player2piece-home";


//Global variable representing a Game instance.
var game;


// **********  Event handlers ************


$(".roll-button").click(function(event) {
  //Roll dice button event handler
  // console.log("In dice roll button event handler");

  game.rollDice(this);

}); //roll-button click event handler


$(".restart-button").click(function(event) {
  //Restart button - start a new game

  //Ick.  Is there a way to make a nicer dialog?
  if (confirm ("Are you sure you want to restart?")) {
    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame();
  }

}); //event handler for restart button

//Game piece event handler (wakes when a game piece is clicked)
//DON'T NEED?
// $(".game-piece").click(function(event) {
//
//   game.manageGamePiece(event.target.id);
//
// }); //game-piece click event


//Show possible move for a piece when you hover over it
//DON'T NEED?
// $(".game-piece").hover(function(event) {
//     console.log("hovering in", event, event);
//     console.log("current target is ", event.target, event.pageX, event.PageY);
//     // alert("hovering in!");
//   },
//   function() {
//     console.log("hovering out ", event);
//     // alert("hovering out!");
//   }
// ); //event handler


$(".tcell").click(function(event) {
  //Event handler when someone clicks on a game board space

  // console.log("In table cell click event handler: target: " + event.target.id);
  //Get the game board space index from the event target id
  var gameBoardSpaceIndex = parseInt(event.target.id.slice(-2), 10);
  if (event.target.id !== "") {
    game.gameBoard[gameBoardSpaceIndex].manageGameBoardSpaceClick();
  }
}); //table cell click event


function enableRollButton () {
  $(".roll-button").prop("disabled", false);
} //enableRollButton

function disableRollButton () {
  $(".roll-button").prop("disabled", true);

} //disableRollButton


// **********  GameBoardSpace class ***************

class GameBoardSpace {
  // Class for each space on the game board

  constructor(gameSpaceNumber) {

    // console.log("GameBoardSpace constructor")
    this.spaceNumber = gameSpaceNumber;

    //Mark if this is a rosette piece or not
    if (rosetteIndeces.includes(this.spaceNumber)) {
      this.isRosette = true;
    } else {
      this.isRosette = false;
    }

    this.canBeMovedTo = false; //True if a place the current player can move to
    this.potentialPieceNumber = pieceStartIndex; //Number of piece that *could* move here (calculated during determine if can move there)
    this.pieceNumber = pieceStartIndex;  //Number of piece on this space (array position in its pieceArray)
    this.playerOnSpace = noPlayerOnSpace; //if the piece is occupied, this is the number of the player on the piece

    //Hide play related images from the space
    this.hideGamePlayImages();

  } //constructor


  hideGamePlayImages() {
    //Hide any play related images from the game board for this space

    //Hide possible move indicator
    this.hidePossibleMoveIndicator();
    //Hide player pieces
    this.hidePlayerGamePiece(player1);
    this.hidePlayerGamePiece(player2);

  } //hideGamePlayImages


  clearGameSpace() {
    //Reset this game space.  If there is a piece on this space, send it back home.

    this.hideGamePlayImages();

    if (this.playerOnSpace !== noPlayerOnSpace) {
      //Get the piece on this space and send back home.
      var gamePieceArray = [];
      if (this.playerOnSpace === player1) {
        gamePieceArray = game.player1GamePieceArray;

      } else {
        gamePieceArray = game.player2GamePieceArray;

      }

      gamePieceArray[this.pieceNumber].sendGamePieceToStart();
      this.playerOnSpace = noPlayerOnSpace;
    }
  } //clearGameSpace


  manageGameBoardSpaceClick() {
    //Method that responds to a game board space being clicked on (meaning player wants to move here)

    // console.log("In manageGameBoardSpaceClick");

    //Only do anything if this a space that can be moved to by a player (based on previous processing)
    if (this.canBeMovedTo) {

      //Figure out which piece to move to this space.
      var pieceArray = game.getGamePieceArray();
      // console.log("Calling movePieceToSpace with: " + this.spaceNumber);

      //Get the number of the piece that can move here...and move it!
      pieceArray[this.potentialPieceNumber].movePieceToSpace(this.spaceNumber);

      //We shouldn't see the game space indicators on the board any more.
      game.hideAllPossibleMoveIndicators();

      if (!game.gameOver) {

        //Switch to the next player, unless the player moved onto a rosette space.
        if (this.isRosette) {
          game.updatePlayerStatus(game.currentPlayer, goAgain);
          //Need to turn the roll button back on
          game.enableRollButton();

        } else {
          game.switchToOtherPlayer();

        }
      }
    } //space can be moved to

  } //manageGameBoardSpaceClick


  generateHtmlIdForMoveIndicator() {
    //Generate the HTML id of the can-be-moved-to indicator

    //The format of the move indicator is "spxx", where xx is the game space index number
    var strLocation = this.spaceNumber.toString(10);
    if (strLocation.length === 1) {
      strLocation = "0" + strLocation;
    }
    // console.log("In generateHtmlIdForMoveIndicator: " + strLocation)
    return "#sp" + strLocation;
  } //generateHtmlIdForMoveIndicator


  hidePossibleMoveIndicator() {
    //Method to hide the "possible move" image indicator on the game space

    $(this.generateHtmlIdForMoveIndicator()).hide();
  } //hidePossibleMoveIndicator


  showPossibleMoveIndicator() {
    //Method to show the "possible move" image indicator on the game space

    $(this.generateHtmlIdForMoveIndicator()).show();
  } //showPossibleMoveIndicator


  generateHtmlIdForPlayerPiece(playerNumber) {
    //Method to create the html id for a player piece

    //Game piece HTML ids are of the form "saxx", where a is the player number and xx is the game space location number
    var strLocation = this.spaceNumber.toString(10);
    if (strLocation.length === 1) {
      strLocation = "0" + strLocation;
    }
    // console.log("In generateHtmlIdForPlayerPiece: " + strLocation)
    return "#s" + playerNumber + strLocation;

  } //generateHtmlIdForPlayerPiece


  hidePlayerGamePiece(playerNumber) {
    //Method to hide game piece images for a player on this space

    $(this.generateHtmlIdForPlayerPiece(playerNumber)).hide();
  } //hidePlayerGamePiece

  showPlayerGamePiece(playerNumber) {
    //Method to show game piece images for a player on this space
    $(this.generateHtmlIdForPlayerPiece(playerNumber)).show();
  } //showPlayerGamePiece

} //gameBoardSpace


// **********  GamePiece class ***************

class GamePiece {
  // Class for each game piece

  constructor(selector, player) {

    // console.log("GamePiece constructor");
    this.player = player; //player number who owns this piece
    this.gameBoardSpaceIndex = pieceStartIndex;
    this.pieceIsHome = false;
    this.onRosette = false; //is piece on a rosette or not
    this.canMove = true; //True if it is okay to move this piece the number the dice rolled
    this.jquerySelector = selector; //Text of jquery selector to use to retrieve the piece from DOM using jquery
    // this.screenButton = $(selector).get(0); //This is the actual button object from DOM (NEEDED?)

  } //constructor


  sendGamePieceToStart() {
    //Reset the game piece - change its color and index to being back in the start area

    $(this.jquerySelector).removeClass(game.getPlayerOnBoardClassName(this.player));
    this.gameBoardSpaceIndex = pieceStartIndex;
    game.updatePlayerSecondStatus(this.player, sentStart);
    // setTimeout(function() {console.log("waiting...");}, msgDelay);

  } //sendGamePieceToStart


  getLocationIndex() {
    //Returns the number for an individual player's board position (out of  14 possibilities:  0-13)
    //Returns -1 if can't find the game board space index associated with this piece
    var indexMap = game.getIndexMap();
    var locationIndex = indexMap.indexOf(this.gameBoardSpaceIndex);

    return locationIndex;

  } //getLocationIndex


  getGameBoardIndex(locationIndex) {
    //Given the current player's current location index (0-13),
    //return where the game board space value for each would be
    //The array has two entries:  first is the array is the current location (0-13) and second is location on the game board (0-19)
    var returnValue;

    //Get the correct index map for the game board (based on who is the current player)
    var indexMap = game.getIndexMap();

    if (locationIndex < 0) {
      //piece is in the start position; next position would be first location on gameBoard
      returnValue = pieceStartIndex;

    } else {
      // piece is on the game board
      if ((locationIndex) > maxPlayerSpacesWithoutHome) {
        //next space would be off the board
        returnValue = pieceEndIndex;

      } else {
        //return the value in the array at that location
        returnValue = indexMap[locationIndex];
      }
    } //piece not in start area

    return returnValue;

  } //getGameBoardIndex


  determineIfCanMove(numberOfSpaces) {
    //Return true if piece can move the number of spaces else return false

    //Find where piece currently is located in its 14 space journey off the board
    var locationIndex = this.getLocationIndex();

    // console.log("in determineIfCanMove: locationIndex is " + locationIndex + " for game board space number " + this.gameBoardSpaceIndex);

    var numberSpacesUntilHome = game.calculateNumberOfSpacesUntilHome(this.gameBoardSpaceIndex);
    if (numberSpacesUntilHome !== -1 && numberOfSpaces > numberSpacesUntilHome) {
      //Can't move - will go off board by greater than exact needed
      this.canMove = false;
      return;
    }

    //Get the location index (0-14) of the space where this piece would move to
    var moveToIndex = locationIndex + numberOfSpaces;

    //Get here if we have a valid move to index.  Find where on the board it would go
    var nextMoveGameBoardIndex = this.getGameBoardIndex(moveToIndex);

    //Is another piece on this space?
    if (game.gameBoard[nextMoveGameBoardIndex].playerOnSpace === noPlayerOnSpace) {
      //space is not occupied - can move there
      this.canMove = true;

    } else {
      //There is another piece on the gameBoard
      if (game.gameBoard[nextMoveGameBoardIndex].playerOnSpace === this.player) {
        //occupied by one of the same player's pieces - can't move there
        this.canMove = false;
        return false;

      } else {
        // Other player is on the space
        if (game.gameBoard[nextMoveGameBoardIndex].isRosette) {
          //The other player piece is there but it's on a rosette - can't move there
          this.canMove = false;
          return false;

        } else {
          //Can move here
          this.canMove = true;

        }
      } //other player on space
    } //space occupied

    if (this.canMove) {
      //Movable space
      game.gameBoard[nextMoveGameBoardIndex].canBeMovedTo = true;

      //Remember the array number of this piece in the game board so we can get back to the piece later
      var gamePieceArray = game.getGamePieceArray();
      game.gameBoard[nextMoveGameBoardIndex].potentialPieceNumber = gamePieceArray.indexOf(this);

    }

    return this.canMove;

  } //determineIfCanMove


  setPieceGameSpaceIndex(numberOfSpaces) {
    //Method to update game piece index after a move

    //The variable below represents where the piece is in relation to reaching home (so a number [0, 13])
    var locationIndex = this.getLocationIndex();

    locationIndex += numberOfSpaces;
    // console.log("In setPieceGameSpaceIndex: location index: " + locationIndex);

    if (locationIndex < maxPlayerSpacesWithoutHome) {
      //We are still on the board - use indexMap array to get the game board space index
      var indexMap = game.getIndexMap();
      this.gameBoardSpaceIndex = indexMap[locationIndex];

    } //still on game board
  } //setPieceGameSpaceIndex


  movePieceToSpace(gameBoardSpaceIndex) {
    //Move this piece to the input game board space index

    //If currently on the board (that is, not in the start position), hide the piece from its current location
    if (this.gameBoardSpaceIndex !== pieceStartIndex) {

      //If we are already on the board, we need to hide this game piece since no longer on starting space.
      game.gameBoard[this.gameBoardSpaceIndex].hidePlayerGamePiece(game.currentPlayer);
      // game.hideGamePieceOnBoard(game.currentPlayer, this.gameBoardSpaceIndex);
      //Reset the old space properties
      game.gameBoard[this.gameBoardSpaceIndex].playerOnSpace = noPlayerOnSpace;
      game.gameBoard[this.gameBoardSpaceIndex].canBeMovedTo = false;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPieceNumber = pieceStartIndex

    } else {
      //This piece is leaving the start area; change appearance
      $(this.jquerySelector).addClass(game.getPlayerOnBoardClassName(this.player));

    }

    //Determine if we are moving off the board or not
    if (gameBoardSpaceIndex === game.getIndexOfLastPlayerSpaceOnBoard()) {

      //Moving piece off the game board
      this.pieceIsHome = true;

      //Take piece off the board by changing appearance of start area piece and resetting appropriate properties
      $(this.jquerySelector).removeClass(game.getPlayerOnBoardClassName(this.player));
      $(this.jquerySelector).addClass(game.getPlayerHomeClassName(this.player));
      game.gameBoard[this.gameBoardSpaceIndex].hidePlayerGamePiece(game.currentPlayer);
      game.updatePlayerSecondStatus(this.player, wentHome);
      // setTimeout(function() {console.log("waiting...");}, msgDelay);

      game.updateNumberOfPiecesHome();
      if (game.allPiecesAreHome()) {
        game.gameOver = true;
        game.updatePlayerStatus(game.currentPlayer, playerWins);
        game.updatePlayerStatus(game.getOtherPlayerNumber(), loserMsg);
      }

    } else {
      //piece is still on the game board

      //If there is another player on the space, send them home!
      if (game.gameBoard[gameBoardSpaceIndex].playerOnSpace === game.getOtherPlayerNumber()) {
        //Get the jquery selector number of the piece that is going off the board.

        game.gameBoard[gameBoardSpaceIndex].clearGameSpace();
        // this.gameBoardSpaceIndex = pieceStartIndex;
      }

      // remember this new space index on the game board
      this.gameBoardSpaceIndex = gameBoardSpaceIndex;

      //Remember which player is on the space associated with this piece.
      game.gameBoard[this.gameBoardSpaceIndex].playerOnSpace = this.player;

      //Reset other game board space properties
      game.gameBoard[this.gameBoardSpaceIndex].canBeMovedTo = false;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPieceNumber = pieceStartIndex;

      //Remember which piece this is in the game piece array
      var gamePieceArray = game.getGamePieceArray();
      game.gameBoard[this.gameBoardSpaceIndex].pieceNumber = gamePieceArray.indexOf(this);

      // Remember if we are on a rosette or not
      if (game.gameBoard[this.gameBoardSpaceIndex].isRosette) {
        this.onRosette = true;
      } else {
        this.onRosette = false;
      }

      game.gameBoard[this.gameBoardSpaceIndex].showPlayerGamePiece(game.currentPlayer);

    } //game piece still on board

  } //movePieceToSpace


  //NOT USING
  // processPieceClick(index) {
  //   //Not sure I want to do anything if they click on a piece??
  //   console.log("In processPieceClick for player " + this.player + ", id " + this.jquerySelector);
  // }

} //GamePiece


// Game of Ur game board class
class UrGame {

  constructor(gameType) {
    // console.log("Ur Constructor");

    this.gamePlayType = gameType; // 0 = 2 players side-by-side; 1 = against computer (future)
    this.diceRoll = 0;
    this.currentPlayer = this.decideFirstPlayer();
    this.displayTurn();
    this.numberPlayer1PiecesHome = 0;
    this.numberPlayer2PiecesHome = 0;
    this.gameOver = false;

    //create the game board
    this.gameBoard = [];


    //Game pieces for each player
    this.player1GamePieceArray = [];
    this.player2GamePieceArray = [];


    for (var i = 0; i < maxSpacesOnBoard; i++) {
      this.gameBoard.push(new GameBoardSpace(i));
    } //for

    //Initilalize arrays holding pieces.
    for (var i = 0; i < numberOfPieces; i++) {
      this.player1GamePieceArray.push(new GamePiece("#p1" + (i + 1), player1));
      this.player2GamePieceArray.push(new GamePiece("#p2" + (i + 1), player2));
    };

    //Initalize dice
    this.setDiceToZero();

    //Initialize pieces - they should only have the default class attached to them
    this.initializePieces();

    //Initialize secondary status
    this.updatePlayerSecondStatus(player1, "");
    this.updatePlayerSecondStatus(player2, "");

  } //constructor



  decideFirstPlayer() {
    //Method to decide who goes firstPlayer
    //TODO - change so that it highest roller goes first

    //Roll to decide which player goes first - highest roll wins
    //For now, set the current player to player 1 (TODO maybe have them roll for it at some point)
    return player1;
  } // decideFirstPlayer


  //Method to change the player status indicating whose turn it is.
  displayTurn() {
    //Get the display element on the window for the current player

    if (this.currentPlayer == player1) {
      this.updatePlayerStatus(1, yourTurnMsg);
      $("#player1-status").html(yourTurnMsg);
      $("#player1-status").addClass("player-status-active");
      $("#l1").addClass("player-label-active");
      this.updatePlayerStatus(2, waitMsg);
      $("#player2-status").removeClass("player-status-active");
      $("#l2").removeClass("player-label-active");

    } else {
      this.updatePlayerStatus(2, yourTurnMsg);
      $("#player2-status").addClass("player-status-active");
      $("#l2").addClass("player-label-active");
      this.updatePlayerStatus(1, waitMsg);
      $("#player1-status").removeClass("player-status-active");
      $("#l1").removeClass("player-label-active");

    };
  } //displayTurn

  switchToOtherPlayer() {
    // Time for other player to have a turn

    if (this.currentPlayer == player1) {
      this.currentPlayer = player2;
    } else {
      this.currentPlayer = player1;
    };

    this.displayTurn();

    //Turn the roll button back on for this turn.
    this.enableRollButton();

  } //switchToOtherPlayer

  getNumberPiecesHomeCounter() {
    if (this.currentPlayer === player1) {
      return this.numberPlayer1PiecesHome;
    } else {
      return this.numberPlayer2PiecesHome;
    }
  } //getNumberPiecesHomeCounter

  updateNumberOfPiecesHome() {
    //Increment number of pieces home for the current player

    if (this.currentPlayer === player1) {
      this.numberPlayer1PiecesHome += 1;

    } else {
      this.numberPlayer2PiecesHome += 1;
    }
  } //updateNumberOfPiecesHome

  allPiecesAreHome() {
    //Return TRUE if all pieces are home for the current player; otherwise return false
    var gamePieceArray = this.getGamePieceArray();
    var numberPiecesHome = this.getNumberPiecesHomeCounter();

    if (numberPiecesHome >= gamePieceArray.length) {
      return true;

    } else {
      return false;
    }

  } //allPiecesAreHome


  getGamePieceArray() {
    //Return the game piece array associated with the current player

    var gamePieceArray = [];

    if (this.currentPlayer === player1) {
      gamePieceArray = this.player1GamePieceArray;

    } else {
      gamePieceArray = this.player2GamePieceArray;
    }

    return gamePieceArray;
  } //getGamePieceArray


  getIndexMap() {
    //Returns the indexMap (the game space index numbers) for the current player
    var indexMap = [];
    if (game.currentPlayer === player1) {
      indexMap = player1IndexMap;

    } else {
      indexMap = player2IndexMap;
    }
    return indexMap;
  } //getIndexMap


  hideAllPossibleMoveIndicators() {
    //Turn off all possible move indicators on the board

    for (var i = 0; i < maxSpacesOnBoard; i++) {
      this.gameBoard[i].hidePossibleMoveIndicator();
    }

  } //hideAllPossibleMoveIndicators


  updatePlayerStatus(player, statusString) {
    //Updates the first status string (the one above the pieces)
    $("#player" + player + "-status").html(statusString);

    if (statusString === playerWins) {
      //Make some snazzy effects :)
      this.makeABigDealForWinner(player);
    }

  } //updatePlayerStatus

  updatePlayerSecondStatus(player, statusString) {
    //Updates the second status string (the one below the pieces)
    $("#player" + player + "-second-status").html(statusString);

  } //updatePlayerStatus


  makeABigDealForWinner(player) {
    //Just because I could...blink the winning message

    //Shut off any secondary messages
    this.updatePlayerSecondStatus(player1, "");
    this.updatePlayerSecondStatus(player2, "");

    var jQuerySelector = "#player" + player + "-status";
    $(jQuerySelector).addClass("player-winner-status");

    $(jQuerySelector).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval);

  } //makeABigDealForWinner

  removeWinnerBigDeal() {
    //Remove any special fonts or effects from the player statuses that are put in when they win
    $("#player1-status").removeClass("player-winner-status");
    $("#player2-status").removeClass("player-winner-status");

  } //removeWinnerBigDeal

  // blinkWinner() {
  //   //This method is woken up by an interval after someone wins; interval is cleared when a new game is started
  //   var jQuerySelector = $("#player" + this.winner + "-status")
  //   $(jQuerySelector).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval);
  //   // $(jQuerySelector).fadeIn(blinkInterval);
  // }


  //Return an integer between 0 and max (inclusive)
  getRandomInt(max) {
    // Return a random integer between 0 and max
    var randomNumber = Math.floor(Math.random() * (max + 1));
    // console.log("In getRandomInt: " + randomNumber);
    return randomNumber;

  } //getRandomInt

  //Roll die number dieNumber (out of the four possible dice that could be rolled)
  //Gets a value and changes the image on the screen
  rollDie(dieNumber) {

    //Roll the Ur game dice (four dice that can each be 0 or 1)
    var rollNumber = this.getRandomInt(1);
    // console.log("rollDice rollNumber: " + rollNumber);

    //Change the image of the dieNumber
    var dieImage = "images/die" + rollNumber + ".png";
    $(".img" + dieNumber).attr("src", dieImage);

    return rollNumber;

  } //rollDie


  setDiceToZero () {
    //Set dice to all zero for initial case at start of a game.
    $(".img1").attr("src", "images/die0.png");
    $(".img2").attr("src", "images/die0.png");
    $(".img3").attr("src", "images/die0.png");
    $(".img4").attr("src", "images/die0.png");
  } //setDiceToZero


  //Method to roll dice
  rollDice() {

    //Roll all 4 dice, totaling up their sum.
    if (!this.gameOver) {

      //Disable the roll button so that no one can roll while a turn is in progress
      this.disableRollButton();

      //Clear out any secondary status
      this.updatePlayerSecondStatus(player1, "");
      this.updatePlayerSecondStatus(player2, "");

      var diceSum = 0;

      for (var i = 1; i <= numberOfDice; i++) {
        diceSum += this.rollDie(i);
      }

      //Save dice roll value
      this.diceRoll = diceSum;

      if (this.diceRoll < 1) {
        // console.log("in roll dice - rolled 0");
        // this.updatePlayerStatus(this.currentPlayer, rolledZero);
        this.updatePlayerSecondStatus(this.currentPlayer, rolledZero);
        this.switchToOtherPlayer();

      } else {
        this.updatePlayerStatus(this.currentPlayer, rolledMsg + diceSum);
        var numberOfMoves = this.showPossibleMoves();

        if (numberOfMoves === 0) {
          //No moves for this player - switch to other user
          this.updatePlayerSecondStatus(this.currentPlayer, noMoves);
          this.switchToOtherPlayer();
        }
      }
    } //game not over
  } //rollDice method

  enableRollButton () {
    $(".roll-button").prop("disabled", false);
  }

  disableRollButton () {
    $(".roll-button").prop("disabled", true);

  }

  getIndexOfLastPlayerSpaceOnBoard() {
    //Determine game board space index of last space prior to home for the current player
    if (game.currentPlayer === player1) {
      return player1IndexMap[player1IndexMap.length - 1];

    } else {
      return player2IndexMap[player2IndexMap.length - 1];
    }
  } //getIndexOfLastPlayerSpaceOnBoard


  calculateNumberOfSpacesUntilHome(gameSpaceNumber) {
    //Given a game board space index, find the number of spaces needed to get to the home space (off the board)
    var indexMap = this.getIndexMap();
    var currentIndex = indexMap.indexOf(gameSpaceNumber);

    if (currentIndex > -1) {
      //index found
      return indexMap.length - currentIndex - 1;

    } else {
      //game space number is not in the array.
      return -1;
    }

  } //calculateNumberOfSpacesUntilHome

  showPossibleMoves() {
    // Show on the game board the number of possible moves for the current player based on the dice roll
    // Returns number of possible moves
    // console.log("In showPossibleMoves for player " + this.currentPlayer);
    // console.log("Dice roll is " + this.diceRoll);
    var i = 0;
    var pieceArray = game.getGamePieceArray();

    var offPieceAlreadySelected = false;

    //Reset canMoveTo property for the game board
    for (i = 0; i < maxSpacesOnBoard; i++) {
      this.gameBoard[i].canBeMovedTo = false;
    }

    // Loop through all the game pieces for the current player to see if that piece can move
    var canMove = false;
    for (i = 0; i < numberOfPieces; i++) {
      if (!pieceArray[i].pieceIsHome) {
        //Piece is not home.
        if (pieceArray[i].gameBoardSpaceIndex !== pieceStartIndex) {
          //This piece is on the board - definitely test if it can move
          canMove = pieceArray[i].determineIfCanMove(this.diceRoll);
        } else {
          //Piece is not on the board - since we already know it isn't home, only test ONE of the
          //start pieces
          if (!offPieceAlreadySelected) {
            canMove = pieceArray[i].determineIfCanMove(this.diceRoll);
            //Set flag so we don't check a start piece again
            offPieceAlreadySelected = true;
          } //start piece not yet selected (but it is now)
        }//piece is in the start area
      } // piece is not home
    } //for

    //Light up board spaces that can be moved to
    var movesAvailable = 0;
    for (i = 0; i < maxSpacesOnBoard; i++) {
      if (this.gameBoard[i].canBeMovedTo) {
        movesAvailable += 1;
        this.gameBoard[i].showPossibleMoveIndicator();
      }
    }

    return movesAvailable;

  } //showPossibleMoves method

  //Method called when a game piece is clicked
  manageGamePiece(targetId) {
    //** NOT USED ***
    // console.log("In manageGamePiece:", event);
    // console.log("In manageGamePiece:", targetId);
    //Get the associated array piece for the button that was pressed.
    var pieceArray = [];
    if (this.currentPlayer === 1) {
      pieceArray = this.player1GamePieceArray;
    } else {
      pieceArray = this.player2GamePieceArray;
    }

    var index = parseInt(targetId.slice(-2), 10);
    // console.log("In manageGamePiece; index is " + index);

    // pieceArray[index - 1].processPieceClick();

  } //manageGamePiece

  getOtherPlayerNumber() {
    if (this.currentPlayer === player1) {
      return player2;
    } else {
      return player1;
    }

  } //getOtherPlayerNumber

  getPlayerStartClassName (player) {
    //Return name of the CSS class to use when a player piece is in the start position (need?)
    if (player === player1) {
      return player1StartClassName;
    } else {
      return player2StartClassName;
    }

  } //getPlayerStartClassName

  getPlayerOnBoardClassName (player) {
    //Return name of the CSS class to use when a player piece is on the board
    if (player === player1) {
      return player1OnBoardClassName;
    } else {
      return player2OnBoardClassName;
    }

  } //getPlayerOnBoardClassName

  getPlayerHomeClassName (player) {
    //Return name of the CSS class to use when a player piece comes home
    if (player === player1) {
      return player1HomeClassName;
    } else {
      return player2HomeClassName;
    }
  } //getPlayerHomeClassName

  initializePieces() {
    //Initialize pieces - they should only have the default class attached to them
    var jQueryName1 = "";
    var jQueryName2 = "";
    for (var i = 0; i < numberOfPieces; i++) {
      jQueryName1 = "#p1" + (i+1);
      jQueryName2 = "#p2" + (i+1);
      $(jQueryName1).removeClass(this.getPlayerOnBoardClassName(player1));
      $(jQueryName1).removeClass(this.getPlayerHomeClassName(player1));
      $(jQueryName2).removeClass(this.getPlayerOnBoardClassName(player2));
      $(jQueryName2).removeClass(this.getPlayerHomeClassName(player2));
    }
  } //initializePieces


} // UrGame



function startGame() {
  // console.log("In startGame");


  //Initialize a game (TODO - This will need to change when can choose to play against computer)
  game = new UrGame(twoPlayerGame);



} //startGame

//Get the ball rolling...
startGame();
