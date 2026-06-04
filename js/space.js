import { SpaceShooter } from "../pkg/wasm_demo.js";

let game;
let timer;

export function setupSpace() {
    window.addEventListener("keydown", handleKeys);
}

function handleKeys(e) {
    if (!game) return;

    if (e.key === "ArrowLeft") game.move_left();
    if (e.key === "ArrowRight") game.move_right();
    if (e.key === " ") game.shoot();
}

export function startSpace() {
    game = new SpaceShooter(20, 20);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const grid = 20;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // player
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(
            game.player_x() * grid,
            game.player_y() * grid,
            grid,
            grid
        );

        // bullets
        ctx.fillStyle = "#facc15";
        for (let i = 0; i < game.bullet_count(); i++) {
            ctx.fillRect(
                game.bullet_x(i) * grid,
                game.bullet_y(i) * grid,
                4,
                8
            );
        }

        // enemies
        ctx.fillStyle = "#ef4444";
        for (let i = 0; i < game.enemy_count(); i++) {
            ctx.fillRect(
                game.enemy_x(i) * grid,
                game.enemy_y(i) * grid,
                grid,
                grid
            );
        }

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
        timer = setTimeout(loop, 80);
    }

    clearTimeout(timer);
    loop();
}

export function cleanupSpace() {
    clearTimeout(timer);
    window.removeEventListener("keydown", handleKeys);
    game = null;
}