import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { SimulationInput } from '@/types/simulation';

// Helper to get authenticated Supabase user or return null
async function getAuthUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

// GET /api/scenarios — List all saved scenarios belonging to the logged-in user
export async function GET() {
  try {
    const user = await getAuthUser();

    // Enforce 401 Unauthorized if no valid user session is present
    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';

    const scenarios = await prisma.scenario.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(scenarios);
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user scenarios from database' },
      { status: 500 }
    );
  }
}

// POST /api/scenarios — Create a new scenario tied to the logged-in user ID
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';
    const body = await request.json();
    const { title, data } = body as { title?: string; data: SimulationInput };

    if (!data) {
      return NextResponse.json({ error: 'Missing simulation data payload' }, { status: 400 });
    }

    const scenarioTitle = title || data.scenarioName || 'Untitled Scenario';

    const newScenario = await prisma.scenario.create({
      data: {
        title: scenarioTitle,
        userId: userId,
        data: data as any,
      },
    });

    return NextResponse.json(newScenario, { status: 201 });
  } catch (error: any) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario in database' },
      { status: 500 }
    );
  }
}
