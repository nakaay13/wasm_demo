import { PongGame } from "../pkg/wasm_demo.js";

const BEST_KEY = "best-pong";

let game;
let timer;
const heldMovementKeys = [];

export function setupPong() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e) {
    if (!game) return;

    const movement = movementForKey(e.key);
    if (movement) {
        e.preventDefault();
        rememberMovementKey(movement.key, movement.direction);
        updatePlayerDirection();
    }
}

function handleKeyUp(e) {
    if (!game) return;

    const movement = movementForKey(e.key);
    if (movement) {
        e.preventDefault();
        forgetMovementKey(movement.key);
        updatePlayerDirection();
    }
}

function movementForKey(key) {
    const normalized = key.toLowerCase();

    if (normalized === "arrowup" || normalized === "w") {
        return { key: normalized, direction: -1 };
    }

    if (normalized === "arrowdown" || normalized === "s") {
        return { key: normalized, direction: 1 };
    }

    return null;
}

function rememberMovementKey(key, direction) {
    forgetMovementKey(key);
    heldMovementKeys.push({ key, direction });
}

function forgetMovementKey(key) {
    const index = heldMovementKeys.findIndex((movement) => movement.key === key);
    if (index !== -1) heldMovementKeys.splice(index, 1);
}

function updatePlayerDirection() {
    const movement = heldMovementKeys[heldMovementKeys.length - 1];
    game.set_player_direction(movement ? movement.direction : 0);
}

function resetHeldMovementKeys() {
    heldMovementKeys.length = 0;
}

export function startPong() {
    resetHeldMovementKeys();
    game = new PongGame(20, 20);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const scale = 20;

    function draw() {
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center line
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Player paddle
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(20, game.player_y() * scale, 14, game.paddle_height() * scale);

        // Opponent paddle
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(canvas.width - 34, game.computer_y() * scale, 14, game.paddle_height() * scale);

        // Ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(game.ball_x() * scale, game.ball_y() * scale, 8, 0, Math.PI * 2);
        ctx.fill();

        updateScores(game.score(), game.opponent_score());

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
        game.update();
        draw();

        if (!game.is_game_over()) {
            timer = setTimeout(loop, 16);
        }
    }

    clearTimeout(timer);
    loop();
}

function updateScores(playerScore, opponentScore) {
    document.getElementById("score").innerText = `${playerScore} - ${opponentScore}`;

    const best = Math.max(Number(localStorage.getItem(BEST_KEY) || "0"), playerScore);
    localStorage.setItem(BEST_KEY, best);
    document.getElementById("best-score").innerText = best;
}

export function cleanupPong() {
    clearTimeout(timer);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    resetHeldMovementKeys();
    game = null;
}
