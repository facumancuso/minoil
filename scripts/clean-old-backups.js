/**
 * Script para limpiar backups antiguos
 *
 * Uso: node scripts/clean-old-backups.js [opciones]
 *
 * Opciones:
 *   --keep=N           Mantener los últimos N backups completos (por defecto: 30)
 *   --incremental      Limpiar también backups incrementales
 *   --days=N           Eliminar backups incrementales más antiguos que N días
 *   --dry-run          Mostrar qué se eliminaría sin eliminarlo realmente
 */

const fs = require('fs').promises;
const path = require('path');

// Parsear argumentos
const args = process.argv.slice(2);
const options = {
  keep: 30,
  incremental: false,
  days: 7,
  dryRun: false,
};

args.forEach(arg => {
  if (arg.startsWith('--keep=')) {
    options.keep = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--incremental') {
    options.incremental = true;
  } else if (arg.startsWith('--days=')) {
    options.days = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  }
});

async function getFileStats(dir, filename) {
  const filepath = path.join(dir, filename);
  const stats = await fs.stat(filepath);
  return {
    filename,
    filepath,
    date: stats.mtime,
    size: stats.size,
  };
}

async function cleanFullBackups(backupDir, keep, dryRun) {
  console.log('\n📦 Limpiando backups completos...');
  console.log(`   Mantener últimos ${keep} backups`);

  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

    if (backupFiles.length === 0) {
      console.log('   ℹ️ No se encontraron backups completos');
      return 0;
    }

    // Obtener información de archivos
    const fileStats = await Promise.all(
      backupFiles.map(f => getFileStats(backupDir, f))
    );

    // Ordenar por fecha (más recientes primero)
    fileStats.sort((a, b) => b.date.getTime() - a.date.getTime());

    console.log(`   Total de backups: ${fileStats.length}`);

    if (fileStats.length <= keep) {
      console.log(`   ✅ No hay backups para eliminar`);
      return 0;
    }

    // Archivos a eliminar
    const toDelete = fileStats.slice(keep);

    console.log(`   🗑️ Backups a eliminar: ${toDelete.length}`);

    if (dryRun) {
      console.log('\n   📋 Archivos que se eliminarían (--dry-run):');
      toDelete.forEach(file => {
        const age = Math.floor((Date.now() - file.date.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`      - ${file.filename} (${age} días, ${formatBytes(file.size)})`);
      });
      return toDelete.length;
    }

    // Eliminar archivos
    let deleted = 0;
    for (const file of toDelete) {
      try {
        await fs.unlink(file.filepath);
        deleted++;
        console.log(`      ✅ Eliminado: ${file.filename}`);
      } catch (error) {
        console.error(`      ❌ Error eliminando ${file.filename}:`, error.message);
      }
    }

    console.log(`   ✅ Eliminados ${deleted} backups completos`);
    return deleted;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return 0;
  }
}

async function cleanIncrementalBackups(incrementalDir, days, dryRun) {
  console.log('\n📦 Limpiando backups incrementales...');
  console.log(`   Eliminar backups más antiguos que ${days} días`);

  try {
    const files = await fs.readdir(incrementalDir);
    const incrementalFiles = files.filter(f => f.startsWith('incremental-') && f.endsWith('.json'));

    if (incrementalFiles.length === 0) {
      console.log('   ℹ️ No se encontraron backups incrementales');
      return 0;
    }

    // Obtener información de archivos
    const fileStats = await Promise.all(
      incrementalFiles.map(f => getFileStats(incrementalDir, f))
    );

    console.log(`   Total de backups incrementales: ${fileStats.length}`);

    // Calcular fecha límite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filtrar archivos antiguos
    const toDelete = fileStats.filter(file => file.date < cutoffDate);

    if (toDelete.length === 0) {
      console.log(`   ✅ No hay backups incrementales para eliminar`);
      return 0;
    }

    console.log(`   🗑️ Backups incrementales a eliminar: ${toDelete.length}`);

    if (dryRun) {
      console.log('\n   📋 Archivos que se eliminarían (--dry-run):');
      toDelete.forEach(file => {
        const age = Math.floor((Date.now() - file.date.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`      - ${file.filename} (${age} días, ${formatBytes(file.size)})`);
      });
      return toDelete.length;
    }

    // Eliminar archivos
    let deleted = 0;
    for (const file of toDelete) {
      try {
        await fs.unlink(file.filepath);
        deleted++;
      } catch (error) {
        console.error(`      ❌ Error eliminando ${file.filename}:`, error.message);
      }
    }

    console.log(`   ✅ Eliminados ${deleted} backups incrementales`);
    return deleted;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   ℹ️ El directorio de backups incrementales no existe');
      return 0;
    }
    console.error('   ❌ Error:', error.message);
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function main() {
  console.log('🧹 Limpieza de Backups');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (options.dryRun) {
    console.log('⚠️  Modo DRY RUN: No se eliminará ningún archivo\n');
  }

  console.log('Opciones:');
  console.log(`  Mantener backups completos: ${options.keep}`);
  console.log(`  Limpiar incrementales: ${options.incremental ? 'Sí' : 'No'}`);
  if (options.incremental) {
    console.log(`  Eliminar incrementales más antiguos que: ${options.days} días`);
  }

  const backupDir = path.join(process.cwd(), 'backups');
  const incrementalDir = path.join(backupDir, 'incremental');

  let totalDeleted = 0;

  // Limpiar backups completos
  totalDeleted += await cleanFullBackups(backupDir, options.keep, options.dryRun);

  // Limpiar backups incrementales si se solicitó
  if (options.incremental) {
    totalDeleted += await cleanIncrementalBackups(incrementalDir, options.days, options.dryRun);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (options.dryRun) {
    console.log(`\n📊 Se eliminarían ${totalDeleted} archivos en total`);
    console.log('\nEjecuta sin --dry-run para eliminar los archivos realmente.');
  } else {
    console.log(`\n✅ Limpieza completada. Eliminados ${totalDeleted} archivos en total`);
  }
}

main().catch(console.error);
