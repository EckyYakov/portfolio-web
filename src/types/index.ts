export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  handler: CommandHandler;
}

export type CommandHandler = (args: string[]) => Promise<CommandResponse>;

export interface CommandResponse {
  content: string | HTMLElement;
  type: 'text' | 'html' | 'markdown';
  persist?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  contact: {
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: {
    category: string;
    items: string[];
  }[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Theme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    accentAlt: string;
    border: string;
    shadow: string;
  };
}