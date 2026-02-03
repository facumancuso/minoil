import { NextRequest, NextResponse } from 'next/server';
import { listBackups } from '@/lib/backup';

/**
 * GET /api/backup/list
 * Lista todos los backups disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const backups = await listBackups();

    return NextResponse.json({
      success: true,
      backups: backups.map(b => ({
        filename: b.filename,
        date: b.date.toISOString(),
        size: b.size,
        sizeFormatted: formatBytes(b.size),
      })),
      total: backups.length,
    });
  } catch (error: any) {
    console.error('❌ Error listing backups:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to list backups'
      },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
