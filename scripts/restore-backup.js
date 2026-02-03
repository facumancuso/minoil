/**
 * Script para restaurar un backup de MongoDB
 *
 * Uso: node scripts/restore-backup.js <ruta-al-archivo-backup.json>
 *
 * ADVERTENCIA: Este script eliminará TODOS los datos existentes en las colecciones
 * y los reemplazará con los datos del backup. Úsalo con precaución.
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

async function restoreBackup(backupFilePath) {
  try {
    console.log('📦 Iniciando restauración de backup...');
    console.log(`📁 Archivo: ${backupFilePath}`);

    // Verificar que el archivo existe
    try {
      await fs.access(backupFilePath);
    } catch (error) {
      throw new Error(`El archivo de backup no existe: ${backupFilePath}`);
    }

    // Leer el archivo de backup
    const backupContent = await fs.readFile(backupFilePath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    console.log(`📅 Fecha del backup: ${backupData.timestamp}`);
    console.log(`📊 Total de documentos: ${backupData.metadata.totalDocuments}`);

    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/minoil_db';
    console.log(`🔌 Conectando a MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;

    // Mapeo de nombres de colecciones en el backup a nombres en la base de datos
    const collectionMapping = {
      workOrders: 'workorders',
      clients: 'clients',
      inventory: 'inventoryitems',
      tools: 'tools',
    };

    // Restaurar cada colección
    for (const [backupCollectionName, dbCollectionName] of Object.entries(collectionMapping)) {
      const documents = backupData.collections[backupCollectionName];

      if (!documents) {
        console.log(`⚠️ Colección ${backupCollectionName} no encontrada en el backup, saltando...`);
        continue;
      }

      console.log(`\n🔄 Restaurando ${backupCollectionName}...`);
      const collection = db.collection(dbCollectionName);

      // Contar documentos existentes
      const existingCount = await collection.countDocuments();
      console.log(`   Documentos existentes: ${existingCount}`);
      console.log(`   Documentos en backup: ${documents.length}`);

      // Eliminar todos los documentos existentes
      if (existingCount > 0) {
        const deleteResult = await collection.deleteMany({});
        console.log(`   🗑️ Eliminados ${deleteResult.deletedCount} documentos existentes`);
      }

      // Insertar documentos del backup
      if (documents.length > 0) {
        // Preparar documentos para inserción
        const documentsToInsert = documents.map(doc => {
          // Crear una copia del documento
          const newDoc = { ...doc };

          // Si el documento tiene un campo id, usarlo como _id
          if (newDoc.id && !newDoc._id) {
            newDoc._id = newDoc.id;
          }

          // Eliminar el campo id duplicado
          delete newDoc.id;

          // Convertir fechas de string a Date
          for (const key in newDoc) {
            if (typeof newDoc[key] === 'string' &&
                (key.includes('Date') || key.includes('At')) &&
                /^\d{4}-\d{2}-\d{2}T/.test(newDoc[key])) {
              newDoc[key] = new Date(newDoc[key]);
            }
          }

          // Procesar arrays anidados con fechas
          if (newDoc.notes && Array.isArray(newDoc.notes)) {
            newDoc.notes = newDoc.notes.map(note => ({
              ...note,
              timestamp: typeof note.timestamp === 'string' ? new Date(note.timestamp) : note.timestamp,
            }));
          }

          return newDoc;
        });

        const insertResult = await collection.insertMany(documentsToInsert, { ordered: false });
        console.log(`   ✅ Insertados ${insertResult.insertedCount} documentos`);
      } else {
        console.log(`   ℹ️ No hay documentos para insertar`);
      }
    }

    console.log('\n✅ ¡Backup restaurado exitosamente!');
    console.log('\n📊 Resumen:');
    for (const [backupCollectionName, dbCollectionName] of Object.entries(collectionMapping)) {
      const collection = db.collection(dbCollectionName);
      const count = await collection.countDocuments();
      console.log(`   ${backupCollectionName}: ${count} documentos`);
    }

  } catch (error) {
    console.error('\n❌ Error al restaurar el backup:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Verificar argumentos
const backupPath = process.argv[2];

if (!backupPath) {
  console.error('❌ Error: Debes proporcionar la ruta al archivo de backup');
  console.log('\nUso:');
  console.log('  node scripts/restore-backup.js <ruta-al-backup.json>');
  console.log('\nEjemplo:');
  console.log('  node scripts/restore-backup.js backups/backup-2026-01-14T10-30-00-000Z.json');
  process.exit(1);
}

// Resolver ruta absoluta
const absolutePath = path.isAbsolute(backupPath)
  ? backupPath
  : path.join(process.cwd(), backupPath);

// Confirmar antes de ejecutar
console.log('\n⚠️  ADVERTENCIA ⚠️');
console.log('Este script eliminará TODOS los datos existentes en la base de datos');
console.log('y los reemplazará con los datos del backup.');
console.log('\nArchivo de backup:', absolutePath);
console.log('\nPresiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');

setTimeout(() => {
  restoreBackup(absolutePath)
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}, 5000);
