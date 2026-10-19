import { main } from '../play-random-game.js';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Serverless invocations must be finite. Run one synchronized round over
    // all configured games and wait for it to finish before responding.
    await main({ gameCount: 1, headless: true });
    return Response.json({ ok: true, completedRounds: 1 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Automation failed' },
      { status: 500 },
    );
  }
}

export const POST = GET;
