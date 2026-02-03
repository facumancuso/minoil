import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'No database connection' }, { status: 500 });
    }
    
    // Drop and recreate the collection
    const collection = db.collection('workorders');
    
    try {
      await collection.drop();
      console.log('✅ Colección workorders eliminada');
    } catch (e: any) {
      console.log('⚠️ No se pudo eliminar colección:', e.message);
    }
    
    // Recreate collection without id index
    await db.createCollection('workorders');
    console.log('✅ Colección workorders recreada');
    
    return NextResponse.json({ 
      success: true,
      message: 'Colección recreada sin índices problemáticos'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
