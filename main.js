import init, { SnakeGame, Direction } from "./pkg/wasm_demo.js";

let game;

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");

document
    .getElementById("snake-card")
    .addEventListener("click", startSnake);

document
    .getElementById("back-btn")
    .addEventListener("click", goHome);

async function startSnake() {

    homePage.classList.add("hidden");
    gamePage.classList.remove("hidden");

    if (game) {
        return;
    }

    await init();

    game = new SnakeGame(20, 20);

    setupSnake();
}

function goHome() {
    gamePage.classList.add("hidden");
    homePage.classList.remove("hidden");
}

function setupSnake() {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    const gridSize = 20;

    document.getElementById("restart-btn").addEventListener("click", () => {
        if (!game) return;
        game.reset();
        draw();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") game.set_direction(Direction.Up);
        if (e.key === "ArrowDown") game.set_direction(Direction.Down);
        if (e.key === "ArrowLeft") game.set_direction(Direction.Left);
        if (e.key === "ArrowRight") game.set_direction(Direction.Right);
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < game.snake_length(); i++) {
            ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
            ctx.fillRect(
                game.snake_x(i) * gridSize,
                game.snake_y(i) * gridSize,
                gridSize,
                gridSize
            );
        }

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
            game.food_x() * gridSize,
            game.food_y() * gridSize,
            gridSize,
            gridSize
        );

        document.getElementById("score").innerText = game.score();

        if (game.is_game_over()) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "28px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

            ctx.font = "16px Arial";
            ctx.fillText("Press Restart", canvas.width / 2, canvas.height / 2 + 30);
        }
    }

    draw();
    setInterval(() => {
        game.update();
        draw();
    }, 160);
}