import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const users = await UserModel.find({});
        console.log('📋 Usuarios en la BD:', users.map(u => ({ email: u.email, name: u.name })));
        
        return NextResponse.json({
            success: true,
            count: users.length,
            users: users.map(u => ({ email: u.email, name: u.name, role: u.role }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
