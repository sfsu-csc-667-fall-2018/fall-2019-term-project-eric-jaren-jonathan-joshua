const socket = io();
const chat = document.getElementById('cr-chat');
const chatBox = document.getElementById('cr-chat-container');
const accountDetailsButton = document.getElementById('account-details-button');

let id;
let user;

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

        const form = document.getElementById('cr-chat');
        form.reset();
    
        socket.emit('chatMessage', message);
    }
    
})

socket.on('message', message => {
    const domNode = document.createElement('div');
    domNode.classList.add('cr-chat-message');
    domNode.innerHTML = '<p class="chat-meta">' + message.username +'</p>' + 
                        '<p class="chat-text" style="margin: 0px">' + message.text + '</p>' +
                        '<p class="chat-meta" style="text-align: right">' + message.time + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);
    chatBox.scrollTop = chatBox.scrollHeight;
})

socket.on('consoleMessage', message => {
    const domNode = document.createElement('div');
    domNode.innerHTML = '<p class="console-text">' + message + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);

    chatBox.scrollTop = chatBox.scrollHeight;
})