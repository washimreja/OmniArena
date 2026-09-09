import { GeminiAdapter } from './adapter';
import { createContentRunner } from '../content-runner';

createContentRunner(new GeminiAdapter());