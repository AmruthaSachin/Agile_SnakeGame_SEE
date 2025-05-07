const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const welcomeScreen = document.querySelector(".welcome-screen");
const welcomePlayButton = document.getElementById("welcomePlayButton");
const controls = document.querySelector(".controls");
const gameContainer = document.querySelector(".game-container");
const tryAgainButton = document.getElementById("tryAgain");
const startGameButton = document.getElementById("startGame");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const snakeColorInput = document.getElementById("snakeColor");

const backgroundOptions = document.querySelectorAll(".background-option");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const quitButton = document.getElementById("quitButton");

const scoreBoard = document.getElementById('scoreBoard'); // 👈 Added shortcut for easy use

document.getElementById("quitButton").addEventListener("click", function() {
    // Optional: Stop game loop, clear intervals/timeouts if needed
    window.location.href = "index.html";
});

const pauseSound = new Audio("sounds/pause.mp3");
const resumeSound = new Audio("soun ds/resume.mp3");
const eatSound = new Audio("sounds/eat.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const buttonClickSound = new Audio("sounds/button.mp3");

let backgroundImage = 'grassland.jpg';

canvas.width = 480;
canvas.height = 480;
const gridSize = 20;

let snake, direction, food, score, highScore, gameOver, speed, gameRunning, gameLoopInterval, mouthOpen;

highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;

// 👇 HIDE scoreboard initially when page loads
window.onload = function() {
    scoreBoard.style.display = 'none';
};

function startGame() {
    buttonClickSound.play();
    scoreBoard.style.display = 'block'; // 👈 SHOW scoreboard when game starts
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    direction = { x: gridSize, y: 0 };
    food = generateFood();
    score = 0;
    scoreDisplay.textContent = score;
    gameOver = false;
    speed = 200;
    gameRunning = true;
    mouthOpen = false;

    tryAgainButton.style.display = "none";

    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, speed);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function draw() {
    const background = new Image();
    background.src = backgroundImage;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "green";
    ctx.fillRect(food.x + gridSize / 2 - 2, food.y + gridSize / 2 - 10, 4, 6);

    ctx.fillStyle = snakeColorInput.value;
    ctx.beginPath();
    ctx.moveTo(snake[0].x + gridSize / 2, snake[0].y + gridSize / 2);
    for (let i = 1; i < snake.length; i++) {
        ctx.lineTo(snake[i].x + gridSize / 2, snake[i].y + gridSize / 2);
    }
    ctx.lineWidth = gridSize - 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = snakeColorInput.value;
    ctx.stroke();

    const head = snake[0];
    ctx.fillStyle = "white";
    ctx.fillRect(head.x + 4, head.y + 6, 4, 4);
    ctx.fillRect(head.x + 12, head.y + 6, 4, 4);

    if (mouthOpen) {
        ctx.fillStyle = "red";
        ctx.fillRect(head.x + 6, head.y + 12, 8, 5);
    }
}

function checkCollision() {
    let head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function update() {
    if (gameOver) return;

    let newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (checkCollision()) {
        gameOverSound.play();
        gameOver = true;
        gameRunning = false;
        tryAgainButton.style.display = "block";
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        eatSound.play();
        score++;
        scoreDisplay.textContent = score;
        mouthOpen = true;
        setTimeout(() => mouthOpen = false, 200);

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreDisplay.textContent = highScore;
        }

        speed *= 0.95;
        clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(gameLoop, speed);
        food = generateFood();
    } else {
        snake.pop();
    }
}

function gameLoop() {
    if (!gameOver && gameRunning) {
        update();
        draw();
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -gridSize };
    else if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: gridSize };
    else if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -gridSize, y: 0 };
    else if (e.key === "ArrowRight" && direction.x === 0) direction = { x: gridSize, y: 0 };
});

welcomePlayButton.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    controls.style.display = "block";
});

startGameButton.addEventListener("click", () => {
    controls.style.display = "none";
    gameContainer.style.display = "block";
    startGame();
});

tryAgainButton.addEventListener("click", () => {
    startGame();
});

// Background selection logic
backgroundOptions.forEach(option => {
    option.addEventListener("click", () => {
        backgroundOptions.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        backgroundImage = option.dataset.image;
    });
});

pauseButton.addEventListener("click", () => {
    if (gameRunning) {
        gameRunning = false;
        pauseSound.play();
        pauseButton.style.display = "none";
        resumeButton.style.display = "inline-block";
    }
});

resumeButton.addEventListener("click", () => {
    if (!gameRunning && !gameOver) {
        gameRunning = true;
        resumeSound.play();
        pauseButton.style.display = "inline-block";
        resumeButton.style.display = "none";
    }
});

quitButton.addEventListener("click", () => {
    buttonClickSound.play();
    clearInterval(gameLoopInterval);
    gameContainer.style.display = "none";
    welcomeScreen.style.display = "block";
    tryAgainButton.style.display = "none";
    pauseButton.style.display = "inline-block";
    resumeButton.style.display = "none";
    scoreBoard.style.display = 'none'; // 👈 HIDE scoreboard when quit
});
