import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

async function fixIndexes() {
  try {
    await dbConnect();
    
    const db = mongoose.connection.db;
    const collection = db!.collection('workorders');
    
    // Get all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Índices actuales:', indexes.map(i => i.name));
    
    // Try to drop id_1 index
    try {
      await collection.dropIndex('id_1');
      console.log('✅ Índice id_1 eliminado');
    } catch (e: any) {
      console.log('⚠️ No se pudo eliminar id_1:', e.message);
    }
    
    // List indexes again
    const indexesAfter = await collection.listIndexes().toArray();
    console.log('Índices después:', indexesAfter.map(i => i.name));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndexes();
