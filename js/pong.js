import { PongGame } from "../pkg/wasm_demo.js";

const BEST_KEY = "best-pong";

let game;
let timer;

export function setupPong() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e) {
    if (!game) return;

    if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        game.set_player_direction(-1);
    }

    if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        game.set_player_direction(1);
    }
}

function handleKeyUp(e) {
    if (!game) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
        e.preventDefault();
        game.set_player_direction(0);
    }
}

export function startPong() {
    game = new PongGame(20, 20);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const scale = 20;

    function draw() {
        ctx.fillStyle = "#061620";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#22c55e";
        ctx.fillRect(20, game.player_y() * scale, 14, game.paddle_height() * scale);

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(canvas.width - 34, game.computer_y() * scale, 14, game.paddle_height() * scale);

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(game.ball_x() * scale, game.ball_y() * scale, 8, 0, Math.PI * 2);
        ctx.fill();

        updateScores(game.score(), game.opponent_score());

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
    game = null;
}
