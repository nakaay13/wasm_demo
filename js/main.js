import init from "../pkg/wasm_demo.js";

import { setupSnake, startSnake, cleanupSnake } from "./snake.js";
import { setupSpace, startSpace, cleanupSpace } from "./space.js";

let activeGame = null;

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");

await init();

// MENU EVENTS
document.getElementById("snake-card").addEventListener("click", () => {
    switchGame("snake");
});

document.getElementById("space-card").addEventListener("click", () => {
    switchGame("space");
});

document.getElementById("back-btn").addEventListener("click", goHome);

document.getElementById("restart-btn").addEventListener("click", () => {
    if (activeGame === "snake") startSnake();
    if (activeGame === "space") startSpace();
});

function switchGame(game) {
    homePage.classList.add("hidden");
    gamePage.classList.remove("hidden");

    cleanupSnake();
    cleanupSpace();

    activeGame = game;

    if (game === "snake") setupSnake();
    if (game === "space") setupSpace();

    startGame(game);
}

function startGame(game) {
    if (game === "snake") startSnake();
    if (game === "space") startSpace();
}

function goHome() {
    cleanupSnake();
    cleanupSpace();

    gamePage.classList.add("hidden");
    homePage.classList.remove("hidden");

    activeGame = null;
}