import { ChatGPTAdapter } from './adapter';
import { createContentRunner } from '../content-runner';

createContentRunner(new ChatGPTAdapter());