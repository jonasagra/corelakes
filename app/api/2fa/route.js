import handler from '../../../lib/handlers/twofa.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const POST = adapt(handler);
