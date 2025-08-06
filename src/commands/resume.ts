import type { Command, ResumeData } from '@/types';
import { QuickSuggestions } from '@/ui/QuickSuggestions';

export const resumeCommand: Command = {
  name: 'resume',
  description: 'View my professional experience and background',
  aliases: ['cv', 'work'],
  suggestions: {
    subcommands: [
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
      }
    ],
    arguments: [
      {
        name: '--full-time-only',
        description: 'Filter to show only full-time positions'
      },
      {
        name: '--consulting-only',
        description: 'Filter to show only consulting engagements'
      },
      {
        name: '--since-year',
        description: 'Show experience since a specific year',
        params: '<year>'
      }
    ]
  },
  handler: async (args: string[]) => {
    try {
      const response = await fetch('./content/resume.json');
      const resumeData: ResumeData = await response.json();

      // Parse arguments
      const { subcommand, filters } = parseResumeArgs(args);
      
      // Filter experience based on arguments
      let filteredExperience = [...resumeData.experience];
      
      if (filters.fullTimeOnly) {
        filteredExperience = filteredExperience.filter(exp => exp.type === 'full-time');
      }
      
      if (filters.consultingOnly) {
        filteredExperience = filteredExperience.filter(exp => exp.type === 'consulting');
      }
      
      if (filters.sinceYear) {
        filteredExperience = filteredExperience.filter(exp => {
          const startYear = parseInt(exp.startDate.split('-')[0]);
          return startYear >= filters.sinceYear!;
        });
      }
      
      // Apply subcommand filtering
      if (subcommand === 'recent') {
        // Filter to show only current (Present) positions or the single most recent one
        const currentPositions = filteredExperience.filter(exp => 
          exp.endDate.toLowerCase() === 'present'
        );
        
        if (currentPositions.length > 0) {
          // If there are current positions, show all of them
          filteredExperience = currentPositions;
        } else {
          // If no current positions, show only the most recent one
          filteredExperience = filteredExperience
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 1);
        }
      }

      const content = document.createElement('div');
      content.className = 'resume-content';
      
      // Generate content based on subcommand
      let contentSections = '';
      
      if (subcommand === 'skills') {
        // Show only skills section
        contentSections = generateSkillsSection(resumeData.skills);
      } else if (subcommand === 'projects') {
        // Show only projects section
        contentSections = generateProjectsSection(resumeData.projects || []);
      } else {
        // Show full resume or filtered sections
        contentSections = `
          ${generateExperienceSection(filteredExperience, subcommand, filters)}
          
          ${subcommand !== 'recent' ? generateSkillsSection(resumeData.skills) : ''}
          
          ${subcommand !== 'recent' ? generateEducationSection(resumeData.education) : ''}
          
          ${generateProjectsSection(resumeData.projects || [])}
        `;
      }

      content.innerHTML = `
        <div class="resume-header brutal-box">
          <h1 class="brutal-heading">${resumeData.name}</h1>
          <h2 class="resume-title">${resumeData.title}</h2>
          <div class="contact-info">
            ${resumeData.contact.email ? `<span>✉ ${resumeData.contact.email}</span>` : ''}
            ${resumeData.contact.phone ? `<span>📞 ${resumeData.contact.phone}</span>` : ''}
            ${resumeData.contact.github ? `<span>🔗 github.com/${resumeData.contact.github}</span>` : ''}
          </div>
          <p class="resume-summary">${resumeData.summary}</p>
        </div>

        ${contentSections}
        
        ${resumeData.meta ? `
          <div class="resume-footer">
            <div class="resume-meta">
              <span class="meta-version">v${resumeData.meta.version}</span>
              <span class="meta-updated">Updated ${resumeData.meta.updated}</span>
            </div>
          </div>
        ` : ''}
        
        ${generateQuickSuggestions(subcommand)}
      `;

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

interface ResumeFilters {
  fullTimeOnly: boolean;
  consultingOnly: boolean;
  sinceYear?: number;
}

interface ParsedArgs {
  subcommand?: string;
  filters: ResumeFilters;
}

function parseResumeArgs(args: string[]): ParsedArgs {
  const filters: ResumeFilters = {
    fullTimeOnly: false,
    consultingOnly: false
  };
  
  let subcommand: string | undefined;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === 'recent') {
      subcommand = 'recent';
    } else if (arg === 'skills') {
      subcommand = 'skills';
    } else if (arg === 'projects') {
      subcommand = 'projects';
    } else if (arg === '--full-time-only') {
      filters.fullTimeOnly = true;
    } else if (arg === '--consulting-only') {
      filters.consultingOnly = true;
    } else if (arg === '--since-year' && i + 1 < args.length) {
      const year = parseInt(args[i + 1]);
      if (!isNaN(year)) {
        filters.sinceYear = year;
        i++; // Skip the next argument since we consumed it
      }
    }
  }
  
  return { subcommand, filters };
}

function generateExperienceSection(experience: any[], subcommand?: string, filters?: ResumeFilters): string {
  if (experience.length === 0) {
    return `<div class="brutal-box"><h2 class="brutal-heading">Experience</h2><p>No experience matches your criteria.</p></div>`;
  }
  
  let sectionTitle = 'Experience';
  if (subcommand === 'recent') {
    sectionTitle = 'Recent Experience';
  } else if (filters?.fullTimeOnly) {
    sectionTitle = 'Full-Time Experience';
  } else if (filters?.consultingOnly) {
    sectionTitle = 'Consulting Experience';
  } else if (filters?.sinceYear) {
    sectionTitle = `Experience Since ${filters.sinceYear}`;
  }
  
  return `
    <div class="experience-section brutal-box">
      <h2 class="brutal-heading">${sectionTitle}</h2>
      ${experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <h3 class="company-name">${exp.company}</h3>
            <span class="experience-type ${exp.type}">${exp.type}</span>
          </div>
          <div class="position-info">
            <h4 class="position-title">${exp.position}</h4>
            ${exp.technologies ? `
              <div class="position-technologies">
                ${exp.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
              </div>
            ` : ''}
            <div class="position-meta">
              <span class="location">${exp.location}</span>
              <span class="dates">${formatDateRange(exp.startDate, exp.endDate)}</span>
            </div>
          </div>
          <ul class="description-list">
            ${exp.description.map((item: string) => `<li>${item}</li>`).join('')}
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
          <h4 class="skill-category">${skillGroup.category}</h4>
          <div class="skill-items">
            ${skillGroup.items.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
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
            <span class="degree">${edu.degree} in ${edu.field}</span>
            <span class="edu-dates">${edu.startDate} - ${edu.endDate}</span>
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
      <h2 class="brutal-heading">Selected Projects</h2>
      ${projects.map(project => `
        <div class="project-item">
          <div class="project-header">
            <h3 class="project-name">${project.name}</h3>
            <div class="project-links">
              ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">Check it out 🡥</a>` : ''}
              ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">📦 GitHub</a>` : ''}
            </div>
          </div>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <ul class="project-details">
            ${project.details.map((detail: string) => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
}

function formatDateRange(startDate: string, endDate: string): string {
  const formatDate = (date: string) => {
    if (date.toLowerCase() === 'present') return 'Present';
    
    // Handle YYYY-MM format
    if (date.includes('-')) {
      const [year, month] = date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    return date;
  };
  
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
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