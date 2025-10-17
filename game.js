// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Get score elements
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');

// Game variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

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

// Mouse control
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Keyboard control
let upPressed = false;
let downPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        upPressed = true;
    } else if (e.key === 'ArrowDown') {
        downPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        upPressed = false;
    } else if (e.key === 'ArrowDown') {
        downPressed = false;
    }
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

// Update player paddle position
function updatePlayer() {
    // Mouse control
    player.y = mouseY - player.height / 2;
    
    // Keyboard control (override mouse if keys are pressed)
    if (upPressed) {
        player.y -= 6;
    }
    if (downPressed) {
        player.y += 6;
    }
    
    // Keep paddle within canvas bounds
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    // Simple AI: follow the ball
    const paddleCenter = computer.y + computer.height / 2;
    
    if (paddleCenter < ball.y - 35) {
        computer.y += computer.dy;
    } else if (paddleCenter > ball.y + 35) {
        computer.y -= computer.dy;
    }
    
    // Keep paddle within canvas bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
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
    }
    
    // Score detection
    if (ball.x - ball.size < 0) {
        // Computer scores
        computerScore++;
        computerScoreElement.textContent = computerScore;
        resetBall();
    }
    
    if (ball.x + ball.size > canvas.width) {
        // Player scores
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

// Draw everything
function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, ball.color);
}

// Update game state
function update() {
    updatePlayer();
    updateComputer();
    updateBall();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
