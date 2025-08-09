import type { Command } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const contactCommand: Command = {
  name: 'contact',
  description: 'Get in touch with me',
  aliases: ['email', 'connect'],
  handler: async () => {
    const content = document.createElement('div');
    content.className = 'contact-content';
    
    // Contact information
    const email = 'ejsteitz@gmail.com';
    const github = 'eckyyakov';
    const subject = encodeURIComponent('Hello from your Portfolio Site');
    const body = encodeURIComponent('Hi Evan,\n\nI found your portfolio site and wanted to reach out.\n\n');
    
    // SVG icons
    const mailIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const copyIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const githubIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
    const checkIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    content.innerHTML = `
      <div class="contact-section brutal-box">
        <h2 class="brutal-heading">Get in Touch</h2>
        
        <div class="contact-method">
          <h3 class="contact-label">
            Email
          </h3>
          <div class="email-row">
            <span class="email-text">${email}</span>
            <button 
              class="icon-button copy-button"
              onclick="window.contactCommand.copyEmail('${email}', this)"
              data-copy-icon="${encodeURIComponent(copyIcon)}"
              data-check-icon="${encodeURIComponent(checkIcon)}"
              title="Copy email address"
            >
              ${copyIcon}
            </button>
          </div>
          <button 
            class="brutal-button contact-button send-email"
            onclick="window.open('mailto:${email}?subject=${subject}&body=${body}', '_blank')"
          >
            ${mailIcon}
            Send Email
          </button>
        </div>
        
        <div class="contact-method">
          <h3 class="contact-label">
            Find Me Online
          </h3>
          <div class="social-links">
            <a 
              href="https://github.com/${github}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="brutal-button social-button github"
            >
              ${githubIcon}
              GitHub
            </a>
          </div>
        </div>
        
        <div class="contact-footer">
          <p class="contact-note">
            Feel free to reach out for opportunities, collaborations, or just to say hello!
          </p>
        </div>
      </div>
      
      ${QuickSuggestions.generate(QuickSuggestions.MAIN_NAVIGATION, 'Quick Commands')}
    `;

    // Add copy functionality to window for onclick access
    if (typeof window !== 'undefined') {
      (window as any).contactCommand = {
        copyEmail: async (email: string, button: HTMLButtonElement) => {
          try {
            await navigator.clipboard.writeText(email);
            
            // Store original content
            const originalHTML = button.innerHTML;
            const originalClass = button.className;
            const checkIcon = decodeURIComponent(button.getAttribute('data-check-icon') || '');
            
            // Show success state
            button.className = originalClass + ' copy-success';
            button.innerHTML = checkIcon;
            button.setAttribute('title', 'Copied!');
            
            // Reset after animation
            setTimeout(() => {
              button.className = originalClass;
              button.innerHTML = originalHTML;
              button.setAttribute('title', 'Copy email address');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy email:', err);
            // Fallback: select the email text
            const emailDisplay = button.closest('.contact-method')?.querySelector('.email-display');
            if (emailDisplay) {
              const range = document.createRange();
              range.selectNode(emailDisplay);
              window.getSelection()?.removeAllRanges();
              window.getSelection()?.addRange(range);
            }
          }
        }
      };
    }

    return {
      content,
      type: 'html'
    };
  }
};