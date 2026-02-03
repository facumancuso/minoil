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
    
    const collection = db.collection('workorders');
    
    // Step 1: List current indexes
    const indexesBefore = await collection.listIndexes().toArray();
    console.log('Índices antes:', indexesBefore.map(i => i.name));
    
    // Step 2: Delete all documents with null id
    try {
      const deleteResult = await collection.deleteMany({ id: null });
      console.log(`✅ ${deleteResult.deletedCount} documentos con id:null eliminados`);
    } catch (e: any) {
      console.log('⚠️ No se pudieron eliminar documentos:', e.message);
    }
    
    // Step 3: Drop the problematic index
    try {
      await collection.dropIndex('id_1');
      console.log('✅ Índice id_1 eliminado');
    } catch (e: any) {
      if (e.code === 27) { // index not found
        console.log('ℹ️ Índice id_1 no existe');
      } else {
        console.log('⚠️ Error al eliminar índice:', e.message);
      }
    }
    
    // Step 4: Drop all indexes except _id
    try {
      await collection.dropIndexes();
      console.log('✅ Todos los índices eliminados (excepto _id)');
    } catch (e: any) {
      console.log('⚠️ Error al eliminar índices:', e.message);
    }
    
    // Step 5: List indexes after cleanup
    const indexesAfter = await collection.listIndexes().toArray();
    console.log('Índices después:', indexesAfter.map(i => i.name));
    
    return NextResponse.json({ 
      success: true,
      message: 'Limpieza completada',
      indexesBefore: indexesBefore.map(i => i.name),
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

export async function GET(request: NextRequest) {
  return POST(request);
}
