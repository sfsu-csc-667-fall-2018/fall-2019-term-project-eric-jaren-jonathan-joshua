const socket = io();
const chat = document.getElementById('cr-chat');
const chatBox = document.getElementById('cr-chat-container');
const accountDetailsButton = document.getElementById('account-details-button');

// startup //
window.onload = function() {
    
}

// account logged in listener // 


// CR-Chat Listener //
chat.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();    
})

socket.on('message', message => {
    const domNode = document.createElement('div');
    domNode.classList.add('cr-chat-message');
    domNode.innerHTML = '<p class="chat-meta">' + message.username +'</p>' + 
                        '<p class="chat-text" style="margin: 0px">' + message.text + '</p>' +
                        '<p class="chat-meta" style="text-align: right">' + message.time + '</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);

    const form = document.getElementById('cr-chat');
    form.reset();
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
    document.querySelector(".cr-login-popup").style.display = "flex";
});

document.getElementById("signup-button").addEventListener("click", function() {
    document.querySelector(".cr-signup-popup").style.display = "flex";
});

document.getElementById("close-popup-login").addEventListener("click", function() {
    document.querySelector(".cr-login-popup").style.display = "none";
});

document.getElementById("close-popup-signup").addEventListener("click", function() {
    document.querySelector(".cr-signup-popup").style.display = "none";
});