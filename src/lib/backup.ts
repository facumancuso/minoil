import dbConnect from "@/lib/db";
import WorkOrderModel from "@/models/WorkOrder";
import ClientModel from "@/models/Client";
import InventoryItemModel from "@/models/InventoryItem";
import ToolModel from "@/models/Tool";
import { promises as fs } from 'fs';
import path from 'path';

export type BackupData = {
  timestamp: string;
  collections: {
    workOrders: any[];
    clients: any[];
    inventory: any[];
    tools: any[];
  };
  metadata: {
    version: string;
    totalDocuments: number;
  };
};

/**
 * Crea un backup completo de todas las colecciones de MongoDB
 */
export async function createFullBackup(): Promise<BackupData> {
  await dbConnect();

  const [workOrders, clients, inventory, tools] = await Promise.all([
    WorkOrderModel.find({}).lean(),
    ClientModel.find({}).lean(),
    InventoryItemModel.find({}).lean(),
    ToolModel.find({}).lean(),
  ]);

  const backupData: BackupData = {
    timestamp: new Date().toISOString(),
    collections: {
      workOrders,
      clients,
      inventory,
      tools,
    },
    metadata: {
      version: '1.0',
      totalDocuments:
        workOrders.length +
        clients.length +
        inventory.length +
        tools.length,
    },
  };

  return backupData;
}

/**
 * Guarda un backup en el sistema de archivos local
 * En producción, esto guardará en el servidor
 */
export async function saveBackupToFile(backupData: BackupData): Promise<string> {
  const backupDir = path.join(process.cwd(), 'backups');

  // Crear directorio de backups si no existe
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.error('Error creating backup directory:', error);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(backupData, null, 2),
    'utf-8'
  );

  return filepath;
}

/**
 * Obtiene el backup más reciente
 */
export async function getLatestBackup(): Promise<BackupData | null> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      return null;
    }

    const latestFile = path.join(backupDir, backupFiles[0]);
    const content = await fs.readFile(latestFile, 'utf-8');
    return JSON.parse(content) as BackupData;
  } catch (error) {
    console.error('Error reading latest backup:', error);
    return null;
  }
}

/**
 * Lista todos los backups disponibles
 */
export async function listBackups(): Promise<Array<{ filename: string; date: Date; size: number }>> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = await Promise.all(
      files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .map(async (filename) => {
          const filepath = path.join(backupDir, filename);
          const stats = await fs.stat(filepath);
          return {
            filename,
            date: stats.mtime,
            size: stats.size,
          };
        })
    );

    return backupFiles.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Limpia backups antiguos, manteniendo solo los últimos N backups
 */
export async function cleanOldBackups(keepCount: number = 30): Promise<number> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    const backups = await listBackups();

    if (backups.length <= keepCount) {
      return 0;
    }

    const toDelete = backups.slice(keepCount);

    await Promise.all(
      toDelete.map(backup =>
        fs.unlink(path.join(backupDir, backup.filename))
      )
    );

    return toDelete.length;
  } catch (error) {
    console.error('Error cleaning old backups:', error);
    return 0;
  }
}

/**
 * Crea un backup incremental solo con los cambios recientes
 * (útil para reducir tamaño de backups)
 */
export async function createIncrementalBackup(
  collectionName: 'workOrders' | 'clients' | 'inventory' | 'tools',
  documentId: string
): Promise<any> {
  await dbConnect();

  const models = {
    workOrders: WorkOrderModel,
    clients: ClientModel,
    inventory: InventoryItemModel,
    tools: ToolModel,
  };

  const model = models[collectionName];
  const document = await model.findById(documentId).lean();

  const backupData = {
    timestamp: new Date().toISOString(),
    collection: collectionName,
    document,
    type: 'incremental',
  };

  // Guardar backup incremental
  const backupDir = path.join(process.cwd(), 'backups', 'incremental');
  await fs.mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `incremental-${collectionName}-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(backupData, null, 2),
    'utf-8'
  );

  return backupData;
}
