import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { diabetes, hypertension, pregnant, allergies } = body;

    // 1. Session Clean up: delete expired sessions
    try {
      await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (cleanErr) {
      console.error('Error during expired sessions cleanup:', cleanErr);
    }

    // 2. Generate UUID session ID
    const sessionId = crypto.randomUUID();

    // 3. Set session expiration to 2 hours from now
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // 4. Save session in database
    await prisma.session.create({
      data: {
        sessionId,
        hasDiabetes: !!diabetes,
        hasHypertension: !!hypertension,
        isPregnant: !!pregnant,
        allergies: Array.isArray(allergies) ? allergies.join(',') : '',
        expiresAt,
      },
    });

    return NextResponse.json({ session_id: sessionId });
  } catch (error: any) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
