import handler from '../../../lib/handlers/ogImage.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const dynamic = 'force-dynamic';

export const GET = adapt(handler);
