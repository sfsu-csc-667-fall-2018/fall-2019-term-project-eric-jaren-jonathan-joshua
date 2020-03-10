## CSC667-02
## Internet Application Design and Development

## Term Project
# UNO

### Members:
Eric Bristow, Jaren Lynch, Jonathan Fontejon, Joshua Agulto

### Project Specifications:
For this project, we have decided that we will be pursuing a version of the card game, UNO. In this game, players are challenged to see who can empty out their hands first. To play the game, each player must place down a card that has one matching characteristic of the card that’s at the top of the middle stack. Each card varies from number and color. Cards can only be matched by their colors and their value. If the middle stack has a Red 4 card, the next player can only play a card that is either red or a 4-card. Sounds simple, right? Wrong. Decks are also equipped with special cards. With these special cards, players are able to completely change the tide of the game. 

Draw 2 Card – When this card is played, the following player is forced to draw 2 cards from the deck. A player is able to stack this card if the player also has a Draw 2 card. Players are able to stack this card infinitely until a player does not have a Draw 2 card. This card can only be played on Draw 2 cards and matching colors.

Reverse Card – This card reverses the direction of play. 

Skip Card – This card skips the next player’s turn. 

Wild Card – When this card is played, the one who played the card can change the color of the stack’s top card. This card can also be played on any card. For example, if the top of the middle stack is a Red 4, regardless of its color and value, the current player can place a Wild card and change the color of that stack. (Note: The number value is arbitrary because the Wild card only has a color. Any card can be played on top of the Wild card if it matches its owners color request). 

Wild Draw 4 Card – When this card is played, the one who played the card can change the color of the stack’s top card and forces the next player to Draw 4. The behavior of this card is similar to Draw 2. This card can be stacked infinitely until a player does not have a Draw 4 card. (Note: Draw 4 cards CANNOT be stacked with Draw 2 cards.

### Objective:
Our objective for this project is to essentially replicate the idea of UNO and implement it as a web applet that people can connect to. For our web site specifications, we plan to:
	* Have an instance of UNO
	* Contain a chat bar on the right-hand side – The chat bar will have two tabs: Global Chat and Lobby Chat
	* Contain a lobby bar where players can join a public lobby or create a private lobby
	* Have each lobby contain a maximum of four players. 
	* Allow players to join any public lobby so long as there is a spot available
	* Allow players to join mid-game but not be permit them to play until the current game is over
	* Create a database of players accounts that allow players to customize their profile picture and username
	* Block features, like profile customization, for clients who do not have accounts

For our game specifications, we play to:
	* Create an UNO game using JavaScript
	* Implement all current features of UNO (such as rules and cards)
	* Force players to follow a clockwise order, unless a Reverse card is played
	* Have stackable Draw 4 and Draw 2 cards
	* Allow a maximum of 4-players in each lobby
	* Allow players to match the top stack card by card value and color
	* Allow players to spectate if they join a lobby whose game is in progress

To complete the project, we will be using:
	* JavaScript, CSS, and HTML for website and web-app development
	* Node.js and Express.js for additional web functionality
	* PostgreSQL to store and hold account information, lobby information, and chat information
	* Heroku to manage all of our project elements
 	* GitHub to manage version control
	* Discord for communication

