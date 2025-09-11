import { analytics } from '@/services/analytics';

interface GolfBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isMoving: boolean;
}

interface GolfHole {
  x: number;
  y: number;
  radius: number;
  par: number;
}

type GolfGameState = 'aiming' | 'shooting' | 'ball-moving' | 'hole-complete' | 'game-complete';

export class GolfGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: number = 0;
  private gameState: GolfGameState = 'aiming';
  
  // Game settings - use full container width
  private readonly CANVAS_WIDTH = 800; // Full container width
  private readonly CANVAS_HEIGHT = 400; // Maintain aspect ratio
  private readonly BALL_RADIUS = 8;
  private readonly HOLE_RADIUS = 20;
  
  // Game objects
  private ball!: GolfBall;
  private hole!: GolfHole;
  private currentHole: number = 1;
  private totalHoles: number = 3;
  private strokes: number = 0;
  private totalStrokes: number = 0;
  
  // Aiming
  private aimAngle: number = 0;
  private power: number = 0;
  private maxPower: number = 20;
  private powerIncreasing: boolean = true;
  
  // Controls (for future use)
  // private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  // Analytics tracking
  private gameStartTime: number = 0;

  constructor(container: HTMLElement) {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.canvas.className = 'golf-canvas';
    this.canvas.style.border = '4px solid var(--color-border)';
    this.canvas.style.boxShadow = '8px 8px 0 var(--color-shadow)';
    this.canvas.style.background = 'var(--color-background)';
    this.canvas.style.width = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.marginTop = '1rem';
    
    this.ctx = this.canvas.getContext('2d')!;
    container.appendChild(this.canvas);
    
    // Set up responsive sizing
    this.setupResponsiveCanvas();
    
    // Initialize game objects
    this.initializeHole();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start game loop
    this.start();
    
    // Track game start
    this.gameStartTime = Date.now();
  }

  private setupResponsiveCanvas(): void {
    const updateCanvasSize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const aspectRatio = this.CANVAS_WIDTH / this.CANVAS_HEIGHT;
      this.canvas.style.height = `${rect.width / aspectRatio}px`;
    };
    
    // Initial sizing
    setTimeout(updateCanvasSize, 0);
    
    // Update on resize
    window.addEventListener('resize', updateCanvasSize);
  }

  private initializeHole(): void {
    // Simple hole layouts
    const holes = [
      { par: 2, ballStart: { x: 80, y: 150 }, hole: { x: 480, y: 150 } },
      { par: 3, ballStart: { x: 80, y: 220 }, hole: { x: 520, y: 80 } },
      { par: 3, ballStart: { x: 100, y: 100 }, hole: { x: 480, y: 200 } }
    ];
    
    const currentHoleData = holes[this.currentHole - 1];
    
    this.ball = {
      x: currentHoleData.ballStart.x,
      y: currentHoleData.ballStart.y,
      vx: 0,
      vy: 0,
      radius: this.BALL_RADIUS,
      isMoving: false
    };
    
    this.hole = {
      x: currentHoleData.hole.x,
      y: currentHoleData.hole.y,
      radius: this.HOLE_RADIUS,
      par: currentHoleData.par
    };
    
    this.strokes = 0;
    this.gameState = 'aiming';
  }

  private setupEventListeners(): void {
    // Mouse controls for aiming
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // Scale mouse coordinates to canvas coordinates
      const scaleX = this.CANVAS_WIDTH / rect.width;
      const scaleY = this.CANVAS_HEIGHT / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
      
      if (this.gameState === 'aiming') {
        this.aimAngle = Math.atan2(this.mouseY - this.ball.y, this.mouseX - this.ball.x);
      }
    });
    
    // Click to shoot
    this.canvas.addEventListener('click', () => {
      if (this.gameState === 'aiming') {
        this.gameState = 'shooting';
        this.power = 0;
        this.powerIncreasing = true;
      } else if (this.gameState === 'shooting') {
        this.shoot();
      }
    });
    
    // Space bar controls
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.gameState === 'aiming') {
          this.gameState = 'shooting';
          this.power = 0;
          this.powerIncreasing = true;
        } else if (this.gameState === 'shooting') {
          this.shoot();
        }
      }
    });
  }

  private shoot(): void {
    this.strokes++;
    this.totalStrokes++;
    
    const powerMultiplier = (this.power / this.maxPower) * 15;
    this.ball.vx = Math.cos(this.aimAngle) * powerMultiplier;
    this.ball.vy = Math.sin(this.aimAngle) * powerMultiplier;
    this.ball.isMoving = true;
    
    // Track shot
    analytics.trackGameAction('golf', 'shot_taken', this.strokes);
    
    this.gameState = 'ball-moving';
  }

  private update(): void {
    if (this.gameState === 'shooting') {
      // Update power meter
      if (this.powerIncreasing) {
        this.power += 0.5;
        if (this.power >= this.maxPower) {
          this.powerIncreasing = false;
        }
      } else {
        this.power -= 0.5;
        if (this.power <= 0) {
          this.powerIncreasing = true;
        }
      }
    } else if (this.gameState === 'ball-moving') {
      // Update ball physics
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      
      // Apply friction
      this.ball.vx *= 0.98;
      this.ball.vy *= 0.98;
      
      // Bounce off walls
      if (this.ball.x <= this.BALL_RADIUS || this.ball.x >= this.CANVAS_WIDTH - this.BALL_RADIUS) {
        this.ball.vx *= -0.7;
        this.ball.x = Math.max(this.BALL_RADIUS, Math.min(this.CANVAS_WIDTH - this.BALL_RADIUS, this.ball.x));
      }
      
      if (this.ball.y <= this.BALL_RADIUS || this.ball.y >= this.CANVAS_HEIGHT - this.BALL_RADIUS) {
        this.ball.vy *= -0.7;
        this.ball.y = Math.max(this.BALL_RADIUS, Math.min(this.CANVAS_HEIGHT - this.BALL_RADIUS, this.ball.y));
      }
      
      // Check if ball reached hole
      const distanceToHole = Math.sqrt(
        Math.pow(this.ball.x - this.hole.x, 2) + 
        Math.pow(this.ball.y - this.hole.y, 2)
      );
      
      if (distanceToHole < this.hole.radius - this.ball.radius) {
        this.completeHole();
      }
      
      // Check if ball stopped moving
      if (Math.abs(this.ball.vx) < 0.1 && Math.abs(this.ball.vy) < 0.1) {
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.isMoving = false;
        this.gameState = 'aiming';
      }
    }
  }

  private completeHole(): void {
    this.gameState = 'hole-complete';
    
    // Track hole completion
    analytics.trackGameAction('golf', 'hole_complete', this.strokes);
    analytics.trackGameAction('golf', `hole_${this.currentHole}_strokes`, this.strokes);
    
    setTimeout(() => {
      if (this.currentHole < this.totalHoles) {
        this.currentHole++;
        this.strokes = 0; // Reset strokes for new hole
        this.initializeHole();
      } else {
        this.gameState = 'game-complete';
        this.trackGameEnd();
      }
    }, 2000);
  }

  private trackGameEnd(): void {
    const duration = Date.now() - this.gameStartTime;
    
    analytics.trackGameEnd('golf', duration, this.totalStrokes, true);
    analytics.trackGameAction('golf', 'game_complete', this.totalStrokes);
    
    // Calculate average strokes per hole
    const averageStrokes = Math.round((this.totalStrokes / this.totalHoles) * 100) / 100;
    analytics.trackGameAction('golf', 'average_strokes_per_hole', averageStrokes);
  }

  private render(): void {
    // Get theme colors
    const rootStyles = getComputedStyle(document.documentElement);
    const backgroundColor = rootStyles.getPropertyValue('--color-background').trim();
    const foregroundColor = rootStyles.getPropertyValue('--color-foreground').trim();
    const accentColor = rootStyles.getPropertyValue('--color-accent').trim();
    
    // Clear canvas
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Draw "grass" pattern
    this.ctx.fillStyle = 'rgba(34, 139, 34, 0.1)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Draw hole
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(this.hole.x, this.hole.y, this.hole.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw hole flag
    this.ctx.strokeStyle = foregroundColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.hole.x, this.hole.y - this.hole.radius);
    this.ctx.lineTo(this.hole.x, this.hole.y - this.hole.radius - 30);
    this.ctx.stroke();
    
    // Draw flag
    this.ctx.fillStyle = accentColor;
    this.ctx.fillRect(this.hole.x, this.hole.y - this.hole.radius - 30, 20, 15);
    
    // Draw ball
    this.ctx.fillStyle = foregroundColor;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw aiming line when aiming
    if (this.gameState === 'aiming') {
      this.ctx.strokeStyle = accentColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.ball.x, this.ball.y);
      this.ctx.lineTo(
        this.ball.x + Math.cos(this.aimAngle) * 50,
        this.ball.y + Math.sin(this.aimAngle) * 50
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    // Draw power meter when shooting
    if (this.gameState === 'shooting') {
      const meterWidth = 200;
      const meterHeight = 20;
      const meterX = (this.CANVAS_WIDTH - meterWidth) / 2;
      const meterY = 50;
      
      // Meter background
      this.ctx.fillStyle = backgroundColor;
      this.ctx.strokeStyle = foregroundColor;
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
      this.ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
      
      // Power fill
      const powerWidth = (this.power / this.maxPower) * meterWidth;
      this.ctx.fillStyle = accentColor;
      this.ctx.fillRect(meterX, meterY, powerWidth, meterHeight);
      
      // Power text
      this.ctx.fillStyle = foregroundColor;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('POWER - Click to shoot!', this.CANVAS_WIDTH / 2, meterY - 10);
    }
    
    // Draw game info
    this.ctx.fillStyle = foregroundColor;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Hole: ${this.currentHole}/${this.totalHoles}`, 20, 30);
    this.ctx.fillText(`Par: ${this.hole.par}`, 20, 50);
    this.ctx.fillText(`Strokes: ${this.strokes}`, 20, 70);
    
    // Draw state-specific messages
    if (this.gameState === 'aiming') {
      this.ctx.fillStyle = accentColor;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Aim with mouse, click or SPACE to set power', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT - 20);
    } else if (this.gameState === 'hole-complete') {
      this.ctx.fillStyle = accentColor;
      this.ctx.font = '20px monospace';
      this.ctx.textAlign = 'center';
      const scoreText = this.strokes <= this.hole.par ? 'Nice shot!' : 'Hole complete!';
      this.ctx.fillText(scoreText, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    } else if (this.gameState === 'game-complete') {
      this.ctx.fillStyle = accentColor;
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Complete!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 20);
      this.ctx.font = '16px monospace';
      this.ctx.fillText(`Total Strokes: ${this.totalStrokes}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
    }
  }

  private start(): void {
    const gameLoop = () => {
      this.update();
      this.render();
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  public cleanup(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    // Remove event listeners
    document.removeEventListener('keydown', this.setupEventListeners);
  }
}