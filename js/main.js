import init from "../pkg/wasm_demo.js";

import { setupSnake, startSnake, cleanupSnake } from "./snake.js";
import { setupFlappy, startFlappy, cleanupFlappy } from "./flappy.js";
import { setupPong, startPong, cleanupPong } from "./pong.js";

let activeGame = null;
let waitingForStart = false;

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");
const restartButton = document.getElementById("restart-btn");

await init();


// MENU EVENTS
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

restartButton.addEventListener("click", restartActiveGame);

window.addEventListener("keydown", (e) => {
    if (!activeGame || e.repeat) return;

    if (waitingForStart && e.key.toLowerCase() === "p") {
        e.preventDefault();
        beginActiveGame();
        return;
    }

    if (waitingForStart) return;

    if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        restartActiveGame();
    }
});


// SWITCH GAME
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
    showStartScreen(game);
}


// START GAME
function beginActiveGame() {
    waitingForStart = false;
    restartButton.disabled = false;
    startGame(activeGame);
}

function startGame(game) {
    if (game === "snake") startSnake();
    if (game === "pong") startPong();
    if (game === "flappy") startFlappy();
}

function restartActiveGame() {
    if (waitingForStart) return;

    if (activeGame === "snake") startSnake();
    if (activeGame === "pong") startPong();
    if (activeGame === "flappy") startFlappy();
}

function showStartScreen(game) {
    waitingForStart = true;
    restartButton.disabled = true;

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#061620";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(36, 138, canvas.width - 72, 124);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "28px Arial";
    ctx.fillText("Press P to start", canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px Arial";
    ctx.fillText(controlHintFor(game), canvas.width / 2, canvas.height / 2 + 28);
}


// BACK TO MENU
function goHome() {
    cleanupSnake();
    cleanupPong();
    cleanupFlappy();

    gamePage.classList.add("hidden");
    homePage.classList.remove("hidden");

    activeGame = null;
    waitingForStart = false;
    restartButton.disabled = false;
}

function controlHintFor(game) {
    if (game === "snake") return "WASD or arrow keys";
    if (game === "pong") return "W/S or arrow keys";
    if (game === "flappy") return "Spacebar to flap";
    return "";
}

function updateGameText(game) {
    const title = document.getElementById("game-title");
    const hint = document.getElementById("hint");
    const score = document.getElementById("score");
    const bestScore = document.getElementById("best-score");

    score.innerText = "0";

    if (game === "snake") {
        title.innerText = "Snake";
        hint.innerText = "Press P to start. Use WASD or arrow keys ↑ ↓ ← →. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-snake") || "0";
    }

    if (game === "pong") {
        title.innerText = "Pong";
        hint.innerText = "Press P to start. Use W/S or arrow keys ↑ ↓. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-pong") || "0";
    }

    if (game === "flappy") {
        title.innerText = "Flappy Bird";
        hint.innerText = "Press P to start. Press Spacebar to flap. Press R to restart";
        bestScore.innerText = localStorage.getItem("best-flappy") || "0";
    }
}
