import type { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { clearCommand } from './clear';
import { themeCommand } from './theme';
import { resumeCommand } from './resume';
import { contactCommand } from './contact';
import { playCommand } from './play';

export const commands: Command[] = [
  helpCommand,
  aboutCommand,
  resumeCommand,
  contactCommand,
  playCommand,
  themeCommand,
  clearCommand,
];