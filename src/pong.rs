use wasm_bindgen::prelude::*;

const PADDLE_HEIGHT: f32 = 4.0;
const WINNING_SCORE: u32 = 7;

#[wasm_bindgen]
pub struct PongGame {
    // Size of the game area
    width: f32,
    height: f32,

    // Y positions of the player and computer paddles
    player_y: f32,
    ai_y: f32,

    // Ball position
    ball_x: f32,
    ball_y: f32,

    // Ball speed in x and y direction
    ball_vx: f32,
    ball_vy: f32,

    // Player movement direction: -1 up, 0 still, 1 down
    player_dir: i32,

    // Scores
    player_score: u32,
    ai_score: u32,

    // Stops the game when someone wins
    game_over: bool,
}

#[wasm_bindgen]
impl PongGame {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> PongGame {
        // Create the game with default values first
        let mut game = PongGame {
            width: width as f32,
            height: height as f32,
            player_y: 0.0,
            ai_y: 0.0,
            ball_x: 0.0,
            ball_y: 0.0,
            ball_vx: 0.0,
            ball_vy: 0.0,
            player_dir: 0,
            player_score: 0,
            ai_score: 0,
            game_over: false,
        };

        // Put everything in the correct start position
        game.reset();
        game
    }

    pub fn reset(&mut self) {
        // Center both paddles
        self.player_y = self.center_paddle();
        self.ai_y = self.center_paddle();

        // Reset scores and player movement
        self.player_score = 0;
        self.ai_score = 0;
        self.player_dir = 0;
        self.game_over = false;

        // Start the ball moving towards the player
        self.reset_ball(-1.0);
    }

    pub fn set_player_direction(&mut self, dir: i32) {
        // Make sure direction is only -1, 0 or 1
        self.player_dir = dir.clamp(-1, 1);
    }

    pub fn update(&mut self) {
        // Do nothing if the match is finished
        if self.game_over {
            return;
        }

        // Move player paddle
        self.player_y += self.player_dir as f32 * 0.45;

        // Keep player paddle inside the screen
        self.player_y = self.clamp_paddle(self.player_y);

        // Simple AI: computer tries to follow the ball
        let target = self.ball_y - PADDLE_HEIGHT / 2.0;
        let diff = target - self.ai_y;

        // Clamp makes the AI slower and more fair
        self.ai_y += diff.clamp(-0.25, 0.25);
        self.ai_y = self.clamp_paddle(self.ai_y);

        // Move the ball
        self.ball_x += self.ball_vx;
        self.ball_y += self.ball_vy;

        // Bounce from top and bottom walls
        if self.ball_y <= 0.0 || self.ball_y >= self.height - 1.0 {
            self.ball_vy = -self.ball_vy;
        }

        // Check if the ball hits the player paddle
        if self.ball_x <= 2.0
            && self.ball_vx < 0.0
            && Self::hits_paddle(self.player_y, self.ball_y)
        {
            // Send the ball back to the right
            self.ball_vx = 0.34;

            // Change angle depending on where the ball hits the paddle
            self.ball_vy += (self.ball_y - (self.player_y + PADDLE_HEIGHT / 2.0)) * 0.06;
        }

        // Check if the ball hits the computer paddle
        if self.ball_x >= self.width - 3.0
            && self.ball_vx > 0.0
            && Self::hits_paddle(self.ai_y, self.ball_y)
        {
            // Send the ball back to the left
            self.ball_vx = -0.34;

            // Change angle depending on where the ball hits the paddle
            self.ball_vy += (self.ball_y - (self.ai_y + PADDLE_HEIGHT / 2.0)) * 0.06;
        }

        // Stop the ball from getting too much vertical speed
        self.ball_vy = self.ball_vy.clamp(-0.35, 0.35);

        // If the ball goes past the player, AI scores
        if self.ball_x < 0.0 {
            self.ai_score += 1;
            self.after_point(1.0);
        }

        // If the ball goes past the AI, player scores
        if self.ball_x > self.width {
            self.player_score += 1;
            self.after_point(-1.0);
        }
    }

    fn after_point(&mut self, direction: f32) {
        // End the game if someone reached the winning score
        if self.player_score >= WINNING_SCORE || self.ai_score >= WINNING_SCORE {
            self.game_over = true;
            return;
        }

        // Otherwise start a new round
        self.reset_ball(direction);
    }

    fn reset_ball(&mut self, direction: f32) {
        // Total points decides if the ball starts going up or down
        let point = self.player_score + self.ai_score;
        let vertical = if point % 2 == 0 { 0.16 } else { -0.16 };

        // Put the ball in the middle
        self.ball_x = self.width / 2.0;
        self.ball_y = self.height / 2.0;

        // Set ball direction and speed
        self.ball_vx = direction * 0.30;
        self.ball_vy = vertical;
    }

    fn hits_paddle(paddle_y: f32, ball_y: f32) -> bool {
        // True if the ball is between the top and bottom of the paddle
        ball_y >= paddle_y && ball_y <= paddle_y + PADDLE_HEIGHT
    }

    fn center_paddle(&self) -> f32 {
        // Find the y position that centers the paddle
        (self.height - PADDLE_HEIGHT) / 2.0
    }

    fn clamp_paddle(&self, y: f32) -> f32 {
        // Keep the paddle inside the game area
        y.clamp(0.0, self.height - PADDLE_HEIGHT)
    }

    // These functions are used by JavaScript to read the game state

    pub fn player_y(&self) -> f32 {
        self.player_y
    }

    pub fn computer_y(&self) -> f32 {
        self.ai_y
    }

    pub fn ball_x(&self) -> f32 {
        self.ball_x
    }

    pub fn ball_y(&self) -> f32 {
        self.ball_y
    }

    pub fn paddle_height(&self) -> f32 {
        PADDLE_HEIGHT
    }

    pub fn score(&self) -> u32 {
        self.player_score
    }

    pub fn opponent_score(&self) -> u32 {
        self.ai_score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }
}
