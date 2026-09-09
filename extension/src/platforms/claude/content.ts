import { ClaudeAdapter } from './adapter';
import { createContentRunner } from '../content-runner';

createContentRunner(new ClaudeAdapter());