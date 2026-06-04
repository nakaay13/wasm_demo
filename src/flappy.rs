use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct FlappyBird {
    width: u32,
    height: u32,

    bird_y: i32,
    velocity: i32,

    gravity: i32,
    flap_strength: i32,

    pipes: Vec<(u32, u32)>, // (x, gap_y center)

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
            width,
            height,
            bird_y: (height / 2) as i32,
            velocity: 0,

            gravity: 1,
            flap_strength: -3,

            pipes: vec![(width, height / 2)],

            tick: 0,
            score: 0,
            game_over: false,

            start_delay: 20,
        }
    }

    pub fn flap(&mut self) {
        if !self.game_over {
            self.velocity = self.flap_strength;
        }
    }

    pub fn reset(&mut self) {
        self.bird_y = (self.height / 2) as i32;
        self.velocity = 0;

        self.pipes.clear();
        self.pipes.push((self.width, self.height / 2));

        self.score = 0;
        self.game_over = false;
        self.tick = 0;

        self.start_delay = 20;
    }

    fn spawn_pipe(&mut self) {
        let gap_size = 8.min(self.height.saturating_sub(6));
        let margin = 3;

        let min = margin + gap_size / 2;
        let max = self.height.saturating_sub(margin + gap_size / 2);

        let prev_gap = self.pipes.last().map(|p| p.1 as i32).unwrap_or((self.height / 2) as i32);
        let pseudo = self.tick.wrapping_mul(41).wrapping_add(17);
        let drift = (pseudo % 9) as i32 - 4;
        let mut gap_y = prev_gap + drift;

        gap_y = gap_y.clamp(min as i32, max as i32);

        self.pipes.push((self.width, gap_y as u32));
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        // 🟡 start delay (prevents instant death)
        if self.start_delay > 0 {
            self.start_delay -= 1;
            return;
        }

        self.tick += 1;

        // physics
        self.velocity += self.gravity;
        self.velocity = self.velocity.clamp(-2, 2);
        self.bird_y += self.velocity;

        // ceiling / floor
        if self.bird_y < 0 || self.bird_y >= self.height as i32 {
            self.game_over = true;
            return;
        }

        // move pipes
        for pipe in &mut self.pipes {
            pipe.0 = pipe.0.saturating_sub(1);
        }

        // spawn pipes
        if self.tick % 20 == 0 {
            self.spawn_pipe();
        }

        // remove off-screen pipes
        self.pipes.retain(|p| p.0 > 0);

        // collision + score
        let bird_x = 5;
        let gap_size = 8;

        for pipe in &self.pipes {
            let x = pipe.0 as i32;
            let gap = pipe.1 as i32;

            // scoring (when passing pipe center)
            if x == bird_x {
                self.score += 1;
            }

            // collision zone
            if x == bird_x {
                if self.bird_y < gap - gap_size / 2 || self.bird_y > gap + gap_size / 2 {
                    self.game_over = true;
                    return;
                }
            }
        }
    }

    pub fn bird_y(&self) -> i32 {
        self.bird_y
    }

    pub fn pipe_count(&self) -> usize {
        self.pipes.len()
    }

    pub fn pipe_x(&self, i: usize) -> u32 {
        self.pipes[i].0
    }

    pub fn pipe_gap(&self, i: usize) -> u32 {
        self.pipes[i].1
    }

    pub fn score(&self) -> u32 {
        self.score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }
}