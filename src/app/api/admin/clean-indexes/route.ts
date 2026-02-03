import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const collection = db.collection('workorders');

    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(c => c.name === 'workorders');

    if (!collectionExists) {
      return NextResponse.json({
        success: true,
        message: 'Collection does not exist, nothing to clean',
      });
    }

    // Get indexes before
    const indexesBefore = await collection.listIndexes().toArray();
    console.log('Indexes before:', indexesBefore.map(i => i.name));

    // Drop all non-default indexes
    for (const index of indexesBefore) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (err) {
          console.error(`Failed to drop index ${index.name}:`, err);
        }
      }
    }

    // Get indexes after
    const indexesAfter = await collection.listIndexes().toArray();
    console.log('Indexes after:', indexesAfter.map(i => i.name));

    return NextResponse.json({
      success: true,
      message: 'All non-default indexes dropped',
      indexesBefore: indexesBefore.map(i => i.name),
      indexesAfter: indexesAfter.map(i => i.name),
    });
  } catch (error) {
    console.error('Error cleaning indexes:', error);
    return NextResponse.json(
      { error: String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
