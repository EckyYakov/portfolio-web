import { CommandProcessor } from '@/core/CommandProcessor';

export class Autocomplete {
  private container: HTMLElement | null = null;
  private processor: CommandProcessor;
  private selectedIndex: number = -1;

  constructor(processor: CommandProcessor) {
    this.processor = processor;
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  update(input: string): void {
    if (!this.container) return;

    const suggestions = this.processor.getSuggestions(input);
    
    if (suggestions.length === 0) {
      this.hide();
      return;
    }

    this.render(suggestions, input);
    this.show();
  }

  private render(suggestions: string[], input: string): void {
    if (!this.container) return;

    this.container.innerHTML = suggestions
      .map((suggestion, index) => {
        // Extract command name from suggestion (remove / prefix)
        const commandName = suggestion.startsWith('/') ? suggestion.slice(1) : suggestion;
        const command = this.processor.getCommands().find((cmd: any) => cmd.name === commandName);
        const isSelected = index === this.selectedIndex;
        return `
          <div class="autocomplete-item ${isSelected ? 'selected' : ''}" data-index="${index}">
            <span class="suggestion-name">${this.highlightMatch(suggestion, input)}</span>
            ${command ? `<span class="suggestion-desc">${command.description}</span>` : ''}
          </div>
        `;
      })
      .join('');

    this.container.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.dataset.index || '0');
        const suggestion = suggestions[index];
        this.selectSuggestion(suggestion);
      });
    });
  }

  private highlightMatch(text: string, match: string): string {
    const index = text.toLowerCase().indexOf(match.toLowerCase());
    if (index === -1) return text;
    
    return (
      text.slice(0, index) +
      `<strong>${text.slice(index, index + match.length)}</strong>` +
      text.slice(index + match.length)
    );
  }

  private selectSuggestion(suggestion: string, executeCommand: boolean = false): void {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (input) {
      input.value = suggestion;
      input.focus();
      this.hide();
      
      if (executeCommand) {
        // Trigger command execution by dispatching an event
        const terminal = (window as any).terminal;
        if (terminal) {
          terminal.executeSelectedCommand(suggestion);
        }
      }
    }
  }

  show(): void {
    if (this.container) {
      this.container.classList.add('visible');
    }
  }

  hide(): void {
    if (this.container) {
      this.container.classList.remove('visible');
      this.selectedIndex = -1;
    }
  }

  hasSelection(): boolean {
    return this.selectedIndex >= 0 && this.container?.classList.contains('visible') === true;
  }

  selectCurrent(): void {
    if (!this.hasSelection() || !this.container) return;
    
    const items = this.container.querySelectorAll('.autocomplete-item');
    if (items[this.selectedIndex]) {
      const suggestionElement = items[this.selectedIndex].querySelector('.suggestion-name');
      if (suggestionElement) {
        const suggestion = suggestionElement.textContent?.trim() || '';
        this.selectSuggestion(suggestion, true); // Execute command immediately
      }
    }
  }

  selectNext(): void {
    const items = this.container?.querySelectorAll('.autocomplete-item');
    if (!items || items.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % items.length;
    this.updateSelection();
  }

  selectPrevious(): void {
    const items = this.container?.querySelectorAll('.autocomplete-item');
    if (!items || items.length === 0) return;

    this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
    this.updateSelection();
  }

  private updateSelection(): void {
    const items = this.container?.querySelectorAll('.autocomplete-item');
    items?.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });
  }
}