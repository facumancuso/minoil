import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'No database connection' }, { status: 500 });
    }
    
    const collection = db.collection('workorders');
    
    // Get all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Índices actuales:', indexes.map(i => i.name));
    
    // Try to drop id_1 index
    let result = { dropped: false, message: '' };
    try {
      await collection.dropIndex('id_1');
      result = { dropped: true, message: 'Índice id_1 eliminado exitosamente' };
      console.log('✅ Índice id_1 eliminado');
    } catch (e: any) {
      result = { dropped: false, message: `No se pudo eliminar: ${e.message}` };
      console.log('⚠️ No se pudo eliminar id_1:', e.message);
    }
    
    // List indexes again
    const indexesAfter = await collection.listIndexes().toArray();
    console.log('Índices después:', indexesAfter.map(i => i.name));
    
    return NextResponse.json({ 
      success: true,
      result,
      indexesBefore: indexes.map(i => i.name),
      indexesAfter: indexesAfter.map(i => i.name)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
