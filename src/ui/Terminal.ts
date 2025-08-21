import { CommandProcessor } from '@/core/CommandProcessor';
import { Router } from '@/core/Router';
import { Autocomplete } from './Autocomplete';
import { CommandHistory } from './CommandHistory';
import { DeviceDetector } from '@/utils/device';
import { BinaryTransition } from '@/utils/binaryTransition';
import type { CommandResponse } from '@/types';

export class Terminal {
  private container: HTMLElement;
  private input!: HTMLInputElement;
  private inputWrapper!: HTMLElement;
  private output!: HTMLElement;
  private processor: CommandProcessor;
  private autocomplete: Autocomplete;
  private commandHistory: CommandHistory;
  private router: Router;
  private currentInput: string = '';
  private currentGameInstance: any = null;

  constructor(container: HTMLElement, processor: CommandProcessor) {
    this.container = container;
    this.processor = processor;
    this.router = Router.getInstance();
    this.autocomplete = new Autocomplete(this.processor);
    this.commandHistory = new CommandHistory();
    
    this.setupUI();
    this.setupEventListeners();
    
    // Initialize command history with placeholders to prevent height changes
    this.commandHistory.render();
    
    this.handleInitialRoute();
  }

  private setupUI(): void {
    this.container.innerHTML = `
      <div class="terminal-wrapper">
        <div class="intro-text">
          <p>Hi, my name is Evan.</p>
          <p>Welcome to my Website.</p>
        </div>
        
        <div class="input-wrapper brutal-box">
          <input 
            type="text" 
            class="command-input" 
            placeholder="Type /help to start... or you could just say hello"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <div class="autocomplete-container"></div>
          <div class="command-history-container"></div>
        </div>
        
        <div class="content-window" id="output">
        </div>
        
      </div>
    `;

    this.output = this.container.querySelector('#output')!;
    this.input = this.container.querySelector('.command-input')!;
    this.inputWrapper = this.container.querySelector('.input-wrapper')!;
    this.autocomplete.setContainer(this.container.querySelector('.autocomplete-container')!);
    this.commandHistory.setContainer(this.container.querySelector('.command-history-container')!);
  }

  private setupEventListeners(): void {
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    
    // Show autocomplete with all commands on focus
    this.input.addEventListener('focus', () => {
      if (!this.input.value) {
        this.autocomplete.update('/');
      }
    });
    
    this.input.addEventListener('blur', () => {
      // Hide autocomplete when losing focus
      setTimeout(() => {
        this.autocomplete.hide();
      }, 200);
    });
    
    // Auto-focus on desktop initially
    if (!DeviceDetector.isMobile()) {
      this.input.focus();
    }
    
    // Focus when clicking on the input wrapper area (both desktop and mobile)
    this.inputWrapper.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.autocomplete-item')) {
        return; // Don't focus if clicking autocomplete item
      }
      this.input.focus();
    });

    window.addEventListener('route-command', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.executeCommand(customEvent.detail);
    });
    
    // Listen for filter button clicks from resume command
    this.output.addEventListener('executeCommand', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.command) {
        this.executeCommand(customEvent.detail.command);
      }
    });
    
    window.addEventListener('pong-game-ended', () => {
      // Update the command processor context when pong game ends
      this.processor.setLastCommand('post-pong');
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (this.autocomplete.hasSelection()) {
          this.autocomplete.selectCurrent();
        } else {
          this.submitCommand();
        }
        break;
      case 'Tab':
        event.preventDefault();
        this.handleTabCompletion();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.autocomplete.selectPrevious();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.autocomplete.selectNext();
        break;
      case 'Escape':
        event.preventDefault();
        this.autocomplete.hide();
        break;
    }
  }

  private handleInput(): void {
    this.currentInput = this.input.value;
    
    // Clear any previous command state when user starts typing
    this.setCommandState('neutral');
    
    if (this.currentInput) {
      this.autocomplete.update(this.currentInput);
      // Normal autocomplete behavior when typing
    } else {
      this.autocomplete.hide();
      // Show all commands again if input is empty and focused
      if (document.activeElement === this.input) {
        this.autocomplete.update('/');
      }
    }
  }

  private handleTabCompletion(): void {
    const suggestions = this.processor.getSuggestions(this.currentInput);
    if (suggestions.length === 1) {
      this.input.value = suggestions[0].command;
      this.currentInput = this.input.value;
      this.autocomplete.hide();
    } else if (suggestions.length > 1) {
      const commands = suggestions.map(s => s.command);
      const commonPrefix = this.findCommonPrefix(commands);
      if (commonPrefix.length > this.currentInput.length) {
        this.input.value = commonPrefix;
        this.currentInput = commonPrefix;
      }
    }
  }

  private findCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
      }
    }
    return prefix;
  }

  private async submitCommand(): Promise<void> {
    const command = this.input.value.trim();
    if (!command) return;

    this.input.value = '';
    this.currentInput = '';
    this.autocomplete.hide();

    // Blur input on mobile to hide keyboard after command execution
    if (DeviceDetector.isMobile()) {
      this.input.blur();
    }

    await this.executeCommand(command);
    this.router.setCommand(command);
  }

  private async executeCommand(command: string): Promise<void> {
    // Add command to history immediately before execution
    // Special handling for clear command
    if (command.toLowerCase() === '/clear' || command.toLowerCase() === '/cls') {
      this.commandHistory.clearToCommand(command);
    } else {
      this.commandHistory.addCommand(command, 'success'); // Optimistically add as success
    }
    
    const response = await this.processor.execute(command);
    await this.displayResponse(response);
    
    // Determine if command was successful based on response content
    const isError = typeof response.content === 'string' && (
      response.content.includes('Command not found') ||
      response.content.includes('Error executing command') ||
      response.content.includes('Commands must start with /')
    );
    
    // Only show visual feedback for errors, not success
    if (isError) {
      this.setCommandState('error');
      
      // Update the history entry to show error state if not a clear command
      if (!(command.toLowerCase() === '/clear' || command.toLowerCase() === '/cls')) {
        this.commandHistory.updateLastCommandState('error');
      }
    }
  }

  private async displayResponse(response: CommandResponse): Promise<void> {
    // Cleanup any existing game instances before clearing content
    this.cleanupCurrentGame();
    
    // Cancel any existing binary transitions
    BinaryTransition.cancelAllAnimations();
    
    // Clear previous content
    this.output.innerHTML = '';
    
    // Scroll to top immediately on mobile
    if (DeviceDetector.isMobile()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (response.type === 'html' && response.content instanceof HTMLElement) {
      this.output.appendChild(response.content);
      
      // Check if this is a game - games should not have binary transitions
      const isGameContent = response.content.querySelector('.pong-game-container, .golf-game-container, .hacker-terminal-container') ||
                          response.content.classList.contains('pong-game-container') ||
                          response.content.classList.contains('golf-game-container') ||
                          response.content.classList.contains('hacker-terminal-container');
      
      if (!isGameContent) {
        // Apply binary transition to non-game HTML content
        await BinaryTransition.animateElement(response.content, {
          delay: 2000,
          charDelay: 8,
          preserveHtml: true
        });
      }
      
      // Check if this is a Pong game and store reference for cleanup
      const pongContainer = response.content.querySelector('.pong-game-container');
      if (pongContainer) {
        // The PongGame instance will be created in a setTimeout, so we need to wait
        setTimeout(() => {
          // Store reference to the container so we can find the game instance later
          this.currentGameInstance = { type: 'pong', wrapper: pongContainer };
        }, 150); // Wait slightly longer than the game's 100ms setTimeout
      }
      
      // Check if this is a Golf game and store reference for cleanup
      const golfContainer = response.content.querySelector('.golf-game-container');
      if (golfContainer) {
        // The GolfGame instance will be created in a setTimeout, so we need to wait
        setTimeout(() => {
          // Store reference to the container so we can find the game instance later
          this.currentGameInstance = { type: 'golf', wrapper: golfContainer };
        }, 150); // Wait slightly longer than the game's 100ms setTimeout
      }
    } else if (response.content.toString().trim()) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'command-response';
      contentDiv.textContent = response.content.toString();
      this.output.appendChild(contentDiv);
      
      // Apply binary transition to text content
      await BinaryTransition.animateElement(contentDiv, {
        delay: 400,
        charDelay: 10,
        preserveHtml: false
      });
    }
    
    // Reset content container scroll position
    // Small delay to ensure content is fully rendered
    setTimeout(() => {
      this.output.scrollTop = 0;
    }, 50);
  }
  
  private cleanupCurrentGame(): void {
    if (this.currentGameInstance) {
      if (this.currentGameInstance.type === 'pong') {
        // Find PongGame instances by looking for canvas elements and their cleanup methods
        const canvases = document.querySelectorAll('canvas.pong-canvas');
        canvases.forEach(canvas => {
          // Look for the cleanup method stored on the canvas or parent
          const gameInstance = (canvas as any)._pongGameInstance;
          if (gameInstance && typeof gameInstance.cleanup === 'function') {
            gameInstance.cleanup();
          }
        });
      }
      
      this.currentGameInstance = null;
    }
  }



  private async handleInitialRoute(): Promise<void> {
    const command = this.router.parseCommand();
    if (command) {
      await this.executeCommand(command);
    }
  }


  clear(): void {
    this.output.innerHTML = '';
    // Clear command history but keep just the clear command
    this.commandHistory.clearToCommand('/clear');
  }

  async executeSelectedCommand(command: string): Promise<void> {
    this.input.value = '';
    this.currentInput = '';
    this.autocomplete.hide();

    // Blur input on mobile to hide keyboard after command execution
    if (DeviceDetector.isMobile()) {
      this.input.blur();
    }

    await this.executeCommand(command);
    this.router.setCommand(command);
  }

  private setCommandState(state: 'success' | 'error' | 'neutral'): void {
    // Clear all states first
    this.inputWrapper.classList.remove('command-success', 'command-error');
    
    // Set new state
    if (state === 'success') {
      this.inputWrapper.classList.add('command-success');
    } else if (state === 'error') {
      this.inputWrapper.classList.add('command-error');
    }
    
    // Auto-clear the state after a delay
    if (state !== 'neutral') {
      setTimeout(() => {
        this.inputWrapper.classList.remove('command-success', 'command-error');
      }, 2000); // Clear after 2 seconds
    }
  }
}