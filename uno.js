var colors = ["Blue", "Red", "Green", "Yellow"];
var values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Skip", "Reverse", "Draw 2"];
var wilds = ["Wild", "Wild Draw 4"];
var deck = new Array();
var players = new Array();
var discardPile = new Array();
var currentPlayer;

function createDeck()
{
    deck = new Array();

    for(let i = 0; i < colors.length; i++)
    {
        for(let j = 0; j < values.length; j++)
        {
            var card = {Color: color[i], Value: values[j]};
            deck.push(card);
        }
        for(let j = 1; j < values.length; j++)
        {
            var card = {Color: color[i], Value: values[j]};
            deck.push(card);
        }
    }
    for(let i = 0; i < 4; i++)
    {
        for(let j = 0; j < wilds.length; j++)
        {
            var card = {Color: "Black", Value: wilds[j]}
        }
    }   
}

function shuffle()
{
    for (let i = 0; i < 1000; i++)
    {
        var location1 = Math.floor((Math.random() * deck.length));
        var location2 = Math.floor((Math.random() * deck.length));
        var tmp = deck[location1];

        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}

function createPlayers()
{
    players = new Array();
    for(let i = 0; i < 4; i++)
    {
        var hand = new Array();
        var player = {Player: 'Player ' + i, ID: i, Hand: hand};
        players.push(player);
    }
    currentPlayer = Math.floor(Math.random() * 4);
}

function deal()
{
    for(let i = 0; i < 7; i++)
    {
        for(let j = 0; j < players.length; j++)
        {
            var card = deck.pop();
            players[x].Hand.push(card);
        }
    }
    var card = deck.pop();
    discardPile.push(card);
}

function setupGame()
{
    createPlayers();
    createDeck();
    shuffle();
    deal();
}

function playerTurn(currentPlayer)
{
    /*Player can play a card or pass if they don't have one to play
      If they pass, they draw a card and if that is playable they play it
      if it is not, they forefit their turn*/
    
    //Play Card: Select Card from your hand
    //Skip Turn: Draw a card. If it can be played, play it.
    //If it is not your turn, you cannot play cards
}
function validPlay(card)
{
    if(discardPile.peek().Value.localeCompare(card.Value) == 0 || 
       discardPile.peek().Color.localeCompare(card.Color) == 0 ||
       card.Color.localeCompare("Black") == 0)
    {
        cardEffect(currentPlayer, card);
        discardPile.push(card);
    }
    else
    {
        window.alert("NOT A VALID PLAY");
    }
}
function setColor()
{
    window.alert("WHAT COLOR DO YOU PICK?")
    
}
function endTurn()
{
    let checkDrawnCard = deck.peek();
    if(checkDrawnCard.Color.localeCompare(discardPile.peek().Color) == 0 ||
       checkDrawnCard.Value.localeCompare(discardPile.peek().Value) == 0 ||
       checkDrawnCard.Color.localeCompare("Black") == 0)
    {
        cardEffect(currentPlayer, checkDrawnCard);
        discardPile.push(checkDrawnCard);
    }
    else 
    {
        players[currentPlayer].Hand.push(checkDrawnCard);
    }

    currentPlayer += 1;
    
}
function cardEffect(currentPlayer, card)
{
    if(card.Value.localeCompare("Skip") == 0)
    {
        currentPlayer += 2;
    }
    else if(card.Value.localeCompare("Reverse") == 0)
    {
        players.reverse();
        currentPlayer += 1;
    }
    else if(card.Value.localeCompare("Draw 2") == 0)
    {
        drawCards(currentPlayer + 1, 2);
        currentPlayer += 1;
    }
    else if(card.Value.localeCompare("Wild") == 0)
    {
        setColor();
        currentPlayer += 1;
    }
    else if(card.Value.localeCompare("Wild Draw 4") == 0)
    {
        setColor();
        drawCards(currentPlayer + 1, 4);
        currentPlayer += 1;
    }
    else
    {
        currentPlayer += 1;
    }

    if(currentPlayer > 4)
    {
        currentPlayer = (currentPlayer % 4) + 1;
    }
}
function drawCards(player, numberOfCards)
{
    for (let i = 0; i < numberOfCards; i++) 
    {
        if(deck.length == 0)
        {
            restockDeck();
        }
        players[player].Hand.push(deck.pop());        
    }
}
function restockDeck()
{
    var discardSize = discardPile.length();

    for(let i = 0; i < discardSize; i++)
    {
        deck.push(discardPile.pop());
    }
    shuffle();
}