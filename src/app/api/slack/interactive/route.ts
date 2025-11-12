import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { createHmac } from 'crypto';

// Verify Slack request signature
function verifySlackRequest(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const hmac = createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');
  const baseString = `${version}:${timestamp}:${body}`;
  hmac.update(baseString);
  const expectedHash = hmac.digest('hex');

  return expectedHash === hash;
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-slack-signature') || '';
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';

    // Verify request (in production, also check timestamp freshness)
    if (!verifySlackRequest(body, signature, timestamp)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Handle different Slack event types
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle other interactive events
    // This would typically forward to your Slack Bolt app
    // For now, return success
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Slack interactive event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withApiCheck(handlePOST);
