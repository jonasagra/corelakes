import handler from '../../../lib/handlers/posts.js';
import { adapt } from '../../../lib/routeAdapter.js';

// Lê cookie/query em cada request — nunca cachear.
export const dynamic = 'force-dynamic';

const route = adapt(handler);

export { route as GET, route as POST, route as PUT, route as DELETE };
