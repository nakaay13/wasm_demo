import init, { FlappyBird } from "../pkg/wasm_demo.js";

const BEST_KEY = "best-flappy";

let game;
let timer;

export function setupFlappy() {
    window.addEventListener("keydown", handleKeys);
}

function handleKeys(e) {
    if (!game) return;

    if (e.code === "Space") {
        e.preventDefault();
        game.flap();
    }
}

export async function startFlappy() {
    await init();

    game = new FlappyBird(20, 20);
    document.getElementById("best-score").innerText = localStorage.getItem(BEST_KEY) || "0";

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    function draw() {
    const scale = 20;

    ctx.fillStyle = "#061620";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // bird
    ctx.fillStyle = "#facc15";
    ctx.fillRect(5 * scale, game.bird_y() * scale, scale, scale);

    const gapSize = 8; // hole size in game units

    // pipes
    ctx.fillStyle = "#22c55e";

    for (let i = 0; i < game.pipe_count(); i++) {
        const x = game.pipe_x(i);
        const gap = game.pipe_gap(i);

        const topPipeHeight = (gap - gapSize / 2) * scale;
        const bottomPipeY = (gap + gapSize / 2) * scale;

        // TOP PIPE (stops before hole)
        ctx.fillRect(
            x * scale,
            0,
            scale,
            Math.max(0, topPipeHeight)
        );

        // BOTTOM PIPE (starts after hole)
        ctx.fillRect(
            x * scale,
            bottomPipeY,
            scale,
            canvas.height - bottomPipeY
        );
    }

    updateScores(game.score());

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

        timer = setTimeout(loop, 100);
    }

    clearTimeout(timer);
    loop();
}

function updateScores(score) {
    document.getElementById("score").innerText = score;

    const best = Math.max(Number(localStorage.getItem(BEST_KEY) || "0"), score);
    localStorage.setItem(BEST_KEY, best);
    document.getElementById("best-score").innerText = best;
}

export function cleanupFlappy() {
    clearTimeout(timer);
    window.removeEventListener("keydown", handleKeys);
    game = null;
}
