// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// High scores
let highScores = {
    single: { easy: 0, medium: 0, hard: 0 },
    multiplayer: 0,
    timed: 0
};

// Customization
let paddleColor = '#fff';
let ballColor = '#fff';
let backgroundColor = '#000';
let ballSpeedMultiplier = 1;

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('pongSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        highScores = settings.highScores || highScores;
        paddleColor = settings.paddleColor || paddleColor;
        ballColor = settings.ballColor || ballColor;
        backgroundColor = settings.backgroundColor || backgroundColor;
        ballSpeedMultiplier = settings.ballSpeedMultiplier || ballSpeedMultiplier;
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        highScores,
        paddleColor,
        ballColor,
        backgroundColor,
        ballSpeedMultiplier
    };
    localStorage.setItem('pongSettings', JSON.stringify(settings));
}

// Function to update menu button states
function updateMenuButtons() {
    // Reset all buttons
    singleBtn.classList.remove('active');
    multiBtn.classList.remove('active');
    timedBtn.classList.remove('active');
    easyBtn.classList.remove('active');
    mediumBtn.classList.remove('active');
    hardBtn.classList.remove('active');
    
    // Set active button
    if (gameMode === 'single') singleBtn.classList.add('active');
    else if (gameMode === 'multiplayer') multiBtn.classList.add('active');
    else if (gameMode === 'timed') timedBtn.classList.add('active');
    
    if (aiLevel === 'easy') easyBtn.classList.add('active');
    else if (aiLevel === 'medium') mediumBtn.classList.add('active');
    else if (aiLevel === 'hard') hardBtn.classList.add('active');
}

// Load settings
loadSettings();

// Game state variables
let gameState = 'menu';
let gameMode = 'single';
let aiLevel = 'easy';
let timer = 60; // for timed mode
let gameTime = 60; // initial game time for timed mode

// Get score elements
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');

// Get menu elements
const menu = document.getElementById('menu');
const singleBtn = document.getElementById('singleBtn');
const multiBtn = document.getElementById('multiBtn');
const timedBtn = document.getElementById('timedBtn');
const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const paddleColorPicker = document.getElementById('paddleColorPicker');
const ballColorPicker = document.getElementById('ballColorPicker');
const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startBtn');

// Initialize menu
updateMenuButtons();
speedSlider.value = ballSpeedMultiplier;
speedValue.textContent = ballSpeedMultiplier.toFixed(1);
paddleColorPicker.value = paddleColor;
ballColorPicker.value = ballColor;

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play sound
function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Game variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const maxScore = 5;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#fff',
    dy: 0
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#fff',
    dy: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 4,
    dy: 4,
    speed: 4,
    color: '#fff'
};

// Score
let playerScore = 0;
let computerScore = 0;

// Player 2 paddle (for multiplayer)
const player2 = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#fff',
    dy: 0
};

// Particles for effects
let particles = [];

// Ball trail
let ballTrail = [];

// Paddle animation
let playerPaddleScale = 1;
let computerPaddleScale = 1;

// Mouse control
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Keyboard control
let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        upPressed = true;
    } else if (e.key === 'ArrowDown') {
        downPressed = true;
    } else if (e.key === 'w' || e.key === 'W') {
        wPressed = true;
    } else if (e.key === 's' || e.key === 'S') {
        sPressed = true;
    } else if (gameState === 'menu') {
        if (e.key === '1') {
            gameMode = 'single';
        } else if (e.key === '2') {
            gameMode = 'multiplayer';
        } else if (e.key === '3') {
            gameMode = 'timed';
        } else if (e.key === 'e' || e.key === 'E') {
            aiLevel = 'easy';
        } else if (e.key === 'm' || e.key === 'M') {
            aiLevel = 'medium';
        } else if (e.key === 'h' || e.key === 'H') {
            aiLevel = 'hard';
        } else if (e.key === 'q' || e.key === 'Q') {
            ballSpeedMultiplier = Math.max(0.5, ballSpeedMultiplier - 0.1);
        } else if (e.key === 'w' || e.key === 'W') {
            ballSpeedMultiplier = Math.min(2, ballSpeedMultiplier + 0.1);
        } else if (e.key === 'a' || e.key === 'A') {
            paddleColor = '#ff0000'; // red
        } else if (e.key === 's' || e.key === 'S') {
            paddleColor = '#00ff00'; // green
        } else if (e.key === 'd' || e.key === 'D') {
            paddleColor = '#0000ff'; // blue
        } else if (e.key === 'f' || e.key === 'F') {
            paddleColor = '#ffff00'; // yellow
        } else if (e.key === 'r' || e.key === 'R') {
            // Reset to defaults
            paddleColor = '#fff';
            ballColor = '#fff';
            backgroundColor = '#000';
            ballSpeedMultiplier = 1;
            highScores = { single: { easy: 0, medium: 0, hard: 0 }, multiplayer: 0, timed: 0 };
        }
        saveSettings();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        upPressed = false;
    } else if (e.key === 'ArrowDown') {
        downPressed = false;
    } else if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    } else if (e.key === 'w' || e.key === 'W') {
        wPressed = false;
    } else if (e.key === 's' || e.key === 'S') {
        sPressed = false;
    }
});

// Click to start game
canvas.addEventListener('click', () => {
    if (gameState === 'menu' || gameState === 'gameOver') {
        // Save high score before resetting
        if (gameState === 'gameOver') {
            if (gameMode === 'single') {
                highScores.single[aiLevel] = Math.max(highScores.single[aiLevel], playerScore);
            } else {
                highScores[gameMode] = Math.max(highScores[gameMode], playerScore);
            }
            saveSettings();
        }
        resetGame();
        gameState = 'playing';
        menu.style.display = 'none';
    }
});

// Menu button events
singleBtn.addEventListener('click', () => {
    gameMode = 'single';
    updateMenuButtons();
});

multiBtn.addEventListener('click', () => {
    gameMode = 'multiplayer';
    updateMenuButtons();
});

timedBtn.addEventListener('click', () => {
    gameMode = 'timed';
    updateMenuButtons();
});

easyBtn.addEventListener('click', () => {
    aiLevel = 'easy';
    updateMenuButtons();
});

mediumBtn.addEventListener('click', () => {
    aiLevel = 'medium';
    updateMenuButtons();
});

hardBtn.addEventListener('click', () => {
    aiLevel = 'hard';
    updateMenuButtons();
});

speedSlider.addEventListener('input', (e) => {
    ballSpeedMultiplier = parseFloat(e.target.value);
    speedValue.textContent = ballSpeedMultiplier.toFixed(1);
});

paddleColorPicker.addEventListener('input', (e) => {
    paddleColor = e.target.value;
});

ballColorPicker.addEventListener('input', (e) => {
    ballColor = e.target.value;
});

resetBtn.addEventListener('click', () => {
    paddleColor = '#fff';
    ballColor = '#fff';
    backgroundColor = '#000';
    ballSpeedMultiplier = 1;
    highScores = { single: { easy: 0, medium: 0, hard: 0 }, multiplayer: 0, timed: 0 };
    speedSlider.value = 1;
    speedValue.textContent = '1.0';
    paddleColorPicker.value = '#ffffff';
    ballColorPicker.value = '#ffffff';
    saveSettings();
});

startBtn.addEventListener('click', () => {
    resetGame();
    gameState = 'playing';
    menu.style.display = 'none';
});

// Draw rectangle function
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle function
function drawCircle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Particle functions
function createParticles(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            life: 30,
            color: '#fff'
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        return p.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
    });
    ctx.globalAlpha = 1;
}

// Update player paddle position
function updatePlayer() {
    let moved = false;
    
    // Mouse control
    player.y = mouseY - player.height / 2;
    
    // Keyboard control (override mouse if keys are pressed)
    if (upPressed) {
        player.y -= 6;
        moved = true;
    }
    if (downPressed) {
        player.y += 6;
        moved = true;
    }
    
    // Keep paddle within canvas bounds
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
    
    // Paddle animation
    if (moved) {
        playerPaddleScale = 1.1;
    } else {
        playerPaddleScale = Math.max(1, playerPaddleScale - 0.05);
    }
}

// Update player 2 paddle position (for multiplayer)
function updatePlayer2() {
    let moved = false;
    
    if (wPressed) {
        player2.y -= 6;
        moved = true;
    }
    if (sPressed) {
        player2.y += 6;
        moved = true;
    }
    
    // Keep paddle within canvas bounds
    if (player2.y < 0) {
        player2.y = 0;
    }
    if (player2.y + player2.height > canvas.height) {
        player2.y = canvas.height - player2.height;
    }
    
    // Paddle animation
    if (moved) {
        computerPaddleScale = 1.1;
    } else {
        computerPaddleScale = Math.max(1, computerPaddleScale - 0.05);
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    let moved = false;
    let speed = 4; // default medium
    let threshold = 35;
    
    if (aiLevel === 'easy') {
        speed = 2;
        threshold = 50;
    } else if (aiLevel === 'hard') {
        speed = 6;
        threshold = 20;
    }
    
    // Simple AI: follow the ball
    const paddleCenter = computer.y + computer.height / 2;
    
    if (paddleCenter < ball.y - threshold) {
        computer.y += speed;
        moved = true;
    } else if (paddleCenter > ball.y + threshold) {
        computer.y -= speed;
        moved = true;
    }
    
    // Keep paddle within canvas bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
    
    // Paddle animation
    if (moved) {
        computerPaddleScale = 1.1;
    } else {
        computerPaddleScale = Math.max(1, computerPaddleScale - 0.05);
    }
}

// Update ball position
function updateBall() {
    // Add to trail
    ballTrail.push({ x: ball.x, y: ball.y });
    if (ballTrail.length > 10) {
        ballTrail.shift();
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
    }
    
    // Paddle collision - Player
    if (ball.x - ball.size < player.x + player.width &&
        ball.x + ball.size > player.x &&
        ball.y - ball.size < player.y + player.height &&
        ball.y + ball.size > player.y) {
        
        // Calculate relative position of ball hit on paddle
        const relativeIntersectY = (player.y + player.height / 2) - ball.y;
        const normalizedRelativeIntersectY = relativeIntersectY / (player.height / 2);
        const bounceAngle = normalizedRelativeIntersectY * (Math.PI / 4);
        
        ball.dx = ball.speed * Math.cos(bounceAngle);
        ball.dy = ball.speed * -Math.sin(bounceAngle);
        
        // Ensure ball moves right
        ball.dx = Math.abs(ball.dx);
        
        // Move ball away from paddle to prevent multiple collisions
        ball.x = player.x + player.width + ball.size;
        
        // Play paddle hit sound
        playSound(440, 0.1, 'square');
        
        // Create particles
        createParticles(ball.x, ball.y);
    }
    
    // Paddle collision - Computer
    if (ball.x + ball.size > computer.x &&
        ball.x - ball.size < computer.x + computer.width &&
        ball.y - ball.size < computer.y + computer.height &&
        ball.y + ball.size > computer.y) {
        
        // Calculate relative position of ball hit on paddle
        const relativeIntersectY = (computer.y + computer.height / 2) - ball.y;
        const normalizedRelativeIntersectY = relativeIntersectY / (computer.height / 2);
        const bounceAngle = normalizedRelativeIntersectY * (Math.PI / 4);
        
        ball.dx = ball.speed * -Math.cos(bounceAngle);
        ball.dy = ball.speed * -Math.sin(bounceAngle);
        
        // Ensure ball moves left
        ball.dx = -Math.abs(ball.dx);
        
        // Move ball away from paddle to prevent multiple collisions
        ball.x = computer.x - ball.size;
        
        // Play paddle hit sound
        playSound(440, 0.1, 'square');
        
        // Create particles
        createParticles(ball.x, ball.y);
    }
    
    // Score detection
    if (ball.x - ball.size < 0) {
        // Computer scores
        computerScore++;
        computerScoreElement.textContent = computerScore;
        resetBall();
        
        // Play score sound
        playSound(200, 0.5, 'sawtooth');
        
        // Check for game over
        if (computerScore >= maxScore) {
            gameState = 'gameOver';
        }
    }
    
    if (ball.x + ball.size > canvas.width) {
        // Player scores
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
        
        // Play score sound
        playSound(600, 0.5, 'sawtooth');
        
        // Check for game over
        if (playerScore >= maxScore) {
            gameState = 'gameOver';
        }
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction with speed multiplier
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed * ballSpeedMultiplier;
    ball.dy = (Math.random() * 2 - 1) * ball.speed * ballSpeedMultiplier;
}

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    resetBall();
    particles = [];
    ballTrail = [];
    timer = gameTime;
}

// Draw everything
function draw() {
    // Clear canvas with background color
    drawRect(0, 0, canvas.width, canvas.height, backgroundColor);
    
    // Draw center line
    drawCenterLine();
    
    // Draw ball trail
    ballTrail.forEach((pos, index) => {
        const alpha = (index + 1) / ballTrail.length * 0.3;
        ctx.globalAlpha = alpha;
        drawCircle(pos.x, pos.y, ball.size, ballColor);
    });
    ctx.globalAlpha = 1;
    
    // Draw paddles with animation
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(playerPaddleScale, 1);
    drawRect(-player.width / 2, -player.height / 2, player.width, player.height, paddleColor);
    ctx.restore();
    
    if (gameMode === 'multiplayer') {
        ctx.save();
        ctx.translate(player2.x + player2.width / 2, player2.y + player2.height / 2);
        ctx.scale(computerPaddleScale, 1);
        drawRect(-player2.width / 2, -player2.height / 2, player2.width, player2.height, paddleColor);
        ctx.restore();
    } else {
        ctx.save();
        ctx.translate(computer.x + computer.width / 2, computer.y + computer.height / 2);
        ctx.scale(computerPaddleScale, 1);
        drawRect(-computer.width / 2, -computer.height / 2, computer.width, computer.height, paddleColor);
        ctx.restore();
    }
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, ballColor);
    
    // Draw particles
    drawParticles();
    
    // Draw timer for timed mode
    if (gameMode === 'timed') {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Time: ${Math.ceil(timer)}`, canvas.width / 2, 30);
    }
}

// Draw menu
function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PONG GAME', canvas.width / 2, canvas.height / 2 - 120);
    
    ctx.font = '20px Arial';
    let highScoreText = '';
    if (gameMode === 'single') {
        highScoreText = `High Score (${aiLevel}): ${highScores.single[aiLevel]}`;
    } else {
        highScoreText = `High Score: ${highScores[gameMode]}`;
    }
    ctx.fillText(highScoreText, canvas.width / 2, canvas.height / 2 - 80);
    
    ctx.fillText(`Mode: ${gameMode.toUpperCase()} | AI: ${aiLevel.toUpperCase()}`, canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText(`Speed: ${ballSpeedMultiplier}x | Paddle: ${paddleColor} | Ball: ${ballColor}`, canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillText('Use buttons below or keyboard shortcuts', canvas.width / 2, canvas.height / 2 + 20);
}

// Draw pause
function drawPause() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press Space to Resume', canvas.width / 2, canvas.height / 2 + 50);
}

// Draw game over
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    let winner = '';
    if (gameMode === 'timed') {
        winner = playerScore > computerScore ? 'Player Wins!' : playerScore < computerScore ? 'Computer Wins!' : 'Draw!';
    } else {
        winner = playerScore > computerScore ? 'Player Wins!' : 'Computer Wins!';
    }
    ctx.fillText(winner, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText('Click to Play Again', canvas.width / 2, canvas.height / 2 + 50);
}

// Update game state
function update() {
    updatePlayer();
    if (gameMode === 'multiplayer') {
        updatePlayer2();
    } else {
        updateComputer();
    }
    updateBall();
    updateParticles();
    
    // Update timer for timed mode
    if (gameMode === 'timed') {
        timer -= 1/60; // assuming 60 FPS
        if (timer <= 0) {
            gameState = 'gameOver';
        }
    }
}

// Game loop
function gameLoop() {
    if (gameState === 'playing') {
        update();
        draw();
        menu.style.display = 'none';
    } else if (gameState === 'menu') {
        draw();
        drawMenu();
        menu.style.display = 'block';
        updateMenuButtons();
    } else if (gameState === 'paused') {
        draw();
        drawPause();
        menu.style.display = 'none';
    } else if (gameState === 'gameOver') {
        draw();
        drawGameOver();
        menu.style.display = 'none';
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
