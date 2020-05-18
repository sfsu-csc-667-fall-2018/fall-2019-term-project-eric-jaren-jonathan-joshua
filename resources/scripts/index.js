const socket = io();
const chat = document.getElementById('cr-chat');
const chatBox = document.getElementById('cr-chat-container');
const accountDetailsButton = document.getElementById('account-details-button');


socket.on('globalMessage', message => {
    const domNode = document.createElement('div');
    domNode.classList.add('cr-chat-message');
    domNode.innerHTML = '<p class="cr-chat-name">' + message.username + ': </p><p class="cr-chat-message-content">' + message.text + '</p>';

    document.querySelector('.cr-intro-chat').appendChild(domNode);
    chatBox.scrollTop = chatBox.scrollHeight;
})

socket.on('consoleMessage', message => {
    const domNode = document.createElement('div');
    domNode.innerHTML = '<p class="console-text">' + message + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);

    chatBox.scrollTop = chatBox.scrollHeight;
})

// Login and Sign-Up Animations //
document.getElementById("login-button").addEventListener("click", function() {
    document.getElementById("login-popup").classList.remove("cr-hidden");
});

document.getElementById("signup-button").addEventListener("click", function() {
    document.getElementById("signup-popup").classList.remove("cr-hidden");
});

document.getElementById("close-popup-login").addEventListener("click", function() {
    document.getElementById("login-popup").classList.add("cr-hidden");
});

document.getElementById("close-popup-signup").addEventListener("click", function() {
    document.getElementById("signup-popup").classList.add("cr-hidden");
});