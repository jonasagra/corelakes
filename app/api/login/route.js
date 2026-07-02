import handler from '../../../lib/handlers/login.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const POST = adapt(handler);
