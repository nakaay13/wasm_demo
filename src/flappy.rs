use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct FlappyBird {
    width: u32,
    height: u32,

    bird_y: i32,
    velocity: i32,

    gravity: i32,
    flap_strength: i32,

    pipes: Vec<(u32, u32)>, // (x, gap_y)

    tick: u32,
    score: u32,
    game_over: bool,
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
            flap_strength: -6,
            pipes: vec![(width, height / 3)],
            tick: 0,
            score: 0,
            game_over: false,
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
        self.pipes.push((self.width, self.height / 3));
        self.score = 0;
        self.game_over = false;
        self.tick = 0;
    }

    fn spawn_pipe(&mut self) {
        let gap = (self.tick * 13 % (self.height - 40)) + 20;
        self.pipes.push((self.width, gap));
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        self.tick += 1;

        // physics
        self.velocity += self.gravity;
        self.bird_y += self.velocity;

        // floor/ceiling
        if self.bird_y < 0 || self.bird_y > self.height as i32 {
            self.game_over = true;
            return;
        }

        // pipes movement
        for pipe in &mut self.pipes {
            pipe.0 = pipe.0.saturating_sub(1);
        }

        // spawn pipes
        if self.tick % 80 == 0 {
            self.spawn_pipe();
        }

        // remove old pipes
        self.pipes.retain(|p| p.0 > 0);

        // collision + score
        for pipe in &self.pipes {
            let x = pipe.0 as i32;
            let gap = pipe.1 as i32;

            if x == 5 {
                self.score += 1;
            }

            if x >= 5 && x <= 7 {
                if self.bird_y < gap - 15 || self.bird_y > gap + 15 {
                    self.game_over = true;
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