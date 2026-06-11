// Import Rust code that has been compiled to WebAssembly
import { FlappyBird } from "../pkg/wasm_demo.js";

// LocalStorage key used for saving the best score
const BEST_KEY = "best-flappy";

// Logical game board size (20x20 units)
const BOARD_SIZE = 20;

// Current WASM game instance
let game;

// Stores requestAnimationFrame id so it can be cancelled
let frame;

// Used to avoid unnecessary DOM updates
let lastScore = "";
let lastBest = "";

export function setupFlappy() {
    // Listen for keyboard input
    window.addEventListener("keydown", handleKeys);
}

function handleKeys(e) {
    if (!game) return;

    // Spacebar triggers a flap in Rust
    if (e.code === "Space") {
        e.preventDefault();
        game.flap();
    }
}

export function startFlappy() {
    // Stop any existing game loop
    cancelLoop();

    // Free previous WASM memory before creating a new game
    if (game) game.free();

    // Create a new Rust FlappyBird instance
    game = new FlappyBird(BOARD_SIZE, BOARD_SIZE);

    lastScore = "";
    lastBest = "";

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    // Converts game coordinates into canvas pixels
    const scale = canvas.width / BOARD_SIZE;

    function draw() {
        // Clear screen
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Read pipe data from Rust and draw it
        drawPipes(ctx, canvas, scale);

        // Read bird position from Rust and draw it
        drawBird(ctx, 5 * scale, game.bird_y() * scale, scale);

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
        // Call Rust game logic through WebAssembly
        game.update();

        // Render updated state
        draw();

        // Continue until game ends
        if (!game.is_game_over()) {
            frame = requestAnimationFrame(loop);
        }
    }

    // Start the game loop
    loop();
}

function drawPipes(ctx, canvas, scale) {
    const gapSize = 8.2;

    ctx.fillStyle = "#22c55e";

    // Read every pipe position from Rust
    for (let i = 0; i < game.pipe_count(); i++) {
        const x = game.pipe_x(i);
        const gap = game.pipe_gap(i);

        const topPipeHeight = (gap - gapSize / 2) * scale;
        const bottomPipeY = (gap + gapSize / 2) * scale;

        // Draw top and bottom pipe
        ctx.fillRect(x * scale, 0, scale, Math.max(0, topPipeHeight));
        ctx.fillRect(x * scale, bottomPipeY, scale, canvas.height - bottomPipeY);

        // Decorative pipe caps
        ctx.fillStyle = "#86efac";
        ctx.fillRect(x * scale - 3, Math.max(0, topPipeHeight - 8), scale + 6, 8);
        ctx.fillRect(x * scale - 3, bottomPipeY, scale + 6, 8);
        ctx.fillStyle = "#22c55e";
    }
}

function drawBird(ctx, x, y, size) {
    // Draw bird body
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.ellipse(centerX - size * 0.22, centerY + size * 0.12, size * 0.22, size * 0.14, -0.35, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.88, y + size * 0.42);
    ctx.lineTo(x + size * 1.22, y + size * 0.55);
    ctx.lineTo(x + size * 0.88, y + size * 0.68);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(x + size * 0.62, y + size * 0.34, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
}

function updateScores(score) {
    // Only update DOM if score changed
    const scoreText = String(score);

    if (scoreText !== lastScore) {
        document.getElementById("score").innerText = scoreText;
        lastScore = scoreText;
    }

    // Store best score in browser LocalStorage
    const best = Math.max(Number(localStorage.getItem(BEST_KEY) || "0"), score);
    const bestText = String(best);

    if (bestText !== lastBest) {
        localStorage.setItem(BEST_KEY, bestText);
        document.getElementById("best-score").innerText = bestText;
        lastBest = bestText;
    }
}

function cancelLoop() {
    // Stop requestAnimationFrame loop
    if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
    }
}

export function cleanupFlappy() {
    // Clean up listeners and WASM memory
    cancelLoop();

    window.removeEventListener("keydown", handleKeys);

    if (game) game.free();

    game = null;
}
