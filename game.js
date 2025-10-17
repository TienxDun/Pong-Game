// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 8;
const COMPUTER_SPEED = 6;

// Game state
let playerScore = 0;
let computerScore = 0;

// Paddle objects
const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const computer = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: 4,
    dy: 4
};

// Key state tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse tracking
let mouseY = canvas.height / 2;

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        keys[e.key] = false;
    }
});

// Event listener for mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
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
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw everything
function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#fff');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#fff');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, '#fff');
}

// Update player paddle
function updatePlayer() {
    // Handle keyboard input
    if (keys.ArrowUp) {
        player.dy = -PADDLE_SPEED;
    } else if (keys.ArrowDown) {
        player.dy = PADDLE_SPEED;
    } else {
        // Handle mouse input when no keys are pressed
        const targetY = mouseY - player.height / 2;
        const diff = targetY - player.y;
        
        if (Math.abs(diff) > 5) {
            player.dy = diff > 0 ? PADDLE_SPEED : -PADDLE_SPEED;
        } else {
            player.dy = 0;
        }
    }
    
    // Update position
    player.y += player.dy;
    
    // Boundary checking
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    
    // Simple AI: follow the ball
    if (computerCenter < ball.y - 35) {
        computer.y += COMPUTER_SPEED;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= COMPUTER_SPEED;
    }
    
    // Boundary checking
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
    }
    
    // Paddle collision detection
    // Player paddle collision
    if (ball.x - ball.size < player.x + player.width &&
        ball.x + ball.size > player.x &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        
        ball.dx = Math.abs(ball.dx); // Ensure ball goes right
        
        // Add some angle based on where it hits the paddle
        const hitPos = (ball.y - player.y) / player.height;
        ball.dy = (hitPos - 0.5) * 8;
    }
    
    // Computer paddle collision
    if (ball.x + ball.size > computer.x &&
        ball.x - ball.size < computer.x + computer.width &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height) {
        
        ball.dx = -Math.abs(ball.dx); // Ensure ball goes left
        
        // Add some angle based on where it hits the paddle
        const hitPos = (ball.y - computer.y) / computer.height;
        ball.dy = (hitPos - 0.5) * 8;
    }
    
    // Score detection
    if (ball.x - ball.size < 0) {
        // Computer scores
        computerScore++;
        updateScoreboard();
        resetBall();
    }
    
    if (ball.x + ball.size > canvas.width) {
        // Player scores
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction
    const speed = 4;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * speed;
    ball.dy = (Math.random() * 2 - 1) * speed;
}

// Update scoreboard
function updateScoreboard() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
