import init from "../pkg/wasm_demo.js";

import { setupSnake, startSnake, cleanupSnake } from "./snake.js";
import { setupFlappy, startFlappy, cleanupFlappy } from "./flappy.js";

let activeGame = null;

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");

await init();


// 🎮 MENU EVENTS
document.getElementById("snake-card").addEventListener("click", () => {
    switchGame("snake");
});

document.getElementById("flappy-card").addEventListener("click", () => {
    switchGame("flappy");
});

document.getElementById("back-btn").addEventListener("click", goHome);

document.getElementById("restart-btn").addEventListener("click", () => {
    if (activeGame === "snake") startSnake();
    if (activeGame === "flappy") startFlappy();
});


// 🎮 SWITCH GAME
function switchGame(game) {
    homePage.classList.add("hidden");
    gamePage.classList.remove("hidden");

    cleanupSnake();
    cleanupFlappy();

    activeGame = game;

    if (game === "snake") setupSnake();
    if (game === "flappy") setupFlappy();

    startGame(game);
}


// ▶ START GAME
function startGame(game) {
    if (game === "snake") startSnake();
    if (game === "flappy") startFlappy();
}


// 🏠 BACK TO MENU
function goHome() {
    cleanupSnake();
    cleanupFlappy();

    gamePage.classList.add("hidden");
    homePage.classList.remove("hidden");

    activeGame = null;
}