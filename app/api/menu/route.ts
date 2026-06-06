import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateDish } from '@/lib/nutrition';
import { Dish } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    let session = null;
    if (sessionId) {
      session = await prisma.session.findUnique({
        where: { sessionId },
      });
    }

    // If no session is found, create an empty default session for rules evaluation
    if (!session) {
      session = {
        id: 0,
        sessionId: '',
        hasDiabetes: false,
        hasHypertension: false,
        isPregnant: false,
        allergies: '',
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };
    }

    // Fetch all dishes
    const dishes = await prisma.dish.findMany();

    // Evaluate suitability
    const evaluated = dishes.map((dish: Dish) => {
      const { status, reason } = evaluateDish(dish, session as any);
      return {
        name: dish.nameEn,
        status,
        reason,
      };
    });

    return NextResponse.json(evaluated);
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
