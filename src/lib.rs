use wasm_bindgen::prelude::*;

// Directions
#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[wasm_bindgen]
pub struct Game {
    width: u32,
    height: u32,
    snake: Vec<(u32, u32)>,
    dir: Direction,
    food: (u32, u32),
    game_over: bool,
    score: u32,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Game {
        Game {
            width,
            height,
            snake: vec![(5, 5)],
            dir: Direction::Right,
            food: (10, 10),
            game_over: false,
            score: 0,
        }
    }

    pub fn reset(&mut self) {
        self.snake = vec![(5, 5)];
        self.dir = Direction::Right;
        self.food = (10, 10);
        self.game_over = false;
        self.score = 0;
    }

    pub fn set_direction(&mut self, dir: Direction) {
        self.dir = dir;
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        let (head_x, head_y) = self.snake[0];

        let new_head = match self.dir {
            Direction::Up => (head_x, head_y.wrapping_sub(1)),
            Direction::Down => (head_x + 0, head_y + 1),
            Direction::Left => (head_x.wrapping_sub(1), head_y),
            Direction::Right => (head_x + 1, head_y),
        };

        // Wall collision
        if new_head.0 >= self.width || new_head.1 >= self.height {
            self.game_over = true;
            return;
        }

        // Self collision
        if self.snake.contains(&new_head) {
            self.game_over = true;
            return;
        }

        self.snake.insert(0, new_head);

        // Food eaten
        if new_head == self.food {
            self.score += 1;

            // Simple pseudo-random spawn
            let x = (new_head.0 + self.score * 3) % self.width;
            let y = (new_head.1 + self.score * 7) % self.height;
            self.food = (x, y);
        } else {
            self.snake.pop();
        }
    }

    // Getters
    pub fn snake_length(&self) -> usize {
        self.snake.len()
    }

    pub fn snake_x(&self, i: usize) -> u32 {
        self.snake[i].0
    }

    pub fn snake_y(&self, i: usize) -> u32 {
        self.snake[i].1
    }

    pub fn food_x(&self) -> u32 {
        self.food.0
    }

    pub fn food_y(&self) -> u32 {
        self.food.1
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn score(&self) -> u32 {
        self.score
    }
}