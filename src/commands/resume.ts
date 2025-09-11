import type { Command, ResumeData } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

// Cache for resume data and rendered sections
let cachedResumeData: ResumeData | null = null;
let cachedSections: Map<string, string> = new Map();

export const resumeCommand: Command = {
  name: 'resume',
  description: 'View my professional experience and background',
  aliases: ['cv', 'work'],
  suggestions: {
    subcommands: [
      {
        name: 'summary',
        description: 'Show only the professional summary'
      },
      {
        name: 'recent',
        description: 'Show only current positions or most recent experience'
      },
      {
        name: 'skills',
        description: 'Show only the skills section'
      },
      {
        name: 'projects',
        description: 'Show only the projects section'
      },
      {
        name: 'full-time',
        description: 'Show only full-time positions'
      },
      {
        name: 'consulting',
        description: 'Show only consulting engagements'
      }
    ]
  },
  handler: async (args: string[]) => {
    try {
      // Load data if not cached
      if (!cachedResumeData) {
        const response = await fetch(`${import.meta.env.BASE_URL}content/resume.json`);
        cachedResumeData = await response.json();
      }
      const resumeData = cachedResumeData as ResumeData;

      // Parse subcommand (skip empty strings)
      const subcommand = args.find(arg => arg && arg.trim()) || undefined;
      
      // Helper function to determine active filter
      const getActiveFilter = (filterType: string) => {
        if (!subcommand && filterType === 'all') return 'active';
        if (subcommand === filterType) return 'active';
        return '';
      };
      
      // Filter work experience based on subcommand
      let filteredWork = [...resumeData.work];
      
      if (subcommand === 'full-time') {
        filteredWork = filteredWork.filter(work => work.type === 'full-time');
      } else if (subcommand === 'consulting') {
        filteredWork = filteredWork.filter(work => work.type === 'consulting');
      } else if (subcommand === 'recent') {
        // Filter to show only current (no endDate) positions or the single most recent one
        const currentPositions = filteredWork.filter(work => 
          !work.endDate || work.endDate?.toLowerCase() === 'present'
        );
        
        if (currentPositions.length > 0) {
          // If there are current positions, show all of them
          filteredWork = currentPositions;
        } else {
          // If no current positions, show only the most recent one
          filteredWork = filteredWork
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 1);
        }
      }

      // Store all sections in cache before generating content
      storeSectionsInCache(resumeData);

      const content = document.createElement('div');
      content.className = 'resume-content';
      
      // Generate content based on subcommand
      let contentSections = '';
      
      if (subcommand === 'summary') {
        // Show only the summary section
        contentSections = cachedSections.get('summary') || '';
      } else if (subcommand === 'skills') {
        // Show only skills section
        contentSections = generateSkillsSection(resumeData.skills);
      } else if (subcommand === 'projects') {
        // Show only projects section
        contentSections = generateProjectsSection(resumeData.projects || []);
      } else if (subcommand === 'recent') {
        // Show only recent experience
        contentSections = generateExperienceSection(filteredWork, subcommand);
      } else if (subcommand === 'full-time' || subcommand === 'consulting') {
        // Show filtered experience + other sections
        contentSections = `
          ${generateExperienceSection(filteredWork, subcommand)}
          ${generateSkillsSection(resumeData.skills)}
          ${generateEducationSection(resumeData.education)}
          ${generateProjectsSection(resumeData.projects || [])}
        `;
      } else {
        // Show full resume (all sections)
        contentSections = `
          ${cachedSections.get('summary') || ''}
          ${generateExperienceSection(filteredWork, subcommand)}
          ${generateSkillsSection(resumeData.skills)}
          ${generateEducationSection(resumeData.education)}
          ${generateProjectsSection(resumeData.projects || [])}
        `;
      }

      content.innerHTML = `
        <div class="resume-header brutal-box">
          <h1 class="brutal-heading">${resumeData.basics.name}</h1>
          <h2 class="resume-title">${resumeData.basics.label}</h2>
          <div class="contact-info">
            ${resumeData.basics.email ? `<span>✉ ${resumeData.basics.email}</span>` : ''}
            ${resumeData.basics.phone ? `<span>📞 ${resumeData.basics.phone}</span>` : ''}
            ${resumeData.basics.profiles?.find(p => p.network === 'GitHub') ? `<span>🔗 github.com/${resumeData.basics.profiles.find(p => p.network === 'GitHub')?.username}</span>` : ''}
          </div>
        </div>

        <div class="resume-actions-centered">
          <a href="${import.meta.env.BASE_URL}resume.pdf" download="Evan_Steitz_Resume.pdf" class="action-btn download-btn">
            <i class="fas fa-download"></i>
            Download PDF
          </a>
          <button class="action-btn print-btn" id="print-resume-btn">
            <i class="fas fa-print"></i>
            Print Resume
          </button>
        </div>

        <div class="resume-filters brutal-box">
          <div class="filter-buttons">
            <button class="filter-btn ${getActiveFilter('all')}" data-filter="all">All</button>
            <button class="filter-btn ${getActiveFilter('summary')}" data-filter="summary">Summary</button>
            <button class="filter-btn ${getActiveFilter('recent')}" data-filter="recent">Recent</button>
            <button class="filter-btn ${getActiveFilter('skills')}" data-filter="skills">Skills</button>
            <button class="filter-btn ${getActiveFilter('projects')}" data-filter="projects">Projects</button>
            <button class="filter-btn ${getActiveFilter('full-time')}" data-filter="full-time">Full-time only</button>
            <button class="filter-btn ${getActiveFilter('consulting')}" data-filter="consulting">Consulting only</button>
          </div>
        </div>

        <div class="resume-sections">
          ${contentSections}
        </div>
        
        ${generateQuickSuggestions(subcommand)}
      `;

      
      // Add click handlers for instant filter buttons and action buttons
      setTimeout(() => {
        const filterButtons = content.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filterType = btn.getAttribute('data-filter');
            if (filterType) {
              applyInstantFilter(content, filterType);
            }
          });
        });

        // Add print button handler
        const printBtn = content.querySelector('#print-resume-btn');
        if (printBtn) {
          printBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`${import.meta.env.BASE_URL}pdf.html`, '_blank');
          });
        }
      }, 0);

      return {
        content,
        type: 'html'
      };
    } catch (error) {
      return {
        content: `Error loading resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'text'
      };
    }
  }
};

function generateExperienceSection(workExperience: any[], subcommand?: string): string {
  if (workExperience.length === 0) {
    return `<div class="brutal-box"><h2 class="brutal-heading">Experience</h2><p>No experience matches your criteria.</p></div>`;
  }
  
  let sectionTitle = 'Experience';
  if (subcommand === 'recent') {
    sectionTitle = 'Most Recent Experience';
  } else if (subcommand === 'full-time') {
    sectionTitle = 'Full-Time Experience';
  } else if (subcommand === 'consulting') {
    sectionTitle = 'Consulting Experience';
  }
  
  return `
    <div class="experience-section brutal-box">
      <h2 class="brutal-heading">${sectionTitle}</h2>
      ${workExperience.map(work => `
        <div class="experience-item">
          <div class="experience-header">
            <h3 class="company-name">${work.name}</h3>
            ${work.type === 'consulting' ? `<span class="experience-type ${work.type}">${work.type}</span>` : ''}
          </div>
          <div class="position-info">
            <h4 class="position-title">${work.position}</h4>
            ${work.keywords ? `
              <div class="position-technologies">
                ${work.keywords.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
              </div>
            ` : ''}
            <div class="position-meta">
              <span class="location">${work.location || ''}</span>
              ${work.type !== 'consulting' ? `<span class="dates">${formatDateRange(work.startDate, work.endDate)}</span>` : ''}
            </div>
          </div>
          <ul class="description-list">
            ${work.highlights.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
}

function generateSkillsSection(skills: any[]): string {
  return `
    <div class="skills-section brutal-box">
      <h2 class="brutal-heading">Skills</h2>
      ${skills.map(skillGroup => `
        <div class="skill-group">
          <h4 class="skill-category">${skillGroup.name}</h4>
          <div class="skill-items">
            ${skillGroup.keywords.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateEducationSection(education: any[]): string {
  return `
    <div class="education-section brutal-box">
      <h2 class="brutal-heading">Education</h2>
      ${education.map(edu => `
        <div class="education-item">
          <h3 class="institution">${edu.institution}</h3>
          <div class="degree-info">
            <span class="degree">${edu.studyType}${edu.area ? ` in ${edu.area}` : ''}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateProjectsSection(projects: any[]): string {
  if (projects.length === 0) return '';
  
  return `
    <div class="projects-section brutal-box">
      <h2 class="brutal-heading">Projects</h2>
      ${projects.map(project => `
        <div class="project-item">
          <div class="project-header">
            <h3 class="project-name">${project.name}</h3>
            <div class="project-links">
              ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">Check it out →</a>` : ''}
              ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">📦 GitHub</a>` : ''}
            </div>
          </div>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.keywords.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function formatDateRange(startDate: string, endDate?: string): string {
  const formatDate = (date: string) => {
    if (date.toLowerCase() === 'present') return 'Present';
    
    // Handle YYYY-MM-DD format (extract YYYY-MM)
    if (date.includes('-')) {
      const [year, month] = date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    return date;
  };
  
  const formattedEndDate = endDate ? formatDate(endDate) : 'Present';
  return `${formatDate(startDate)} – ${formattedEndDate}`;
}

function storeSectionsInCache(resumeData: ResumeData): void {
  // Cache all possible sections for instant switching
  cachedSections.clear();
  
  // Cache summary section
  cachedSections.set('summary', `
    <div class="summary-section brutal-box">
      <h2 class="brutal-heading">Summary</h2>
      <p class="summary-text">${resumeData.basics.summary}</p>
    </div>
  `);
  
  // Cache full experience
  cachedSections.set('experience-all', generateExperienceSection(resumeData.work));
  
  // Cache filtered experience
  const currentPositions = resumeData.work.filter(work => 
    !work.endDate || work.endDate?.toLowerCase() === 'present'
  );
  const recentExperience = currentPositions.length > 0 ? currentPositions : 
    [resumeData.work.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]];
  
  cachedSections.set('experience-recent', generateExperienceSection(recentExperience, 'recent'));
  cachedSections.set('experience-fulltime', generateExperienceSection(
    resumeData.work.filter(work => work.type === 'full-time'),
    'full-time'
  ));
  cachedSections.set('experience-consulting', generateExperienceSection(
    resumeData.work.filter(work => work.type === 'consulting'),
    'consulting'
  ));
  
  // Cache other sections
  cachedSections.set('skills', generateSkillsSection(resumeData.skills));
  cachedSections.set('education', generateEducationSection(resumeData.education));
  cachedSections.set('projects', generateProjectsSection(resumeData.projects || []));
}

function applyInstantFilter(container: HTMLElement, filterType: string): void {
  // Update active button
  const buttons = container.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filterType) {
      btn.classList.add('active');
    }
  });
  
  // Get the content sections container
  const sectionsContainer = container.querySelector('.resume-sections');
  if (!sectionsContainer) {
    // Create sections container if it doesn't exist
    const header = container.querySelector('.resume-header');
    const newSectionsContainer = document.createElement('div');
    newSectionsContainer.className = 'resume-sections';
    header?.insertAdjacentElement('afterend', newSectionsContainer);
  }
  
  const sections = container.querySelector('.resume-sections') || container;
  
  // Determine which sections to show based on filter
  let newContent = '';
  switch (filterType) {
    case 'all':
      newContent = `
        ${cachedSections.get('summary') || ''}
        ${cachedSections.get('experience-all') || ''}
        ${cachedSections.get('skills') || ''}
        ${cachedSections.get('education') || ''}
        ${cachedSections.get('projects') || ''}
      `;
      break;
    case 'summary':
      newContent = cachedSections.get('summary') || '';
      break;
    case 'recent':
      newContent = cachedSections.get('experience-recent') || '';
      break;
    case 'skills':
      newContent = cachedSections.get('skills') || '';
      break;
    case 'projects':
      newContent = cachedSections.get('projects') || '';
      break;
    case 'full-time':
      newContent = `
        ${cachedSections.get('experience-fulltime') || ''}
        ${cachedSections.get('skills') || ''}
        ${cachedSections.get('education') || ''}
        ${cachedSections.get('projects') || ''}
      `;
      break;
    case 'consulting':
      newContent = `
        ${cachedSections.get('experience-consulting') || ''}
        ${cachedSections.get('skills') || ''}
        ${cachedSections.get('education') || ''}
        ${cachedSections.get('projects') || ''}
      `;
      break;
  }
  
  // Apply transition animation
  animateFilterTransition(sections, newContent);
}

function animateFilterTransition(container: Element, newContent: string): void {
  const existingSections = container.querySelectorAll('.brutal-box:not(.resume-filters):not(.resume-header)');
  
  // Add exit animation to current sections
  existingSections.forEach((section, index) => {
    section.classList.add('filter-transition-out');
    (section as HTMLElement).style.animationDelay = `${index * 50}ms`;
  });
  
  // Wait for exit animation to complete
  setTimeout(() => {
    // Update content
    container.innerHTML = newContent;
    
    // Add enter animation to new sections
    const newSections = container.querySelectorAll('.brutal-box');
    newSections.forEach((section, index) => {
      section.classList.add('filter-transition-in');
      (section as HTMLElement).style.animationDelay = `${index * 50}ms`;
      
      // Remove animation class after completion
      setTimeout(() => {
        section.classList.remove('filter-transition-in');
      }, 400 + (index * 50));
    });
  }, 300);
}

function generateQuickSuggestions(subcommand?: string): string {
  // Show different suggestions based on current subcommand
  if (subcommand === 'skills') {
    return QuickSuggestions.generate([
      { command: '/resume', label: '/resume', description: 'View full resume' },
      { command: '/resume projects', label: '/resume projects', description: 'View my projects' },
      { command: '/resume recent', label: '/resume recent', description: 'Recent experience only' },
      { command: '/about', label: '/about', description: 'Learn more about me' },
      { command: '/help', label: '/help', description: 'See all available commands' }
    ], 'Quick Commands');
  }
  
  if (subcommand === 'projects') {
    return QuickSuggestions.generate([
      { command: '/resume', label: '/resume', description: 'View full resume' },
      { command: '/resume skills', label: '/resume skills', description: 'View my skills' },
      { command: '/resume recent', label: '/resume recent', description: 'Recent experience only' },
      { command: '/about', label: '/about', description: 'Learn more about me' },
      { command: '/help', label: '/help', description: 'See all available commands' }
    ], 'Quick Commands');
  }
  
  if (subcommand === 'recent') {
    return QuickSuggestions.generate([
      { command: '/resume', label: '/resume', description: 'View full resume' },
      { command: '/resume skills', label: '/resume skills', description: 'View my skills' },
      { command: '/resume projects', label: '/resume projects', description: 'View my projects' },
      { command: '/resume --full-time-only', label: '/resume --full-time-only', description: 'Full-time only' },
      { command: '/help', label: '/help', description: 'See all available commands' }
    ], 'Quick Commands');
  }
  
  // Default suggestions for full resume
  return QuickSuggestions.generate(QuickSuggestions.RESUME_VARIATIONS, 'Quick Commands');
}