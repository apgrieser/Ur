// Royal Game of Ur
//
// Written by Andrea Grieser 2020
//

// Constant definitions
const version = "1.0";

const numberOfDice = 4;
const numberOfPieces = 7;
const maxSpacesOnBoard = 22; //There are 22 spaces TOTAL on the board (8 spaces are shared between players); 2 are the home positions
const player1 = 1;
const player2 = 2;
const humanPlayer = player1; //human is the first player
const aiPlayer = player2; //computer is the second player

// Constants used for game play modes
const twoPlayerGame = 0;
const onePlayerGameAgainstAI = 1;
const twoPlayerGameRemote = 2; //FUTURE

// Constants to specify the difficulty level for the AI to choose the next move
const easyDifficultyLevel = 0;
const mediumDifficultyLevel = 1;
const hardDifficultyLevel = 2;

const twoPlayerGameHeader = "Player 2";
const onePlayerGameAgainstAIHeader = "Computer";
const headerSelector = "l2";

// MAY NOT NEED THIS
// const player1SelectedClassName = "player1piece-pressed";
// const player2SelectedClassName = "player2piece-pressed";

//Value of the current player on space if no one is on the space
const noPlayerOnSpace = 0;

// Status messages
const yourTurnMsg = "Your Turn - Roll";
const waitMsg = "wait...";
const rolledMsg = "You rolled:  ";
const rolledZero = "You rolled 0 - no pieces can move";
const rolledZeroAgainstAi = "You rolled - 0; when computer turn ends, go again";
const noMoves = "You have no moves - other player goes";
const goAgain = "You go again!";
const playerWins = "You Win!!";
const loserMsg = "Better Luck Next Time";
const sentStart = "You were sent back to start";
const wentHome = "You made it home!";
const msgDelay = 1500; //milliseconds to delay before moving on from some messages NOT USING?
const blinkInterval = 100; //milliseconds ot blink winner message

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
  // console.log("In dice roll button event handler")
  game.rollDice(this);

}); //roll-button click event handler


$(".restart-button").click(function(event) {
  //Restart button - start a new game

  //Ick.  Is there a way to make a nicer dialog?
  if (confirm("Are you sure you want to restart?")) {
    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame(game.gamePlayType, game.gameDifficultyMode);
  }

}); //event handler for restart button


$("#setAIE").click(function(event) {
  // console.log("Setting to play computer (easy) pressed");
  if (confirm("Are you sure you want to play the computer (random mode)?  This will restart the game.")) {
    $("#setAIE").addClass("active");
    $("#setAIM").removeClass("active");
    $("#setAIH").removeClass("active");
    $("#setHumanLocal").removeClass("active");

    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame(onePlayerGameAgainstAI, easyDifficultyLevel);
  }
});


$("#setAIM").click(function(event) {
  // console.log("Setting to play computer (medium) pressed");
  if (confirm("Are you sure you want to play the computer (traditional mode)?  This will restart the game.")) {
    $("#setAIM").addClass("active");
    $("#setAIE").removeClass("active");
    $("#setAIH").removeClass("active");
    $("#setHumanLocal").removeClass("active");
    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame(onePlayerGameAgainstAI, mediumDifficultyLevel);
  }
});

$("#setAIH").click(function(event) {
  // console.log("Setting to play computer (hard) pressed");
  if (confirm("Are you sure you want to play the computer (simulations mode)?  This will restart the game.")) {
    $("#setAIH").addClass("active");
    $("#setAIM").removeClass("active");
    $("#setAIE").removeClass("active");
    $("#setHumanLocal").removeClass("active");
    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame(onePlayerGameAgainstAI, hardDifficultyLevel);
  }
});

$("#setHumanLocal").click(function(ecvent) {
  // console.log("Setting to play a human local pressed");
  if (confirm("Are you sure you want to play with another person?  This will restart the game.")) {
    $("#setHumanLocal").addClass("active");
    $("#setAIE").removeClass("active");
    $("#setAIM").removeClass("active");
    $("#setAIH").removeClass("active");
    //Remove winner display class stuff from the player status.
    game.removeWinnerBigDeal();
    startGame(twoPlayerGame);
  }
});


$("#setHumanRemote").click(function(event) {
  // console.log("FUTURE FEATURE Setting to play a human remote pressed");
  if (confirm("Are you sure you want to play with another person?  This will restart the game.")) {
    //Remove winner display class stuff from the player status.
    //UNCOMMENT NEXT TWO STATEMENTS WHEN READY TO IMPLEMENT
    // game.removeWinnerBigDeal();
    // startGame(twoPlayerGameRemote);
  }
});


$(".tcell").click(function(event) {
  //Event handler when someone clicks on a game board space

  // console.log("In table cell click event handler: target: " + event.target.id);
  //Get the game board space index from the event target id
  var gameBoardSpaceIndex = parseInt(event.target.id.slice(-2), 10);
  if (event.target.id !== "") {
    game.gameBoard[gameBoardSpaceIndex].manageGameBoardSpaceMove();
  }
}); //table cell click event


function enableRollButton() {
  $(".roll-button").prop("disabled", false);
} //enableRollButton


function disableRollButton() {
  $(".roll-button").prop("disabled", true);
} //disableRollButton


// **********  UrAI class *************************

class UrAI {
  // Class to determine the next move for an AI player

  constructor(difficulty) {

    this.difficultyLevel = difficulty;
    this.nextGameSpaceToMoveTo = -1;

  } //constructor


  determineNextMoveSpaceNumber(boardArray) {
    //Use the Ur server to figure out the next move for the computer

    var nextMove = -1;
    var urlText = "/nextMove";

    // Things to pass to the server:  the difficulty level and the game board array
    var serverObject = {
      difficulty: this.difficultyLevel,
      player1PiecesHome: game.getNumberPiecesHomeCounter(player1),
      player2PiecesHome: game.getNumberPiecesHomeCounter(player2),
      gameBoardArray: boardArray
    }

    console.log("Before server call; serverObject is: ", serverObject);
    // console.log("Before JSON convert: ", this.gameBoardArray);
    // var jsonGameBoardArray = JSON.stringify(this.gameBoardArray);
    // console.log("After JSON convert: ", jsonGameBoardArray);
    // console.log("serverObject: ", serverObject);
    // console.log("JSON serverObject: ", JSON.stringify(serverObject));

    // console.log("Doing .ajax thing");
    // Use ajax to pass the request to the server
    // Response will come to the .done indicator
    // var self = this;
    var jqxhr = $.ajax({
        type: "POST",
        url: urlText,
        contentType: "application/json; charset=utf-8",
        // context: self,
        // contents: jsonGameBoardArray,
        data: JSON.stringify(serverObject),
        dataType: "json",
        // async: false,
        // beforeSend: function(xhr) {
        //   console.log("before send in ajax with url " + this.url, this.data)
        // },

      })

      .done(function(data) {
        console.log("Back from ajax in done ", data);
        console.log("In done function: ", data.nextMove);
        // nextMove = data.nextMove;
        //Tell the game the next move for the computer
        game.receiveAiNextMove(data.nextMove);

        // console.log("Back", jqxhr);
        // console.log("Response text ");

      })

      .fail(function(xhr) {
        console.log("ERROR from server was returned: " + xhr.status + " " + xhr.statusText);
      });

    // console.log("Back - jqxhr is: ", jqxhr);

  } //determineNextMoveSpaceNumber

} //class UrAI


// **********  GameBoardSpace class ***************

class GameBoardSpace {
  // Class for each space on the game board

  constructor(gameSpaceNumber) {

    this.spaceNumber = gameSpaceNumber;
    this.isRosette = (rosetteIndeces.includes(this.spaceNumber)) ? true : false;
    this.canBeMovedTo = false; //True if a place the current player can move to
    this.potentialPieceNumber = pieceStartIndex; //Number of piece that *could* move here (calculated during determine if can move there)
    this.potentialPreviousSpaceNumber = pieceStartIndex; //Game space number of potential piece; -1 means it is still in start area
    this.pieceNumber = pieceStartIndex; //Number of piece on this space (array position in its pieceArray) for the player number on the space
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
    // console.log("In clearGameSpace before hideGamePlayImages; playerOnSpace is " + this.playerOnSpace);
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


  manageGameBoardSpaceMove() {
    //Method that responds to a game board space being clicked on (meaning player wants to move here)
    //or the server returning a game board space for the ai to move to

    //Only do anything if this a space that can be moved to by a player (based on previous processing)
    if (this.canBeMovedTo) {

      //Move the correct piece to this space
      var pieceNumber = this.potentialPieceNumber;
      var pieceArray = game.getGamePieceArray();
      pieceArray[pieceNumber].movePieceToSpace(this.spaceNumber);

      //We shouldn't see the game space indicators on the board any more.
      game.hideAllPossibleMoveIndicators();

      if (!game.gameOver) {

        if (game.currentPlayer === aiPlayer && game.gamePlayType === onePlayerGameAgainstAI) {
          //Blink the piece if the ai just moved
          game.gameBoard[this.spaceNumber].blinkPieceOnGameBoardSpace(aiPlayer);
        }

        //Switch to the next player, unless the player moved onto a rosette space.
        if (this.isRosette) {
          game.updatePlayerStatus(game.currentPlayer, goAgain);

          //If the ai lands on a rosette, queue up its second turn
          //TIMING ISSUES HERE?  1 millisecond not enough with the blinking?
          if (game.currentPlayer === aiPlayer && game.gamePlayType === onePlayerGameAgainstAI) {
            //AI goes again
            setTimeout(function() {
              game.rollDice();
            }, 1000);

          } else {
            //Need to turn the roll button back on (if it isn't the ai taking its second turn)
            game.enableRollButton();
          }

        } else {
          //Not on a rosette.  Move is over so switch to the other player.
          game.switchToOtherPlayer();

          //New for playing against computer
          //If we are now the playing against the computer and it's the computer's turn, have the computer auto roll
          if (game.currentPlayer === aiPlayer && game.gamePlayType === onePlayerGameAgainstAI) {
            //The computer is the second player - auto roll dice need to be rolled again...
            game.rollDice();
          }

        } //not rosette
      } //game not over
    } //space can be moved to

  } //manageGameBoardSpaceMove


  generateHtmlIdForMoveIndicator() {
    //Generate the HTML id of the can-be-moved-to indicator

    //The format of the move indicator is "spxx", where xx is the game space index number
    var strLocation = this.spaceNumber.toString(10);
    if (strLocation.length === 1) {
      strLocation = "0" + strLocation;
    }

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


  blinkPieceOnGameBoardSpace(playerNumber) {
    var pieceSelector = this.generateHtmlIdForPlayerPiece(playerNumber);
    // console.log("In blinkPieceOnGameBoardSpace for player " + playerNumber);
    $(pieceSelector).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval);

  }

} //gameBoardSpace class


// **********  GamePiece class ***************

class GamePiece {
  // Class for each game piece

  constructor(selector, player) {

    // console.log("GamePiece constructor");
    this.player = player; //player number who owns this piece
    this.gameBoardSpaceIndex = pieceStartIndex;
    this.pieceIsHome = false;
    this.jquerySelector = selector; //Text of jquery selector to use to retrieve the piece from DOM using jquery

  } //constructor


  sendGamePieceToStart() {
    //Reset the game piece - change its color and index to being back in the start area

    $(this.jquerySelector).removeClass(game.getPlayerOnBoardClassName(this.player));
    this.gameBoardSpaceIndex = pieceStartIndex;
    game.updatePlayerSecondStatus(this.player, sentStart);

  } //sendGamePieceToStart


  movePieceToSpace(gameBoardSpaceIndex) {
    //Move this piece to the input game board space index

    //If currently on the board (that is, not in the start position), hide the piece from its current location
    if (this.gameBoardSpaceIndex !== pieceStartIndex) {

      //If we are already on the board, we need to hide this game piece since no longer on starting space.
      game.gameBoard[this.gameBoardSpaceIndex].hidePlayerGamePiece(this.player);

      //Reset the old space properties
      game.gameBoard[this.gameBoardSpaceIndex].playerOnSpace = noPlayerOnSpace;
      game.gameBoard[this.gameBoardSpaceIndex].canBeMovedTo = false;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPieceNumber = pieceStartIndex;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPreviousSpaceNumber = pieceStartIndex;
      game.gameBoard[this.gameBoardSpaceIndex].pieceNumber = pieceStartIndex;

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
      game.gameBoard[this.gameBoardSpaceIndex].hidePlayerGamePiece(this.player);
      game.updatePlayerSecondStatus(this.player, wentHome);

      game.updateNumberOfPiecesHome();
      if (game.getNumberPiecesHomeCounter(this.player) >= game.getGamePieceArray().length) {
        game.gameOver = true;
        game.updatePlayerStatus(game.currentPlayer, playerWins);
        game.updatePlayerStatus(game.getOtherPlayerNumber(), loserMsg);
      }

    } else {
      //piece is still on the game board

      //If there is another player on the space, send them home!
      if (game.gameBoard[gameBoardSpaceIndex].playerOnSpace === game.getOtherPlayerNumber()) {

        game.gameBoard[gameBoardSpaceIndex].clearGameSpace();

      }

      // remember this new space index on the game board
      this.gameBoardSpaceIndex = gameBoardSpaceIndex;

      //Remember which player is on the space associated with this piece.
      game.gameBoard[this.gameBoardSpaceIndex].playerOnSpace = this.player;

      //Reset other game board space properties
      game.gameBoard[this.gameBoardSpaceIndex].canBeMovedTo = false;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPieceNumber = pieceStartIndex;
      game.gameBoard[this.gameBoardSpaceIndex].potentialPreviousSpaceNumber = pieceStartIndex;

      //Remember which piece this is in the game piece array
      var gamePieceArray = game.getGamePieceArray();
      game.gameBoard[this.gameBoardSpaceIndex].pieceNumber = gamePieceArray.indexOf(this);

      game.gameBoard[this.gameBoardSpaceIndex].showPlayerGamePiece(this.player);

    } //game piece still on board
  } //movePieceToSpace

} //GamePiece class


// *********************  UrGame class **********

// Game of Ur game board class
class UrGame {

  constructor(gameType, difficultyLevel) {

    this.gamePlayType = gameType; // 0 = 2 players side-by-side; 1 = against computer
    this.gameDifficultyMode = difficultyLevel;
    this.diceRoll = 0;
    this.numberPlayer1PiecesHome = 0;
    this.numberPlayer2PiecesHome = 0;
    this.gameOver = false;

    //create the game board, an array of GameBoardSpaces
    this.gameBoard = [];
    for (var i = 0; i < maxSpacesOnBoard; i++) {
      this.gameBoard.push(new GameBoardSpace(i));
    } //for

    //Initialize game piece arrays for each player
    this.player1GamePieceArray = [];
    this.player2GamePieceArray = [];

    for (var i = 0; i < numberOfPieces; i++) {
      this.player1GamePieceArray.push(new GamePiece("#p1" + (i + 1), player1));
      this.player2GamePieceArray.push(new GamePiece("#p2" + (i + 1), player2));
    };

    //Initialize game
    this.currentPlayer = this.decideFirstPlayer();
    this.setGamePlayerHeaders(gameType);
    this.displayTurn();
    this.setDiceToZero();
    this.initializePieces();
    this.enableRollButton();
    this.updatePlayerSecondStatus(player1, "");
    this.updatePlayerSecondStatus(player2, "");

  } //constructor


  decideFirstPlayer() {
    //Method to decide who goes firstPlayer
    //Placeholder if want to change some day to something else
    //For now, set the current player to player 1
    return player1;
  } // decideFirstPlayer


  displayTurn() {
    //Method to change the player status indicating whose turn it is.

    //Get the display element on the window for the current player
    if (this.currentPlayer == player1) {
      this.updatePlayerStatus(1, yourTurnMsg);
      $("#player1-status").html(yourTurnMsg);
      $("#player1-status").addClass("player-status-active");
      $("#l1").addClass("player-label-active");
      //Clear out second player message if player is a human
      if (this.gamePlayType === twoPlayerGame) {
        this.updatePlayerStatus(2, waitMsg);
      }
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
    this.currentPlayer = (this.currentPlayer === player1) ? player2 : player1;
    this.displayTurn();

    //Turn the roll button back on for this turn.
    this.enableRollButton();

  } //switchToOtherPlayer


  getNumberPiecesHomeCounter(player) {
    var numberPiecesHome = (player === player1) ? this.numberPlayer1PiecesHome : this.numberPlayer2PiecesHome;
    return numberPiecesHome;
  } //getNumberPiecesHomeCounter


  updateNumberOfPiecesHome() {
    //Increment number of pieces home for the current player
    if (this.currentPlayer === player1) {
      this.numberPlayer1PiecesHome += 1;

    } else {
      this.numberPlayer2PiecesHome += 1;
    }

  } //updateNumberOfPiecesHome


  getGamePieceArray() {
    //Return the game piece array associated with the current player
    var gamePieceArray = (this.currentPlayer === player1) ? this.player1GamePieceArray : this.player2GamePieceArray;
    return gamePieceArray;
  } //getGamePieceArray


  getIndexMap() {
    //Returns the indexMap (the game space index numbers) for the current player
    var indexMap = (game.currentPlayer === player1) ? player1IndexMap : player2IndexMap;
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

    //Blink the winner message
    var jQuerySelector = "#player" + player + "-status";
    $(jQuerySelector).addClass("player-winner-status");
    $(jQuerySelector).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval).fadeOut(blinkInterval).fadeIn(blinkInterval);

  } //makeABigDealForWinner

  removeWinnerBigDeal() {
    //Remove any special fonts or effects from the player statuses that are put in when they win
    $("#player1-status").removeClass("player-winner-status");
    $("#player2-status").removeClass("player-winner-status");

  } //removeWinnerBigDeal


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


  setDiceToZero() {
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
      // Leave the human player status up when the computer goes (because sometimes it's hard to tell what's going on)
      if (this.gamePlayType === twoPlayerGame) {
        //Clear out second status always for two player games
        this.updatePlayerSecondStatus(player1, "");
      }  else if (this.currentPlayer !== aiPlayer) {
        //If not a two player game (playing against the ai), then only clear out second status when it isn't the ai's turn
        this.updatePlayerSecondStatus(player1, "");
      }

      // if (this.gamePlayType !== twoPlayerGame && this.currentPlayer !== aiPlayer) {
      //   this.updatePlayerSecondStatus(player1, "");
      // } 
      this.updatePlayerSecondStatus(player2, "");

      //If it's not a two player game, this is a good time to clear out the computer's status
      if (this.gamePlayType !== twoPlayerGame) {
        this.updatePlayerStatus(aiPlayer, waitMsg);
      }

      //Roll the 4 dice, getting their sum
      var diceSum = 0;
      for (var i = 1; i <= numberOfDice; i++) {
        diceSum += this.rollDie(i);
      }

      //Save dice roll value
      this.diceRoll = diceSum;
      // console.log("In rollDice for player " + this.currentPlayer + "; roll is " + this.diceRoll);

      if (this.diceRoll < 1) {
        // console.log("in roll dice - rolled 0");
        if (this.gamePlayType !== twoPlayerGame && this.currentPlayer !== aiPlayer) {
          //Slightly different message sent if you roll a zero and play will switch to the ai
          this.updatePlayerSecondStatus(this.currentPlayer, rolledZeroAgainstAi);

        } else {
          this.updatePlayerSecondStatus(this.currentPlayer, rolledZero);

        }

        this.switchToOtherPlayer();
        console.log("In rollDice rolled < 1 -switched to player " + game.currentPlayer);

        //playing against computer and the human rolled a zero - we need to have the computer auto roll
        if (this.gamePlayType === onePlayerGameAgainstAI && this.currentPlayer === aiPlayer) {
          game.rollDice();
        }

      } else {
        //Rolled bigger than 0
        this.updatePlayerStatus(this.currentPlayer, rolledMsg + diceSum);
        var numberOfMoves = this.showPossibleMoves();

        if (numberOfMoves === 0) {
          //No moves for this player - switch to other user
          this.updatePlayerSecondStatus(this.currentPlayer, noMoves);
          this.switchToOtherPlayer();

          if (game.gamePlayType === onePlayerGameAgainstAI && game.currentPlayer === aiPlayer) {
            //Automatically roll for the ai
            game.rollDice();
          }
        }
      } //rolled bigger than 0
    } //game not over
  } //rollDice method


  enableRollButton() {
    $(".roll-button").prop("disabled", false);
  }


  disableRollButton() {
    $(".roll-button").prop("disabled", true);

  }

  getIndexOfLastPlayerSpaceOnBoard() {
    //Determine game board space index of last space prior to home for the current player
    var lastIndex = (game.currentPlayer === player1) ? player1IndexMap[player1IndexMap.length - 1] : player2IndexMap[player2IndexMap.length - 1];
    return lastIndex;

  } //getIndexOfLastPlayerSpaceOnBoard

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
      for (var i = 0; i < this.gameBoard.length; i++) {
        this.gameBoard[i].canBeMovedTo = false;
      }

      // Loop through pieces already on board for this player and mark spaces they can move to
      for (var i = 0; i < this.gameBoard.length; i++) {
        // console.log("In determinePossibleMoves loop i is " + i + " game board array row is ", this.gameBoardArray[i]);
        if (this.gameBoard[i].playerOnSpace === player) {
          // We've found a piece for the input player
          // Keep track of number of pieces we have on the board
          numPiecesOnBoard += 1;

          // See what would happen if we move it the number our dice gave us

          // Get the game board space index we might be able to move to
          // Get our current space value, and where numerically we are in our path
          var gameSpaceNumber = this.gameBoard[i].spaceNumber;
          var positionInPath = indexMapToUse.indexOf(gameSpaceNumber);
          var newPositionInPath = positionInPath + diceRoll;
          // console.log("In determinePossibleMoves: diceRoll = " + diceRoll + " gameSpaceNumber = " + gameSpaceNumber + ", positionInPath = " + positionInPath + ", newPositionInPath = " + newPositionInPath);

          // Can only consider this piece if moving it doesn't push us past the end of the board
          if (newPositionInPath < indexMapToUse.length) {
            // So far we know that this doesn't move us illegally passed the edge of the board.

            // Get the game space number for this space
            var newGameSpaceNumber = indexMapToUse[newPositionInPath];

            // We can consider this space if we aren't already on it.
            if (this.gameBoard[newGameSpaceNumber].playerOnSpace !== player) {

              // We can't move here if this is a rosette AND the opponent has a piece on this space
              if (this.gameBoard[newGameSpaceNumber].isRosette && this.gameBoard[newGameSpaceNumber].playerOnSpace === otherPlayer) {
                // We can't go here - rosette and other player
                this.gameBoard[newGameSpaceNumber].canBeMovedTo = false;

              } else {
                // We should be able to move here - it isn't a rosette with the other player on it
                this.gameBoard[newGameSpaceNumber].canBeMovedTo = true;
                this.gameBoard[newGameSpaceNumber].potentialPreviousSpaceNumber = gameSpaceNumber;
                this.gameBoard[newGameSpaceNumber].potentialPieceNumber = this.gameBoard[gameSpaceNumber].pieceNumber;


              }
            } // we aren't already on space
          } // we aren't already on space

        } //else {
        //   //We are already on ths space - can't move here
        //   //Nothing to do? (don't set canMoveTo false...might have previously been set by previous test )
        //   // this.gameBoardArray[i].canBeMovedTo = false; DON'T DO THIS
        //
        // }
      } //for

      //Check if a piece off the board can move
      var piecesAtStart = 0;

      piecesAtStart = (player === humanPlayer) ?
        numberOfPieces - numPiecesOnBoard - this.numberPlayer1PiecesHome :
        numberOfPieces - numPiecesOnBoard - this.numberPlayer2PiecesHome;

      if (piecesAtStart > 0) {
        //Another possibility is to move one of our start pieces - see if it can move...
        // Get the game space number for this space - we will be in our "safe" zone, so
        // less checking required
        var newGameSpaceNumber = indexMapToUse[diceRoll - 1];

        // If we aren't already on this piece, we can move here
        if (this.gameBoard[newGameSpaceNumber].playerOnSpace !== player) {
          this.gameBoard[newGameSpaceNumber].canBeMovedTo = true;
          this.gameBoard[newGameSpaceNumber].potentialPreviousSpaceNumber = pieceStartIndex;
          //Get the index of the first piece that is not yet on the board for this player.
          var gamePieceArray = game.getGamePieceArray();
          for (var i=0; i<numberOfPieces; i++) {
            if (gamePieceArray[i].gameBoardSpaceIndex === pieceStartIndex) {
              this.gameBoard[newGameSpaceNumber].potentialPieceNumber = i;
              break;
            }
          } //for

        } else {
          this.gameBoard[newGameSpaceNumber].canBeMovedTo = false;
        }
      }

    } //determinePossibleMoves


  showPossibleMoves() {
    // Show on the game board the number of possible moves for the current player based on the dice roll
    // Returns number of possible moves
    // console.log("In showPossibleMoves for player " + this.currentPlayer);
    // console.log("Dice roll is " + this.diceRoll);
    this.determinePossibleMoves(this.currentPlayer, this.diceRoll);

    if (this.gamePlayType === twoPlayerGame || (this.gamePlayType !== twoPlayerGame && this.currentPlayer === player1)) {
      //Two player side-by-side game or its the human player's turn against ai - light up possible spaces for the move decision
      //Light up board spaces that can be moved to
      var movesAvailable = 0;
      for (var i = 0; i < maxSpacesOnBoard; i++) {
        if (this.gameBoard[i].canBeMovedTo) {
          movesAvailable += 1;
          this.gameBoard[i].showPossibleMoveIndicator();
        }
      }//for

    } else {
      // Playing against AI (who is player 2)
      //We don't know what the moves available are yet, so leave that variable "unset" with anything meaningful
      //(server will figure out if there are available moves or not in this case)
      movesAvailable = -1;

      //Create an ai object to determine where the AI should move next
      var ai = new UrAI(this.gameDifficultyMode);

      //The next method uses the gameBoard object to determine where to move to next.
      //This method also sets the gameboard space index of where the next move is
      ai.determineNextMoveSpaceNumber(game.gameBoard);

    } //ai playing

    return movesAvailable;

  } //showPossibleMoves method


  receiveAiNextMove(nextMove) {
    // Called from the UrAI object after the server figures out the next move for the AI.
    if (nextMove > -1) {
      game.gameBoard[nextMove].manageGameBoardSpaceMove();

    } else {
      //No moves for ai
      game.updatePlayerSecondStatus(game.currentPlayer, noMoves);
      game.switchToOtherPlayer();

      //Automatically roll for the ai
      // if (game.currentPlayer === aiPlayer) {
      //   game.rollDice();
      // }

    } //no moves found for ai

  } //receiveAiNextMove


  getOtherPlayerNumber() {
    //Get the other player number
    return (this.currentPlayer === player1) ? player2 : player1;

  } //getOtherPlayerNumber

  getPlayerStartClassName(player) {
    //Return name of the CSS class to use when a player piece is in the start position (need?)
    return (player === player1) ? player1StartClassName : player2StartClassName;

  } //getPlayerStartClassName

  getPlayerOnBoardClassName(player) {
    //Return name of the CSS class to use when a player piece is on the board
    return (player === player1) ? player1OnBoardClassName : player2OnBoardClassName;

  } //getPlayerOnBoardClassName

  getPlayerHomeClassName(player) {
    //Return name of the CSS class to use when a player piece comes home
    return (player === player1) ? player1HomeClassName : player2HomeClassName;

  } //getPlayerHomeClassName

  initializePieces() {
    //Initialize pieces - they should only have the default class attached to them
    var jQueryName1 = "";
    var jQueryName2 = "";
    for (var i = 0; i < numberOfPieces; i++) {
      jQueryName1 = "#p1" + (i + 1);
      jQueryName2 = "#p2" + (i + 1);
      $(jQueryName1).removeClass(this.getPlayerOnBoardClassName(player1));
      $(jQueryName1).removeClass(this.getPlayerHomeClassName(player1));
      $(jQueryName2).removeClass(this.getPlayerOnBoardClassName(player2));
      $(jQueryName2).removeClass(this.getPlayerHomeClassName(player2));
    }
  } //initializePieces

  setGamePlayerHeaders(gameType) {
    if (gameType === twoPlayerGame) {
      // this.setDisplaysForTwoPlayerGame();
      $("#" + headerSelector).html(twoPlayerGameHeader);
    } else {
      // this.setDisplaysForOnePlayerAgainstAIGame();
      $("#" + headerSelector).html(onePlayerGameAgainstAIHeader);
    }
  } //setGamePlayerHeaders

} // UrGame


function startGame(playType, difficultyLevel) {

  //Initialize a game (TODO - This will need to change when can choose to play against computer)
  // game = new UrGame(twoPlayerGame);
  game = new UrGame(playType, difficultyLevel);

} //startGame

//Get the ball rolling...
console.log("Royal Game of Ur version " + version);

startGame(onePlayerGameAgainstAI, mediumDifficultyLevel);
