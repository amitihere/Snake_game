class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-value');
        this.highScoreElement = document.getElementById('high-score-value');
        this.finalScoreElement = document.getElementById('final-score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');

        
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameSpeed = 150;
        this.gameLoop = null;
        this.isGameRunning = false;

        
        this.highScoreElement.textContent = this.highScore;

        this.setupEventListeners();
    }

    setupEventListeners() {
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e.key);
        });

        
        ['up', 'down', 'left', 'right'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                this.handleKeyPress(id);
            });
        });

        
        ['up', 'down', 'left', 'right'].forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleKeyPress(id);
                });
            }
        });

        
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
    }

    handleKeyPress(key) {
        if (!this.isGameRunning) return;

        const directions = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };

        if (directions[key]) {
            
            if (this.direction.x !== -directions[key].x || this.direction.y !== -directions[key].y) {
                this.nextDirection = directions[key];
            }
        }
    }

    startGame() {
        
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }
        ];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.generateFood();
        
        
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        
        this.isGameRunning = true;
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        this.food = newFood;
    }

    update() {
        if (!this.isGameRunning) return;

        
        this.direction = this.nextDirection;

        
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            const newHead = {
                x: (this.snake[0].x + this.direction.x + this.tileCount) % this.tileCount,
                y: (this.snake[0].y + this.direction.y + this.tileCount) % this.tileCount
            };

            
            if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                this.gameOver();
                return;
            }

            this.snake.unshift(newHead);

            
            if (newHead.x === this.food.x && newHead.y === this.food.y) {
                this.score += 10;
                this.scoreElement.textContent = this.score;
                this.generateFood();
            } else {
                this.snake.pop();
            }
        }

        this.draw();
    }

    draw() {
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createRadialGradient(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                0,
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#45a049');
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#4CAF50';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1,
                index === 0 ? 8 : 4
            );
            this.ctx.fill();
        });

        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.shadowColor = '#ff4444';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.gameLoop);
        
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
}


window.addEventListener('load', () => {
    new SnakeGame();
});