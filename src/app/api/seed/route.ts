import { NextRequest, NextResponse } from 'next/server';
import { seedDatabaseAction } from '@/app/seed-action';

export async function GET(request: NextRequest) {
    try {
        const res = await seedDatabaseAction();
        return NextResponse.json(res);
    } catch (error) {
        console.error('Error running seed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
