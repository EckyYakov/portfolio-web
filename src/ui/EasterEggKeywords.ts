export interface EasterEggKeyword {
  keyword: string;
  trigger: string;
  description?: string;
}

export class EasterEggKeywords {
  static readonly KEYWORDS: EasterEggKeyword[] = [
    { keyword: 'hack', trigger: 'hack', description: 'Enter hacker terminal' },
    { keyword: 'hacker', trigger: 'hacker', description: 'Enter hacker terminal' },
    { keyword: 'hackerman', trigger: 'hackerman', description: 'Enter hacker terminal' },
    { keyword: 'matrix', trigger: 'matrix', description: 'Enter hacker terminal' },
    { keyword: 'sudo', trigger: 'sudo', description: 'Enter hacker terminal' },
    { keyword: 'root', trigger: 'root', description: 'Enter hacker terminal' },
    { keyword: 'ping', trigger: 'ping', description: 'Try ping pong' },
    { keyword: 'pong', trigger: 'pong', description: 'Play pong game' },
    { keyword: 'golf', trigger: 'golf', description: 'Play mini golf' },
    { keyword: 'play', trigger: 'lets play', description: 'Play pong game' }
  ];

  static makeClickable(text: string, keyword: string, trigger?: string): string {
    const actualTrigger = trigger || keyword;
    const clickableKeyword = `<span 
      class="easter-egg-keyword" 
      onclick="window.terminal.executeSelectedCommand('${actualTrigger}')"
    >${keyword}</span>`;
    
    return text.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), clickableKeyword);
  }

  static wrapKeywords(text: string, keywords: string[] = ['hack', 'ping', 'pong', 'golf']): string {
    let wrappedText = text;
    
    keywords.forEach(keyword => {
      const keywordData = this.KEYWORDS.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
      if (keywordData) {
        wrappedText = this.makeClickable(wrappedText, keyword, keywordData.trigger);
      }
    });
    
    return wrappedText;
  }

  static generateHints(keywords: string[], title: string = 'Try These Words'): string {
    if (keywords.length === 0) return '';
    
    const hints = keywords.map(keyword => {
      const keywordData = this.KEYWORDS.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
      const trigger = keywordData?.trigger || keyword;
      const description = keywordData?.description || `Try saying "${keyword}"`;
      
      return `
        <span 
          class="easter-egg-hint" 
          onclick="window.terminal.executeSelectedCommand('${trigger}')"
          title="${description}"
        >
          ${keyword}
        </span>`;
    }).join('');
    
    return `
      <div class="easter-egg-hints">
        <span class="hints-title">${title}:</span>
        <div class="hint-keywords">
          ${hints}
        </div>
      </div>
    `;
  }
}