import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      return NextResponse.json(
        { error: 'MONGODB_URI not configured' },
        { status: 500 }
      );
    }

    // Use MongoDB connection from Mongoose
    const { MongoClient } = await import('mongodb' as any);
    const client = new MongoClient(mongoUrl);
    
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('workorders');

      console.log('Starting database cleanup...');

      // Step 1: Get current indexes
      const indexesBefore = await collection.listIndexes().toArray();
      console.log('Indexes before:', indexesBefore.map((i: any) => ({ name: i.name, key: i.key })));

      // Step 2: Drop all non-_id indexes
      const droppedIndexes: string[] = [];
      for (const index of indexesBefore) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
            droppedIndexes.push(index.name);
            console.log(`✅ Dropped index: ${index.name}`);
          } catch (err: any) {
            console.log(`Note: Could not drop ${index.name}: ${err.message}`);
          }
        }
      }

      // Step 3: Delete documents with null id field
      const deleteResult = await collection.deleteMany({ id: null });
      console.log(`Deleted ${deleteResult.deletedCount} documents with null id`);

      // Step 4: Verify indexes after
      const indexesAfter = await collection.listIndexes().toArray();
      console.log('Indexes after:', indexesAfter.map((i: any) => i.name));

      // Step 5: Count remaining documents
      const count = await collection.countDocuments();

      return NextResponse.json({
        success: true,
        message: 'Database cleanup completed',
        droppedIndexes,
        deletedDocumentsWithNullId: deleteResult.deletedCount,
        documentCount: count,
        indexesDropped: droppedIndexes.length,
        indexesRemaining: indexesAfter.length,
      });
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error('Error in cleanup:', error);
    return NextResponse.json(
      { error: error.message || String(error), stack: error.stack },
      { status: 500 }
    );
  }
}

