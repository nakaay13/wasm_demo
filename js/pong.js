// Import Rust PongGame class compiled to WebAssembly
import { PongGame } from "../pkg/wasm_demo.js";

// LocalStorage key for saving best player score
const BEST_KEY = "best-pong";

// Current WASM game instance
let game;

// Stores the game loop timer
let timer;

// Keeps track of currently held movement keys
const heldMovementKeys = [];

export function setupPong() {
    // Listen for key press and key release
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e) {
    if (!game) return;

    const movement = movementForKey(e.key);

    if (movement) {
        e.preventDefault();

        // Remember pressed movement key
        rememberMovementKey(movement.key, movement.direction);

        // Send latest direction to Rust
        updatePlayerDirection();
    }
}

function handleKeyUp(e) {
    if (!game) return;

    const movement = movementForKey(e.key);

    if (movement) {
        e.preventDefault();

        // Remove released movement key
        forgetMovementKey(movement.key);

        // Update Rust with remaining direction or stop
        updatePlayerDirection();
    }
}

function movementForKey(key) {
    const normalized = key.toLowerCase();

    // Up movement
    if (normalized === "arrowup" || normalized === "w") {
        return { key: normalized, direction: -1 };
    }

    // Down movement
    if (normalized === "arrowdown" || normalized === "s") {
        return { key: normalized, direction: 1 };
    }

    return null;
}

function rememberMovementKey(key, direction) {
    // Avoid storing the same key twice
    forgetMovementKey(key);

    heldMovementKeys.push({ key, direction });
}

function forgetMovementKey(key) {
    const index = heldMovementKeys.findIndex((movement) => movement.key === key);

    if (index !== -1) {
        heldMovementKeys.splice(index, 1);
    }
}

function updatePlayerDirection() {
    // Use the most recently pressed movement key
    const movement = heldMovementKeys[heldMovementKeys.length - 1];

    // Send direction to Rust: -1 up, 0 stop, 1 down
    game.set_player_direction(movement ? movement.direction : 0);
}

function resetHeldMovementKeys() {
    // Clear all stored key input
    heldMovementKeys.length = 0;
}

export function startPong() {
    resetHeldMovementKeys();

    // Create a new Rust PongGame instance through WebAssembly
    game = new PongGame(20, 20);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    // Converts game units into canvas pixels
    const scale = 20;

    function draw() {
        // Clear canvas
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw center line
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw player paddle using position from Rust
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(
            20,
            game.player_y() * scale,
            14,
            game.paddle_height() * scale
        );

        // Draw computer paddle using position from Rust
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
            canvas.width - 34,
            game.computer_y() * scale,
            14,
            game.paddle_height() * scale
        );

        // Draw ball using position from Rust
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            game.ball_x() * scale,
            game.ball_y() * scale,
            8,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Update score display
        updateScores(game.score(), game.opponent_score());

        // Show result screen when Rust says game is over
        if (game.is_game_over()) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const result = game.score() > game.opponent_score() ? "YOU WON" : "YOU LOST";

            ctx.fillStyle = "white";
            ctx.font = "28px Arial";
            ctx.textAlign = "center";
            ctx.fillText(result, canvas.width / 2, canvas.height / 2);
        }
    }

    function loop() {
        // Run game logic in Rust through WebAssembly
        game.update();

        // Draw the updated state with JavaScript Canvas
        draw();

        // Continue loop while game is running
        if (!game.is_game_over()) {
            timer = setTimeout(loop, 16);
        }
    }

    // Stop previous loop if one exists
    clearTimeout(timer);

    // Start game loop
    loop();
}

function updateScores(playerScore, opponentScore) {
    // Display current match score
    document.getElementById("score").innerText = `${playerScore} - ${opponentScore}`;

    // Save best player score in LocalStorage
    const best = Math.max(Number(localStorage.getItem(BEST_KEY) || "0"), playerScore);

    localStorage.setItem(BEST_KEY, best);
    document.getElementById("best-score").innerText = best;
}

export function cleanupPong() {
    // Stop the game loop
    clearTimeout(timer);

    // Remove event listeners to avoid duplicate input
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);

    // Clear stored input
    resetHeldMovementKeys();

    // Remove current game reference
    game = null;
}
