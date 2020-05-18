const socket = io();
const chat = document.getElementById('cr-chat');
const draw = document.getElementById('cr-draw');
const chatBox = document.getElementById('cr-chat-container');
const startGameScreen = document.getElementById('cr-game-start');
const joinButton = document.getElementById('cr-game-join');
const startButton = document.getElementById('cr-game-start-button');
const endButton = document.getElementById('cr-game-end');
const leaveButton = document.getElementById('cr-game-leave');
const playerList = document.getElementById('cr-player-list');
const playerHand = document.getElementById('cr-game-hand');
const discardStack = document.getElementById('cr-discard');
const turnHeader = document.getElementById('cr-game-title');
const enemyTop = document.getElementById('cr-enemy-top');
const enemyLeft = document.getElementById('cr-enemy-left');
const enemyRight = document.getElementById('cr-enemy-right');

const globalChatButton = document.getElementById('cr-global-chat');
const lobbyChatButton = document.getElementById('cr-lobby-chat');

const lobbyButton = document.getElementById('lobby');
const globalButton = document.getElementById('global');

let id;
let user;
let currentHand;
let discard;
let turn;
let players;

let lobbyToggle;

socket.on('connect', () => {
    id = socket.id;
    lobbyToggle = true;
})

socket.on('userInfo', user => {
    if (id == user.id) socket.emit('retrieveInfo', user.passport.user);
})

socket.on('foundInfo', userInfo => {
    user = userInfo;
    user.lobby = new URLSearchParams(window.location.search).get('Lobby');

    socket.emit('joinRoom', user);
})

socket.on('getGameInfo', gameInfo => {
    if (gameInfo.game_state == 0) {
        startGameScreen.classList.remove('cr-hidden');
        if (gameInfo.player_list) {
            if (gameInfo.player_list.includes(user.id)) {
                joinButton.classList.add('cr-hidden');
                leaveButton.classList.remove('cr-hidden');
                this.gameInfo = gameInfo;
            } else {
                joinButton.classList.remove('cr-hidden');
                leaveButton.classList.add('cr-hidden');
            }
        }

        players = [];
        playerList.innerHTML = '';
        for (let i = 0; i < gameInfo.player_list.length; i++) {
            socket.emit('findUserById', gameInfo.player_list[i]);
        }

        if (gameInfo.player_list[0] == user.id && gameInfo.player_list.length > 1) startButton.classList.remove('cr-hidden');
        else startButton.classList.add('cr-hidden');
    } else if (gameInfo.game_state == 1) {
        startGameScreen.classList.add('cr-hidden');
        socket.emit('forceUpdate', user);
    }
})

socket.on('gameWinner', user => {
    const lobby = {
        lobby_id: user.lobby,
        game_state: 0
    }
    
    socket.emit('changeGameState', lobby);
})

socket.on('foundUsername', user => {
    players.push(user);
    playerList.innerHTML += '<div class="cr-player-list">' + user.username + '</div>';
})

socket.on('updateGame', (gameInfo) => {
    let deck = gameInfo.deck;
    currentHand = [];

    for (let i = 0; i < deck.length; i++) {
        if (deck[i].player_id == user.id) currentHand.push(deck[i].card_id);
        else if (deck[i].player_id == 0) discard = deck[i].card_id;
    }

    playerHand.innerHTML = '';
    for (let i = 0; i < currentHand.length; i++) findCardByID(playerHand, currentHand[i], 'cr-card-inhand');

    discardStack.innerHTML = '';
    findCardByID(discardStack, discard, '');

    if (gameInfo.gameInfo.player_list[gameInfo.gameInfo.turn] == user.id) {
        playerHand.classList.add('cr-turn');
        turnHeader.innerHTML = 'Your Turn';
        turn = true;
    } else {
        playerHand.classList.remove('cr-turn');
        turnHeader.innerHTML = players[gameInfo.gameInfo.turn].username + '\'s Turn';
        turn = false;
    }

    if (gameInfo.gameInfo.player_list.length == 2) {
        enemyLeft.classList.add('cr-hidden');
        enemyRight.classList.add('cr-hidden');
        enemyTop.classList.remove('cr-hidden');
    } else if (gameInfo.gameInfo.player_list.length == 3) {
        enemyLeft.classList.remove('cr-hidden');
        enemyRight.classList.remove('cr-hidden');
        enemyTop.classList.add('cr-hidden');
    } else if (gameInfo.gameInfo.player_list.length == 4) {
        enemyLeft.classList.remove('cr-hidden');
        enemyRight.classList.remove('cr-hidden');
        enemyTop.classList.remove('cr-hidden');
    }

    if (gameInfo.gameInfo.player_list[0] == user.id) endButton.classList.remove('cr-hidden');
    else endButton.classList.add('cr-hidden');
})

// CR-Chat Listener //
chat.addEventListener('submit', (e) => {
    e.preventDefault();

    if (lobbyToggle) {
        if (e.target.elements.message.value) {
            const message = {
                username: user.username,
                text: e.target.elements.message.value,
                time: new Date().toLocaleString(),
                lobby: user.lobby
            };
    
            chat.reset();
    
            socket.emit('chatMessage', message);
        }
    } else {
        if (e.target.elements.message.value) {
            const message = {
                username: user.username,
                text: e.target.elements.message.value,
                time: new Date().toLocaleString(),
                lobby: user.lobby
            };
    
            chat.reset();
    
            socket.emit('globalChatMessage', message);
        }
    }
})

// draw listener
draw.addEventListener('submit', (e) => {
    e.preventDefault();

    if (turn) socket.emit('drawCard', user);
})

// join game listener
joinButton.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('joinGame', user);
})

// leave game listener
leaveButton.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('leaveGame', user);
})

startButton.addEventListener('submit', (e) => {
    e.preventDefault();
    const lobby = {
        lobby_id: user.lobby,
        game_state: 1
    }
    socket.emit('changeGameState', lobby);
})

endButton.addEventListener('submit', (e) => {
    e.preventDefault();
    const lobby = {
        lobby_id: user.lobby,
        game_state: 0
    }

    socket.emit('changeGameState', lobby);
})

playerHand.addEventListener('click', (e) => {
    e.preventDefault();

    if (turn) {
        let cardId;
        if (e.target.id) {
            cardId = e.target.id;
        } else if (e.target.tagName == 'IMG' || e.target.tagName == 'P') {
            cardId = e.target.parentNode.id;
        }

        user.discardCard = cardId;
        socket.emit('endTurn', user);
    }
})

globalChatButton.addEventListener('submit', (e) => {
    e.preventDefault();

    chatBox.innerHTML = '';
    lobbyToggle = false;
})

lobbyChatButton.addEventListener('submit', (e) => {
    e.preventDefault();

    chatBox.innerHTML = '';
    lobbyToggle = true;
})

socket.on('message', message => {
    if (lobbyToggle) {
        const domNode = document.createElement('div');
        domNode.classList.add('cr-chat-message');
        domNode.innerHTML = '<p class="cr-chat-name">' + message.username + ': </p><p class="cr-chat-message-content">' + message.text + '</p>';

        document.querySelector('.cr-chat-box').appendChild(domNode);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
})

socket.on('globalMessage', message => {
    if (!lobbyToggle) {
        const domNode = document.createElement('div');
        domNode.classList.add('cr-chat-message');
        domNode.innerHTML = '<p class="cr-chat-name">' + message.username + ': </p><p class="cr-chat-message-content">' + message.text + '</p>';
    
        document.querySelector('.cr-chat-box').appendChild(domNode);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
})

socket.on('consoleMessage', message => {
    if (lobbyToggle) {
        const domNode = document.createElement('div');
        domNode.innerHTML = '<p class="console-text">' + message + '</p>';
    
        document.querySelector('.cr-chat-box').appendChild(domNode);
    
        chatBox.scrollTop = chatBox.scrollHeight;
    }
})

function findCardByID(domNode, id, addClass) {
    if (id < 10) {
        if (id != 0) domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-red cr-card-front">' + id + '</div>'
        else domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-red cr-card-front">' +
            '<img class="cr-card-block" src="resources/images/block-48px.svg" alt="Block"></div>';
    } else if (id < 20) {
        if (id != 0) domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-yellow cr-card-front">' + (id - 10) + '</div>'
        else domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-yellow cr-card-front">' +
            '<img class="cr-card-block" src="resources/images/block-48px.svg" alt="Block"></div>';
    } else if (id < 30) {
        if (id != 0) domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-green cr-card-front">' + (id - 20) + '</div>'
        else domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-green cr-card-front">' +
            '<img class="cr-card-block" src="resources/images/block-48px.svg" alt="Block"></div>';
    } else if (id < 40) {
        if (id != 0) domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-blue cr-card-front">' + (id - 30) + '</div>'
        else domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-blue cr-card-front">' +
            '<img class="cr-card-block" src="resources/images/block-48px.svg" alt="Block"></div>';
    } else if (id < 50) {
        switch (id) {
            case 40:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-red cr-card-front"><p class="cr-card-draw-2">+2</p></div>';
                break;
            case 41:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-red cr-card-front">' +
                    '<img class="cr-card-block" src="resources/images/loop-48px.svg" alt="Loop"></div>';
                break;
            case 42:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-yellow cr-card-front"><p class="cr-card-draw-2">+2</p></div>';
                break;
            case 43:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-yellow cr-card-front">' +
                    '<img class="cr-card-block" src="resources/images/loop-48px.svg" alt="Loop"></div>';
                break;
            case 44:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-green cr-card-front"><p class="cr-card-draw-2">+2</p></div>';
                break;
            case 45:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-green cr-card-front">' +
                    '<img class="cr-card-block" src="resources/images/loop-48px.svg" alt="Loop"></div>';
                break;
            case 46:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-blue cr-card-front"><p class="cr-card-draw-2">+2</p></div>';
                break;
            case 47:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-blue cr-card-front">' +
                    '<img class="cr-card-block" src="resources/images/loop-48px.svg" alt="Loop"></div>';
                break;
            case 48:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-rainbow cr-card-front"></div>';
                break;
            case 49:
                domNode.innerHTML += '<div id="' + id + '" class="' + addClass + ' cr-card-rainbow cr-card-front"><p class="cr-card-draw-2">+4</p></div>';
                break;
        }
    }
}