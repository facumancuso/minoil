import mongoose, { Schema } from 'mongoose';
import { WorkOrder } from '@/lib/types';

// Create nested schemas without _id
const NoteSchema = new Schema({
    status: String,
    note: String,
    timestamp: Date,
    user: String,
}, { _id: false });

const SparePartSchema = new Schema({
    id: String,
    description: String,
    quantity: Number,
    status: { type: String, enum: ['Pendiente', 'Ordenado', 'Recibido'] },
}, { _id: false });

const FileSchema = new Schema({
    name: String,
    type: String,
    size: Number,
}, { _id: false });

const WorkOrderSchema = new Schema<WorkOrder>({
    orderNumber: { type: String, required: true, unique: true }, // Custom Work Order Number (e.g., OT-12345)
    client: { type: String, required: true },
    clientId: { type: String, required: true },
    component: { type: String, required: true },
    brand: { type: String, required: true },
    serialNumber: { type: String, required: true },
    equipment: { type: String, required: true },
    workOrderType: { type: String, enum: ['Normal', 'Garantía'], required: true },
    status: {
        type: String,
        enum: [
            'Espera de Desarme y Evaluación',
            'Desarme y Evaluación',
            'Simulacion',
            'Cotizacion',
            'Cotizacion al cliente',
            'Espera de repuesto',
            'Llegada de Repuesto',
            'Rechazado por Cliente',
            'Armado',
            'Listo para Entregar',
            'Entregado',
            'Espera de Retiro'
        ],
        required: true
    },
    progress: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    notes: [NoteSchema],
    spareParts: [SparePartSchema],
    evaluationReports: [FileSchema],
    supplierQuotes: [FileSchema],
    clientQuotes: [FileSchema],
    purchaseOrderFiles: [FileSchema],
    solped: String,
    purchaseOrder: String,

    // Dates
    estimatedEvaluationStartDate: Date,
    evaluationStartDate: Date,
    evaluationEndDate: Date,
    evaluationEstimatedEndDate: Date,
    supplierQuotationDate: Date,
    clientQuotationDate: Date,
    clientQuotationApprovalDate: Date,
    estimatedDeliveryDate: Date,
    sparePartsEstimatedArrivalDate: Date,
    sparePartsArrivalDate: Date,
    assemblyStartDate: Date,
    assemblyEstimatedEndDate: Date,
    assemblyEndDate: Date,
    deliveryDate: Date,

    // Cycle times & manual data
    evaluationWaitTimeDays: Number,
    evaluationTimeDays: Number,
    evaluationMechanics: Number,
    evaluationManHours: Number,
    assemblyMechanics: Number,
    assemblyManHours: Number,
    assemblyTimeHours: Number,
    deliveryComplianceDelta: Number,

    // Flags
    isViableForRepair: Boolean,
    isStockUsage: Boolean,
    partsArrivalComplete: Boolean,

}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            ret.id = doc._id?.toString();
        }
    },
    toObject: {
        transform: function (doc, ret) {
            delete ret.__v;
            ret.id = doc._id?.toString();
        }
    },
    syncIndexes: false,
    strict: true
});

// Delete from cache to ensure schema changes are picked up
delete mongoose.models.WorkOrder;

export default mongoose.model<WorkOrder>('WorkOrder', WorkOrderSchema);
