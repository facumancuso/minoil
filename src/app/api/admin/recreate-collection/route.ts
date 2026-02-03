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
    
    // Step 1: Get all documents before dropping
    const collection = db.collection('workorders');
    const allDocs = await collection.find({}).toArray();
    console.log(`📋 ${allDocs.length} documentos encontrados`);
    
    // Step 2: Backup data to another collection
    if (allDocs.length > 0) {
      const backupCollection = db.collection('workorders_backup');
      try {
        await backupCollection.deleteMany({});
        await backupCollection.insertMany(allDocs);
        console.log('✅ Documentos respaldados');
      } catch (e: any) {
        console.log('⚠️ Error al respaldar:', e.message);
      }
    }
    
    // Step 3: Drop collection completely
    try {
      await collection.drop();
      console.log('✅ Colección workorders eliminada');
    } catch (e: any) {
      console.log('⚠️ No se pudo eliminar colección:', e.message);
    }
    
    // Step 4: Verify collection is gone
    const collections = await db.listCollections().toArray();
    const hasWorkorders = collections.some(c => c.name === 'workorders');
    console.log('✅ Colección workorders existe:', hasWorkorders);
    
    // Step 5: Recreate collection
    await db.createCollection('workorders');
    console.log('✅ Colección workorders recreada');
    
    return NextResponse.json({ 
      success: true,
      message: 'Colección completamente recreada sin índices problemáticos',
      documentosRespaldados: allDocs.length
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
