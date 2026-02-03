import mongoose, { Schema } from 'mongoose';
import { InventoryItem } from '@/lib/types';

const InventoryItemSchema = new Schema<InventoryItem>({
    code: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    location: { type: String, required: true },
    unitPrice: { type: Number }
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.models.InventoryItem || mongoose.model<InventoryItem>('InventoryItem', InventoryItemSchema);
