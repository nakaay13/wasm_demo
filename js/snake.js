```javascript
// Import Rust SnakeGame and Direction enum compiled to WebAssembly
import { SnakeGame, Direction } from "../pkg/wasm_demo.js";

// LocalStorage key for saving best score
const BEST_KEY = "best-snake";

// Current WASM game instance
let game;

// Stores the game loop timer
let timer;

export function setupSnake() {
    // Listen for keyboard input
    window.addEventListener("keydown", handleKeys);
}

function handleKeys(e) {
    if (!game) return;

    const key = e.key.toLowerCase();

    // Send movement direction to Rust
    if (key === "arrowup" || key === "w") {
        e.preventDefault();
        game.set_direction(Direction.Up);
    }

    if (key === "arrowdown" || key === "s") {
        e.preventDefault();
        game.set_direction(Direction.Down);
    }

    if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        game.set_direction(Direction.Left);
    }

    if (key === "arrowright" || key === "d") {
        e.preventDefault();
        game.set_direction(Direction.Right);
    }
}

export function startSnake() {
    // Create a new Rust SnakeGame instance through WebAssembly
    game = new SnakeGame(20, 20);

    // Load best score from browser storage
    document.getElementById("best-score").innerText =
        localStorage.getItem(BEST_KEY) || "0";

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    // Size of each grid cell in pixels
    const grid = 20;

    function draw() {
        // Clear canvas
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake using positions calculated in Rust
        for (let i = 0; i < game.snake_length(); i++) {
            ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";

            ctx.fillRect(
                game.snake_x(i) * grid,
                game.snake_y(i) * grid,
                grid,
                grid
            );
        }

        // Draw food using position from Rust
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
            game.food_x() * grid,
            game.food_y() * grid,
            grid,
            grid
        );

        // Update score UI
        updateScores(game.score());

        // Draw game over overlay
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
        // Run snake logic in Rust through WebAssembly
        game.update();

        // Draw updated game state with JavaScript Canvas
        draw();

        // Slower loop because Snake moves step by step
        timer = setTimeout(loop, 120);
    }

    // Stop any previous loop before starting a new one
    clearTimeout(timer);

    // Start game loop
    loop();
}

function updateScores(score) {
    // Display current score
    document.getElementById("score").innerText = score;

    // Save best score in LocalStorage
    const best = Math.max(Number(localStorage.getItem(BEST_KEY) || "0"), score);

    localStorage.setItem(BEST_KEY, best);
    document.getElementById("best-score").innerText = best;
}

export function cleanupSnake() {
    // Stop game loop
    clearTimeout(timer);

    // Remove keyboard listener to avoid duplicate input
    window.removeEventListener("keydown", handleKeys);

    // Remove current game reference
    game = null;
}
```
