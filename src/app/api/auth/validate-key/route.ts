export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { validateInviteKey } from '@/lib/auth/invite-keys';

export async function POST(req: NextRequest) {
  try {
    const { inviteKey } = await req.json();
    
    const result = await validateInviteKey(inviteKey);
    
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error validating key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
