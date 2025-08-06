import { CommandProcessor } from '@/core/CommandProcessor';
import { Router } from '@/core/Router';
import { Autocomplete } from './Autocomplete';
import { CommandHistory } from './CommandHistory';
import { DeviceDetector } from '@/utils/device';
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
    
    // Only auto-focus on desktop
    if (!DeviceDetector.isMobile()) {
      this.input.focus();
      
      document.addEventListener('click', () => {
        this.input.focus();
      });
    } else {
      // On mobile, only focus when input area is tapped
      this.inputWrapper.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.autocomplete-item')) {
          return; // Don't focus if clicking autocomplete item
        }
        this.input.focus();
      });
    }

    window.addEventListener('route-command', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.executeCommand(customEvent.detail);
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
    } else {
      this.autocomplete.hide();
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
    const response = await this.processor.execute(command);
    this.displayResponse(response);
    
    // Determine if command was successful based on response content
    const isError = typeof response.content === 'string' && (
      response.content.includes('Command not found') ||
      response.content.includes('Error executing command') ||
      response.content.includes('Commands must start with /')
    );
    
    const state = isError ? 'error' : 'success';
    
    // Only show visual feedback for errors, not success
    if (isError) {
      this.setCommandState(state);
    }
    
    // Add command to history with its state
    this.commandHistory.addCommand(command, state);
  }

  private displayResponse(response: CommandResponse): void {
    // Cleanup any existing game instances before clearing content
    this.cleanupCurrentGame();
    
    // Clear previous content
    this.output.innerHTML = '';
    
    if (response.type === 'html' && response.content instanceof HTMLElement) {
      this.output.appendChild(response.content);
      
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
    }
    
    // Scroll to top of content after loading new content
    // Small delay to ensure content is fully rendered
    setTimeout(() => {
      this.output.scrollTop = 0;
      // Also scroll the window to ensure the terminal is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
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



  private handleInitialRoute(): void {
    const command = this.router.parseCommand();
    if (command) {
      this.executeCommand(command);
    }
  }


  clear(): void {
    this.output.innerHTML = '';
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