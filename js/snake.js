import { SnakeGame, Direction } from "../pkg/wasm_demo.js";

let game;
let timer;

export function setupSnake() {
    window.addEventListener("keydown", handleKeys);
}

function handleKeys(e) {
    if (!game) return;

    if (e.key === "ArrowUp") game.set_direction(Direction.Up);
    if (e.key === "ArrowDown") game.set_direction(Direction.Down);
    if (e.key === "ArrowLeft") game.set_direction(Direction.Left);
    if (e.key === "ArrowRight") game.set_direction(Direction.Right);
}

export function startSnake() {
    game = new SnakeGame(20, 20);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const grid = 20;

    function draw() {
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < game.snake_length(); i++) {
            ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
            ctx.fillRect(
                game.snake_x(i) * grid,
                game.snake_y(i) * grid,
                grid,
                grid
            );
        }

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
            game.food_x() * grid,
            game.food_y() * grid,
            grid,
            grid
        );

        document.getElementById("score").innerText = game.score();

        if (game.is_game_over()) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "28px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        }
    }

    function loop() {
        game.update();
        draw();
        timer = setTimeout(loop, 120);
    }

    clearTimeout(timer);
    loop();
}

export function cleanupSnake() {
    clearTimeout(timer);
    window.removeEventListener("keydown", handleKeys);
    game = null;
}