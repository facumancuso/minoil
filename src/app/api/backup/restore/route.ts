import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkOrderModel from '@/models/WorkOrder';
import ClientModel from '@/models/Client';
import InventoryItemModel from '@/models/InventoryItem';
import ToolModel from '@/models/Tool';
import mongoose from 'mongoose';

/**
 * POST /api/backup/restore
 * Restaura un backup completo de la base de datos
 * ADVERTENCIA: Esto eliminará todos los datos existentes
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📦 Iniciando restauración de backup...');

    // Leer el backup del body
    const backupData = await request.json();

    if (!backupData || !backupData.collections) {
      return NextResponse.json(
        { success: false, error: 'Formato de backup inválido' },
        { status: 400 }
      );
    }

    console.log(`📅 Fecha del backup: ${backupData.timestamp}`);
    console.log(`📊 Total de documentos: ${backupData.metadata?.totalDocuments || 'desconocido'}`);

    // Conectar a MongoDB
    await dbConnect();

    const models = {
      workOrders: WorkOrderModel,
      clients: ClientModel,
      inventory: InventoryItemModel,
      tools: ToolModel,
    };

    const results: any = {
      restored: {},
      errors: [],
    };

    // Restaurar cada colección
    for (const [collectionName, Model] of Object.entries(models)) {
      try {
        const documents = backupData.collections[collectionName];

        if (!documents || !Array.isArray(documents)) {
          console.log(`⚠️ Colección ${collectionName} no encontrada en el backup, saltando...`);
          continue;
        }

        console.log(`\n🔄 Restaurando ${collectionName}...`);
        console.log(`   Documentos en backup: ${documents.length}`);

        // Contar documentos existentes
        const existingCount = await Model.countDocuments();
        console.log(`   Documentos existentes: ${existingCount}`);

        // Eliminar todos los documentos existentes
        if (existingCount > 0) {
          await Model.deleteMany({});
          console.log(`   🗑️ Eliminados ${existingCount} documentos existentes`);
        }

        // Preparar documentos para inserción
        if (documents.length > 0) {
          const documentsToInsert = documents.map((doc: any) => {
            const newDoc = { ...doc };

            // Manejar el campo _id
            if (newDoc.id && !newDoc._id) {
              // Validar que sea un ObjectId válido
              if (mongoose.Types.ObjectId.isValid(newDoc.id)) {
                newDoc._id = new mongoose.Types.ObjectId(newDoc.id);
              }
            } else if (newDoc._id && typeof newDoc._id === 'string') {
              if (mongoose.Types.ObjectId.isValid(newDoc._id)) {
                newDoc._id = new mongoose.Types.ObjectId(newDoc._id);
              }
            }

            // Eliminar el campo id duplicado
            delete newDoc.id;

            // Convertir fechas de string a Date
            for (const key in newDoc) {
              if (
                typeof newDoc[key] === 'string' &&
                (key.includes('Date') || key.includes('At') || key === 'timestamp') &&
                /^\d{4}-\d{2}-\d{2}T/.test(newDoc[key])
              ) {
                newDoc[key] = new Date(newDoc[key]);
              }
            }

            // Procesar arrays anidados con fechas
            if (newDoc.notes && Array.isArray(newDoc.notes)) {
              newDoc.notes = newDoc.notes.map((note: any) => ({
                ...note,
                timestamp:
                  typeof note.timestamp === 'string'
                    ? new Date(note.timestamp)
                    : note.timestamp,
              }));
            }

            return newDoc;
          });

          // Insertar documentos
          const inserted = await Model.insertMany(documentsToInsert, {
            ordered: false,
          });

          console.log(`   ✅ Insertados ${inserted.length} documentos`);
          results.restored[collectionName] = inserted.length;
        } else {
          console.log(`   ℹ️ No hay documentos para insertar`);
          results.restored[collectionName] = 0;
        }
      } catch (error: any) {
        console.error(`❌ Error restaurando ${collectionName}:`, error.message);
        results.errors.push({
          collection: collectionName,
          error: error.message,
        });
      }
    }

    console.log('\n✅ Restauración completada');

    // Verificar cantidades finales
    const finalCounts: any = {};
    for (const [collectionName, Model] of Object.entries(models)) {
      finalCounts[collectionName] = await Model.countDocuments();
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado exitosamente',
      restored: results.restored,
      finalCounts,
      errors: results.errors.length > 0 ? results.errors : undefined,
      backupTimestamp: backupData.timestamp,
    });
  } catch (error: any) {
    console.error('❌ Error restaurando backup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al restaurar el backup',
      },
      { status: 500 }
    );
  }
}
