import handler from '../../../lib/handlers/categories.js';
import { adapt } from '../../../lib/routeAdapter.js';

export const dynamic = 'force-dynamic';

const route = adapt(handler);

export { route as GET, route as POST, route as PUT, route as DELETE };
