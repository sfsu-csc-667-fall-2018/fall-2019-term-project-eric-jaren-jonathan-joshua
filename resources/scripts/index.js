const socket = io();

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