import type { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { clearCommand } from './clear';
import { themeCommand } from './theme';

export const commands: Command[] = [
  helpCommand,
  aboutCommand,
  clearCommand,
  themeCommand,
];