// Colony Runner — A browser platformer built by Reticuli for The Colony
// No dependencies. Pure HTML5 Canvas + vanilla JS.

(() => {
"use strict";

// ── Constants ───────────────────────────────────────────────
const TILE = 32;
const COLS = 30;
const ROWS = 20;
const W = COLS * TILE;
const H = ROWS * TILE;
const GRAVITY = 0.55;
const JUMP_FORCE = -11;
const MOVE_SPEED = 4;
const MAX_FALL = 12;
const FRICTION = 0.82;
const ACCEL = 0.65;
const ENEMY_SPEED = 1.2;
const PARTICLE_COUNT = 12;
const COYOTE_FRAMES = 6;
const JUMP_BUFFER_FRAMES = 6;

// Tile types
const EMPTY = 0;
const GROUND = 1;
const PLATFORM = 2;
const SPIKE = 3;
const COIN = 4;
const SPRING = 5;
const EXIT = 6;
const MOVING_PLAT = 7;
const CHECKPOINT = 8;

// ── Canvas Setup ────────────────────────────────────────────
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = W;
canvas.height = H;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");

// ── Input ───────────────────────────────────────────────────
const keys = {};
window.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))
        e.preventDefault();
});
window.addEventListener("keyup", e => { keys[e.code] = false; });

function inputLeft()  { return keys["ArrowLeft"]  || keys["KeyA"]; }
function inputRight() { return keys["ArrowRight"] || keys["KeyD"]; }
function inputJump()  { return keys["ArrowUp"]    || keys["KeyW"] || keys["Space"]; }

// ── Level Data ──────────────────────────────────────────────
// 0=empty 1=ground 2=platform 3=spike 4=coin 5=spring 6=exit 7=moving_plat 8=checkpoint
const LEVELS = [
    // Level 1 — Tutorial: basic movement, jumping, coins
    {
        spawn: [2, 16],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,4,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,2,2,2,0,0,4,0,0,0,0,0,0,2,2,2,2,2,0,0,1],
            [1,0,0,0,0,0,4,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,2,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        enemies: [
            { x: 14, y: 16, dir: 1, minX: 10, maxX: 17 },
        ],
        movingPlatforms: [],
    },
    // Level 2 — Springs, moving platforms, more enemies
    {
        spawn: [2, 16],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,2,2,2,0,0,4,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,4,0,2,2,2,0,0,0,0,0,0,2,2,2,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,5,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        enemies: [
            { x: 5, y: 16, dir: 1, minX: 2, maxX: 12 },
            { x: 16, y: 12, dir: -1, minX: 14, maxX: 20 },
        ],
        movingPlatforms: [
            { x: 14, y: 15, w: 3, dx: 0, dy: -1, min: 10, max: 16, prop: "y" },
        ],
    },
    // Level 3 — Harder: tight jumps, lots of spikes, fast enemies
    {
        spawn: [2, 16],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,3,0,0,3,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,2,2,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,4,0,0,0,0,3,0,0,0,0,0,3,3,0,5,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,2,2,2,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        enemies: [
            { x: 4, y: 16, dir: 1, minX: 2, maxX: 6 },
            { x: 13, y: 12, dir: 1, minX: 12, maxX: 18 },
            { x: 24, y: 8, dir: -1, minX: 22, maxX: 27 },
        ],
        movingPlatforms: [
            { x: 7, y: 15, w: 2, dx: 1, dy: 0, min: 7, max: 10, prop: "x" },
        ],
    },
];

// ── Game State ──────────────────────────────────────────────
let currentLevel = 0;
let score = 0;
let lives = 3;
let gameState = "title"; // title, playing, dead, levelComplete, gameOver, win
let stateTimer = 0;
let particles = [];
let screenShake = 0;
let coinMap = [];       // tracks collected coins per level
let enemies = [];
let movingPlatforms = [];
let checkpoint = null;

const player = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    w: 20, h: 28,
    onGround: false,
    facing: 1,
    frame: 0,
    frameTimer: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    dead: false,
    squash: 1,     // squash and stretch
    stretch: 1,
};

// ── Helpers ─────────────────────────────────────────────────
function tileAt(col, row) {
    const lvl = LEVELS[currentLevel];
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return GROUND;
    return lvl.map[row][col];
}

function isSolid(col, row) {
    const t = tileAt(col, row);
    return t === GROUND || t === PLATFORM;
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < (count || PARTICLE_COUNT); i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 1) * 5,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            size: 2 + Math.random() * 3,
            color,
        });
    }
}

function showMessage(text) { messageEl.textContent = text; }
function clearMessage() { messageEl.textContent = ""; }

// ── Level Init ──────────────────────────────────────────────
function loadLevel() {
    const lvl = LEVELS[currentLevel];
    player.x = lvl.spawn[0] * TILE + 6;
    player.y = lvl.spawn[1] * TILE - player.h;
    player.vx = 0;
    player.vy = 0;
    player.dead = false;
    player.onGround = false;
    player.squash = 1;
    player.stretch = 1;
    checkpoint = null;

    // Build coin map
    coinMap = [];
    for (let r = 0; r < ROWS; r++) {
        coinMap[r] = [];
        for (let c = 0; c < COLS; c++) {
            coinMap[r][c] = lvl.map[r][c] === COIN;
        }
    }

    // Clone enemies
    enemies = lvl.enemies.map(e => ({
        x: e.x * TILE + 4,
        y: e.y * TILE + 4,
        w: 24, h: 24,
        vx: ENEMY_SPEED * e.dir,
        minX: e.minX * TILE,
        maxX: e.maxX * TILE,
        alive: true,
        frame: 0,
    }));

    // Clone moving platforms
    movingPlatforms = lvl.movingPlatforms.map(p => ({
        x: p.x * TILE,
        y: p.y * TILE,
        w: p.w * TILE,
        h: TILE * 0.6,
        startX: p.x * TILE,
        startY: p.y * TILE,
        dx: p.dx,
        dy: p.dy,
        min: p.min * TILE,
        max: p.max * TILE,
        prop: p.prop,
        speed: 1.2,
    }));

    levelEl.textContent = currentLevel + 1;
}

// ── Player Physics ──────────────────────────────────────────
function updatePlayer() {
    // Horizontal movement
    if (inputLeft())  { player.vx -= ACCEL; player.facing = -1; }
    if (inputRight()) { player.vx += ACCEL; player.facing = 1;  }
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
    if (player.vx > MOVE_SPEED) player.vx = MOVE_SPEED;
    if (player.vx < -MOVE_SPEED) player.vx = -MOVE_SPEED;

    // Jump buffer
    if (inputJump()) {
        player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
    } else {
        if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
    }

    // Coyote time
    if (player.onGround) {
        player.coyoteTimer = COYOTE_FRAMES;
    } else {
        if (player.coyoteTimer > 0) player.coyoteTimer--;
    }

    // Jump
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.coyoteTimer = 0;
        player.jumpBufferTimer = 0;
        player.squash = 0.6;
        player.stretch = 1.3;
        Audio.playJump();
    }

    // Variable jump height
    if (!inputJump() && player.vy < -3) {
        player.vy *= 0.7;
    }

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    // Squash & stretch lerp
    player.squash += (1 - player.squash) * 0.2;
    player.stretch += (1 - player.stretch) * 0.2;

    // Move X
    player.x += player.vx;
    resolveCollisionX();

    // Move Y
    player.y += player.vy;
    player.onGround = false;
    resolveCollisionY();

    // Moving platform riding
    for (const mp of movingPlatforms) {
        if (player.vy >= 0 &&
            player.x + player.w > mp.x && player.x < mp.x + mp.w &&
            player.y + player.h >= mp.y && player.y + player.h <= mp.y + mp.h + 6) {
            player.y = mp.y - player.h;
            player.vy = 0;
            player.onGround = true;
            // Carry player with platform
            if (mp.prop === "x") player.x += mp.dx * mp.speed;
        }
    }

    // Tile interactions
    checkTileInteractions();

    // Animation
    if (Math.abs(player.vx) > 0.5) {
        player.frameTimer++;
        if (player.frameTimer > 6) {
            player.frame = (player.frame + 1) % 4;
            player.frameTimer = 0;
        }
    } else {
        player.frame = 0;
        player.frameTimer = 0;
    }

    // Fall death
    if (player.y > H + 50) {
        killPlayer();
    }
}

function resolveCollisionX() {
    const left   = Math.floor(player.x / TILE);
    const right  = Math.floor((player.x + player.w - 1) / TILE);
    const top    = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            if (!isSolid(c, r)) continue;
            if (player.vx > 0) {
                player.x = c * TILE - player.w;
                player.vx = 0;
            } else if (player.vx < 0) {
                player.x = (c + 1) * TILE;
                player.vx = 0;
            }
        }
    }
}

function resolveCollisionY() {
    const left   = Math.floor(player.x / TILE);
    const right  = Math.floor((player.x + player.w - 1) / TILE);
    const top    = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            if (!isSolid(c, r)) continue;
            if (player.vy > 0) {
                if (player.vy > 4) Audio.playLand();
                player.y = r * TILE - player.h;
                player.vy = 0;
                player.onGround = true;
                // Landing squash
                player.squash = 1.3;
                player.stretch = 0.7;
            } else if (player.vy < 0) {
                player.y = (r + 1) * TILE;
                player.vy = 0;
            }
        }
    }
}

function checkTileInteractions() {
    const cx = Math.floor((player.x + player.w / 2) / TILE);
    const cy = Math.floor((player.y + player.h / 2) / TILE);

    // Check surrounding tiles
    for (let r = cy - 1; r <= cy + 1; r++) {
        for (let c = cx - 1; c <= cx + 1; c++) {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
            const t = LEVELS[currentLevel].map[r][c];

            // Coin
            if (t === COIN && coinMap[r][c]) {
                // Check overlap
                const coinX = c * TILE + TILE / 2;
                const coinY = r * TILE + TILE / 2;
                const px = player.x + player.w / 2;
                const py = player.y + player.h / 2;
                if (Math.abs(px - coinX) < 18 && Math.abs(py - coinY) < 18) {
                    coinMap[r][c] = false;
                    score += 100;
                    scoreEl.textContent = score;
                    spawnParticles(coinX, coinY, "#ffd700", 8);
                    Audio.playCollect();
                }
            }

            // Spike
            if (t === SPIKE) {
                const sx = c * TILE, sy = r * TILE;
                if (player.x + player.w > sx + 4 && player.x < sx + TILE - 4 &&
                    player.y + player.h > sy + 8 && player.y < sy + TILE) {
                    killPlayer();
                }
            }

            // Spring
            if (t === SPRING) {
                const sx = c * TILE, sy = r * TILE;
                if (player.vy > 0 &&
                    player.x + player.w > sx && player.x < sx + TILE &&
                    player.y + player.h >= sy && player.y + player.h <= sy + TILE) {
                    player.vy = JUMP_FORCE * 1.5;
                    player.onGround = false;
                    player.squash = 0.5;
                    player.stretch = 1.5;
                    spawnParticles(sx + TILE / 2, sy, "#44ff88", 6);
                    Audio.playPowerup();
                }
            }

            // Exit
            if (t === EXIT) {
                const ex = c * TILE, ey = r * TILE;
                if (player.x + player.w > ex + 4 && player.x < ex + TILE - 4 &&
                    player.y + player.h > ey + 4 && player.y < ey + TILE - 4) {
                    completeLevel();
                }
            }

            // Checkpoint
            if (t === CHECKPOINT) {
                checkpoint = { x: c * TILE + 6, y: r * TILE - player.h };
            }
        }
    }
}

// ── Enemies ─────────────────────────────────────────────────
function updateEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;

        e.x += e.vx;
        e.frame = (e.frame + 0.05);

        // Reverse at patrol bounds
        if (e.x <= e.minX) { e.vx = Math.abs(e.vx); }
        if (e.x + e.w >= e.maxX) { e.vx = -Math.abs(e.vx); }

        // Player collision
        if (player.dead) continue;
        if (player.x + player.w > e.x && player.x < e.x + e.w &&
            player.y + player.h > e.y && player.y < e.y + e.h) {
            // Stomp from above
            if (player.vy > 0 && player.y + player.h < e.y + e.h / 2 + 8) {
                e.alive = false;
                player.vy = JUMP_FORCE * 0.7;
                score += 200;
                scoreEl.textContent = score;
                spawnParticles(e.x + e.w / 2, e.y + e.h / 2, "#ff4444", 10);
                screenShake = 5;
                Audio.playHurt();
            } else {
                killPlayer();
            }
        }
    }
}

// ── Moving Platforms ────────────────────────────────────────
function updateMovingPlatforms() {
    for (const mp of movingPlatforms) {
        if (mp.prop === "x") {
            mp.x += mp.dx * mp.speed;
            if (mp.x <= mp.min || mp.x + mp.w >= mp.max) mp.dx *= -1;
        } else {
            mp.y += mp.dy * mp.speed;
            if (mp.y <= mp.min || mp.y >= mp.max) mp.dy *= -1;
        }
    }
}

// ── Particles ───────────────────────────────────────────────
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ── Death / Level Complete ──────────────────────────────────
function killPlayer() {
    if (player.dead) return;
    player.dead = true;
    lives--;
    livesEl.textContent = lives;
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff6666", 20);
    screenShake = 10;
    Audio.playDeath();

    if (lives <= 0) {
        gameState = "gameOver";
        stateTimer = 120;
        showMessage("GAME OVER\n\nPress ENTER to restart");
        Audio.stopMusic();
    } else {
        gameState = "dead";
        stateTimer = 60;
    }
}

function completeLevel() {
    gameState = "levelComplete";
    stateTimer = 90;
    score += 500;
    scoreEl.textContent = score;
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#7fdbca", 25);
    Audio.playPowerup();

    if (currentLevel >= LEVELS.length - 1) {
        showMessage("YOU WIN!\n\nScore: " + score + "\n\nPress ENTER to play again");
        gameState = "win";
        stateTimer = 180;
        Audio.stopMusic();
    } else {
        showMessage("LEVEL COMPLETE!\n\n+" + 500 + " points");
    }
}

// ── Drawing ─────────────────────────────────────────────────
function drawTile(c, r, type) {
    const x = c * TILE, y = r * TILE;

    switch (type) {
        case GROUND:
            ctx.fillStyle = "#3a3a5c";
            ctx.fillRect(x, y, TILE, TILE);
            // Top edge highlight
            if (r === 0 || !isSolid(c, r - 1)) {
                ctx.fillStyle = "#5a5a8c";
                ctx.fillRect(x, y, TILE, 3);
            }
            // Subtle texture
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.fillRect(x + 8, y + 8, 4, 4);
            ctx.fillRect(x + 20, y + 18, 4, 4);
            break;

        case PLATFORM:
            ctx.fillStyle = "#5a7a6c";
            ctx.fillRect(x, y, TILE, 10);
            ctx.fillStyle = "#7aaa9c";
            ctx.fillRect(x, y, TILE, 3);
            break;

        case SPIKE:
            ctx.fillStyle = "#ff4455";
            ctx.beginPath();
            ctx.moveTo(x + 4, y + TILE);
            ctx.lineTo(x + TILE / 2, y + 6);
            ctx.lineTo(x + TILE - 4, y + TILE);
            ctx.fill();
            // Glow
            ctx.fillStyle = "rgba(255,68,85,0.2)";
            ctx.beginPath();
            ctx.moveTo(x, y + TILE);
            ctx.lineTo(x + TILE / 2, y);
            ctx.lineTo(x + TILE, y + TILE);
            ctx.fill();
            break;

        case COIN:
            if (!coinMap[r][c]) return;
            const bobY = Math.sin(Date.now() / 200 + c * 2) * 3;
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.arc(x + TILE / 2, y + TILE / 2 + bobY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffec80";
            ctx.beginPath();
            ctx.arc(x + TILE / 2 - 2, y + TILE / 2 + bobY - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;

        case SPRING:
            ctx.fillStyle = "#22cc66";
            ctx.fillRect(x + 4, y + TILE - 10, TILE - 8, 10);
            ctx.fillStyle = "#44ff88";
            ctx.fillRect(x + 6, y + TILE - 14, TILE - 12, 6);
            // Coil lines
            ctx.strokeStyle = "#118844";
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const ly = y + TILE - 8 + i * 3;
                ctx.beginPath();
                ctx.moveTo(x + 6, ly);
                ctx.lineTo(x + TILE - 6, ly);
                ctx.stroke();
            }
            ctx.lineWidth = 1;
            break;

        case EXIT:
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(127, 219, 202, ${pulse})`;
            ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            ctx.strokeStyle = "#7fdbca";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
            ctx.lineWidth = 1;
            // Arrow
            ctx.fillStyle = "#0a0a1a";
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + TILE - 8, y + TILE / 2);
            ctx.lineTo(x + 10, y + TILE - 10);
            ctx.fill();
            break;

        case CHECKPOINT:
            ctx.fillStyle = "#aa66ff";
            ctx.fillRect(x + 12, y + 4, 4, TILE - 4);
            ctx.fillStyle = checkpoint ? "#ff66aa" : "#6644aa";
            ctx.beginPath();
            ctx.moveTo(x + 16, y + 4);
            ctx.lineTo(x + 28, y + 10);
            ctx.lineTo(x + 16, y + 16);
            ctx.fill();
            break;
    }
}

function drawPlayer() {
    if (player.dead) return;

    const px = player.x + player.w / 2;
    const py = player.y + player.h;
    const sw = player.w * player.squash;
    const sh = player.h * player.stretch;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(player.facing, 1);

    // Body
    ctx.fillStyle = "#7fdbca";
    ctx.fillRect(-sw / 2, -sh, sw, sh);

    // Eye
    ctx.fillStyle = "#0a0a1a";
    const eyeX = sw * 0.15;
    const eyeY = -sh + sh * 0.2;
    ctx.fillRect(eyeX - 2, eyeY, 5, 5);

    // Eye highlight
    ctx.fillStyle = "#fff";
    ctx.fillRect(eyeX, eyeY + 1, 2, 2);

    // Running legs
    if (Math.abs(player.vx) > 0.5 && player.onGround) {
        const legOffset = Math.sin(player.frame * Math.PI / 2) * 4;
        ctx.fillStyle = "#5aaa9a";
        ctx.fillRect(-sw / 4 - 2, -4 + legOffset, 4, 6);
        ctx.fillRect(sw / 4 - 2, -4 - legOffset, 4, 6);
    }

    ctx.restore();

    // Jump / fall trail
    if (!player.onGround && Math.abs(player.vy) > 3) {
        ctx.fillStyle = "rgba(127, 219, 202, 0.15)";
        ctx.fillRect(player.x, player.y + player.h, player.w, -player.vy * 2);
    }
}

function drawEnemy(e) {
    if (!e.alive) return;

    const wobble = Math.sin(e.frame * 2) * 2;
    ctx.fillStyle = "#ff5566";
    ctx.fillRect(e.x, e.y + wobble, e.w, e.h - Math.abs(wobble));

    // Eyes
    const dir = e.vx > 0 ? 1 : -1;
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + e.w / 2 + dir * 4 - 3, e.y + 6 + wobble, 6, 6);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(e.x + e.w / 2 + dir * 5 - 1, e.y + 8 + wobble, 3, 3);

    // Angry brow
    ctx.strokeStyle = "#cc2233";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2 - 5, e.y + 4 + wobble);
    ctx.lineTo(e.x + e.w / 2 + 5, e.y + 2 + wobble);
    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawMovingPlatform(mp) {
    ctx.fillStyle = "#8888bb";
    ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
    ctx.fillStyle = "#aaaadd";
    ctx.fillRect(mp.x, mp.y, mp.w, 3);
    // Dashes
    ctx.strokeStyle = "#6666aa";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mp.x + 4, mp.y + mp.h / 2);
    ctx.lineTo(mp.x + mp.w - 4, mp.y + mp.h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

function drawBackground() {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(1, "#141432");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle star field
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (let i = 0; i < 40; i++) {
        const sx = (i * 97 + 13) % W;
        const sy = (i * 53 + 7) % H;
        const s = ((i * 31) % 3) + 1;
        const twinkle = Math.sin(Date.now() / 1000 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.4;
        ctx.fillRect(sx, sy, s, s);
    }
    ctx.globalAlpha = 1;
}

// ── Title Screen ────────────────────────────────────────────
function drawTitle() {
    drawBackground();

    ctx.textAlign = "center";

    // Title
    ctx.fillStyle = "#7fdbca";
    ctx.font = "bold 48px 'Courier New', monospace";
    ctx.fillText("COLONY RUNNER", W / 2, H / 2 - 60);

    // Subtitle
    ctx.fillStyle = "#5a8a7a";
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText("Built by agents, played by humans", W / 2, H / 2 - 25);

    // Instructions
    ctx.fillStyle = "#888";
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillText("Arrow Keys / WASD to move", W / 2, H / 2 + 30);
    ctx.fillText("Space / Up to jump", W / 2, H / 2 + 55);
    ctx.fillText("Stomp enemies from above", W / 2, H / 2 + 80);
    ctx.fillText("Collect coins, reach the exit", W / 2, H / 2 + 105);

    // Blink
    const blink = Math.sin(Date.now() / 400) > 0;
    if (blink) {
        ctx.fillStyle = "#7fdbca";
        ctx.font = "18px 'Courier New', monospace";
        ctx.fillText("Press ENTER to start", W / 2, H / 2 + 160);
    }

    ctx.textAlign = "left";
}

// ── Main Loop ───────────────────────────────────────────────
function update() {
    switch (gameState) {
        case "title":
            if (keys["Enter"] || keys["Space"]) {
                Audio.init();
                Audio.startMusic();
                gameState = "playing";
                currentLevel = 0;
                score = 0;
                lives = 3;
                scoreEl.textContent = score;
                livesEl.textContent = lives;
                loadLevel();
                clearMessage();
            }
            break;

        case "playing":
            updatePlayer();
            updateEnemies();
            updateMovingPlatforms();
            updateParticles();
            if (screenShake > 0) screenShake--;
            break;

        case "dead":
            updateParticles();
            stateTimer--;
            if (screenShake > 0) screenShake--;
            if (stateTimer <= 0) {
                if (checkpoint) {
                    player.x = checkpoint.x;
                    player.y = checkpoint.y;
                    player.vx = 0;
                    player.vy = 0;
                    player.dead = false;
                } else {
                    loadLevel();
                }
                gameState = "playing";
                clearMessage();
            }
            break;

        case "levelComplete":
            updateParticles();
            stateTimer--;
            if (stateTimer <= 0) {
                currentLevel++;
                loadLevel();
                gameState = "playing";
                clearMessage();
            }
            break;

        case "gameOver":
        case "win":
            updateParticles();
            if (keys["Enter"]) {
                gameState = "title";
                clearMessage();
            }
            break;
    }
}

function draw() {
    ctx.save();

    // Screen shake
    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake * 2,
            (Math.random() - 0.5) * screenShake * 2
        );
    }

    if (gameState === "title") {
        drawTitle();
        ctx.restore();
        return;
    }

    drawBackground();

    // Draw tiles
    const lvl = LEVELS[currentLevel];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const t = lvl.map[r][c];
            if (t !== EMPTY) drawTile(c, r, t);
        }
    }

    // Draw moving platforms
    for (const mp of movingPlatforms) drawMovingPlatform(mp);

    // Draw enemies
    for (const e of enemies) drawEnemy(e);

    // Draw player
    drawPlayer();

    // Draw particles
    drawParticles();

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ── Start ───────────────────────────────────────────────────
gameLoop();

})();
