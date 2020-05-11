// const socket = io();
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

    const message = e.target.elements.message.value;
    // socket.emit('chatMessage', message);
})

// Chat Box Update //
// socket.on('message', message => {
//     console.log(socket.username);
//     updateChat(message);
//     chatBox.scrollTop = chatBox.scrollHeight;
// })

function updateChat(message) {
    const domNode = document.createElement('div');
    domNode.classList.add('cr-chat-message');
    domNode.innerHTML = '<p class="chat-meta">' + message.username +'</p>' + 
                        '<p class="chat-text" style="margin: 0px">' + message.text + '</p>' +
                        '<p class="chat-meta" style="text-align: right">September 12, 2019</p>';
    
    document.querySelector('.cr-chat-box').appendChild(domNode);

    const form = document.getElementById('cr-chat');
    form.reset();
}