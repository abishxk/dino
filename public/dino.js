// ================= CONFIG =================
const GROUND_OFFSET = 200;

const BASE_WIDTH = 720;
const BASE_HEIGHT = 445;


// ================= GLOBAL =================
let board, context;

let assetsLoaded = 0;
let TOTAL_ASSETS = 0;


// ================= BACKGROUND =================
let desertImg, trackImg;

let trackX = 0;
let trackHeight = 0;

window.addEventListener("message", (e) => {

    if (!e.data) return;

    if (e.data.type === "JUMP") {

        if (!isJumping && !gameOver) {
            jump();
        }
    }

    if (e.data.type === "DUCK") {

        if (!isJumping && !gameOver) {

            duckFromTouch = true;
            startDuck();
        }
    }
});


// ================= DINO =================
const NORMAL_HEIGHT = 90;
const DUCK_HEIGHT = 40;

let dino = {
    x: 60,
    y: 0,
    width: 80,

    height: NORMAL_HEIGHT,
    hitboxHeight: NORMAL_HEIGHT,
    hitboxY: 0                 // 👈 ADD THIS
};



let groundLevel;


// ================= SPRITES =================
let runImgs = [];
let duckImgs = [];
let jumpImg;

let deadImg;        // Game Over text
let knockedImg;     // Fallen character


let runIndex = 0;
let duckIndex = 0;

let isJumping = false;
let isDucking = false;

let duckFromTouch = false;
let duckTimeout = null;
let duckRatio = 1;



// ================= OBSTACLES =================
let obstacles = [];

let cactusImgs = [];
let bigCactusImgs = [];
let birdImgs = [];

const MIN_SPAWN_DISTANCE = 260;
const MAX_SPAWN_DISTANCE = 520;
let nextSpawnDistance = 0;




// ================= PHYSICS =================
let velocityX = -4;
let maxSpeed = -10;
let speedIncrease = 0.00035;

let velocityY = 0;
let gravity = 0.4
const BASE_GRAVITY = 0.4;
const MAX_GRAVITY = 0.9;
let jumpPower = -13;


// ================= GAME =================
let gameOver = false;
let score = 0;

let crashX = 0;
let crashY = 0;

let lastTime = 0;

const BASE_SCORE_RATE = 8;   // slow start
const MAX_SCORE_RATE = 40;  // late game speed


// ================= SCREEN SHAKE =================
let shakeTime = 0;
let shakeIntensity = 12;



// ================= SPAWN =================
let spawnDelay = 1600;
let minDelay = 800;


// ================= IMAGE LOADER =================
function loadImg(src) {

    TOTAL_ASSETS++;

    const img = new Image();
    img.src = "./" + src;

    img.onload = () => assetsLoaded++;

    return img;
}


// ================= INIT =================
window.onload = () => {

    // ---------- Mobile Controls (Global) ----------

    let startY = 0;
    let startTime = 0;

    window.addEventListener("touchstart", (e) => {

        if (gameOver) return;

        // Prevent scrolling
        e.preventDefault();

        startY = e.touches[0].clientY;
        startTime = Date.now();

    }, { passive: false });


    window.addEventListener("touchend", (e) => {

        if (gameOver) return;

        e.preventDefault();

        const endY = e.changedTouches[0].clientY;
        const diffY = startY - endY;

        // Swipe Down → Duck
        if (diffY < -60 && !isDucking && !isJumping) {

            duckFromTouch = true;
            startDuck();
            return;
        }

        // Tap / Swipe Up → Jump
        if (diffY > -20 && !isJumping) {

            jump();
            return;
        }

    }, { passive: false });


    board = document.getElementById("board");

    board.width = BASE_WIDTH;
    board.height = BASE_HEIGHT;

    board.style.width = "100%";
    board.style.height = "100%";

    context = board.getContext("2d");




    // ---------- Assets ----------

    desertImg = loadImg("new_bg_try.JPEG");

    trackImg = loadImg("dim_track.PNG");

    trackImg.onload = () => {

        trackHeight = trackImg.height;

        groundLevel = BASE_HEIGHT - trackHeight + GROUND_OFFSET;

        dino.y = groundLevel - dino.height;

        assetsLoaded++;
    };


    runImgs = [
        loadImg("char A.png"),
        loadImg("char B.png"),
    ];

    duckImgs = [
        loadImg("char duck.png"),
        loadImg("char duck.png"),
    ];

    duckImgs[0].addEventListener("load", () => {
        duckRatio = duckImgs[0].width / duckImgs[0].height;
    });

    jumpImg = loadImg("char A.png");
    deadImg = loadImg("end.png");
    knockedImg = loadImg("char_knock.png");


    cactusImgs = [
        loadImg("1dog.png"),
        loadImg("2dog.png"),
        loadImg("3dog.png"),
    ];

    bigCactusImgs = [
        loadImg("1demo.png"),
        loadImg("only_vecna (1).png"),
        loadImg("mf.png"),
    ];

    birdImgs = [
        loadImg("bat-1.png"),
        loadImg("bat-2.png"),
    ];


    waitForAssets();


    // ---------- Keyboard ----------

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

};


// ================= WAIT =================
function waitForAssets() {

    if (assetsLoaded < TOTAL_ASSETS || trackHeight === 0) {
        requestAnimationFrame(waitForAssets);
        return;
    }

    requestAnimationFrame(update);
    spawnLoop();
}


// ================= SPAWN =================
function spawnLoop() {
    if (gameOver) return;
    placeObstacle();
    requestAnimationFrame(spawnLoop);
}


// ================= GAME LOOP =================
function update(time) {

    requestAnimationFrame(update);

    if (!lastTime) lastTime = time;

    const delta = (time - lastTime) / 1000; // seconds
    lastTime = time;
    // ================= SCREEN SHAKE =================
    let offsetX = 0;
    let offsetY = 0;

    if (shakeTime > 0) {

        offsetX = (Math.random() - 0.5) * shakeIntensity;
        offsetY = (Math.random() - 0.5) * shakeIntensity;

        shakeTime--;
    }

    context.setTransform(1, 0, 0, 1, offsetX, offsetY);


    context.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);


    // Background
    if (desertImg.complete) {
        context.drawImage(desertImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);
    }


    // Track
    if (trackImg.complete) {

        const y = BASE_HEIGHT - trackHeight;

        context.drawImage(trackImg, trackX, y);
        context.drawImage(trackImg, trackX + trackImg.width, y);

        if (!gameOver) trackX += velocityX;

        if (trackX <= -trackImg.width) trackX = 0;
    }



    // Speed
    if (!gameOver) {
        velocityX -= speedIncrease;
    }


    if (velocityX < maxSpeed) velocityX = maxSpeed;


    // Gravity
    if (!gameOver) {
        // Scale gravity with speed
        const speedFactor =
            (Math.abs(velocityX) - 4) /
            (Math.abs(maxSpeed) - 4);

        const gravityFactor = Math.min(Math.max(speedFactor, 0), 1);

        gravity =
            BASE_GRAVITY +
            gravityFactor * (MAX_GRAVITY - BASE_GRAVITY);

        velocityY += gravity;

        dino.y += velocityY;
    }



    const floorY = groundLevel - dino.height;

    if (dino.y >= floorY) {

        dino.y = floorY;
        velocityY = 0;
        isJumping = false;
    }

    // Sync hitbox position
    dino.hitboxY = dino.y + (dino.height - dino.hitboxHeight);

    drawDino();


    // Obstacles
    for (let obs of obstacles) {

        if (!gameOver) {
            obs.x += velocityX;
        }


        let img = obs.imgs
            ? obs.imgs[Math.floor(obs.frame) % obs.imgs.length]
            : obs.img;

        if (obs.imgs && !gameOver) {
            obs.frame += 0.25;
        }



        context.drawImage(img, obs.x, obs.y, obs.width, obs.height);


        if (!gameOver && collision(dino, obs)) {

            gameOver = true;

            // 🔥 Reset dino to normal pose
            isDucking = false;
            isJumping = false;

            dino.y = groundLevel - dino.height;

            // Save crash position AFTER reset
            crashX = dino.x;
            crashY = dino.y;

            velocityX = 0;
            velocityY = 0;

            shakeTime = 15;
        }

    }

    // ================= SCORE SYSTEM =================
    if (!gameOver) {

        // Convert speed to difficulty (0 → 1)
        const speedFactor =
            (Math.abs(velocityX) - 4) /
            (Math.abs(maxSpeed) - 4);

        const difficulty = Math.min(Math.max(speedFactor, 0), 1);

        // Dynamic score rate (points per second)
        const scoreRate =
            BASE_SCORE_RATE +
            difficulty * (MAX_SCORE_RATE - BASE_SCORE_RATE);

        // Apply score using delta time
        score += scoreRate * delta;
    }


    // Score (show only while playing)
    if (!gameOver) {

        context.fillStyle = "#fff";
        context.font = "20px Courier New";

        context.fillText(Math.floor(score), 15, 25);

    }

    // Game Over
    if (gameOver) {
        // Draw frozen scene
        drawGameOver();
    }

    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

}


// ================= DINO =================
function drawDino() {

    if (gameOver) return;

    // Jump has highest priority
    if (isJumping) {
        context.drawImage(jumpImg, dino.x, dino.y, dino.width, dino.height);
        return;
    }

    // Duck overrides run completely
    if (isDucking) {

        let img = duckImgs[Math.floor(duckIndex) % duckImgs.length];
        duckIndex += 0.12;

        // Use real duck size
        const h = DUCK_HEIGHT;
        const w = h * duckRatio;

        // Center horizontally
        const x = dino.x + (dino.width - w) / 2;

        // Stick to ground
        const y = groundLevel - h;

        context.drawImage(img, x, y, w, h);
        return;
    }


    // Run animation
    let img = runImgs[Math.floor(runIndex) % runImgs.length];
    runIndex += 0.18;

    context.drawImage(img, dino.x, dino.y, dino.width, dino.height);
}



// ================= GAME OVER =================
function drawGameOver() {

    // Draw knocked-out character
    if (knockedImg.complete) {

        context.drawImage(
            knockedImg,
            crashX,
            crashY+17,
            dino.width,
            dino.height
        );
    }

    // Draw GAME OVER image (no stretch)
    if (deadImg.complete) {

        const scale = 0.6; // tweak this (0.5–0.8 works well)

        const w = deadImg.width * scale;
        const h = deadImg.height * scale;

        const x = (BASE_WIDTH - w) / 2;
        const y = BASE_HEIGHT / 4;

        context.drawImage(deadImg, x, y, w, h);
    }

    // Draw Score
    context.fillStyle = "#fff";
    context.font = "22px Courier New";
    context.textAlign = "center";

    context.fillText(
        "Score: " + Math.floor(score),
        BASE_WIDTH / 2,
        BASE_HEIGHT / 2 + 40
    );
}



// ================= CONTROLS =================
function keyDown(e) {

    if (gameOver) return;

    if (e.repeat) return; // ⬅️ THIS LINE

    if ((e.code === "Space" || e.code === "ArrowUp") && !isJumping) {
        jump();
    }

    if (e.code === "ArrowDown" && !isJumping) {
        startDuck();
    }
}



function keyUp(e) {

    if (e.code === "ArrowDown") {
        stopDuck();
    }
}


// ================= ACTIONS =================
function jump() {

    velocityY = jumpPower;
    isJumping = true;
}


function startDuck() {

    if (isDucking || isJumping) return;

    isDucking = true;

    // Small hitbox
    dino.hitboxHeight = DUCK_HEIGHT;

    runIndex = 0;

    if (duckFromTouch) {

        if (duckTimeout) clearTimeout(duckTimeout);

        duckTimeout = setTimeout(() => {
            stopDuck();
        }, 350);
    }
}

function stopDuck() {

    if (!isDucking) return;

    isDucking = false;

    dino.hitboxHeight = NORMAL_HEIGHT;

    duckFromTouch = false;

    if (duckTimeout) {
        clearTimeout(duckTimeout);
        duckTimeout = null;
    }
}

// ================= OBSTACLES =================
function placeObstacle() {

    if (gameOver) return;

    if (obstacles.length > 0) {

        const last = obstacles[obstacles.length - 1];

        // Roll once per obstacle
        if (nextSpawnDistance === 0) {

            const speedFactor =
                (Math.abs(velocityX) - 4) /
                (Math.abs(maxSpeed) - 4);

            const difficulty = Math.min(Math.max(speedFactor, 0), 1);

            // Base safe range
            const min =
                MIN_SPAWN_DISTANCE * (1 - difficulty * 0.25);

            const max =
                MAX_SPAWN_DISTANCE * (1 - difficulty * 0.15);

            // 🎲 Base roll
            nextSpawnDistance =
                min + Math.random() * (max - min);


            /* ================= PATTERN BREAKER ================= */
            // Rare breathing space
            if (Math.random() < 0.12) {   // ~12%
                nextSpawnDistance *= 1.6;
            }


            /* ================= COMBO TRAP ================= */
            // Sudden double hit
            if (difficulty > 0.5 && Math.random() < 0.15) { // ~10%
                nextSpawnDistance *= 0.55;
            }


            /* ================= MICRO VARIATION ================= */
            // Prevent identical values
            nextSpawnDistance += Math.random() * 40 - 20;
        }

        // Real gap check
        const lastRight = last.x + last.width;
        const spawnX = BASE_WIDTH + 20;

        const gap = spawnX - lastRight;

        if (gap < nextSpawnDistance) return;
    }



    let r = Math.random();

    let obs = {

        img: null,
        imgs: null,
        frame: 0,

        x: BASE_WIDTH + 20,
        y: 0,

        width: 0,
        height: 0,
    };


    // Bird
    if (r < 0.25) {

        obs.imgs = birdImgs;

        obs.width = 80;
        obs.height = 55;

        const g = groundLevel;

        const heights = [
            g - obs.height - 5,
            g - obs.height - 65,
            g - obs.height - 120,
        ];

        obs.y = heights[Math.floor(Math.random() * heights.length)];
    }


    // Big cactus
    else if (r < 0.55) {

        obs.img = bigCactusImgs[
            Math.floor(Math.random() * bigCactusImgs.length)
            ];

        obs.width = obs.img.width * 0.9;
        obs.height = obs.img.height * 0.9;

        obs.y = groundLevel - obs.height;
    }


    // Small cactus
    else {

        obs.img = cactusImgs[
            Math.floor(Math.random() * cactusImgs.length)
            ];

        obs.width = obs.img.width * 0.85;
        obs.height = obs.img.height * 0.85;

        obs.y = groundLevel - obs.height;
    }


    obstacles.push(obs);
    // Reset for next roll
    nextSpawnDistance = 0;


    if (obstacles.length > 6) obstacles.shift();
}


// ================= COLLISION =================
function collision(a, b) {

    const pad = 12;

    return (
        a.x + pad < b.x + b.width - pad &&
        a.x + a.width - pad > b.x + pad &&

        a.hitboxY + pad < b.y + b.height - pad &&
        a.hitboxY + a.hitboxHeight - pad > b.y + pad
    );
}

