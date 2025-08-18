export class BinaryTransition {
  private static activeAnimations = new Map<Element, () => void>();
  private static animationCount = 0;
  private static isReducedMotion = false;
  
  static {
    // Check for reduced motion preference
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Performance monitoring
    if ('performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      // Reduce animation complexity on low memory devices
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
        this.isReducedMotion = true;
      }
    }
  }
  
  static async animateElement(element: Element, options: {
    delay?: number;
    charDelay?: number;
    preserveHtml?: boolean;
  } = {}): Promise<void> {
    this.animationCount++;
    
    // Adaptive timing based on previous animations and performance
    const isFirstAnimation = this.animationCount === 1;
    const baseDelay = isFirstAnimation ? 400 : 200; // Faster subsequent animations
    const baseCharDelay = this.isReducedMotion ? 4 : 8; // Faster on reduced motion
    
    const {
      delay = baseDelay,
      charDelay = baseCharDelay,
      preserveHtml = true
    } = options;
    
    // Cancel any existing animation on this element
    this.cancelAnimation(element);
    
    return new Promise<void>((resolve) => {
      // Store original content and dimensions
      const originalContent = preserveHtml ? element.innerHTML : element.textContent || '';
      
      // Capture the original dimensions before changing content (for HTML elements)
      if (element instanceof HTMLElement) {
        const originalHeight = element.offsetHeight;
        const originalWidth = element.offsetWidth;
        
        // Apply fixed dimensions to prevent jumping
        element.style.minHeight = `${originalHeight}px`;
        element.style.minWidth = `${originalWidth}px`;
      }
      
      // Generate binary version that preserves styling
      const binaryContent = this.generateBinaryContent(element, preserveHtml);
      
      // Set initial binary state with data stream effect
      if (preserveHtml) {
        element.innerHTML = binaryContent;
      } else {
        element.textContent = binaryContent;
      }
      
      // Add binary styling and loading animation classes
      element.classList.add('binary-transition-active');
      
      // Add animation classes based on performance capabilities
      if (!this.isReducedMotion) {
        element.classList.add('binary-loading');
        element.classList.add('data-materializing');
        
        // Add dynamic data stream effect only if not reduced motion
        this.addDataStreamEffect(element);
      } else {
        // Simpler animation for reduced motion
        element.classList.add('binary-loading-simple');
      }
      
      // Remove loading animation classes after they complete
      const animationDuration = this.isReducedMotion ? 250 : 500;
      setTimeout(() => {
        element.classList.remove('binary-loading');
        element.classList.remove('binary-loading-simple');
      }, animationDuration);
      
      if (!this.isReducedMotion) {
        setTimeout(() => {
          element.classList.remove('data-materializing');
        }, 800);
      }
      
      let cancelAnimation = false;
      const cleanup = () => {
        cancelAnimation = true;
        element.classList.remove('binary-transition-active');
        element.classList.remove('binary-loading');
        element.classList.remove('binary-loading-simple');
        element.classList.remove('data-materializing');
        this.removeDataStreamEffect(element);
        // Remove the fixed dimensions after animation completes (for HTML elements)
        if (element instanceof HTMLElement) {
          element.style.minHeight = '';
          element.style.minWidth = '';
        }
        this.activeAnimations.delete(element);
      };
      
      // Store cleanup function
      this.activeAnimations.set(element, cleanup);
      
      // Start transition after delay
      setTimeout(() => {
        if (cancelAnimation) return;
        
        this.performTransition(element, originalContent, preserveHtml, charDelay)
          .then(() => {
            if (!cancelAnimation) {
              cleanup();
              resolve();
            }
          });
      }, delay);
    });
  }
  
  static cancelAnimation(element: Element): void {
    const cleanup = this.activeAnimations.get(element);
    if (cleanup) {
      cleanup();
    }
  }
  
  static cancelAllAnimations(): void {
    this.activeAnimations.forEach(cleanup => cleanup());
    this.activeAnimations.clear();
  }
  
  private static generateBinaryContent(element: Element, preserveHtml: boolean): string {
    if (preserveHtml) {
      return this.generateBinaryFromHtml(element.innerHTML);
    } else {
      const text = element.textContent || '';
      return this.generateBinaryFromText(text);
    }
  }
  
  private static generateBinaryFromHtml(html: string): string {
    // Parse HTML and replace text content with binary while preserving tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    this.walkTextNodes(tempDiv, (textNode) => {
      if (textNode.textContent) {
        // Use the word-preserving binary generation
        textNode.textContent = this.generateBinaryFromText(textNode.textContent);
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  private static walkTextNodes(element: Element, callback: (node: Text) => void): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip text nodes that are only whitespace between elements
          const text = node.textContent || '';
          return text.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );
    
    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    
    textNodes.forEach(callback);
  }
  
  private static generateBinaryFromText(text: string): string {
    // Process text word by word to preserve word boundaries and prevent wrapping
    const words = text.split(/(\s+)/); // Split but keep whitespace
    
    return words.map(word => {
      // If it's whitespace, preserve it exactly
      if (/^\s+$/.test(word)) {
        return word;
      }
      
      // For actual words, create enhanced binary that closely matches character widths
      // This prevents word wrapping changes
      return word.split('').map((char, index) => {
        // Add occasional corruption/glitch characters for visual interest
        const corruptionChance = Math.random();
        if (corruptionChance < 0.03) { // 3% chance
          const glitchChars = ['█', '▓', '▒', '░', '◆', '◇', '▣', '▤'];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        
        // Occasional hex characters for variety
        if (corruptionChance < 0.08) { // Additional 5% chance
          const hexChars = ['A', 'B', 'C', 'D', 'E', 'F'];
          return hexChars[Math.floor(Math.random() * hexChars.length)];
        }
        
        // Special handling for specific characters to maintain width
        if (char === 'I' || char === 'i') return '1'; // Very narrow
        if (char === 'l') return '1'; // Very narrow
        if (char === 'W' || char === 'M') return '0'; // Very wide
        if (char === 'm' || char === 'w') return '0'; // Wide
        
        // For numbers and special chars
        if (/[0-9]/.test(char)) return '0'; // Numbers are generally wider
        if (/[.,;:!?]/.test(char)) return '1'; // Punctuation is narrow
        
        // For uppercase letters (generally wider)
        if (/[A-Z]/.test(char)) {
          // Mix that leans toward 0 for width
          return index % 3 === 0 ? '1' : '0';
        }
        
        // For lowercase letters (mixed widths)
        if (/[a-z]/.test(char)) {
          // Balanced mix with slight bias toward 1
          return Math.random() < 0.55 ? '1' : '0';
        }
        
        // Default for other characters
        return Math.random() < 0.6 ? '1' : '0';
      }).join('');
    }).join('');
  }
  
  private static async performTransition(
    element: Element, 
    originalContent: string, 
    preserveHtml: boolean,
    charDelay: number
  ): Promise<void> {
    if (preserveHtml) {
      return this.performHtmlTransition(element, originalContent, charDelay);
    } else {
      return this.performTextTransition(element, originalContent, charDelay);
    }
  }
  
  private static async performTextTransition(
    element: Element, 
    originalText: string, 
    charDelay: number
  ): Promise<void> {
    const currentText = element.textContent || '';
    const chars = originalText.split('');
    let revealedText = currentText.split('');
    
    return new Promise<void>((resolve) => {
      let index = 0;
      
      const revealNextChar = () => {
        // Reveal multiple characters per frame for much faster animation
        const charsPerFrame = 3;
        let revealed = 0;
        
        while (revealed < charsPerFrame && index < chars.length) {
          // Skip whitespace instantly
          while (index < chars.length && /\s/.test(chars[index])) {
            revealedText[index] = chars[index];
            index++;
          }
          
          if (index < chars.length) {
            revealedText[index] = chars[index];
            index++;
            revealed++;
          }
        }
        
        element.textContent = revealedText.join('');
        
        if (index < chars.length) {
          // Much faster with minimal randomness
          const delay = charDelay + (Math.random() * charDelay * 0.2);
          setTimeout(revealNextChar, delay);
        } else {
          resolve();
        }
      };
      
      revealNextChar();
    });
  }
  
  private static async performHtmlTransition(
    element: Element, 
    originalHtml: string, 
    charDelay: number
  ): Promise<void> {
    // Parse both current and original HTML
    const tempOriginal = document.createElement('div');
    tempOriginal.innerHTML = originalHtml;
    
    const originalTextNodes: Text[] = [];
    const currentTextNodes: Text[] = [];
    
    this.walkTextNodes(tempOriginal, (node) => originalTextNodes.push(node));
    this.walkTextNodes(element, (node) => currentTextNodes.push(node as Text));
    
    return new Promise<void>((resolve) => {
      let nodeIndex = 0;
      let charIndex = 0;
      
      const revealNextChar = () => {
        if (nodeIndex >= originalTextNodes.length) {
          resolve();
          return;
        }
        
        const originalNode = originalTextNodes[nodeIndex];
        const currentNode = currentTextNodes[nodeIndex];
        
        if (!currentNode || !originalNode) {
          nodeIndex++;
          charIndex = 0;
          revealNextChar();
          return;
        }
        
        const originalText = originalNode.textContent || '';
        const currentText = currentNode.textContent || '';
        
        // Reveal multiple characters per frame for HTML content too
        const charsPerFrame = 4;
        let revealed = 0;
        
        while (revealed < charsPerFrame && charIndex < originalText.length) {
          // Skip whitespace instantly
          while (charIndex < originalText.length && /\s/.test(originalText[charIndex])) {
            charIndex++;
          }
          
          if (charIndex < originalText.length) {
            charIndex++;
            revealed++;
          }
        }
        
        if (charIndex > 0) {
          const newText = originalText.substring(0, charIndex) + 
                        currentText.substring(charIndex);
          currentNode.textContent = newText;
        }
        
        if (charIndex < originalText.length) {
          const delay = charDelay + (Math.random() * charDelay * 0.2);
          setTimeout(revealNextChar, delay);
        } else {
          // Move to next node
          nodeIndex++;
          charIndex = 0;
          setTimeout(revealNextChar, charDelay * 0.3);
        }
      };
      
      revealNextChar();
    });
  }
  
  private static addDataStreamEffect(element: Element): void {
    if (!(element instanceof HTMLElement) || this.isReducedMotion) return;
    
    // Create floating data fragments
    const fragmentsContainer = document.createElement('div');
    fragmentsContainer.className = 'data-fragments-container';
    
    // Reduce fragment count on slower devices
    const baseFragmentCount = 3;
    const maxFragments = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 ? 2 : 3;
    const fragmentCount = baseFragmentCount + Math.floor(Math.random() * maxFragments);
    
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('span');
      fragment.className = 'data-fragment';
      
      // Performance-adaptive timing
      const baseDelay = i * 0.1;
      const adaptiveDelay = this.animationCount > 1 ? baseDelay * 0.7 : baseDelay;
      
      fragment.style.setProperty('--delay', `${adaptiveDelay}s`);
      fragment.style.setProperty('--duration', `${0.6 + Math.random() * 0.4}s`);
      fragment.style.setProperty('--random-x', Math.random().toString());
      fragment.style.setProperty('--random-y', Math.random().toString());
      
      // Generate random binary/hex data with reduced complexity
      const dataTypes = [
        () => Array.from({length: 4 + Math.floor(Math.random() * 3)}, () => Math.random() > 0.5 ? '1' : '0').join(''),
        () => `0x${Math.floor(Math.random() * 0xFFF).toString(16).toUpperCase().padStart(3, '0')}`,
        () => `[${Array.from({length: 2}, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join(' ')}]`,
        () => String.fromCharCode(0x2588 + Math.floor(Math.random() * 8)) + String.fromCharCode(0x2588 + Math.floor(Math.random() * 8))
      ];
      
      fragment.textContent = dataTypes[Math.floor(Math.random() * dataTypes.length)]();
      fragmentsContainer.appendChild(fragment);
    }
    
    element.appendChild(fragmentsContainer);
    
    // Store reference for cleanup
    (element as any).__dataFragments = fragmentsContainer;
  }
  
  private static removeDataStreamEffect(element: Element): void {
    if (!(element instanceof HTMLElement)) return;
    
    const fragments = (element as any).__dataFragments;
    if (fragments && fragments.parentNode) {
      fragments.parentNode.removeChild(fragments);
    }
    delete (element as any).__dataFragments;
  }
}