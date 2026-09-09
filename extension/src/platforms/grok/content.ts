import { GrokAdapter } from './adapter';
import { createContentRunner } from '../content-runner';

createContentRunner(new GrokAdapter());