import handler from '../../../lib/handlers/logout.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const POST = adapt(handler);
