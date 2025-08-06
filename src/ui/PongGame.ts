import { EasterEggKeywords } from './EasterEggKeywords';

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
}

interface GameScore {
  player: number;
  ai: number;
}

type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private gameLoop: number = 0;
  private gameState: GameState = 'menu';
  
  // Game objects
  private playerPaddle: Paddle;
  private aiPaddle: Paddle;
  private ball: Ball;
  private score: GameScore = { player: 0, ai: 0 };
  
  // Controls
  private keys: Set<string> = new Set();
  private mouseY: number = 0;
  private previousMouseY: number = 0;
  private useMouseControl: boolean = false;
  private playerVelocity: number = 0;
  
  // Gamepad support
  private gamepadIndex: number | null = null;
  private gamepadConnected: boolean = false;
  private useGamepadControl: boolean = false;
  private readonly GAMEPAD_DEADZONE = 0.15;
  
  // Game settings
  private readonly CANVAS_WIDTH = 600;
  private readonly CANVAS_HEIGHT = 300;
  private readonly PADDLE_WIDTH = 12;
  private readonly PADDLE_HEIGHT = 60;
  private readonly BALL_RADIUS = 6;
  private readonly WINNING_SCORE = 5;
  private gamepadStatusElement: HTMLDivElement | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.canvas.className = 'pong-canvas';
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    
    // Initialize game objects
    this.playerPaddle = {
      x: 20,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT,
      speed: 5
    };
    
    this.aiPaddle = {
      x: this.CANVAS_WIDTH - 20 - this.PADDLE_WIDTH,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT,
      speed: 3
    };
    
    // Initialize ball
    this.ball = {
      x: this.CANVAS_WIDTH / 2,
      y: this.CANVAS_HEIGHT / 2,
      radius: this.BALL_RADIUS,
      vx: 0,
      vy: 0,
      speed: 4
    };
    
    this.resetBall();
    
    container.appendChild(this.canvas);
    
    // Store reference to this instance on the canvas for cleanup
    (this.canvas as any)._pongGameInstance = this;
    
    // Create gamepad status indicator
    this.gamepadStatusElement = document.createElement('div');
    this.gamepadStatusElement.className = 'gamepad-status';
    this.gamepadStatusElement.style.cssText = 'position: absolute; top: 10px; right: 10px; font-family: monospace; font-size: 12px; opacity: 0.7;';
    container.appendChild(this.gamepadStatusElement);
    
    this.setupEventListeners();
    this.setupGamepadListeners();
    this.gameLoop = requestAnimationFrame(() => this.loop());
  }
  
  private resetBall(): void {
    this.ball = {
      x: this.CANVAS_WIDTH / 2,
      y: this.CANVAS_HEIGHT / 2,
      radius: this.BALL_RADIUS,
      vx: (Math.random() > 0.5 ? 1 : -1) * 4,
      vy: (Math.random() - 0.5) * 4,
      speed: 4
    };
  }
  
  private setupEventListeners(): void {
    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ' && this.gameState === 'menu') {
        this.startGame();
      }
      if (e.key === 'Escape') {
        this.gameState = this.gameState === 'paused' ? 'playing' : 'paused';
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };
    
    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      if (this.previousMouseY === 0) {
        this.previousMouseY = e.clientY - rect.top;
      }
      this.mouseY = e.clientY - rect.top;
      this.useMouseControl = true;
      this.useGamepadControl = false; // Switch from gamepad when mouse moves
    };
    
    const handleClick = () => {
      if (this.gameState === 'menu') {
        this.startGame();
      } else if (this.gameState === 'gameover') {
        this.resetGame();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('click', handleClick);
    
    // Store references for cleanup
    (this.canvas as any)._pongListeners = {
      handleKeyDown,
      handleKeyUp,
      handleMouseMove,
      handleClick
    };
  }
  
  private setupGamepadListeners(): void {
    const handleGamepadConnected = (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
      this.gamepadConnected = true;
      this.updateGamepadStatus();
    };
    
    const handleGamepadDisconnected = (e: GamepadEvent) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
        this.gamepadConnected = false;
        this.useGamepadControl = false;
        this.updateGamepadStatus();
      }
    };
    
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    // Store references for cleanup
    (this.canvas as any)._gamepadListeners = {
      handleGamepadConnected,
      handleGamepadDisconnected
    };
    
    // Initial gamepad check
    this.refreshGamepadConnection();
  }
  
  private refreshGamepadConnection(): void {
    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    
    let preferredGamepadIndex = null;
    let fallbackGamepadIndex = null;
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      
      if (gamepad && gamepad.connected) {
        // Prefer Xbox controllers or standard gamepads over other devices
        if (gamepad.id.toLowerCase().includes('xbox') || gamepad.id.toLowerCase().includes('xinput') || gamepad.id.toLowerCase().includes('standard')) {
          preferredGamepadIndex = i;
          break; // Use this one immediately
        } else if (fallbackGamepadIndex === null) {
          fallbackGamepadIndex = i;
        }
      }
    }
    
    const selectedIndex = preferredGamepadIndex !== null ? preferredGamepadIndex : fallbackGamepadIndex;
    
    if (selectedIndex !== null) {
      this.gamepadIndex = selectedIndex;
      this.gamepadConnected = true;
      this.updateGamepadStatus();
    } else {
      // No gamepads found
      this.gamepadIndex = null;
      this.gamepadConnected = false;
      this.updateGamepadStatus();
    }
  }
  
  private updateGamepadStatus(): void {
    if (this.gamepadStatusElement) {
      if (this.gamepadConnected) {
        this.gamepadStatusElement.textContent = '🎮 Controller Connected';
        this.gamepadStatusElement.style.color = 'var(--color-accent)';
      } else {
        this.gamepadStatusElement.textContent = '';
      }
    }
  }
  
  private startGame(): void {
    this.gameState = 'playing';
    this.resetBall();
    // Refresh gamepad connection each time the game starts
    this.refreshGamepadConnection();
  }
  
  private resetGame(): void {
    this.score = { player: 0, ai: 0 };
    this.gameState = 'menu';
    this.resetBall();
  }
  
  private loop(): void {
    this.update();
    this.render();
    this.gameLoop = requestAnimationFrame(() => this.loop());
  }
  
  private update(): void {
    // Poll gamepad for menu/pause controls even when not playing
    this.pollGamepad();
    
    if (this.gameState !== 'playing') return;
    
    // Update player paddle
    this.updatePlayerPaddle();
    
    // Update AI paddle
    this.updateAIPaddle();
    
    // Update ball
    this.updateBall();
    
    // Check for scoring
    this.checkScoring();
  }
  
  private pollGamepad(): void {
    if (this.gamepadIndex === null) return;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];
    
    if (!gamepad) {
      this.gamepadConnected = false;
      this.gamepadIndex = null;
      this.updateGamepadStatus();
      return;
    }
    
    // Button mappings (standard gamepad)
    // Button 0: A/Cross - Start game
    // Button 1: B/Circle - Pause (alternative)
    // Button 9: Start/Options - Pause
    
    // Handle menu/game over states
    if (this.gameState === 'menu' || this.gameState === 'gameover') {
      if (gamepad.buttons[0]?.pressed) {
        if (this.gameState === 'menu') {
          this.startGame();
        } else {
          this.resetGame();
        }
      }
    }
    
    // Handle pause (Start button or B button)
    if (gamepad.buttons[9]?.pressed || gamepad.buttons[1]?.pressed) {
      // Use a simple debounce to prevent rapid toggling
      if (!(this as any)._gamepadPausePressed) {
        if (this.gameState === 'playing' || this.gameState === 'paused') {
          this.gameState = this.gameState === 'paused' ? 'playing' : 'paused';
        }
        (this as any)._gamepadPausePressed = true;
      }
    } else {
      (this as any)._gamepadPausePressed = false;
    }
  }
  
  private updatePlayerPaddle(): void {
    
    // Check for gamepad input
    let gamepadMovement = 0;
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[this.gamepadIndex];
      
      if (gamepad) {
        // Left analog stick vertical axis (axis 1) or D-pad
        const leftStickY = gamepad.axes[1] || 0; // Y-axis (up/down)
        const dpadUp = gamepad.buttons[12]?.pressed || false;
        const dpadDown = gamepad.buttons[13]?.pressed || false;
        
        // Apply deadzone to analog stick
        if (Math.abs(leftStickY) > this.GAMEPAD_DEADZONE) {
          gamepadMovement = leftStickY * this.playerPaddle.speed * 1.5; // Slightly faster for analog
          this.useGamepadControl = true;
          this.useMouseControl = false;
        }
        
        // D-pad overrides analog stick
        if (dpadUp) {
          gamepadMovement = -this.playerPaddle.speed;
          this.useGamepadControl = true;
          this.useMouseControl = false;
        } else if (dpadDown) {
          gamepadMovement = this.playerPaddle.speed;
          this.useGamepadControl = true;
          this.useMouseControl = false;
        }
        
        // Reset control modes if no gamepad input but gamepad is connected
        // This allows other input methods to take over when gamepad is idle
        if (Math.abs(leftStickY) <= this.GAMEPAD_DEADZONE && !dpadUp && !dpadDown) {
          // Only reset if we were previously using gamepad control
          if (this.useGamepadControl) {
            this.useGamepadControl = false;
            // Don't automatically set mouse control - let mouse movement set it
          }
        }
      }
    }
    
    if (this.useGamepadControl && gamepadMovement !== 0) {
      // Gamepad control
      this.playerPaddle.y += gamepadMovement;
      this.playerVelocity = gamepadMovement;
    } else if (this.useMouseControl) {
      // Mouse control
      this.playerPaddle.y = this.mouseY - this.PADDLE_HEIGHT / 2;
      // Calculate velocity from mouse movement
      this.playerVelocity = this.mouseY - this.previousMouseY;
      this.previousMouseY = this.mouseY;
    } else {
      // Keyboard control
      this.playerVelocity = 0;
      if (this.keys.has('w') || this.keys.has('arrowup')) {
        this.playerPaddle.y -= this.playerPaddle.speed;
        this.playerVelocity = -this.playerPaddle.speed;
      }
      if (this.keys.has('s') || this.keys.has('arrowdown')) {
        this.playerPaddle.y += this.playerPaddle.speed;
        this.playerVelocity = this.playerPaddle.speed;
      }
    }
    
    // Use keyboard if keys are pressed (overrides gamepad)
    if (this.keys.has('w') || this.keys.has('s') || this.keys.has('arrowup') || this.keys.has('arrowdown')) {
      this.useMouseControl = false;
      this.useGamepadControl = false;
    }
    
    // Keep paddle in bounds
    this.playerPaddle.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, this.playerPaddle.y));
    
    // Clamp velocity if paddle hit bounds
    if (this.playerPaddle.y === 0 || this.playerPaddle.y === this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
      this.playerVelocity = 0;
    }
  }
  
  private updateAIPaddle(): void {
    // AI with intentional imperfection for fun gameplay
    const paddleCenter = this.aiPaddle.y + this.PADDLE_HEIGHT / 2;
    
    // Only track ball when it's moving towards AI and past the middle
    if (this.ball.vx > 0 && this.ball.x > this.CANVAS_WIDTH * 0.4) {
      // Add some reaction delay and error
      const targetY = this.ball.y + (Math.random() - 0.5) * 30; // Add random offset
      const diff = targetY - paddleCenter;
      
      // Don't move if difference is small (creates dead zone)
      if (Math.abs(diff) > 15) {
        // Slower reaction speed and sometimes "miss" on purpose
        const speedMultiplier = Math.random() > 0.1 ? 1 : 0.5; // 10% chance to be slow
        if (diff > 0) {
          this.aiPaddle.y += this.aiPaddle.speed * speedMultiplier;
        } else {
          this.aiPaddle.y -= this.aiPaddle.speed * speedMultiplier;
        }
      }
    } else {
      // Return to center when ball is going away
      const centerY = this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2;
      const diff = centerY - this.aiPaddle.y;
      if (Math.abs(diff) > 5) {
        this.aiPaddle.y += diff * 0.05; // Slowly drift to center
      }
    }
    
    // Keep AI paddle in bounds
    this.aiPaddle.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, this.aiPaddle.y));
  }
  
  private updateBall(): void {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    
    // Top and bottom wall bouncing
    if (this.ball.y <= this.BALL_RADIUS || this.ball.y >= this.CANVAS_HEIGHT - this.BALL_RADIUS) {
      this.ball.vy = -this.ball.vy;
    }
    
    // Paddle collision detection
    this.checkPaddleCollision(this.playerPaddle);
    this.checkPaddleCollision(this.aiPaddle);
  }
  
  private checkPaddleCollision(paddle: Paddle): void {
    if (this.ball.x - this.BALL_RADIUS < paddle.x + paddle.width &&
        this.ball.x + this.BALL_RADIUS > paddle.x &&
        this.ball.y - this.BALL_RADIUS < paddle.y + paddle.height &&
        this.ball.y + this.BALL_RADIUS > paddle.y) {
      
      // Reverse ball direction
      this.ball.vx = -this.ball.vx;
      
      // Classic Pong physics: paddle velocity influences ball
      const paddleCenter = paddle.y + paddle.height / 2;
      const hitPos = (this.ball.y - paddleCenter) / (paddle.height / 2);
      
      // Base angle from hit position
      let newVy = hitPos * 4;
      
      // Add paddle velocity influence (only for player paddle)
      if (paddle === this.playerPaddle && Math.abs(this.playerVelocity) > 0.5) {
        // Moving paddle adds extra spin to the ball
        newVy += this.playerVelocity * 0.3;
        
        // Slightly increase horizontal speed when paddle is moving
        this.ball.vx *= 1.1;
      } else {
        // Standard speed increase
        this.ball.vx *= 1.05;
      }
      
      // Apply the new vertical velocity
      this.ball.vy = newVy;
      
      // Cap maximum velocities to keep game playable
      const maxSpeed = 8;
      this.ball.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.vy));
      this.ball.vx = Math.max(-maxSpeed * 1.5, Math.min(maxSpeed * 1.5, Math.abs(this.ball.vx))) * Math.sign(this.ball.vx);
      
      // Prevent ball from getting stuck in paddle
      if (paddle === this.playerPaddle) {
        this.ball.x = paddle.x + paddle.width + this.BALL_RADIUS;
      } else {
        this.ball.x = paddle.x - this.BALL_RADIUS;
      }
    }
  }
  
  private checkScoring(): void {
    if (this.ball.x < 0) {
      // AI scores
      this.score.ai++;
      this.resetBall();
      if (this.score.ai >= this.WINNING_SCORE) {
        this.gameState = 'gameover';
        this.showPostGameMessage();
      }
    } else if (this.ball.x > this.CANVAS_WIDTH) {
      // Player scores
      this.score.player++;
      this.resetBall();
      if (this.score.player >= this.WINNING_SCORE) {
        this.gameState = 'gameover';
        this.showPostGameMessage();
      }
    }
  }
  
  private showPostGameMessage(): void {
    // Add a delay to let the game over screen show for a moment
    setTimeout(() => {
      // Clean up the game
      this.cleanup();
      
      // Replace the entire container content with the post-game message
      const messages = [
        "Nice game! That was fun!",
        "Good match! That was actually pretty entertaining.",
        "Well played! That was a solid game.",
        "Not bad! That was fun."
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      this.container.innerHTML = `
        <div class="easter-egg-response">
          <h2 class="brutal-heading">Game Over! 🏓</h2>
          <p><strong>Final Score:</strong> You ${this.score.player} - ${this.score.ai} AI</p>
          <p style="margin-top: 1.5rem;"><strong>${randomMessage}</strong></p>
          <p style="margin-top: 1rem;">${EasterEggKeywords.makeClickable('Ping pong isn\'t really my strong suit though. I\'m more of a <span style="color: var(--color-accent); font-weight: bold;">golfer</span> myself... want to see what I mean? 🏌️', 'golfer', 'golf')}</p>
        </div>
      `;
      
      // Set context for the command processor
      // We need to communicate this to the terminal somehow
      window.dispatchEvent(new CustomEvent('pong-game-ended'));
    }, 2000); // Show after 2 seconds
  }
  
  private render(): void {
    // Get theme colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const backgroundColor = rootStyles.getPropertyValue('--color-background').trim();
    const foregroundColor = rootStyles.getPropertyValue('--color-foreground').trim();
    const accentColor = rootStyles.getPropertyValue('--color-accent').trim();
    
    // Clear canvas
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Draw center line
    this.ctx.strokeStyle = foregroundColor;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.CANVAS_WIDTH / 2, 0);
    this.ctx.lineTo(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    if (this.gameState === 'playing' || this.gameState === 'paused') {
      // Draw paddles
      this.ctx.fillStyle = foregroundColor;
      this.ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height);
      this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
      
      // Draw ball
      this.ctx.fillStyle = accentColor;
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw score
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${this.score.player}`, this.CANVAS_WIDTH / 4, 40);
      this.ctx.fillText(`${this.score.ai}`, (3 * this.CANVAS_WIDTH) / 4, 40);
      
      if (this.gameState === 'paused') {
        this.ctx.fillStyle = accentColor;
        this.ctx.font = '20px monospace';
        this.ctx.fillText('PAUSED', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Press ESC to resume', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 30);
      }
    } else if (this.gameState === 'menu') {
      // Draw menu
      this.ctx.fillStyle = accentColor;
      this.ctx.font = '32px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PONG', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 40);
      
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = '16px monospace';
      this.ctx.fillText('Click or press SPACE to start', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
      this.ctx.font = '14px monospace';
      const controlsText = this.gamepadConnected 
        ? 'Controls: 🎮 Gamepad, Mouse or W/S/↑/↓' 
        : 'Controls: Mouse or W/S/↑/↓';
      this.ctx.fillText(controlsText, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 45);
      this.ctx.fillText(`First to ${this.WINNING_SCORE} wins!`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 65);
    } else if (this.gameState === 'gameover') {
      // Draw game over
      const winner = this.score.player >= this.WINNING_SCORE ? 'YOU WIN!' : 'AI WINS!';
      const winnerColor = this.score.player >= this.WINNING_SCORE ? accentColor : foregroundColor;
      
      this.ctx.fillStyle = winnerColor;
      this.ctx.font = '28px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(winner, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 20);
      
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = '16px monospace';
      this.ctx.fillText(`Final Score: ${this.score.player} - ${this.score.ai}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
      this.ctx.font = '14px monospace';
      this.ctx.fillText('Click to play again', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 45);
    }
  }
  
  public cleanup(): void {
    // Stop game loop
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    
    // Remove event listeners
    const listeners = (this.canvas as any)._pongListeners;
    if (listeners) {
      document.removeEventListener('keydown', listeners.handleKeyDown);
      document.removeEventListener('keyup', listeners.handleKeyUp);
      this.canvas.removeEventListener('mousemove', listeners.handleMouseMove);
      this.canvas.removeEventListener('click', listeners.handleClick);
    }
    
    // Remove gamepad event listeners
    const gamepadListeners = (this.canvas as any)._gamepadListeners;
    if (gamepadListeners) {
      window.removeEventListener('gamepadconnected', gamepadListeners.handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', gamepadListeners.handleGamepadDisconnected);
    }
    
    // Remove gamepad status element
    if (this.gamepadStatusElement && this.gamepadStatusElement.parentNode) {
      this.gamepadStatusElement.parentNode.removeChild(this.gamepadStatusElement);
    }
    
    // Remove canvas from DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}