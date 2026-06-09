import init from "../pkg/wasm_demo.js";

import { setupSnake, startSnake, cleanupSnake } from "./snake.js";
import { setupFlappy, startFlappy, cleanupFlappy } from "./flappy.js";
import { setupPong, startPong, cleanupPong } from "./pong.js";

let activeGame = null;

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");

await init();


// 🎮 MENU EVENTS
document.getElementById("snake-card").addEventListener("click", () => {
    switchGame("snake");
});

document.getElementById("pong-card").addEventListener("click", () => {
    switchGame("pong");
});

document.getElementById("flappy-card").addEventListener("click", () => {
    switchGame("flappy");
});

document.getElementById("back-btn").addEventListener("click", goHome);

document.getElementById("restart-btn").addEventListener("click", restartActiveGame);

window.addEventListener("keydown", (e) => {
    if (!activeGame || e.repeat) return;

    if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        restartActiveGame();
    }
});


// 🎮 SWITCH GAME
function switchGame(game) {
    homePage.classList.add("hidden");
    gamePage.classList.remove("hidden");

    cleanupSnake();
    cleanupPong();
    cleanupFlappy(); 

    activeGame = game;

    if (game === "snake") setupSnake();
    if (game === "pong") setupPong();
    if (game === "flappy") setupFlappy();

    updateGameText(game);
    startGame(game);
}


// ▶ START GAME
function startGame(game) {
    if (game === "snake") startSnake();
    if (game === "pong") startPong();
    if (game === "flappy") startFlappy();
}

function restartActiveGame() {
    if (activeGame === "snake") startSnake();
    if (activeGame === "pong") startPong();
    if (activeGame === "flappy") startFlappy();
}


// 🏠 BACK TO MENU
function goHome() {
    cleanupSnake();
    cleanupPong();
    cleanupFlappy();

    gamePage.classList.add("hidden");
    homePage.classList.remove("hidden");

    activeGame = null;
}

function updateGameText(game) {
    const title = document.getElementById("game-title");
    const hint = document.getElementById("hint");
    const score = document.getElementById("score");
    const bestScore = document.getElementById("best-score");

    score.innerText = "0";

    if (game === "snake") {
        title.innerText = "Snake";
        hint.innerText = "Use arrow keys ↑ ↓ ← →. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-snake") || "0";
    }

    if (game === "pong") {
        title.innerText = "Pong";
        hint.innerText = "Use W/S or arrow keys ↑ ↓. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-pong") || "0";
    }

    if (game === "flappy") {
        title.innerText = "Flappy Bird";
        hint.innerText = "Press Spacebar to flap. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-flappy") || "0";
    }
}
