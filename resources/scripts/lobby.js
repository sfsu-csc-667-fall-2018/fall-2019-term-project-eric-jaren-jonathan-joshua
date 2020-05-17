const socket = io();
const chat = document.getElementById('cr-chat');
const draw = document.getElementById('cr-draw');
const chatBox = document.getElementById('cr-chat-container');
const startGameScreen = document.getElementById('cr-game-start');
const joinButton = document.getElementById('cr-game-join');
const startButton = document.getElementById('cr-game-start-button');
const leaveButton = document.getElementById('cr-game-leave');
const playerList = document.getElementById('cr-player-list');

let id;
let user;
let gameInfo;

socket.on('connect', () => {
    id = socket.id;
    console.log(socket);
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
    if (gameInfo.player_list) {
        if (gameInfo.player_list.includes(user.id)) {
            joinButton.classList.add('cr-hidden');
            leaveButton.classList.remove('cr-hidden');
            this.gameInfo = gameInfo;
        } else {
            joinButton.classList.remove('cr-hidden');
            leaveButton.classList.add('cr-hidden');
        }

        playerList.innerHTML = '';
        for (let i = 0; i < gameInfo.player_list.length; i++) {
            playerList.innerHTML += '<h2>' + gameInfo.player_list[i] + '</h2>';
        }
    }

    if (gameInfo.player_list[0] == user.id && gameInfo.player_list.length > 1) startButton.classList.remove('cr-hidden');
    else startButton.classList.add('cr-hidden');
})

// CR-Chat Listener //
chat.addEventListener('submit', (e) => {
    e.preventDefault();

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
})

// draw listener
draw.addEventListener('submit', (e) => {
    e.preventDefault();
    let randomColor = Math.floor((Math.random() * 5) + 1);
    console.log(randomColor);
    const domNode = document.createElement('div');
    switch (randomColor) {
        case 1: 
            domNode.innerHTML = '<div class="cr-card-inhand cr-card-red cr-card-front">' + Math.floor((Math.random() * 9) + 1); + '</div>';
            break;
        case 2: 
            domNode.innerHTML = '<div class="cr-card-inhand cr-card-yellow cr-card-front">' + Math.floor((Math.random() * 9) + 1); + '</div>';
            break;
        case 3: 
            domNode.innerHTML = '<div class="cr-card-inhand cr-card-green cr-card-front">' + Math.floor((Math.random() * 9) + 1); + '</div>';
            break;
        case 4: 
            domNode.innerHTML = '<div class="cr-card-inhand cr-card-blue cr-card-front">' + Math.floor((Math.random() * 9) + 1); + '</div>';
            break;
        case 5:
            domNode.innerHTML = '<div class="cr-card-inhand cr-card-rainbow cr-card-front">' + Math.floor((Math.random() * 9) + 1); + '</div>';
            break;
    }
    document.querySelector('.cr-game-hand').appendChild(domNode);
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


socket.on('message', message => {
    const domNode = document.createElement('div');
    domNode.classList.add('cr-chat-message');
    domNode.innerHTML = '<p class="cr-chat-name">' + message.username + ': </p><p class="cr-chat-message-content">' + message.text + '</p>';
                        //'<p class="chat-meta" style="text-align: right">' + message.time + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);
    chatBox.scrollTop = chatBox.scrollHeight;
})

socket.on('consoleMessage', message => {
    const domNode = document.createElement('div');
    domNode.innerHTML = '<p class="console-text">' + message + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);

    chatBox.scrollTop = chatBox.scrollHeight;
})