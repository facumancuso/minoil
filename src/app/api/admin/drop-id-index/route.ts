import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    // Get the collection
    const collection = db.collection('workorders');

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes);

    // Drop the id_1 index if it exists
    const idIndex = indexes.find(idx => idx.name === 'id_1');
    if (idIndex) {
      await collection.dropIndex('id_1');
      console.log('✅ Dropped id_1 index');
    }

    // List indexes after drop
    const indexesAfter = await collection.listIndexes().toArray();
    console.log('Indexes after drop:', indexesAfter);

    return NextResponse.json({
      success: true,
      message: 'Index id_1 dropped successfully',
      indexesBefore: indexes.length,
      indexesAfter: indexesAfter.length,
    });
  } catch (error) {
    console.error('Error dropping index:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
