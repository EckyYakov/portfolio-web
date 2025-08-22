export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  handler: CommandHandler;
  suggestions?: CommandSuggestions;
}

export interface CommandSuggestions {
  subcommands?: SuggestionItem[];
  arguments?: SuggestionItem[];
}

export interface SuggestionItem {
  name: string;
  description: string;
  params?: string; // e.g., "<year>" for --since-year
}

export interface AutocompleteSuggestion {
  command: string;
  description: string;
  displayText: string; // e.g., "--since-year <year>"
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

// JSON Resume Standard Types
export interface ResumeData {
  $schema?: string;
  basics: BasicsInfo;
  work: WorkExperience[];
  education: EducationItem[];
  projects?: ProjectItem[];
  skills: SkillGroup[];
}

export interface BasicsInfo {
  name: string;
  label: string;
  email?: string;
  phone?: string;
  url?: string;
  summary: string;
  location?: Location;
  profiles?: Profile[];
}

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface WorkExperience {
  name: string;
  position: string;
  location?: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  highlights: string[];
  keywords?: string[];
  type?: string; // Custom field for full-time/consulting distinction
}

export interface EducationItem {
  institution: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface SkillGroup {
  name: string;
  level?: string;
  keywords: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
  // Legacy fields for backward compatibility in display
  technologies?: string[];
  details?: string[];
  github?: string;
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