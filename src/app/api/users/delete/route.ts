import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        await UserModel.deleteMany({});
        console.log('🗑️ Todos los usuarios fueron eliminados');
        
        return NextResponse.json({
            success: true,
            message: 'Usuarios eliminados'
        });
    } catch (error) {
        console.error('Error deleting users:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
