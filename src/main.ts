import './styles/main.css';
import { CommandProcessor } from './core/CommandProcessor';
import { Terminal } from './ui/Terminal';
import { ThemeManager } from './ui/ThemeManager';
import { commands } from './commands';

declare global {
  interface Window {
    terminal: Terminal;
  }
}

function init() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Initialize theme manager first
  ThemeManager.getInstance();

  // Initialize command processor
  const processor = new CommandProcessor();
  
  // Register all commands
  commands.forEach(command => processor.register(command));

  // Create terminal
  const terminal = new Terminal(app, processor);
  
  // Make terminal globally accessible for debugging and command execution
  window.terminal = terminal;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}