import type { Command, CommandResponse } from '@/types';
import { QuickSuggestions } from './QuickSuggestions';
import { analytics } from '@/services/analytics';

export interface HackerCommand extends Command {
  category?: 'network' | 'exploit' | 'crypto' | 'system';
}

export class HackerMode {
  private static instance: HackerMode | null = null;
  private isActive: boolean = false;
  private hasRootAccess: boolean = false;
  private isFileDecrypted: boolean = false;
  private gameStartTime: number | null = null;
  private hackerCommands: Map<string, HackerCommand> = new Map();
  private glitchEffect: GlitchEffect | null = null;
  private fileSystem: Map<string, { content: string; requiresRoot: boolean }> = new Map();

  constructor() {
    this.initializeFileSystem();
    this.initializeHackerCommands();
  }

  static getInstance(): HackerMode {
    if (!HackerMode.instance) {
      HackerMode.instance = new HackerMode();
    }
    return HackerMode.instance;
  }

  private initializeFileSystem(): void {
    // Initialize with base system.log
    this.updateSystemLog();
    
    // Initialize the secrets file in locked state
    this.fileSystem.set('evans-deep-dark-secrets.locked', {
      content: `🔒 CLASSIFIED INFORMATION 🔒

Access denied. Root privileges required.`,
      requiresRoot: true
    });
  }

  private updateSystemLog(): void {
    let logContent = '';
    
    // Add current progress messages at top
    if (this.isFileDecrypted) {
      logContent += `[2024-01-15 09:32:00] ✅ [SUCCESS] File decrypted successfully: evans-deep-dark-secrets.txt\n`;
      logContent += `[2024-01-15 09:31:45] [INFO] Decryption keys validated: pizza, 3.14\n`;
    }
    
    if (this.hasRootAccess) {
      logContent += `[2024-01-15 09:30:00] ✅ [SUCCESS] Root access granted for EV4N-01\n`;
      if (!this.isFileDecrypted) {
        logContent += `[2024-01-15 09:30:15] [INFO] File renamed: evans-deep-dark-secrets.locked → evans-deep-dark-secrets.encrypted\n`;
        logContent += `[2024-01-15 09:30:16] [WARNING] Encrypted file detected. Decryption required.\n`;
        logContent += `[2024-01-15 09:30:17] [INFO] Key reminder utility available: decrypt_key_reminder.png\n`;
      }
    }
    
    // Add original logs at bottom
    logContent += `[2024-01-15 09:23:45] User login: admin
[2024-01-15 09:24:12] Failed sudo attempt - incorrect password
[2024-01-15 09:24:30] Password changed for user EV4N-01
[2024-01-15 09:24:31] New password set to: dad626
[2024-01-15 09:25:02] System backup completed
[2024-01-15 09:25:15] File permissions updated: evans-deep-dark-secrets.locked
[2024-01-15 09:25:16] Access level: ROOT_REQUIRED`;

    this.fileSystem.set('system.log', {
      content: logContent,
      requiresRoot: false
    });
  }

  private initializeHackerCommands(): void {
    // ls command
    this.hackerCommands.set('ls', {
      name: 'ls',
      description: 'List files in current directory',
      category: 'system',
      handler: async (): Promise<CommandResponse> => {
        const content = document.createElement('div');
        content.className = 'hacker-output';
        
        let fileList = '';
        this.fileSystem.forEach((_, filename) => {
          fileList += `<div style="margin: 0.2rem 0; font-family: 'Courier New', monospace;">${filename}</div>`;
        });
        
        content.innerHTML = `
          <div style="font-family: 'Courier New', monospace; color: #00ff00;">
            ${fileList}
          </div>
        `;
        
        return { content, type: 'html' };
      }
    });

    // open command
    const fileArgs = this.getFileArguments();
    this.hackerCommands.set('open', {
      name: 'open',
      description: 'Open a file',
      category: 'system',
      suggestions: {
        arguments: fileArgs
      },
      handler: async (args: string[]): Promise<CommandResponse> => {
        // Handle case where autocomplete adds empty first argument
        const filename = args.find(arg => arg && arg.trim().length > 0) || '';
        
        if (!filename) {
          return { content: 'Usage: open <filename>', type: 'text' };
        }

        // Track file access attempt
        analytics.trackGameAction('hacker', 'file_access_attempt', 1);
        analytics.trackGameAction('hacker', `file_access_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`, 1);

        const file = this.fileSystem.get(filename);
        
        if (!file) {
          analytics.trackGameAction('hacker', 'file_not_found', 1);
          return { content: `open: ${filename}: No such file or directory`, type: 'text' };
        }

        if (file.requiresRoot && !this.hasRootAccess) {
          analytics.trackGameAction('hacker', 'file_permission_denied', 1);
          return { content: `open: ${filename}: Permission denied. Need root access to open this file.`, type: 'text' };
        }

        // Track successful file access
        analytics.trackGameAction('hacker', 'file_access_success', 1);

        const content = document.createElement('div');
        content.className = 'hacker-output';
        
        // Special visual treatment for decrypt key reminder
        if (filename === 'decrypt_key_reminder.png') {
          content.innerHTML = `
            <div style="font-family: 'Courier New', monospace; color: #00ff00; padding: 2rem; background: rgba(0, 20, 0, 0.7); border: 2px solid #00ff00;">
              
              <div style="display: flex; justify-content: space-around; align-items: center; gap: 3rem; flex-wrap: wrap;">
                
                <!-- Pizza SVG -->
                <div style="text-align: center; flex: 1;">
                  <svg width="150" height="120" viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Pizza slice triangle -->
                    <polygon points="75,10 25,100 125,100" fill="#00ff00" stroke="#00ff00" stroke-width="2" filter="url(#glow)"/>
                    <!-- Crust -->
                    <path d="M 25 100 Q 50 110 75 100 Q 100 110 125 100" fill="#00dd00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <!-- Pepperoni -->
                    <circle cx="60" cy="45" r="6" fill="#00cc00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <circle cx="90" cy="55" r="6" fill="#00cc00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <circle cx="70" cy="70" r="6" fill="#00cc00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <circle cx="85" cy="80" r="6" fill="#00cc00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <circle cx="55" cy="80" r="6" fill="#00cc00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
                    <!-- Glow effect -->
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>

                <!-- Pi SVG -->
                <div style="text-align: center; flex: 1;">
                  <svg width="150" height="120" viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
                    <text x="75" y="75" font-family="serif" font-size="60" fill="#00ff00" text-anchor="middle" filter="url(#glow2)">π</text>
                    <!-- Glow effect -->
                    <defs>
                      <filter id="glow2">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>

              </div>
            </div>
          `;
        } else {
          content.innerHTML = `
            <div style="font-family: 'Courier New', monospace; color: #00ff00; white-space: pre-line; padding: 1rem; background: rgba(0, 20, 0, 0.5); border: 1px solid rgba(0, 255, 0, 0.3);">
${file.content}
            </div>
          `;
        }
        
        return { content, type: 'html' };
      }
    });

    // cat command (alias for open)
    this.hackerCommands.set('cat', {
      name: 'cat',
      description: 'Display file contents',
      category: 'system',
      suggestions: {
        arguments: this.getFileArguments()
      },
      handler: async (args: string[]): Promise<CommandResponse> => {
        return this.hackerCommands.get('open')!.handler(args);
      }
    });

    // sudo command
    this.hackerCommands.set('sudo', {
      name: 'sudo',
      description: 'Execute commands as root',
      category: 'system',
      handler: async (): Promise<CommandResponse> => {
        return this.promptForPassword();
      }
    });

    // su command (alias for sudo)
    this.hackerCommands.set('su', {
      name: 'su',
      description: 'Switch user to root',
      category: 'system',
      handler: async (): Promise<CommandResponse> => {
        return this.promptForPassword();
      }
    });

    // help command
    this.hackerCommands.set('help', {
      name: 'help',
      description: 'Show available commands',
      category: 'system',
      handler: async (): Promise<CommandResponse> => {
        const content = document.createElement('div');
        content.className = 'hacker-output';
        
        content.innerHTML = `
          <div style="font-family: 'Courier New', monospace; color: #00ff00;">
            <h3 style="color: #00ff00; margin: 0 0 1rem 0;">Available commands:</h3>
            <div style="margin: 0.3rem 0;"><strong>ls</strong> - List files in current directory</div>
            <div style="margin: 0.3rem 0;"><strong>open [filename]</strong> - Open a file</div>
            <div style="margin: 0.3rem 0;"><strong>cat [filename]</strong> - Display file contents</div>
            <div style="margin: 0.3rem 0;"><strong>sudo</strong> - Execute commands as root</div>
            <div style="margin: 0.3rem 0;"><strong>help</strong> - Show this help message</div>
            <div style="margin: 0.3rem 0;"><strong>exit</strong> - Return to normal terminal</div>
          </div>
        `;
        
        return { content, type: 'html' };
      }
    });

    // decrypt command
    this.hackerCommands.set('decrypt', {
      name: 'decrypt',
      description: 'Decrypt an encrypted file',
      category: 'crypto',
      suggestions: {
        arguments: this.getEncryptedFileArguments()
      },
      handler: async (args: string[]): Promise<CommandResponse> => {
        // Handle case where autocomplete adds empty first argument
        const filename = args.find(arg => arg && arg.trim().length > 0) || '';
        if (!filename) {
          return { content: 'Usage: decrypt <filename>', type: 'text' };
        }

        // Track decrypt attempt
        analytics.trackGameAction('hacker', 'decrypt_attempt', 1);

        const file = this.fileSystem.get(filename);
        if (!file) {
          return { content: `decrypt: ${filename}: No such file or directory`, type: 'text' };
        }

        if (!filename.endsWith('.encrypted')) {
          return { content: `decrypt: ${filename}: File is not encrypted`, type: 'text' };
        }

        if (!this.hasRootAccess) {
          return { content: `decrypt: ${filename}: Permission denied. Root access required.`, type: 'text' };
        }

        // Track decrypt interface shown
        analytics.trackGameAction('hacker', 'decrypt_interface_shown', 1);
        return this.showDecryptionInterface(filename);
      }
    });

    // Exit command
    this.hackerCommands.set('exit', {
      name: 'exit',
      description: 'Exit hacker mode and return to normal terminal',
      category: 'system',
      handler: async (): Promise<CommandResponse> => {
        // Track game completion status
        const gameCompletedWithDecryption = this.isFileDecrypted;
        const gameCompletedWithRoot = this.hasRootAccess;
        
        analytics.trackGameAction('hacker', 'game_exit', 1);
        if (gameCompletedWithDecryption) {
          analytics.trackGameAction('hacker', 'game_completed_full', 1);
          analytics.trackGameEnd('hacker', Date.now() - (this.gameStartTime || Date.now()), 100, true);
        } else if (gameCompletedWithRoot) {
          analytics.trackGameAction('hacker', 'game_completed_partial', 1);
          analytics.trackGameEnd('hacker', Date.now() - (this.gameStartTime || Date.now()), 50, true);
        } else {
          analytics.trackGameAction('hacker', 'game_exited_early', 1);
          analytics.trackGameEnd('hacker', Date.now() - (this.gameStartTime || Date.now()), 0, false);
        }
        
        this.exitHackerMode();
        
        const content = document.createElement('div');
        content.className = 'hacker-exit';
        
        content.innerHTML = `
          <div class="exit-message" style="padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
              <h3 style="color: var(--color-accent); margin: 0 0 1rem 0;">🔒 Exiting Hacker Mode</h3>
              <p style="margin: 0 0 1rem 0;">Connection terminated. Returning to normal terminal...</p>
              <p style="margin: 0; opacity: 0.8;">Welcome back! Type <strong>/help</strong> to see normal commands.</p>
            </div>
            ${QuickSuggestions.generate(QuickSuggestions.MAIN_NAVIGATION, 'Quick Commands')}
          </div>
        `;
        
        return { content, type: 'html' };
      }
    });
  }

  isHackerModeActive(): boolean {
    return this.isActive;
  }

  enterHackerMode(): void {
    this.isActive = true;
    this.gameStartTime = Date.now(); // Set game start time for analytics
    this.transformTerminalAppearance();
    
    // Start glitch effects
    if (!this.glitchEffect) {
      this.glitchEffect = new GlitchEffect();
    }
    this.glitchEffect.start();
  }

  exitHackerMode(): void {
    this.isActive = false;
    this.hasRootAccess = false; // Reset root access when exiting
    this.isFileDecrypted = false; // Reset decryption state
    this.gameStartTime = null; // Reset game start time
    this.restoreTerminalAppearance();
    
    // Stop glitch effects
    if (this.glitchEffect) {
      this.glitchEffect.stop();
    }
  }

  getHackerCommands(): Map<string, HackerCommand> {
    return this.hackerCommands;
  }

  async executeHackerCommand(commandName: string, args: string[]): Promise<CommandResponse | null> {
    const command = this.hackerCommands.get(commandName.toLowerCase());
    if (command) {
      return await command.handler(args);
    }
    return null;
  }

  // Get suggestions for a specific command
  getHackerCommandSuggestions(commandName: string): any {
    const command = this.hackerCommands.get(commandName.toLowerCase());
    return command?.suggestions;
  }

  // Public method to check if encrypted files are available
  hasEncryptedFiles(): boolean {
    return this.getEncryptedFileArguments().length > 0;
  }

  private promptForPassword(): Promise<CommandResponse> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.className = 'hacker-output';
      
      content.innerHTML = `
        <div style="font-family: 'Courier New', monospace; color: #00ff00;">
          <div style="margin-bottom: 1rem;">Password: </div>
          <input type="password" id="sudo-password-input" style="
            background: transparent;
            border: none;
            border-bottom: 1px solid #00ff00;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 1rem;
            outline: none;
            padding: 0.5rem 0;
            width: 200px;
          " placeholder="Enter password..." />
          <div id="password-error" style="color: #ff4444; background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; padding: 1rem; margin-top: 1rem; display: none; text-align: center; font-weight: bold; text-shadow: 0 0 5px #ff4444;">
            Incorrect password, try again.
          </div>
        </div>
      `;
      
      // Focus the input after it's added to DOM
      setTimeout(() => {
        const input = content.querySelector('#sudo-password-input') as HTMLInputElement;
        if (input) {
          input.focus();
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              this.handlePasswordSubmit(input.value);
            }
          });
        }
      }, 100);
      
      resolve({ content, type: 'html' });
    });
  }

  private handlePasswordSubmit(password: string): void {
    // Track sudo attempt
    analytics.trackGameAction('hacker', 'sudo_attempt', 1);
    
    if (password === 'dad626') {
      this.hasRootAccess = true;
      this.updateBashPrompt(); // Update prompt to show root
      this.updateFileSystemAfterRootAccess(); // Update files and logs
      
      // Track successful sudo
      analytics.trackGameAction('hacker', 'sudo_success', 1);
      
      // Replace the entire content window with success message
      const contentWindow = document.querySelector('.content-window');
      if (contentWindow) {
        const successContent = document.createElement('div');
        successContent.className = 'hacker-output';
        
        successContent.innerHTML = `
          <div style="font-family: 'Courier New', monospace; color: #00ff00; padding: 2rem;">
            <div style="margin-bottom: 0.5rem;">Password accepted.</div>
            <div style="color: #4ade80; margin-bottom: 1rem;">🔓 Root access granted!</div>
            <div style="opacity: 0.8;">File system updated. Try 'ls' to see what's available.</div>
          </div>
        `;
        
        contentWindow.innerHTML = '';
        contentWindow.appendChild(successContent);
        
        // Focus the command input to keep flow smooth
        setTimeout(() => {
          const commandInput = document.querySelector('.command-input') as HTMLInputElement;
          if (commandInput) {
            commandInput.focus();
          }
        }, 100);
      }
    } else {
      const errorDiv = document.getElementById('password-error');
      if (errorDiv) {
        errorDiv.style.display = 'block';
        const input = document.getElementById('sudo-password-input') as HTMLInputElement;
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    }
  }

  private updateFileSystemAfterRootAccess(): void {
    // Remove locked file and add encrypted version
    this.fileSystem.delete('evans-deep-dark-secrets.locked');
    
    this.fileSystem.set('evans-deep-dark-secrets.encrypted', {
      content: `Ω§ñ∆√¢€π¬∑ß∂ƒ©˙∆Ω≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆
≈ç√∫˜µ≤≥÷åΩ§ñ∆√¢€π¬∑ß∂ƒ©˙∆Ω≈ç√∫˜µ≤≥÷
åß∂ƒ©˙∆≈ç√∫˜µΩ§ñ∆√¢€π¬∑ß∂ƒ©˙∆Ω≈ç√∫˜
µ≤≥÷åß∂ƒ©˙∆≈ç√∫˜µ≤≥÷åΩ§ñ∆√¢€π¬∑ß∂ƒ©
˙∆Ω≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆≈ç√∫˜µ≤≥÷åΩ§ñ∆√¢€

[File appears to be encrypted. Use 'decrypt' command to decrypt.]`,
      requiresRoot: true
    });

    // Add key reminder file
    this.fileSystem.set('decrypt_key_reminder.png', {
      content: `=== DECRYPTION KEY REMINDER ===

🍕 Remember your favorite food:
      ╭────────────╮
     ╱  ●    ●    ╲
    ╱     ●        ╲
   ╱  ●     ●   ●  ╲
  ╱      ●    ●    ╲
 ╱__________________╲

π Mathematical constant:
π = 3.14159265...

[Hint: 5 letters, 3 digits with decimal]`,
      requiresRoot: false
    });

    // Update system log
    this.updateSystemLog();
    
    // Update command suggestions
    this.updateCommandSuggestions();
  }

  private getFileArguments(): Array<{ name: string; description: string }> {
    const fileArgs: Array<{ name: string; description: string }> = [];
    
    this.fileSystem.forEach((_, filename) => {
      // Show all files in autocomplete - let the open command handle permission checks
      fileArgs.push({
        name: filename,
        description: `Open ${filename}`
      });
    });
    
    return fileArgs;
  }

  private getEncryptedFileArguments(): Array<{ name: string; description: string }> {
    const encryptedArgs: Array<{ name: string; description: string }> = [];
    
    this.fileSystem.forEach((file, filename) => {
      // Only show .encrypted files that are accessible
      if (filename.endsWith('.encrypted') && (!file.requiresRoot || this.hasRootAccess)) {
        encryptedArgs.push({
          name: filename,
          description: `Decrypt ${filename}`
        });
      }
    });
    
    return encryptedArgs;
  }

  private updateCommandSuggestions(): void {
    // Update open command suggestions
    const openCommand = this.hackerCommands.get('open');
    if (openCommand && openCommand.suggestions) {
      const newArgs = this.getFileArguments();
      openCommand.suggestions.arguments = newArgs;
    }

    // Update cat command suggestions
    const catCommand = this.hackerCommands.get('cat');
    if (catCommand && catCommand.suggestions) {
      const newArgs = this.getFileArguments();
      catCommand.suggestions.arguments = newArgs;
    }

    // Update decrypt command suggestions
    const decryptCommand = this.hackerCommands.get('decrypt');
    if (decryptCommand && decryptCommand.suggestions) {
      const newArgs = this.getEncryptedFileArguments();
      decryptCommand.suggestions.arguments = newArgs;
    }
  }

  private showDecryptionInterface(filename: string): Promise<CommandResponse> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.className = 'hacker-output';
      
      content.innerHTML = `
        <div style="font-family: 'Courier New', monospace; color: #00ff00; padding: 2rem;">
          <h3 style="color: #00ff00; margin: 0 0 1.5rem 0; text-shadow: 0 0 10px #00ff00;">🔐 DECRYPTION INTERFACE</h3>
          <div style="margin-bottom: 1rem;">Decrypting: <strong>${filename}</strong></div>
          
          <div style="margin: 2rem 0;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem;">5-Letter Hash Code:</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="hash-0" maxlength="1" class="hash-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  text-transform: lowercase;
                  outline: none;
                " />
                <input type="text" id="hash-1" maxlength="1" class="hash-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  text-transform: lowercase;
                  outline: none;
                " />
                <input type="text" id="hash-2" maxlength="1" class="hash-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  text-transform: lowercase;
                  outline: none;
                " />
                <input type="text" id="hash-3" maxlength="1" class="hash-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  text-transform: lowercase;
                  outline: none;
                " />
                <input type="text" id="hash-4" maxlength="1" class="hash-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  text-transform: lowercase;
                  outline: none;
                " />
              </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem;">3-Digit Decimal:</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="text" id="decimal-0" maxlength="1" class="decimal-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  outline: none;
                " />
                <span style="
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.8rem;
                  font-weight: bold;
                  margin: 0 0.25rem;
                ">.</span>
                <input type="text" id="decimal-1" maxlength="1" class="decimal-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  outline: none;
                " />
                <input type="text" id="decimal-2" maxlength="1" class="decimal-input" style="
                  background: rgba(0, 20, 0, 0.8);
                  border: 2px solid #00ff00;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 1.4rem;
                  text-align: center;
                  padding: 0.75rem;
                  width: 50px;
                  height: 50px;
                  outline: none;
                " />
              </div>
            </div>
            </div>
            
            <button 
              id="decrypt-submit"
              style="
                background: rgba(0, 40, 0, 0.8);
                border: 2px solid #00ff00;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 1rem;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                margin-top: 1rem;
                text-shadow: 0 0 5px #00ff00;
              "
              onmouseover="this.style.background='rgba(0, 255, 0, 0.1)'"
              onmouseout="this.style.background='rgba(0, 40, 0, 0.8)'"
            >
              DECRYPT
            </button>
          </div>
          
          <div id="decrypt-error" style="color: #ff4444; background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; padding: 1rem; margin-top: 1rem; display: none; text-align: center; font-weight: bold; text-shadow: 0 0 5px #ff4444;">
            Invalid keys. Try again.
          </div>
        </div>
      `;
      
      // Add event listeners after DOM insertion
      setTimeout(() => {
        const hashInputs = [0, 1, 2, 3, 4].map(i => document.getElementById(`hash-${i}`) as HTMLInputElement);
        const decimalInputs = [0, 1, 2].map(i => document.getElementById(`decimal-${i}`) as HTMLInputElement);
        const submitButton = document.getElementById('decrypt-submit') as HTMLButtonElement;
        
        // Focus first hash input
        hashInputs[0]?.focus();
        
        // Auto-advance logic for hash inputs
        hashInputs.forEach((input, index) => {
          if (!input) return;
          
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Only allow letters
            target.value = target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
            
            // Auto-advance to next input
            if (target.value && index < hashInputs.length - 1) {
              hashInputs[index + 1]?.focus();
            } else if (target.value && index === hashInputs.length - 1) {
              // Move to first decimal input when hash is complete
              decimalInputs[0]?.focus();
            }
          });
          
          // Handle backspace to go to previous input
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
              hashInputs[index - 1]?.focus();
            }
          });
        });
        
        // Auto-advance logic for decimal inputs
        decimalInputs.forEach((input, index) => {
          if (!input) return;
          
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Only allow numbers
            target.value = target.value.replace(/[^0-9]/g, '');
            
            // Auto-advance to next input
            if (target.value && index < decimalInputs.length - 1) {
              decimalInputs[index + 1]?.focus();
            }
          });
          
          // Handle backspace to go to previous input
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
              decimalInputs[index - 1]?.focus();
            }
          });
        });
        
        const handleSubmit = () => {
          // Collect values from all inputs
          const hashValue = hashInputs.map(input => input?.value || '').join('');
          const decimalValue = `${decimalInputs[0]?.value || ''}.${decimalInputs[1]?.value || ''}${decimalInputs[2]?.value || ''}`;
          this.handleDecryptionSubmit(filename, hashValue, decimalValue);
        };
        
        submitButton?.addEventListener('click', handleSubmit);
        
        // Add enter key support to all inputs
        [...hashInputs, ...decimalInputs].forEach(input => {
          if (input) {
            input.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            });
          }
        });
      }, 100);
      
      resolve({ content, type: 'html' });
    });
  }

  private handleDecryptionSubmit(filename: string, hashCode: string, decimal: string): void {
    // Track decryption submission attempt
    analytics.trackGameAction('hacker', 'decryption_submit_attempt', 1);
    
    if (hashCode.toLowerCase() === 'pizza' && decimal === '3.14') {
      this.isFileDecrypted = true;
      this.updateFileSystemAfterDecryption(filename);
      
      // Track successful decryption
      analytics.trackGameAction('hacker', 'decryption_success', 1);
      
      const contentWindow = document.querySelector('.content-window');
      if (contentWindow) {
        const successContent = document.createElement('div');
        successContent.className = 'hacker-output';
        
        successContent.innerHTML = `
          <div style="font-family: 'Courier New', monospace; color: #00ff00; padding: 2rem;">
            <div style="color: #4ade80; margin-bottom: 1rem;">✅ Decryption successful!</div>
            <div style="margin-bottom: 0.5rem;">File decrypted: evans-deep-dark-secrets.txt</div>
            <div style="opacity: 0.8;">Use 'open evans-deep-dark-secrets.txt' to view the contents.</div>
          </div>
        `;
        
        contentWindow.innerHTML = '';
        contentWindow.appendChild(successContent);
        
        // Focus the command input to keep flow smooth
        setTimeout(() => {
          const commandInput = document.querySelector('.command-input') as HTMLInputElement;
          if (commandInput) {
            commandInput.focus();
          }
        }, 100);
      }
    } else {
      // Track failed decryption
      analytics.trackGameAction('hacker', 'decryption_failed', 1);
      
      const errorDiv = document.getElementById('decrypt-error');
      if (errorDiv) {
        errorDiv.style.display = 'block';
        // Clear all individual character inputs
        const hashInputs = [0, 1, 2, 3, 4].map(i => document.getElementById(`hash-${i}`) as HTMLInputElement);
        const decimalInputs = [0, 1, 2].map(i => document.getElementById(`decimal-${i}`) as HTMLInputElement);
        
        hashInputs.forEach(input => input && (input.value = ''));
        decimalInputs.forEach(input => input && (input.value = ''));
        
        // Focus first hash input
        hashInputs[0]?.focus();
      }
    }
  }

  private updateFileSystemAfterDecryption(filename: string): void {
    // Remove encrypted file
    this.fileSystem.delete(filename);
    
    // Add decrypted file
    const txtFilename = filename.replace('.encrypted', '.txt');
    this.fileSystem.set(txtFilename, {
      content: `=== EVAN'S DEEP DARK SECRETS ===

• I still use vim with arrow keys sometimes
• My first website had a visitor counter AND a guestbook  
• I've googled "how to center a div" this week
• I once spent 3 hours debugging a missing semicolon
• My password used to be "password123"
• I think tabs are better than spaces
• I have 47 unused domain names
• My code comments are 90% TODOs I'll never do
• I still google basic Git commands
• I've pushed directly to main branch... today
• I name variables things like "thingy" and "stuff"
• My biggest fear is someone reviewing my old code

[More challenges await... come back later! Thanks for playing]`,
      requiresRoot: true
    });

    // Update system log
    this.updateSystemLog();
    
    // Update command suggestions
    this.updateCommandSuggestions();
  }

  private transformTerminalAppearance(): void {
    // Add hacker mode CSS class to body
    document.body.classList.add('hacker-mode');
    
    // Transform the input to look like a bash terminal
    this.createBashPrompt();

    // Add matrix-style background and theme
    this.createMatrixBackground();
  }

  private restoreTerminalAppearance(): void {
    // Remove hacker mode CSS classes
    document.body.classList.remove('hacker-mode', 'root-access');
    
    // Restore normal input appearance
    this.restoreBashPrompt();

    // Remove matrix background
    this.removeMatrixBackground();
  }

  private createBashPrompt(): void {
    const inputWrapper = document.querySelector('.input-wrapper') as HTMLElement;
    const input = document.querySelector('.command-input') as HTMLInputElement;
    
    if (inputWrapper && input) {
      // Store original styles for restoration
      input.dataset.originalPlaceholder = input.placeholder || '';
      inputWrapper.dataset.originalDisplay = inputWrapper.style.display || '';
      inputWrapper.dataset.originalPadding = inputWrapper.style.padding || '';
      
      // Create bash prompt element
      const bashPrompt = document.createElement('span');
      bashPrompt.className = 'bash-prompt';
      bashPrompt.textContent = this.hasRootAccess ? 'root@evans-website:~# ' : 'EV4N-01@evans-website:~$ ';
      
      // Transform input wrapper to flex container
      inputWrapper.style.display = 'flex';
      inputWrapper.style.alignItems = 'center';
      inputWrapper.style.padding = '0.75rem';
      inputWrapper.style.gap = '0.5rem';
      
      // Style the prompt (mobile-first)
      bashPrompt.style.cssText = `
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 0.9rem;
        text-shadow: 0 0 5px #00ff00;
        white-space: nowrap;
        flex-shrink: 0;
        user-select: none;
        pointer-events: none;
      `;
      
      // Style the input to take remaining space
      input.style.cssText = `
        flex: 1;
        background: transparent !important;
        border: none !important;
        color: #00ff00 !important;
        font-family: 'Courier New', monospace !important;
        font-size: 1rem;
        text-shadow: 0 0 5px #00ff00;
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
        caret-color: #00ff00;
      `;
      
      input.placeholder = 'enter hacker commands...';
      
      // Insert prompt at the beginning
      inputWrapper.insertBefore(bashPrompt, input);
    }
  }

  private restoreBashPrompt(): void {
    const inputWrapper = document.querySelector('.input-wrapper') as HTMLElement;
    const input = document.querySelector('.command-input') as HTMLInputElement;
    const bashPrompt = document.querySelector('.bash-prompt');
    
    if (bashPrompt) {
      bashPrompt.remove();
    }
    
    if (input) {
      // Clear all inline styles to restore original appearance
      input.style.cssText = '';
      input.placeholder = input.dataset.originalPlaceholder || "Type /help to start... or you could just say 'hello'";
      
      // Clean up data attributes
      delete input.dataset.originalPlaceholder;
    }
    
    if (inputWrapper) {
      // Restore original wrapper styles
      inputWrapper.style.display = inputWrapper.dataset.originalDisplay || '';
      inputWrapper.style.padding = inputWrapper.dataset.originalPadding || '';
      inputWrapper.style.alignItems = '';
      inputWrapper.style.gap = '';
      
      // Clean up data attributes
      delete inputWrapper.dataset.originalDisplay;
      delete inputWrapper.dataset.originalPadding;
    }
  }

  private createMatrixBackground(): void {
    // Create binary rain canvas
    this.createBinaryRain();
    
    // Add subtle matrix rain effect
    const style = document.createElement('style');
    style.id = 'hacker-mode-styles';
    style.textContent = `
      /* Global hacker mode theme */
      .hacker-mode {
        background: #000000 !important;
        color: #00ff00 !important;
        min-height: 100vh;
      }
      
      /* Terminal container styling */
      .hacker-mode .terminal-wrapper {
        background: linear-gradient(135deg, #001100 0%, #000a00 100%) !important;
        border: 2px solid #00ff00 !important;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.1) !important;
        border-radius: 0 !important;
      }
      
      /* Intro text styling */
      .hacker-mode .intro-text {
        color: #00ff00 !important;
        text-shadow: 0 0 10px #00ff00;
        font-family: 'Courier New', monospace !important;
      }
      
      /* Input wrapper styling */
      .hacker-mode .input-wrapper {
        background: rgba(0, 20, 0, 0.9) !important;
        border: 2px solid #00ff00 !important;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1) !important;
        border-radius: 0 !important;
      }
      
      /* Command input styling */
      .hacker-mode .command-input {
        background: transparent !important;
        border: none !important;
        color: #00ff00 !important;
        text-shadow: 0 0 5px #00ff00;
        font-family: 'Courier New', monospace !important;
        font-weight: bold;
        caret-color: #00ff00;
      }
      
      .hacker-mode .command-input::placeholder {
        color: rgba(0, 255, 0, 0.6) !important;
        font-style: italic;
      }
      
      .hacker-mode .command-input:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Content window styling */
      .hacker-mode .content-window {
        background: linear-gradient(135deg, #000800 0%, #001000 100%) !important;
        border: 2px solid #00ff00 !important;
        color: #00ff00 !important;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 15px rgba(0, 255, 0, 0.05) !important;
        border-radius: 0 !important;
        font-family: 'Courier New', monospace !important;
      }
      
      /* Headings and text */
      .hacker-mode .brutal-heading,
      .hacker-mode h1, .hacker-mode h2, .hacker-mode h3 {
        color: #00ff00 !important;
        text-shadow: 0 0 15px #00ff00;
        font-family: 'Courier New', monospace !important;
      }
      
      .hacker-mode p, .hacker-mode div {
        color: #00ff00 !important;
        font-family: 'Courier New', monospace !important;
      }
      
      /* Autocomplete styling */
      .hacker-mode .autocomplete-suggestions {
        background: rgba(0, 20, 0, 0.95) !important;
        border: 1px solid #00ff00 !important;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3) !important;
      }
      
      .hacker-mode .autocomplete-suggestion {
        color: #00ff00 !important;
        background: transparent !important;
        font-family: 'Courier New', monospace !important;
      }
      
      .hacker-mode .autocomplete-suggestion:hover,
      .hacker-mode .autocomplete-suggestion.selected {
        background: rgba(0, 255, 0, 0.2) !important;
        text-shadow: 0 0 5px #00ff00;
      }
      
      /* Command history styling - Fixed selectors */
      .hacker-mode .command-history-container {
        background: rgba(0, 20, 0, 0.9) !important;
        border: 1px solid rgba(0, 255, 0, 0.3) !important;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.2) !important;
        border-radius: 0 !important;
        margin-top: 0.5rem !important;
        width: 100% !important;
        left: 0 !important;
        right: 0 !important;
        position: relative !important;
      }
      
      /* Target the correct history item class */
      .hacker-mode .history-item {
        color: #00ff00 !important;
        background: transparent !important;
        border: none !important;
        border-bottom: 1px solid rgba(0, 255, 0, 0.1) !important;
        font-family: 'Courier New', monospace !important;
        padding: 0.3rem 0.5rem !important;
        margin: 0 !important;
        font-size: 0.85rem !important;
        text-align: left !important;
        display: block !important;
        width: 100% !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
      }
      
      /* Target the history command specifically */
      .hacker-mode .history-command {
        color: #00ff00 !important;
        background: transparent !important;
        border: 1px solid rgba(0, 255, 0, 0.3) !important;
        font-family: 'Courier New', monospace !important;
        font-size: 0.8rem !important;
        padding: 0.125rem 0.375rem !important;
        display: inline-block !important;
        border-radius: 0 !important;
      }
      
      /* Override the $ symbol color - will be updated dynamically */
      .hacker-mode .history-command::before {
        content: "EV4N-01@evans-website:~$ " !important;
        color: #00ff00 !important;
        font-weight: bold !important;
        font-size: 0.8rem !important;
      }

      /* Root prompt styling when root access is gained */
      .hacker-mode.root-access .history-command::before {
        content: "root@evans-website:~# " !important;
      }
      
      /* Override success/error border colors */
      .hacker-mode .history-command.command-success {
        border-color: #00ff00 !important;
        color: #00ff00 !important;
      }
      
      .hacker-mode .history-command.command-error {
        border-color: #ff4444 !important;
        color: #00ff00 !important;
      }
      
      .hacker-mode .history-command.command-error::before {
        color: #ff4444 !important;
      }
      
      /* Override any nested elements */
      .hacker-mode .history-item * {
        color: #00ff00 !important;
        font-family: 'Courier New', monospace !important;
      }
      
      /* Hover effects */
      .hacker-mode .history-item:hover {
        background: rgba(0, 255, 0, 0.1) !important;
      }
      
      .hacker-mode .history-item:hover .history-command {
        color: #00ff00 !important;
        text-shadow: 0 0 5px #00ff00 !important;
      }
      
      .hacker-mode .history-item:hover .history-command::before {
        text-shadow: 0 0 5px #00ff00 !important;
      }
      
      /* Matrix effect background */
      .hacker-mode::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(ellipse at center, transparent 0%, rgba(0, 20, 0, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          );
        pointer-events: none;
        z-index: -1;
      }
      
      /* Hacker output specific styling */
      .hacker-mode .hacker-output {
        font-family: 'Courier New', monospace !important;
        background: rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(0, 255, 0, 0.3) !important;
        padding: 1rem !important;
        box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1) !important;
      }

      .scan-line, .exploit-line {
        margin: 0.3rem 0;
        opacity: 0;
        animation: typewriter 0.5s ease-in forwards;
      }

      .scan-line:nth-child(1) { animation-delay: 0.2s; }
      .scan-line:nth-child(2) { animation-delay: 0.6s; }
      .scan-line:nth-child(3) { animation-delay: 1.0s; }
      .scan-line:nth-child(4) { animation-delay: 1.4s; }
      .scan-line:nth-child(5) { animation-delay: 1.8s; }
      .scan-line:nth-child(6) { animation-delay: 2.2s; }
      .scan-line:nth-child(7) { animation-delay: 2.6s; }
      .scan-line:nth-child(8) { animation-delay: 3.0s; }

      .exploit-line:nth-child(1) { animation-delay: 0.2s; }
      .exploit-line:nth-child(2) { animation-delay: 0.6s; }
      .exploit-line:nth-child(3) { animation-delay: 1.0s; }
      .exploit-line:nth-child(4) { animation-delay: 1.4s; }
      .exploit-line:nth-child(5) { animation-delay: 1.8s; }
      .exploit-line:nth-child(6) { animation-delay: 2.2s; }
      .exploit-line:nth-child(7) { animation-delay: 2.6s; }
      .exploit-line:nth-child(8) { animation-delay: 3.0s; }
      .exploit-line:nth-child(9) { animation-delay: 3.4s; }
      .exploit-line:nth-child(10) { animation-delay: 3.8s; }

      @keyframes typewriter {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Glitch effect animations */
      .glitch-word {
        display: inline-block;
        position: relative;
        animation: glitch 0.35s ease-in-out forwards;
        color: #00ff00 !important;
        text-shadow: 
          0 0 5px #00ff00,
          2px 0 #ff0080,
          -2px 0 #00ffff;
        font-family: 'Courier New', monospace !important;
      }

      @keyframes glitch {
        0% {
          transform: translate(0);
          filter: hue-rotate(0deg);
        }
        10% {
          transform: translate(-2px, 2px);
          filter: hue-rotate(90deg);
        }
        20% {
          transform: translate(-1px, -1px);
          filter: hue-rotate(180deg);
        }
        30% {
          transform: translate(3px, 1px);
          filter: hue-rotate(270deg);
        }
        40% {
          transform: translate(1px, -2px);
          filter: hue-rotate(360deg);
        }
        50% {
          transform: translate(-3px, 2px);
          filter: hue-rotate(45deg);
          text-shadow: 
            0 0 10px #ff0080,
            3px 0 #00ffff,
            -3px 0 #ffff00;
        }
        60% {
          transform: translate(2px, 1px);
          filter: hue-rotate(135deg);
        }
        70% {
          transform: translate(-1px, -2px);
          filter: hue-rotate(225deg);
        }
        80% {
          transform: translate(1px, 2px);
          filter: hue-rotate(315deg);
        }
        90% {
          transform: translate(-2px, -1px);
          filter: hue-rotate(405deg);
        }
        100% {
          transform: translate(0);
          filter: hue-rotate(0deg);
          text-shadow: 
            0 0 5px #00ff00,
            2px 0 #ff0080,
            -2px 0 #00ffff;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private removeMatrixBackground(): void {
    const style = document.getElementById('hacker-mode-styles');
    if (style) {
      style.remove();
    }
    
    // Remove binary rain canvas and stop animation
    const canvas = document.getElementById('binary-rain-canvas') as any;
    if (canvas) {
      if (canvas.animationInterval) {
        clearInterval(canvas.animationInterval);
      }
      canvas.remove();
    }
  }

  private updateBashPrompt(): void {
    const bashPrompt = document.querySelector('.bash-prompt');
    if (bashPrompt) {
      bashPrompt.textContent = this.hasRootAccess ? 'root@evans-website:~# ' : 'EV4N-01@evans-website:~$ ';
    }
    
    // Update body class for CSS styling
    if (this.hasRootAccess) {
      document.body.classList.add('root-access');
    } else {
      document.body.classList.remove('root-access');
    }
  }

  private createBinaryRain(): void {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'binary-rain-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -2;
      opacity: 0.15;
    `;
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Binary rain configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }
    
    const binaryChars = '01';
    
    const draw = () => {
      // Semi-transparent black background for fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      // Draw binary characters
      for (let i = 0; i < drops.length; i++) {
        const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
        const x = i * fontSize + fontSize / 2;
        const y = drops[i];
        
        ctx.fillText(char, x, y);
        
        // Reset drop to top when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i] += fontSize;
      }
    };
    
    // Start animation
    const interval = setInterval(draw, 100);
    
    // Store interval for cleanup
    (canvas as any).animationInterval = interval;
  }

  getAvailableCommands(): string {
    const commandsByCategory: { [key: string]: HackerCommand[] } = {};
    
    this.hackerCommands.forEach(command => {
      const category = command.category || 'system';
      if (!commandsByCategory[category]) {
        commandsByCategory[category] = [];
      }
      commandsByCategory[category].push(command);
    });

    let output = '<div class="hacker-help" style="font-family: monospace;">';
    output += '<h3 style="color: var(--color-accent); margin: 0 0 1rem 0;">🔴 HACKER COMMANDS AVAILABLE 🔴</h3>';
    
    Object.entries(commandsByCategory).forEach(([category, commands]) => {
      output += `<div style="margin-bottom: 1.5rem;">`;
      output += `<h4 style="color: #00ff00; margin: 0 0 0.5rem 0; text-transform: uppercase;">${category}</h4>`;
      commands.forEach(command => {
        output += `<div style="margin: 0.3rem 0; padding-left: 1rem;">`;
        output += `<strong style="color: var(--color-accent);">${command.name}</strong> - ${command.description}`;
        output += `</div>`;
      });
      output += `</div>`;
    });
    
    output += '<div style="margin-top: 2rem; padding: 1rem; border: 1px solid #00ff00; background: rgba(0, 255, 0, 0.1);">';
    output += '<strong>🎯 MISSION:</strong> Complete the hacking sequence: scan → exploit → decrypt → backdoor<br>';
    output += '<strong>💡 TIP:</strong> Start with <strong>scan</strong> to find targets!';
    output += '</div>';
    output += '</div>';
    
    return output;
  }
}

class GlitchEffect {
  private intervalId: number | null = null;
  private isRunning: boolean = false;
  private lastGlitchedElement: HTMLElement | null = null;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleNextGlitch();
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    
    // Clean up any active glitched elements
    document.querySelectorAll('.glitch-word').forEach(el => {
      this.cleanupGlitchElement(el as HTMLElement);
    });
  }

  private scheduleNextGlitch(): void {
    if (!this.isRunning) return;
    
    // Random interval between 2-4 seconds
    const delay = 2000 + Math.random() * 2000;
    
    this.intervalId = window.setTimeout(() => {
      this.performGlitch();
      this.scheduleNextGlitch();
    }, delay);
  }

  private performGlitch(): void {
    const textElements = this.findTextElements();
    if (textElements.length === 0) return;

    // Get a random text element
    const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
    const words = this.extractWords(randomElement);
    
    if (words.length === 0) return;

    // Pick a random word
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Don't glitch the same element twice in a row
    if (randomWord.element === this.lastGlitchedElement) {
      return;
    }
    
    this.applyGlitchToWord(randomWord);
    this.lastGlitchedElement = randomWord.element;
  }

  private findTextElements(): HTMLElement[] {
    const textElements: HTMLElement[] = [];
    
    // Include both content window and intro text
    const containers = [
      document.querySelector('.content-window'),
      document.querySelector('.intro-text')
    ];

    containers.forEach(container => {
      if (!container) return;
      
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Skip if parent already has glitch class
            if (parent.classList.contains('glitch-word')) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Only include text nodes with meaningful content
            const text = node.textContent?.trim();
            if (text && text.length > 2) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        const parent = node.parentElement;
        if (parent && !textElements.includes(parent)) {
          textElements.push(parent);
        }
      }
    });

    return textElements;
  }

  private extractWords(element: HTMLElement): Array<{ text: string; element: HTMLElement }> {
    const words: Array<{ text: string; element: HTMLElement }> = [];
    const text = element.textContent || '';
    
    // Simple word extraction - split by spaces and punctuation
    const wordMatches = text.match(/\b\w{3,}\b/g);
    if (wordMatches) {
      wordMatches.forEach(word => {
        words.push({ text: word, element });
      });
    }
    
    return words;
  }

  private applyGlitchToWord(wordData: { text: string; element: HTMLElement }): void {
    const element = wordData.element;
    const word = wordData.text;
    const originalHTML = element.innerHTML;
    
    // Find the word in the HTML and wrap it
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    const match = originalHTML.match(wordRegex);
    
    if (!match) return;
    
    // Create glitched version
    const glitchSpan = `<span class="glitch-word" data-original="${word}">${this.createGlitchText(word)}</span>`;
    const newHTML = originalHTML.replace(wordRegex, glitchSpan);
    
    element.innerHTML = newHTML;
    
    // Remove glitch after animation duration
    setTimeout(() => {
      const glitchElement = element.querySelector('.glitch-word');
      if (glitchElement) {
        this.cleanupGlitchElement(glitchElement as HTMLElement);
      }
    }, 350);
  }

  private createGlitchText(original: string): string {
    const glitchChars = '!@#$%^&*()[]{}|\\~`';
    let glitched = '';
    
    for (let i = 0; i < original.length; i++) {
      if (Math.random() < 0.3) {
        glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
      } else {
        glitched += original[i];
      }
    }
    
    return glitched;
  }

  private cleanupGlitchElement(element: HTMLElement): void {
    const original = element.getAttribute('data-original');
    if (original) {
      element.outerHTML = original;
    }
  }
}