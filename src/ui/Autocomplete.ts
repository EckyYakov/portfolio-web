import { CommandProcessor } from '@/core/CommandProcessor';
import type { AutocompleteSuggestion } from '@/types';

export class Autocomplete {
  private container: HTMLElement | null = null;
  private processor: CommandProcessor;
  private selectedIndex: number = -1;
  private currentSuggestions: AutocompleteSuggestion[] = [];

  constructor(processor: CommandProcessor) {
    this.processor = processor;
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  update(input: string): void {
    if (!this.container) return;

    this.currentSuggestions = this.processor.getSuggestions(input);
    
    if (this.currentSuggestions.length === 0) {
      this.hide();
      return;
    }

    this.render(this.currentSuggestions, input);
    this.show();
  }

  private render(suggestions: AutocompleteSuggestion[], input: string): void {
    if (!this.container) return;

    this.container.innerHTML = suggestions
      .map((suggestion, index) => {
        const isSelected = index === this.selectedIndex;
        return `
          <div class="autocomplete-item ${isSelected ? 'selected' : ''}" data-index="${index}">
            <span class="suggestion-name">${this.highlightMatch(suggestion.displayText, input)}</span>
            <span class="suggestion-desc">${suggestion.description}</span>
          </div>
        `;
      })
      .join('');

    this.container.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.dataset.index || '0');
        const suggestion = suggestions[index];
        // Execute command immediately on click/tap
        this.selectSuggestion(suggestion, true);
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

  private selectSuggestion(suggestion: AutocompleteSuggestion, executeCommand: boolean = false): void {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (input) {
      input.value = suggestion.command;
      input.focus();
      this.hide();
      
      if (executeCommand) {
        // Trigger command execution by dispatching an event
        const terminal = (window as any).terminal;
        if (terminal) {
          terminal.executeSelectedCommand(suggestion.command);
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
    
    if (this.selectedIndex >= 0 && this.selectedIndex < this.currentSuggestions.length) {
      const suggestion = this.currentSuggestions[this.selectedIndex];
      this.selectSuggestion(suggestion, true); // Execute command immediately
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