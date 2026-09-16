import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { SimulationInput } from '@/types/simulation';

interface Params {
  params: {
    id: string;
  };
}

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

// GET /api/scenarios/:id — Get single scenario owned by authenticated user
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser();

    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';
    const { id } = params;

    const scenario = await prisma.scenario.findFirst({
      where: { id, userId },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    return NextResponse.json(scenario);
  } catch (error: any) {
    console.error(`Error fetching scenario ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch scenario from database' },
      { status: 500 }
    );
  }
}

// PUT /api/scenarios/:id — Update a scenario owned by authenticated user
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser();

    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';
    const { id } = params;
    const body = await request.json();
    const { title, data } = body as { title?: string; data?: SimulationInput };

    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (data !== undefined) {
      updatePayload.data = data;
      if (!title && data.scenarioName) {
        updatePayload.title = data.scenarioName;
      }
    }

    const updated = await prisma.scenario.updateMany({
      where: { id, userId },
      data: updatePayload,
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Scenario not found or access denied' }, { status: 404 });
    }

    const result = await prisma.scenario.findUnique({ where: { id } });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error updating scenario ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update scenario in database' },
      { status: 500 }
    );
  }
}

// DELETE /api/scenarios/:id — Delete a scenario owned by authenticated user
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser();

    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';
    const { id } = params;

    const deleted = await prisma.scenario.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Scenario not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error(`Error deleting scenario ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete scenario from database' },
      { status: 500 }
    );
  }
}
