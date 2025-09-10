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
  
  // Touch controls
  private touchY: number = 0;
  private previousTouchY: number = 0;
  private useTouchControl: boolean = false;
  private touchActive: boolean = false;
  
  // Gamepad support
  private gamepadIndex: number | null = null;
  private gamepadConnected: boolean = false;
  private useGamepadControl: boolean = false;
  private readonly GAMEPAD_DEADZONE = 0.15;
  
  // Game settings (will be calculated based on screen size)
  private canvasWidth!: number;
  private canvasHeight!: number;
  private paddleWidth!: number;
  private paddleHeight!: number;
  private ballRadius!: number;
  private readonly WINNING_SCORE = 5;
  private scaleFactor!: number;
  private gamepadStatusElement: HTMLDivElement | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    
    // Calculate responsive canvas dimensions
    this.calculateCanvasDimensions();
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.className = 'pong-canvas';
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    
    // Initialize game objects
    this.playerPaddle = {
      x: 20 * this.scaleFactor,
      y: this.canvasHeight / 2 - this.paddleHeight / 2,
      width: this.paddleWidth,
      height: this.paddleHeight,
      speed: 5 * this.scaleFactor
    };
    
    this.aiPaddle = {
      x: this.canvasWidth - (20 * this.scaleFactor) - this.paddleWidth,
      y: this.canvasHeight / 2 - this.paddleHeight / 2,
      width: this.paddleWidth,
      height: this.paddleHeight,
      speed: 3 * this.scaleFactor
    };
    
    // Initialize ball
    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      radius: this.ballRadius,
      vx: 0,
      vy: 0,
      speed: 4 * this.scaleFactor
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
    this.setupTouchListeners();
    this.setupGamepadListeners();
    this.gameLoop = requestAnimationFrame(() => this.loop());
  }
  
  private calculateCanvasDimensions(): void {
    // Calculate responsive canvas size based on viewport and container constraints
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= 768;
    
    let maxWidth: number;
    if (isMobile) {
      // Mobile: Use most of viewport width but leave some margin for visual breathing room
      maxWidth = Math.min(viewportWidth * 0.95, 800);
    } else {
      // Desktop: Match terminal input width (800px - 3rem padding = ~752px)
      maxWidth = Math.min(704, viewportWidth * 0.9);
    }
    
    this.canvasWidth = maxWidth;
    this.canvasHeight = this.canvasWidth / 2; // Maintain 2:1 aspect ratio
    
    // Calculate scale factor based on original dimensions
    this.scaleFactor = this.canvasWidth / 600;
    
    // Scale game elements
    this.paddleWidth = Math.round(12 * this.scaleFactor);
    this.paddleHeight = Math.round(60 * this.scaleFactor);
    this.ballRadius = Math.round(6 * this.scaleFactor);
  }
  
  private resetBall(): void {
    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      radius: this.ballRadius,
      vx: (Math.random() > 0.5 ? 1 : -1) * 4 * this.scaleFactor,
      vy: (Math.random() - 0.5) * 4 * this.scaleFactor,
      speed: 4 * this.scaleFactor
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
      this.useTouchControl = false; // Switch from touch when mouse moves
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
  
  private setupTouchListeners(): void {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.touchY = e.touches[0].clientY - rect.top;
        this.previousTouchY = this.touchY;
        this.touchActive = true;
        this.useTouchControl = true;
        this.useMouseControl = false;
        this.useGamepadControl = false;
        
        // Handle game state changes on touch
        if (this.gameState === 'menu') {
          this.startGame();
        } else if (this.gameState === 'gameover') {
          this.resetGame();
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (this.touchActive && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.previousTouchY = this.touchY;
        this.touchY = e.touches[0].clientY - rect.top;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      this.touchActive = false;
    };
    
    // Add touch event listeners
    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Store references for cleanup
    (this.canvas as any)._touchListeners = {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
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
    } else if (this.useTouchControl && this.touchActive) {
      // Touch control
      this.playerPaddle.y = this.touchY - this.paddleHeight / 2;
      // Calculate velocity from touch movement
      this.playerVelocity = this.touchY - this.previousTouchY;
      this.previousTouchY = this.touchY;
    } else if (this.useMouseControl) {
      // Mouse control
      this.playerPaddle.y = this.mouseY - this.paddleHeight / 2;
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
    
    // Use keyboard if keys are pressed (overrides other controls)
    if (this.keys.has('w') || this.keys.has('s') || this.keys.has('arrowup') || this.keys.has('arrowdown')) {
      this.useMouseControl = false;
      this.useGamepadControl = false;
      this.useTouchControl = false;
    }
    
    // Keep paddle in bounds
    this.playerPaddle.y = Math.max(0, Math.min(this.canvasHeight - this.paddleHeight, this.playerPaddle.y));
    
    // Clamp velocity if paddle hit bounds
    if (this.playerPaddle.y === 0 || this.playerPaddle.y === this.canvasHeight - this.paddleHeight) {
      this.playerVelocity = 0;
    }
  }
  
  private updateAIPaddle(): void {
    // AI with intentional imperfection for fun gameplay
    const paddleCenter = this.aiPaddle.y + this.paddleHeight / 2;
    
    // Only track ball when it's moving towards AI and past the middle
    if (this.ball.vx > 0 && this.ball.x > this.canvasWidth * 0.4) {
      // Add some reaction delay and error
      const targetY = this.ball.y + (Math.random() - 0.5) * 30 * this.scaleFactor; // Scale random offset
      const diff = targetY - paddleCenter;
      
      // Don't move if difference is small (creates dead zone)
      if (Math.abs(diff) > 15 * this.scaleFactor) {
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
      const centerY = this.canvasHeight / 2 - this.paddleHeight / 2;
      const diff = centerY - this.aiPaddle.y;
      if (Math.abs(diff) > 5 * this.scaleFactor) {
        this.aiPaddle.y += diff * 0.05; // Slowly drift to center
      }
    }
    
    // Keep AI paddle in bounds
    this.aiPaddle.y = Math.max(0, Math.min(this.canvasHeight - this.paddleHeight, this.aiPaddle.y));
  }
  
  private updateBall(): void {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    
    // Top and bottom wall bouncing
    if (this.ball.y <= this.ballRadius || this.ball.y >= this.canvasHeight - this.ballRadius) {
      this.ball.vy = -this.ball.vy;
    }
    
    // Paddle collision detection
    this.checkPaddleCollision(this.playerPaddle);
    this.checkPaddleCollision(this.aiPaddle);
  }
  
  private checkPaddleCollision(paddle: Paddle): void {
    if (this.ball.x - this.ballRadius < paddle.x + paddle.width &&
        this.ball.x + this.ballRadius > paddle.x &&
        this.ball.y - this.ballRadius < paddle.y + paddle.height &&
        this.ball.y + this.ballRadius > paddle.y) {
      
      // Reverse ball direction
      this.ball.vx = -this.ball.vx;
      
      // Classic Pong physics: paddle velocity influences ball
      const paddleCenter = paddle.y + paddle.height / 2;
      const hitPos = (this.ball.y - paddleCenter) / (paddle.height / 2);
      
      // Base angle from hit position
      let newVy = hitPos * 4 * this.scaleFactor;
      
      // Add paddle velocity influence (only for player paddle)
      if (paddle === this.playerPaddle && Math.abs(this.playerVelocity) > 0.5 * this.scaleFactor) {
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
      const maxSpeed = 8 * this.scaleFactor;
      this.ball.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.vy));
      this.ball.vx = Math.max(-maxSpeed * 1.5, Math.min(maxSpeed * 1.5, Math.abs(this.ball.vx))) * Math.sign(this.ball.vx);
      
      // Prevent ball from getting stuck in paddle
      if (paddle === this.playerPaddle) {
        this.ball.x = paddle.x + paddle.width + this.ballRadius;
      } else {
        this.ball.x = paddle.x - this.ballRadius;
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
    } else if (this.ball.x > this.canvasWidth) {
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
      // Find the pong header element instead of replacing everything
      const headerElement = this.container.parentElement?.querySelector('.pong-header') as HTMLElement;
      
      if (headerElement) {
        const messages = [
          "Nice game! That was fun!",
          "Good match! That was actually pretty entertaining.",
          "Well played! That was a solid game.",
          "Not bad! That was fun."
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Replace just the header content with the completion message
        headerElement.innerHTML = `
          <h2 class="brutal-heading">Game Over! 🏓</h2>
          <p><strong>Final Score:</strong> You ${this.score.player} - ${this.score.ai} AI</p>
          <p style="margin-top: 1.5rem;"><strong>${randomMessage}</strong></p>
          <p style="margin-top: 1rem;">${EasterEggKeywords.makeClickable('Ping pong isn\'t really my strong suit though. I\'m more of a <span style="color: var(--color-accent); font-weight: bold;">golfer</span> myself... want to see what I mean? 🏌️', 'golfer', 'golf')}</p>
        `;
      }
      
      // Set context for the command processor
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
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw center line
    this.ctx.strokeStyle = foregroundColor;
    this.ctx.lineWidth = 2 * this.scaleFactor;
    this.ctx.setLineDash([5 * this.scaleFactor, 5 * this.scaleFactor]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvasWidth / 2, 0);
    this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
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
      this.ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw score
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = `${24 * this.scaleFactor}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${this.score.player}`, this.canvasWidth / 4, 40 * this.scaleFactor);
      this.ctx.fillText(`${this.score.ai}`, (3 * this.canvasWidth) / 4, 40 * this.scaleFactor);
      
      if (this.gameState === 'paused') {
        this.ctx.fillStyle = accentColor;
        this.ctx.font = `${20 * this.scaleFactor}px monospace`;
        this.ctx.fillText('PAUSED', this.canvasWidth / 2, this.canvasHeight / 2);
        this.ctx.font = `${14 * this.scaleFactor}px monospace`;
        this.ctx.fillText('Press ESC to resume', this.canvasWidth / 2, this.canvasHeight / 2 + 30 * this.scaleFactor);
      }
    } else if (this.gameState === 'menu') {
      // Draw menu
      this.ctx.fillStyle = accentColor;
      this.ctx.font = `${32 * this.scaleFactor}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PONG', this.canvasWidth / 2, this.canvasHeight / 2 - 40 * this.scaleFactor);
      
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = `${16 * this.scaleFactor}px monospace`;
      const isMobile = window.innerWidth <= 768;
      const startText = isMobile ? 'Tap to start' : 'Click or press SPACE to start';
      this.ctx.fillText(startText, this.canvasWidth / 2, this.canvasHeight / 2 + 20 * this.scaleFactor);
      this.ctx.font = `${14 * this.scaleFactor}px monospace`;
      const controlsText = isMobile 
        ? 'Controls: Touch to move paddle'
        : this.gamepadConnected 
          ? 'Controls: 🎮 Gamepad, Mouse or W/S/↑/↓' 
          : 'Controls: Mouse or W/S/↑/↓';
      this.ctx.fillText(controlsText, this.canvasWidth / 2, this.canvasHeight / 2 + 45 * this.scaleFactor);
      this.ctx.fillText(`First to ${this.WINNING_SCORE} wins!`, this.canvasWidth / 2, this.canvasHeight / 2 + 65 * this.scaleFactor);
    } else if (this.gameState === 'gameover') {
      // Draw game over
      const winner = this.score.player >= this.WINNING_SCORE ? 'YOU WIN!' : 'AI WINS!';
      const winnerColor = this.score.player >= this.WINNING_SCORE ? accentColor : foregroundColor;
      
      this.ctx.fillStyle = winnerColor;
      this.ctx.font = `${28 * this.scaleFactor}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(winner, this.canvasWidth / 2, this.canvasHeight / 2 - 20 * this.scaleFactor);
      
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = `${16 * this.scaleFactor}px monospace`;
      this.ctx.fillText(`Final Score: ${this.score.player} - ${this.score.ai}`, this.canvasWidth / 2, this.canvasHeight / 2 + 20 * this.scaleFactor);
      this.ctx.font = `${14 * this.scaleFactor}px monospace`;
      const isMobile = window.innerWidth <= 768;
      const playAgainText = isMobile ? 'Tap to play again' : 'Click to play again';
      this.ctx.fillText(playAgainText, this.canvasWidth / 2, this.canvasHeight / 2 + 45 * this.scaleFactor);
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
    
    // Remove touch event listeners
    const touchListeners = (this.canvas as any)._touchListeners;
    if (touchListeners) {
      this.canvas.removeEventListener('touchstart', touchListeners.handleTouchStart);
      this.canvas.removeEventListener('touchmove', touchListeners.handleTouchMove);
      this.canvas.removeEventListener('touchend', touchListeners.handleTouchEnd);
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