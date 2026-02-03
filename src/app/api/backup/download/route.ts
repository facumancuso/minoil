import { NextRequest, NextResponse } from 'next/server';
import { createFullBackup } from '@/lib/backup';

/**
 * GET /api/backup/download
 * Descarga un backup completo de la base de datos en formato JSON
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Generating backup for download...');

    // Crear backup
    const backupData = await createFullBackup();

    // Convertir a JSON
    const jsonContent = JSON.stringify(backupData, null, 2);

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `minoil-backup-${timestamp}.json`;

    // Retornar como descarga
    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating backup for download:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate backup'
      },
      { status: 500 }
    );
  }
}
