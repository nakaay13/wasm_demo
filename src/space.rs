use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SpaceShooter {
    width: u32,
    height: u32,
    player_x: u32,
    player_y: u32,
    bullets: Vec<(u32, u32)>,
    enemies: Vec<(u32, u32)>,
    score: u32,
    game_over: bool,
    tick: u32,
    fire_cooldown: u32,
    spawn_timer: u32,
}

#[wasm_bindgen]
impl SpaceShooter {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> SpaceShooter {
        let player_y = height.saturating_sub(1);
        SpaceShooter {
            width,
            height,
            player_x: width / 2,
            player_y,
            bullets: Vec::new(),
            enemies: Vec::new(),
            score: 0,
            game_over: false,
            tick: 0,
            fire_cooldown: 0,
            spawn_timer: 5,
        }
    }

    pub fn reset(&mut self) {
        self.player_x = self.width / 2;
        self.player_y = self.height.saturating_sub(1);
        self.bullets.clear();
        self.enemies.clear();
        self.score = 0;
        self.game_over = false;
        self.tick = 0;
        self.fire_cooldown = 0;
        self.spawn_timer = 5;
    }

    pub fn move_left(&mut self) {
        if self.player_x > 0 {
            self.player_x -= 1;
        }
    }

    pub fn move_right(&mut self) {
        if self.player_x + 1 < self.width {
            self.player_x += 1;
        }
    }

    pub fn shoot(&mut self) {
        if self.game_over {
            return;
        }

        if self.fire_cooldown == 0 {
            if self.player_y > 0 {
                self.bullets.push((self.player_x, self.player_y - 1));
            }
            self.fire_cooldown = 4;
        }
    }

    fn random_spawn_x(&self) -> u32 {
        ((self.tick.wrapping_mul(73)).wrapping_add(self.score.wrapping_mul(23)).wrapping_add(17)) % self.width
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        self.tick = self.tick.wrapping_add(1);

        if self.fire_cooldown > 0 {
            self.fire_cooldown -= 1;
        }

        if self.spawn_timer > 0 {
            self.spawn_timer -= 1;
        }

        if self.spawn_timer == 0 {
            let x = self.random_spawn_x();
            self.enemies.push((x, 0));
            self.spawn_timer = 8;
        }

        let mut new_bullets = Vec::with_capacity(self.bullets.len());
        for &(x, y) in self.bullets.iter() {
            if y > 0 {
                new_bullets.push((x, y - 1));
            }
        }
        self.bullets = new_bullets;

        let mut new_enemies = Vec::with_capacity(self.enemies.len());
        for &(x, y) in self.enemies.iter() {
            let next_y = y + 1;
            if next_y >= self.height {
                self.game_over = true;
                return;
            }
            new_enemies.push((x, next_y));
        }
        self.enemies = new_enemies;

        let mut destroyed_positions = Vec::new();
        for bullet in self.bullets.iter() {
            if self.enemies.contains(bullet) {
                destroyed_positions.push(*bullet);
            }
        }

        if !destroyed_positions.is_empty() {
            self.score += destroyed_positions.len() as u32;
            self.bullets.retain(|pos| !destroyed_positions.contains(pos));
            self.enemies.retain(|pos| !destroyed_positions.contains(pos));
        }

        for &(x, y) in self.enemies.iter() {
            if x == self.player_x && y == self.player_y {
                self.game_over = true;
                return;
            }
        }
    }

    pub fn player_x(&self) -> u32 {
        self.player_x
    }

    pub fn player_y(&self) -> u32 {
        self.player_y
    }

    pub fn bullet_count(&self) -> usize {
        self.bullets.len()
    }

    pub fn bullet_x(&self, i: usize) -> u32 {
        self.bullets[i].0
    }

    pub fn bullet_y(&self, i: usize) -> u32 {
        self.bullets[i].1
    }

    pub fn enemy_count(&self) -> usize {
        self.enemies.len()
    }

    pub fn enemy_x(&self, i: usize) -> u32 {
        self.enemies[i].0
    }

    pub fn enemy_y(&self, i: usize) -> u32 {
        self.enemies[i].1
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn score(&self) -> u32 {
        self.score
    }
}
