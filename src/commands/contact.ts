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
    const web3formsKey = '65edd7d2-eb25-4004-9eda-0ab0e2a1ab70';
    const subject = encodeURIComponent('Hello from your Portfolio Site');
    const body = encodeURIComponent('Hi Evan,\n\nI found your portfolio site and wanted to reach out.\n\n');
    
    // SVG icons
    const mailIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const copyIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const githubIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
    const checkIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const sendIcon = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    const loadingIcon = `<svg class="icon spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"></path></svg>`;
    
    content.innerHTML = `
      <div class="contact-section brutal-box">
        <h2 class="brutal-heading">Get in Touch</h2>
        
        <!-- Contact Form Section -->
        <div class="contact-form-container">
          <h3 class="contact-label">Send me a message</h3>
          <form id="contact-form" class="contact-form">
            <input type="hidden" name="access_key" value="${web3formsKey}">
            <input type="checkbox" name="botcheck" style="display: none;">
            
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-input brutal-input binary-placeholder" 
                required
                placeholder="11010010"
                data-placeholder="Your Name"
              >
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input brutal-input binary-placeholder" 
                required
                placeholder="1001101010111000011010101"
                data-placeholder="your.email@example.com"
              >
            </div>
            
            <div class="form-group">
              <label for="subject" class="form-label">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                class="form-input brutal-input binary-placeholder" 
                placeholder="10010110101001100110"
                data-placeholder="What's this about?"
              >
            </div>
            
            <div class="form-group">
              <label for="message" class="form-label">Message</label>
              <textarea 
                id="message" 
                name="message" 
                class="form-textarea brutal-input binary-placeholder" 
                required
                rows="5"
                placeholder="1001101010111000"
                data-placeholder="Your message..."
              ></textarea>
            </div>
            
            <button type="submit" class="brutal-button form-submit-btn">
              <span class="btn-text">${sendIcon} Send Message</span>
              <span class="btn-loading" style="display: none;">${loadingIcon} Sending...</span>
            </button>
            
            <div class="form-message" style="display: none;"></div>
          </form>
        </div>
        
        <div class="contact-divider"></div>
        
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

    // Add functionality to window for onclick access
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
      
      // Animate placeholder text with binary transition - synchronized with main content
      setTimeout(() => {
        const inputs = document.querySelectorAll('.binary-placeholder');
        
        inputs.forEach((input) => {
          const element = input as HTMLInputElement | HTMLTextAreaElement;
          const originalPlaceholder = element.getAttribute('data-placeholder') || '';
          
          // Transition from current binary placeholder to real text
          // Make sure we work with the correct length - use target text length
          const targetText = originalPlaceholder.split('');
          let currentText: string[] = Array(targetText.length).fill(0).map(() => 
            Math.random() > 0.5 ? '1' : '0'
          );
          let revealedIndices = new Set<number>();
          
          const transitionInterval = setInterval(() => {
            // Reveal 3 characters per frame to match main content speed
            const toReveal = Math.min(3, targetText.length - revealedIndices.size);
            
            for (let i = 0; i < toReveal; i++) {
              let randomIndex;
              do {
                randomIndex = Math.floor(Math.random() * targetText.length);
              } while (revealedIndices.has(randomIndex) && revealedIndices.size < targetText.length);
              
              revealedIndices.add(randomIndex);
              currentText[randomIndex] = targetText[randomIndex];
            }
            
            // Update placeholder
            element.placeholder = currentText.join('');
            
            // Clear interval when complete
            if (revealedIndices.size === targetText.length) {
              clearInterval(transitionInterval);
              element.classList.remove('binary-placeholder');
            }
          }, 8); // Match the charDelay from main content
        });
      }, 2000); // Start at the same time as main content binary transition
      
      // Add form submission handler
      setTimeout(() => {
        const form = document.getElementById('contact-form') as HTMLFormElement;
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.form-submit-btn') as HTMLButtonElement;
            const btnText = submitBtn.querySelector('.btn-text') as HTMLElement;
            const btnLoading = submitBtn.querySelector('.btn-loading') as HTMLElement;
            const messageDiv = form.querySelector('.form-message') as HTMLElement;
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            messageDiv.style.display = 'none';
            
            const formData = new FormData(form);
            const object: Record<string, any> = {};
            formData.forEach((value, key) => {
              object[key] = value;
            });
            
            try {
              const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(object)
              });
              
              const data = await response.json();
              
              if (response.ok && data.success) {
                // Show success message
                messageDiv.className = 'form-message success-message';
                messageDiv.innerHTML = `${decodeURIComponent('%3Csvg%20class%3D%22icon%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')} Message sent successfully! I'll get back to you soon.`;
                messageDiv.style.display = 'block';
                form.reset();
              } else {
                throw new Error(data.message || 'Failed to send message');
              }
            } catch (error) {
              // Show error message
              messageDiv.className = 'form-message error-message';
              messageDiv.innerHTML = `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Sorry, there was an error sending your message. Please try again or use the email link below.`;
              messageDiv.style.display = 'block';
              console.error('Form submission error:', error);
            } finally {
              // Reset button state
              submitBtn.disabled = false;
              btnText.style.display = 'inline-flex';
              btnLoading.style.display = 'none';
            }
          });
        }
      }, 100);
    }

    return {
      content,
      type: 'html'
    };
  }
};