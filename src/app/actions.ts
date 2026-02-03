"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import WorkOrderModel from "@/models/WorkOrder";
import ClientModel from "@/models/Client";
import InventoryItemModel from "@/models/InventoryItem";
import ToolModel from "@/models/Tool";
import { WorkOrder, Client, InventoryItem, Tool } from "@/lib/types";
import { createIncrementalBackup } from "@/lib/backup";

// Helper to ensure DB connection
async function connect() {
  await dbConnect();
}

// Helper to trigger backup in background (non-blocking)
function triggerBackup(
  collectionName: 'workOrders' | 'clients' | 'inventory' | 'tools',
  documentId: string,
  operation: 'create' | 'update' | 'delete'
) {
  // Execute backup in background without blocking the main operation
  // Using Promise without await to not block the main operation
  Promise.resolve().then(async () => {
    try {
      if (operation === 'delete') {
        console.log(`🗑️ Skipping backup for deleted document: ${collectionName}/${documentId}`);
        return;
      }

      console.log(`📦 Creating incremental backup for ${collectionName}/${documentId}...`);
      await createIncrementalBackup(collectionName, documentId);
      console.log(`✅ Backup created for ${collectionName}/${documentId}`);
    } catch (error) {
      console.error(`❌ Error creating backup for ${collectionName}/${documentId}:`, error);
      // Don't throw error - backup failure should not affect main operation
    }
  }).catch(err => {
    console.error(`❌ Fatal backup error for ${collectionName}/${documentId}:`, err);
  });
}

// Helper to serialize document with id mapping - deeply serializes to remove all Mongoose methods
function serializeDoc(doc: any): any {
  if (!doc) return null;
  
  // Step 1: Convert to plain object
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Step 2: Manually construct a clean object recursively
  const clean = cleanObject(obj);
  
  // Step 3: Ensure id field exists
  if (!clean.id && clean._id) {
    clean.id = typeof clean._id === 'string' ? clean._id : clean._id?.toString?.();
  }
  
  return clean;
}

function cleanObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // Handle primitives
  if (typeof obj !== 'object') return obj;
  
  // Handle Dates
  if (obj instanceof Date) return obj.toISOString();
  
  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }
  
  // Handle plain objects - create new object without methods
  const cleaned: any = {};
  for (const key in obj) {
    if (key === '_id') continue; // Skip _id field
    if (key === '__v') continue; // Skip __v field
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      cleaned[key] = cleanObject(value);
    }
  }
  
  return cleaned;
}

/**
 * WORK ORDERS
 */

export async function addWorkOrderAction(formData: Omit<WorkOrder, 'id'> & { orderNumber: string } & { estimatedEvaluationStartDate?: string }) {
  try {
    await connect();
    console.log("📝 Creating new work order with data:", formData);

    const { orderNumber, _id, id, ...restOfData } = formData;

    const newOrderData = {
      orderNumber,
      ...restOfData,
      status: 'Espera de Desarme y Evaluación',
      progress: 5,
      createdAt: formData.createdAt ? new Date(formData.createdAt) : new Date(),
      updatedAt: new Date(),
      estimatedEvaluationStartDate: formData.estimatedEvaluationStartDate ? new Date(formData.estimatedEvaluationStartDate) : undefined,
      notes: [{
        status: 'Espera de Desarme y Evaluación',
        note: 'Orden creada en el sistema.',
        timestamp: new Date(),
        user: 'system',
      }],
      spareParts: restOfData.spareParts || [],
    };

    const newOrder = await WorkOrderModel.create(newOrderData);
    const safeOrder = serializeDoc(newOrder);

    console.log("✅ Work order created with orderNumber:", safeOrder.orderNumber, "and ID:", safeOrder.id);

    // Trigger automatic backup (non-blocking, error-safe)
    try {
      triggerBackup('workOrders', safeOrder.id, 'create');
    } catch (backupError) {
      console.error('⚠️ Backup failed but operation succeeded:', backupError);
    }

    revalidatePath('/');
    revalidatePath('/admin/work-orders');

    return {
      success: true,
      newOrder: safeOrder as WorkOrder
    };
  } catch (error) {
    console.error("❌ Error adding/updating work order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al crear la orden"
    };
  }
}

export async function updateWorkOrderAction(
  orderId: string,
  formData: Partial<WorkOrder> & { updateDate?: string; supplierQuotationDate?: string | Date },
  noteText?: string
) {
  try {
    await connect();
    console.log("📝 Updating work order:", orderId, "with data:", formData);

    const updateData: any = {
      ...formData,
      updatedAt: new Date()
    };

    const dateFields = [
      'evaluationEstimatedEndDate', 'evaluationStartDate', 'evaluationEndDate',
      'clientQuotationDate', 'supplierQuotationDate',
      'assemblyStartDate', 'assemblyEstimatedEndDate', 'assemblyEndDate',
      'deliveryDate', 'updateDate'
    ];

    dateFields.forEach(field => {
      // @ts-ignore
      if (typeof updateData[field] === 'string') {
        // @ts-ignore
        updateData[field] = new Date(updateData[field]);
      }
    });

    if (noteText && noteText.trim()) {
      const newNote = {
        status: formData.status,
        note: noteText,
        timestamp: new Date(),
        user: 'system',
      };
      // @ts-ignore
      updateData.$push = { notes: newNote };
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedOrder = await WorkOrderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      throw new Error(`Work order with ID ${orderId} not found`);
    }

    console.log("✅ Work order updated successfully");

    // Trigger automatic backup (non-blocking, error-safe)
    try {
      triggerBackup('workOrders', orderId, 'update');
    } catch (backupError) {
      console.error('⚠️ Backup failed but operation succeeded:', backupError);
    }

    revalidatePath('/');
    revalidatePath('/admin/work-orders');
    revalidatePath('/admin/history');
    revalidatePath('/admin/gantt');
    revalidatePath('/admin/statistics');

    return { success: true, orderId };
  } catch (error) {
    console.error("❌ Error updating work order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al actualizar la orden"
    };
  }
}

export async function deleteWorkOrderAction(orderId: string) {
  try {
    await connect();
    console.log(`🗑️ Deleting work order with ID: ${orderId}`);
    await WorkOrderModel.findByIdAndDelete(orderId);
    console.log(`✅ Work order ${orderId} deleted successfully.`);

    revalidatePath('/');
    revalidatePath('/admin/work-orders');
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting work order ${orderId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al eliminar la orden",
    };
  }
}

export async function getWorkOrdersAction() {
  try {
    await connect();
    const orders = await WorkOrderModel.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
}

export async function getWorkOrderAction(id: string) {
  try {
    await connect();
    const order = await WorkOrderModel.findById(id);
    if (!order) return null;
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Error fetching work order:", error);
    return null;
  }
}

/**
 * CLIENTS
 */

export async function addOrUpdateClientAction(client: Omit<Client, 'id'> & { id?: string }) {
  try {
    await connect();

    // Verificar si es actualización: el id debe existir Y ser un ObjectId válido de MongoDB
    const isValidMongoId = client.id && /^[0-9a-fA-F]{24}$/.test(client.id);
    const isUpdate = !!isValidMongoId;

    console.log(`📝 Saving client: ${client.name} ${isValidMongoId ? `(updating ID: ${client.id})` : '(creating new)'}`);

    let savedClient;

    if (isUpdate) {
      // Obtener el cliente anterior para comparar el nombre
      const oldClient = await ClientModel.findById(client.id);

      // Es una actualización de un cliente existente
      const { id, ...clientData } = client;
      savedClient = await ClientModel.findByIdAndUpdate(client.id, clientData, { new: true });

      // Si cambió el nombre del cliente, actualizar todas las órdenes de trabajo
      if (oldClient && oldClient.name !== client.name) {
        console.log(`🔄 Updating client name in work orders: "${oldClient.name}" → "${client.name}"`);

        const updateResult = await WorkOrderModel.updateMany(
          { clientId: client.id },
          { $set: { client: client.name } }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} work order(s) with new client name`);

        // Revalidar la página de órdenes de trabajo también
        revalidatePath('/admin/work-orders');
      }
    } else {
      // Es un nuevo cliente - eliminar el id UUID si existe
      const { id, ...clientData } = client;
      savedClient = await ClientModel.create(clientData);
    }

    const clientId = savedClient._id.toString();

    // Trigger automatic backup (non-blocking, error-safe)
    try {
      triggerBackup('clients', clientId, isUpdate ? 'update' : 'create');
    } catch (backupError) {
      console.error('⚠️ Backup failed but operation succeeded:', backupError);
    }

    revalidatePath('/admin/clients');
    return {
      success: true,
      client: JSON.parse(JSON.stringify(savedClient))
    };
  } catch (error) {
    console.error("❌ Error adding/updating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al guardar el cliente"
    };
  }
}

export async function getClientsAction() {
  try {
    await connect();
    const clients = await ClientModel.find({});
    return JSON.parse(JSON.stringify(clients));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

/**
 * INVENTORY & TOOLS
 */

export async function getInventoryAction() {
  try {
    await connect();
    const items = await InventoryItemModel.find({});
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

export async function updateInventoryItemAction(item: Partial<InventoryItem> & { id: string }) {
  try {
    await connect();
    const { id, ...data } = item;
    const updated = await InventoryItemModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/admin/inventory');
    return { success: true, item: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function getToolsAction() {
  try {
    await connect();
    const tools = await ToolModel.find({});
    return JSON.parse(JSON.stringify(tools));
  } catch (error) {
    console.error("Error fetching tools:", error);
    return [];
  }
}

export async function updateToolAction(tool: Partial<Tool> & { id: string }) {
  try {
    await connect();
    const { id, ...data } = tool;
    const updated = await ToolModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/admin/inventory');
    return { success: true, tool: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error updating tool:", error);
    return { success: false, error: "Failed to update tool" };
  }
}

export async function deleteInventoryItemAction(itemId: string) {
  try {
    await connect();
    console.log(`🗑️ Deleting inventory item with ID: ${itemId}`);
    await InventoryItemModel.findByIdAndDelete(itemId);
    console.log(`✅ Inventory item ${itemId} deleted successfully.`);
    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting inventory item ${itemId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al eliminar el repuesto",
    };
  }
}

export async function deleteToolAction(toolId: string) {
  try {
    await connect();
    console.log(`🗑️ Deleting tool with ID: ${toolId}`);
    await ToolModel.findByIdAndDelete(toolId);
    console.log(`✅ Tool ${toolId} deleted successfully.`);
    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting tool ${toolId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al eliminar la herramienta",
    };
  }
}
