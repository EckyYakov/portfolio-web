import { CommandProcessor } from '@/core/CommandProcessor';
import { Router } from '@/core/Router';
import { Autocomplete } from './Autocomplete';
import type { CommandResponse } from '@/types';

export class Terminal {
  private container: HTMLElement;
  private input!: HTMLInputElement;
  private output!: HTMLElement;
  private processor: CommandProcessor;
  private autocomplete: Autocomplete;
  private router: Router;
  private currentInput: string = '';

  constructor(container: HTMLElement, processor: CommandProcessor) {
    this.container = container;
    this.processor = processor;
    this.router = Router.getInstance();
    this.autocomplete = new Autocomplete(this.processor);
    
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
            placeholder="Type /help to start...."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <div class="autocomplete-container"></div>
        </div>
        
        <div class="content-window" id="output">
        </div>
      </div>
    `;

    this.output = this.container.querySelector('#output')!;
    this.input = this.container.querySelector('.command-input')!;
    this.autocomplete.setContainer(this.container.querySelector('.autocomplete-container')!);
  }

  private setupEventListeners(): void {
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.focus();

    document.addEventListener('click', () => {
      this.input.focus();
    });

    window.addEventListener('route-command', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.executeCommand(customEvent.detail);
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
    if (this.currentInput) {
      this.autocomplete.update(this.currentInput);
    } else {
      this.autocomplete.hide();
    }
  }

  private handleTabCompletion(): void {
    const suggestions = this.processor.getSuggestions(this.currentInput);
    if (suggestions.length === 1) {
      this.input.value = suggestions[0];
      this.currentInput = this.input.value;
      this.autocomplete.hide();
    } else if (suggestions.length > 1) {
      const commonPrefix = this.findCommonPrefix(suggestions);
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

    await this.executeCommand(command);
    this.router.setCommand(command);
  }

  private async executeCommand(command: string): Promise<void> {
    const response = await this.processor.execute(command);
    this.displayResponse(response);
  }

  private displayResponse(response: CommandResponse): void {
    // Clear previous content
    this.output.innerHTML = '';
    
    if (response.type === 'html' && response.content instanceof HTMLElement) {
      this.output.appendChild(response.content);
    } else if (response.content.toString().trim()) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'command-response';
      contentDiv.textContent = response.content.toString();
      this.output.appendChild(contentDiv);
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

    await this.executeCommand(command);
    this.router.setCommand(command);
  }
}