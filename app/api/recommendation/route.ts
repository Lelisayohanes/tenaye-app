import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateDish } from '@/lib/nutrition';
import { generateRecommendation } from '@/lib/groq';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id query parameter.' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired.' }, { status: 404 });
    }

    // Retrieve all dishes
    const dishes = await prisma.dish.findMany();

    // Filter to only safe dishes
    const safeDishes = dishes.filter((dish) => {
      const { status } = evaluateDish(dish, session);
      return status === 'safe';
    });

    // Call Groq recommendation engine
    const recommendation = await generateRecommendation(session, safeDishes);

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
