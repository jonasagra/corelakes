import handler from '../../../lib/handlers/newsSitemap.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const dynamic = 'force-dynamic';

export const GET = adapt(handler);
