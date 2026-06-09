use wasm_bindgen::prelude::*;

const BIRD_X: f32 = 5.0;
const BIRD_SIZE: f32 = 0.9;
const PIPE_WIDTH: f32 = 1.0;
const GAP_SIZE: f32 = 7.0;
const PIPE_SPEED: f32 = 0.066;
const SPAWN_EVERY: u32 = 115;
const GRAVITY: f32 = 0.033;
const FLAP_STRENGTH: f32 = -0.50;
const MIN_VELOCITY: f32 = -0.56;
const MAX_VELOCITY: f32 = 0.64;

#[wasm_bindgen]
pub struct FlappyBird {
    width: f32,
    height: f32,

    bird_y: f32,
    velocity: f32,

    pipes: Vec<(f32, f32, bool)>, // (x, gap_y center, scored)

    tick: u32,
    score: u32,
    game_over: bool,
    start_delay: u32,
}

#[wasm_bindgen]
impl FlappyBird {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> FlappyBird {
        Self {
            width: width as f32,
            height: height as f32,
            bird_y: height as f32 / 2.0,
            velocity: 0.0,
            pipes: vec![(width as f32, height as f32 / 2.0, false)],
            tick: 0,
            score: 0,
            game_over: false,
            start_delay: 20,
        }
    }

    pub fn flap(&mut self) {
        if !self.game_over {
            self.velocity = FLAP_STRENGTH;
        }
    }

    pub fn reset(&mut self) {
        self.bird_y = self.height / 2.0;
        self.velocity = 0.0;
        self.pipes.clear();
        self.pipes.push((self.width, self.height / 2.0, false));
        self.score = 0;
        self.game_over = false;
        self.tick = 0;
        self.start_delay = 20;
    }

    fn spawn_pipe(&mut self) {
        let margin = 3.0;
        let min = margin + GAP_SIZE / 2.0;
        let max = self.height - margin - GAP_SIZE / 2.0;
        let previous_gap = self.pipes.last().map(|pipe| pipe.1).unwrap_or(self.height / 2.0);

        let pseudo = self.tick.wrapping_mul(41).wrapping_add(17);
        let drift = (pseudo % 900) as f32 / 100.0 - 4.5;
        let gap_y = (previous_gap + drift).clamp(min, max);

        self.pipes.push((self.width, gap_y, false));
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        if self.start_delay > 0 {
            self.start_delay -= 1;
            return;
        }

        self.tick += 1;

        self.velocity = (self.velocity + GRAVITY).clamp(MIN_VELOCITY, MAX_VELOCITY);
        self.bird_y += self.velocity;

        if self.bird_y < 0.0 || self.bird_y + BIRD_SIZE > self.height {
            self.game_over = true;
            return;
        }

        for pipe in &mut self.pipes {
            pipe.0 -= PIPE_SPEED;
        }

        if self.tick % SPAWN_EVERY == 0 {
            self.spawn_pipe();
        }

        self.pipes.retain(|pipe| pipe.0 + PIPE_WIDTH > 0.0);

        let bird_left = BIRD_X;
        let bird_right = BIRD_X + BIRD_SIZE;
        let bird_top = self.bird_y;
        let bird_bottom = self.bird_y + BIRD_SIZE;

        for pipe in &mut self.pipes {
            let pipe_left = pipe.0;
            let pipe_right = pipe.0 + PIPE_WIDTH;
            let gap_top = pipe.1 - GAP_SIZE / 2.0;
            let gap_bottom = pipe.1 + GAP_SIZE / 2.0;

            if !pipe.2 && pipe_right < bird_left {
                self.score += 1;
                pipe.2 = true;
            }

            let overlaps_x = bird_right > pipe_left && bird_left < pipe_right;
            let outside_gap = bird_top < gap_top || bird_bottom > gap_bottom;

            if overlaps_x && outside_gap {
                self.game_over = true;
                return;
            }
        }
    }

    pub fn bird_y(&self) -> f32 {
        self.bird_y
    }

    pub fn pipe_count(&self) -> usize {
        self.pipes.len()
    }

    pub fn pipe_x(&self, i: usize) -> f32 {
        self.pipes[i].0
    }

    pub fn pipe_gap(&self, i: usize) -> f32 {
        self.pipes[i].1
    }

    pub fn score(&self) -> u32 {
        self.score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }
}
