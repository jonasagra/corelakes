import handler from '../../../lib/handlers/me.js';
import { adapt } from '../../../lib/routeAdapter.js';

// Depende do cookie de sessão em cada request — nunca cachear.
export const dynamic = 'force-dynamic';

export const GET = adapt(handler);
