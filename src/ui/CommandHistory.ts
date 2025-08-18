export class CommandHistory {
  private container: HTMLElement | null = null;
  private history: Array<{ command: string; state: 'success' | 'error' }> = [];
  private maxHistorySize = 2;

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  addCommand(command: string, state: 'success' | 'error' = 'success'): void {
    if (!command.trim()) return;
    
    // Add to beginning of history
    this.history.unshift({ command, state });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    this.render();
  }

  clear(): void {
    this.history = [];
    this.render();
  }

  render(): void {
    if (!this.container) return;

    // Always render placeholder space for 2 commands to maintain consistent height
    const placeholderCount = this.maxHistorySize - this.history.length;
    const historyHtml = this.history
      .map((historyItem, index) => {
        const opacity = this.getOpacity(index);
        const stateClass = `command-${historyItem.state}`;
        return `
          <div class="history-item" style="opacity: ${opacity}">
            <span class="history-command ${stateClass}">${this.escapeHtml(historyItem.command)}</span>
          </div>
        `;
      })
      .join('');
    
    // Add invisible placeholders to maintain height
    const placeholderHtml = Array(placeholderCount)
      .fill(0)
      .map(() => `
        <div class="history-item history-placeholder" style="visibility: hidden;">
          <span class="history-command">$ placeholder</span>
        </div>
      `)
      .join('');

    this.container.innerHTML = historyHtml + placeholderHtml;
    this.container.classList.add('visible');
  }

  private getOpacity(index: number): number {
    // Most recent command has highest opacity, older commands fade out
    switch (index) {
      case 0: return 0.8;    // Most recent
      case 1: return 0.5;    // Older
      default: return 0.3;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}