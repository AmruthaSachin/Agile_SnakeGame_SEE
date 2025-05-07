const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const welcomeScreen = document.querySelector(".welcome-screen");
const welcomePlayButton = document.getElementById("welcomePlayButton");
const controls = document.querySelector(".controls");
const gameContainer = document.querySelector(".game-container");
const tryAgainButton = document.getElementById("tryAgain");
const startGameButton = document.getElementById("startGame");
const scoreDisplay1 = document.getElementById("scorePlayer1");
const scoreDisplay2 = document.getElementById("scorePlayer2");
const highScoreDisplay1 = document.getElementById("highScorePlayer1");
const highScoreDisplay2 = document.getElementById("highScorePlayer2");
const snakeColorInput1 = document.getElementById("snakeColor1");
const snakeColorInput2 = document.getElementById("snakeColor2");

const backgroundOptions = document.querySelectorAll(".background-option");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const quitButton = document.getElementById("quitButton");

const scoreBoard = document.getElementById('scoreBoard');

document.getElementById("quitButton").addEventListener("click", function() {
    window.location.href = "index.html";
});

const pauseSound = new Audio("sounds/pause.mp3");
const resumeSound = new Audio("sounds/resume.mp3");
const eatSound = new Audio("sounds/eat.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const buttonClickSound = new Audio("sounds/button.mp3");

let backgroundImage = 'grassland.jpg';

canvas.width = 960; // Doubled for split screen
canvas.height = 480;
const gridSize = 20;

let snake1, snake2, direction1, direction2, food1, food2;
let score1, score2, highScore1, highScore2;
let gameOver1, gameOver2, speed, gameRunning;
let gameLoopInterval, mouthOpen1, mouthOpen2;
let winner = null;

// Load high scores from local storage
highScore1 = localStorage.getItem("highScorePlayer1") || 0;
highScore2 = localStorage.getItem("highScorePlayer2") || 0;
highScoreDisplay1.textContent = highScore1;
highScoreDisplay2.textContent = highScore2;

// Hide scoreboard initially
window.onload = function() {
    scoreBoard.style.display = 'none';
};

function startGame() {
    buttonClickSound.play();
    scoreBoard.style.display = 'block';
    
    // Initialize player 1 (WASD)
    snake1 = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    direction1 = { x: gridSize, y: 0 };
    food1 = generateFood(0); // Left side
    score1 = 0;
    scoreDisplay1.textContent = score1;
    gameOver1 = false;
    mouthOpen1 = false;
    
    // Initialize player 2 (Arrow keys)
    snake2 = [
        { x: 200 + canvas.width/2, y: 200 },
        { x: 180 + canvas.width/2, y: 200 },
        { x: 160 + canvas.width/2, y: 200 }
    ];
    direction2 = { x: gridSize, y: 0 };
    food2 = generateFood(1); // Right side
    score2 = 0;
    scoreDisplay2.textContent = score2;
    gameOver2 = false;
    mouthOpen2 = false;
    
    winner = null;
    speed = 200;
    gameRunning = true;

    tryAgainButton.style.display = "none";

    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, speed);
}

function generateFood(playerIndex) {
    const halfWidth = canvas.width / 2;
    
    if (playerIndex === 0) {
        // Player 1 (left side)
        return {
            x: Math.floor(Math.random() * (halfWidth / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    } else {
        // Player 2 (right side)
        return {
            x: halfWidth + Math.floor(Math.random() * (halfWidth / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    }
}

function draw() {
    // Load and draw the grassy background for both sides
    const background = new Image();
    background.src = backgroundImage;
    
    // Draw background for left side
    ctx.drawImage(background, 0, 0, canvas.width/2, canvas.height);
    
    // Draw background for right side
    ctx.drawImage(background, canvas.width/2, 0, canvas.width/2, canvas.height);
    
    // Draw the grid overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines for both sides
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw dividing line between players
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();

    // Draw player status
    if (gameOver1) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width/2, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/4, canvas.height/2);
    }
    
    if (gameOver2) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(canvas.width/2, 0, canvas.width/2, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width*3/4, canvas.height/2);
    }
    
    // Draw winner when both games are over
    if (gameOver1 && gameOver2 && winner) {
        ctx.fillStyle = "white";
        ctx.font = "24px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(winner + " WINS!", canvas.width/2, 60);
    }

    // Draw food for player 1
    drawFood(food1);
    
    // Draw food for player 2
    drawFood(food2);

    // Draw snake for player 1
    drawSnake(snake1, snakeColorInput1.value, mouthOpen1);
    
    // Draw snake for player 2
    drawSnake(snake2, snakeColorInput2.value, mouthOpen2);
}

function drawFood(food) {
    // Draw apple (red circle with green stem)
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw green stem
    ctx.fillStyle = "green";
    ctx.fillRect(food.x + gridSize / 2 - 2, food.y + gridSize / 2 - 10, 4, 6);
}

function drawSnake(snake, color, mouthOpen) {
    // Draw snake as a continuous line with rounded caps
    ctx.beginPath();
    ctx.moveTo(snake[0].x + gridSize / 2, snake[0].y + gridSize / 2);
    for (let i = 1; i < snake.length; i++) {
        ctx.lineTo(snake[i].x + gridSize / 2, snake[i].y + gridSize / 2);
    }
    ctx.lineWidth = gridSize - 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();

    // Draw snake head features (eyes)
    const head = snake[0];
    ctx.fillStyle = "white";
    ctx.fillRect(head.x + 4, head.y + 6, 4, 4);
    ctx.fillRect(head.x + 12, head.y + 6, 4, 4);

    // Draw mouth when eating
    if (mouthOpen) {
        ctx.fillStyle = "red";
        ctx.fillRect(head.x + 6, head.y + 12, 8, 5);
    }
}

function checkCollision(snake, playerIndex) {
    const halfWidth = canvas.width / 2;
    let head = snake[0];
    
    // Check wall collision based on which player's side
    if (playerIndex === 0) {
        // Player 1 (left side)
        if (head.x < 0 || head.x >= halfWidth || head.y < 0 || head.y >= canvas.height) return true;
    } else {
        // Player 2 (right side)
        if (head.x < halfWidth || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    }
    
    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    
    return false;
}

function update() {
    if (gameOver1 && gameOver2) return;

    // Update player 1
    if (!gameOver1) {
        // Create new head based on direction
        let newHead1 = { x: snake1[0].x + direction1.x, y: snake1[0].y + direction1.y };
        
        // Check collision
        if (checkCollision(snake1, 0)) {
            gameOverSound.play();
            gameOver1 = true;
            
            // Check if both players are now done
            if (gameOver2) {
                determineWinner();
                tryAgainButton.style.display = "block";
            }
            return;
        }
        
        // Add new head to the front
        snake1.unshift(newHead1);
        
        // Check if eaten food
        if (newHead1.x === food1.x && newHead1.y === food1.y) {
            eatSound.play();
            score1++;
            scoreDisplay1.textContent = score1;
            mouthOpen1 = true;
            setTimeout(() => mouthOpen1 = false, 200);
            
            // Update high score if needed
            if (score1 > highScore1) {
                highScore1 = score1;
                localStorage.setItem("highScorePlayer1", highScore1);
                highScoreDisplay1.textContent = highScore1;
            }
            
            // Generate new food
            food1 = generateFood(0);
            
            // Increase game speed
            speed *= 0.95;
            clearInterval(gameLoopInterval);
            gameLoopInterval = setInterval(gameLoop, speed);
        } else {
            // Remove tail if no food eaten
            snake1.pop();
        }
    }
    
    // Update player 2
    if (!gameOver2) {
        // Create new head based on direction
        let newHead2 = { x: snake2[0].x + direction2.x, y: snake2[0].y + direction2.y };
        
        // Check collision
        if (checkCollision(snake2, 1)) {
            gameOverSound.play();
            gameOver2 = true;
            
            // Check if both players are now done
            if (gameOver1) {
                determineWinner();
                tryAgainButton.style.display = "block";
            }
            return;
        }
        
        // Add new head to the front
        snake2.unshift(newHead2);
        
        // Check if eaten food
        if (newHead2.x === food2.x && newHead2.y === food2.y) {
            eatSound.play();
            score2++;
            scoreDisplay2.textContent = score2;
            mouthOpen2 = true;
            setTimeout(() => mouthOpen2 = false, 200);
            
            // Update high score if needed
            if (score2 > highScore2) {
                highScore2 = score2;
                localStorage.setItem("highScorePlayer2", highScore2);
                highScoreDisplay2.textContent = highScore2;
            }
            
            // Generate new food
            food2 = generateFood(1);
            
            // Increase game speed
            speed *= 0.95;
            clearInterval(gameLoopInterval);
            gameLoopInterval = setInterval(gameLoop, speed);
        } else {
            // Remove tail if no food eaten
            snake2.pop();
        }
    }
}

function determineWinner() {
    if (score1 > score2) {
        winner = "PLAYER 1";
    } else if (score2 > score1) {
        winner = "PLAYER 2";
    } else {
        winner = "TIE";
    }
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
    }
}

// Controls for both players
document.addEventListener("keydown", (e) => {
    // Player 1 - WASD
    if (e.key === "w" && direction1.y === 0) direction1 = { x: 0, y: -gridSize };
    else if (e.key === "s" && direction1.y === 0) direction1 = { x: 0, y: gridSize };
    else if (e.key === "a" && direction1.x === 0) direction1 = { x: -gridSize, y: 0 };
    else if (e.key === "d" && direction1.x === 0) direction1 = { x: gridSize, y: 0 };
    
    // Player 2 - Arrow Keys
    else if (e.key === "ArrowUp" && direction2.y === 0) direction2 = { x: 0, y: -gridSize };
    else if (e.key === "ArrowDown" && direction2.y === 0) direction2 = { x: 0, y: gridSize };
    else if (e.key === "ArrowLeft" && direction2.x === 0) direction2 = { x: -gridSize, y: 0 };
    else if (e.key === "ArrowRight" && direction2.x === 0) direction2 = { x: gridSize, y: 0 };
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
    if (!gameRunning && !(gameOver1 && gameOver2)) {
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
    scoreBoard.style.display = 'none';
});
