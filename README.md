# The Royal Game of Ur

[Royal Game of Ur Web App](https://powerful-ridge-54202.herokuapp.com/)

The Royal Game of Ur is considered by some to be one of the oldest games still played and seems to be a precursor to backgammon.  Its history is interesting as is how we know the rules (of which there are several variants).

[Watch Irving Finkel from the British Museum explain the history and rules, and play with Tom Scott.](https://youtu.be/WZskjLq040I)

## Rules
This version of the game is a simple variant.  
* Each player has 7 pieces, and has to make their way around the board.  
* Each player alternates turns, rolling 4 tetrahedron shape dice.  
* Each die has 2 sides with 1 pip on it and 2 sides that are blank (the effect is the same as flipping 4 coins).  Therefore a player may roll 0, 1, 2, 3, or 4.
* Players move the sum of the dice (only one piece can move, unlike backgammon where the die values can be split among pieces).  
  * If 0 is rolled, play changes to the opponent.  
  * Players can move to any unoccupied space in their path, or on spaces occupied by an opponent's piece.  The exception is if the opponent is on a rosette (which are gold stars on my board) - a player cannot move to a rosette space if it is occupied by a piece from the other player.  
  * If a player lands on an unoccupied rosette, they get another turn.
  * If a player lands on a space occupied by the opponent and it is not a rosette, the opponent's piece is sent back to the start area off the board.
  * A player must roll the exact number to complete a piece's journey off the board.
  
  The paths for each player are shown here.
  
  ![Gameboard Paths](https://github.com/apgrieser/Ur/blob/master/images/gameBrdPath.png)
  
  ## This Version
  The version in this repository is a web app that used html, css, javascript, bootstrap, and jquery.  You can play it [here](https://powerful-ridge-54202.herokuapp.com/).  You may play with two people sitting next to each other or you may play the computer (see the Settings to change modes).  The computer will play with varying levels of difficulty that you get to choose.
  
  
