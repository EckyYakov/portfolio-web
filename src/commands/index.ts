import type { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { clearCommand } from './clear';
import { themeCommand } from './theme';
import { resumeCommand } from './resume';

export const commands: Command[] = [
  helpCommand,
  aboutCommand,
  resumeCommand,
  clearCommand,
  themeCommand,
];