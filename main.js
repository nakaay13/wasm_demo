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
    const bestScoreElement = document.getElementById("best-score");
    let tickTimer;

    let bestScore = 0;
    try {
        const stored = window.localStorage.getItem("snake-best-score");
        bestScore = stored ? Number(stored) : 0;
    } catch (error) {
        bestScore = 0;
    }
    bestScoreElement.innerText = bestScore;

    document.getElementById("restart-btn").addEventListener("click", () => {
        if (!game) return;
        game.reset();
        draw();
        scheduleTick();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") game.set_direction(Direction.Up);
        if (e.key === "ArrowDown") game.set_direction(Direction.Down);
        if (e.key === "ArrowLeft") game.set_direction(Direction.Left);
        if (e.key === "ArrowRight") game.set_direction(Direction.Right);
    });

    function getTickDelay() {
        return Math.max(70, 220 - game.score() * 10);
    }

    function draw() {
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

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
        const currentScore = game.score();
        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestScoreElement.innerText = bestScore;
            try {
                window.localStorage.setItem("snake-best-score", String(bestScore));
            } catch (error) {
                // ignore storage failures
            }
        }

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

    function scheduleTick() {
        clearTimeout(tickTimer);
        if (game.is_game_over()) return;
        tickTimer = setTimeout(() => {
            game.update();
            draw();
            scheduleTick();
        }, getTickDelay());
    }

    draw();
    scheduleTick();
}