import { NextRequest, NextResponse } from 'next/server';
import { createFullBackup, saveBackupToFile, cleanOldBackups } from '@/lib/backup';

/**
 * POST /api/backup/create
 * Crea un backup completo de la base de datos
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating full backup...');

    // Crear backup
    const backupData = await createFullBackup();

    // Guardar en archivo
    const filepath = await saveBackupToFile(backupData);

    // Limpiar backups antiguos (mantener últimos 30)
    const deletedCount = await cleanOldBackups(30);

    console.log(`✅ Backup created successfully at: ${filepath}`);
    if (deletedCount > 0) {
      console.log(`🗑️ Cleaned ${deletedCount} old backups`);
    }

    return NextResponse.json({
      success: true,
      filepath,
      metadata: backupData.metadata,
      timestamp: backupData.timestamp,
      deletedOldBackups: deletedCount,
    });
  } catch (error: any) {
    console.error('❌ Error creating backup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create backup'
      },
      { status: 500 }
    );
  }
}
