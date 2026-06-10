use wasm_bindgen::prelude::*;
use js_sys::Math;

// Bird is always drawn at this x position
const BIRD_X: f32 = 5.0;

const BIRD_SIZE: f32 = 0.8;
const PIPE_WIDTH: f32 = 1.0;
const GAP_SIZE: f32 = 8.2;
const PIPE_SPEED: f32 = 0.052;

// How often a new pipe is created
const SPAWN_EVERY: u32 = 140;

// Gravity pulls the bird down each frame
const GRAVITY: f32 = 0.005;

// Negative velocity makes the bird move up
const FLAP_STRENGTH: f32 = -0.20;

// Limits so the bird does not move too fast
const MAX_VELOCITY: f32 = 0.22;
const MIN_VELOCITY: f32 = -0.30;

#[wasm_bindgen]
pub struct FlappyBird {
    // Size of the game area
    width: f32,
    height: f32,

    // Bird vertical position and speed
    bird_y: f32,
    velocity: f32,

    // Each pipe stores: x position, gap center y, and whether it gave score
    pipes: Vec<(f32, f32, bool)>,

    // Frame counter
    tick: u32,

    // Player score
    score: u32,

    // Stops the game when bird crashes
    game_over: bool,
}

#[wasm_bindgen]
impl FlappyBird {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> FlappyBird {
        Self {
            width: width as f32,
            height: height as f32,

            // Start bird in the middle of the screen
            bird_y: height as f32 / 2.0,
            velocity: 0.0,

            // Start with one pipe at the right side
            pipes: vec![(width as f32, height as f32 / 2.0, false)],

            tick: 0,
            score: 0,
            game_over: false,
        }
    }

    pub fn flap(&mut self) {
        // Only allow flap while game is running
        if !self.game_over {
            self.velocity = FLAP_STRENGTH;
        }
    }

    pub fn reset(&mut self) {
        // Put bird back in the middle
        self.bird_y = self.height / 2.0;
        self.velocity = 0.0;

        // Remove old pipes and add one fresh pipe
        self.pipes.clear();
        self.pipes.push((self.width, self.height / 2.0, false));

        // Reset game state
        self.score = 0;
        self.game_over = false;
        self.tick = 0;
    }

    fn spawn_pipe(&mut self) {
        // Keep the pipe gap away from the top and bottom edges
        let margin = 3.0;
        let min = margin + GAP_SIZE / 2.0;
        let max = self.height - margin - GAP_SIZE / 2.0;

        // Random y position for the center of the pipe gap
        let gap_y = min + (Math::random() as f32) * (max - min);

        // New pipe starts at the right side of the screen
        self.pipes.push((self.width, gap_y, false));
    }

    pub fn update(&mut self) {
        // Do nothing if the game is already over
        if self.game_over {
            return;
        }

        // Count frames
        self.tick += 1;

        // Add gravity to velocity and limit the speed
        self.velocity = (self.velocity + GRAVITY).clamp(MIN_VELOCITY, MAX_VELOCITY);

        // Move bird based on velocity
        self.bird_y += self.velocity;

        // Bird dies if it hits top or bottom of screen
        if self.bird_y < 0.0 || self.bird_y + BIRD_SIZE > self.height {
            self.game_over = true;
            return;
        }

        // Move all pipes to the left
        for pipe in &mut self.pipes {
            pipe.0 -= PIPE_SPEED;
        }

        // Create a new pipe every few frames
        if self.tick % SPAWN_EVERY == 0 {
            self.spawn_pipe();
        }

        // Remove pipes that are fully outside the screen
        self.pipes.retain(|pipe| pipe.0 + PIPE_WIDTH > 0.0);

        // Bird hitbox
        let bird_left = BIRD_X;
        let bird_right = BIRD_X + BIRD_SIZE;
        let bird_top = self.bird_y;
        let bird_bottom = self.bird_y + BIRD_SIZE;

        for pipe in &mut self.pipes {
            // Pipe hitbox and gap area
            let pipe_left = pipe.0;
            let pipe_right = pipe.0 + PIPE_WIDTH;
            let gap_top = pipe.1 - GAP_SIZE / 2.0;
            let gap_bottom = pipe.1 + GAP_SIZE / 2.0;

            // Give score once the bird has passed the pipe
            if !pipe.2 && pipe_right < bird_left {
                self.score += 1;
                pipe.2 = true;
            }

            // Check if bird is inside the pipe's x range
            let overlaps_x = bird_right > pipe_left && bird_left < pipe_right;

            // Check if bird is outside the safe gap
            let outside_gap = bird_top < gap_top || bird_bottom > gap_bottom;

            // Collision happens when bird overlaps pipe and is not in the gap
            if overlaps_x && outside_gap {
                self.game_over = true;
                return;
            }
        }
    }

    // Functions below are used by JavaScript to read the game state

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
