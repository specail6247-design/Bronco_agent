export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { bootstrapUser } from '@/lib/auth/owner-bootstrap';
import { validateInviteKey, consumeInviteKey } from '@/lib/auth/invite-keys';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, name, inviteKey } = await req.json();

    // 1. Validate Invite Key again (security double-check)
    const keyValidation = await validateInviteKey(inviteKey);
    if (!keyValidation.valid || !keyValidation.key) {
      return NextResponse.json({ error: keyValidation.error }, { status: 400 });
    }

    // 2. Bootstrap User (assign role & agents)
    const user = await bootstrapUser(
      userId, 
      email, 
      name, 
      keyValidation.key.id,
      keyValidation.key.allowedAgents,
      // For expiry, we need to calculate it based on key config
      // But for simplicity in bootstrapUser we passed date directly or calculated it
      // Let's rely on bootstrap logic handling OWNER vs MEMBER
    );

    // 3. Consume Invite Key
    await consumeInviteKey(keyValidation.key.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
