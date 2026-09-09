import { DeepSeekAdapter } from './adapter';
import { createContentRunner } from '../content-runner';

createContentRunner(new DeepSeekAdapter());