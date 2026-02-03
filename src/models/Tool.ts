import mongoose, { Schema } from 'mongoose';
import { Tool } from '@/lib/types';

const ToolSchema = new Schema<Tool>({
    code: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Disponible', 'En Uso', 'En Mantenimiento'], required: true },
    assignedTo: { type: String }
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret: any) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret: any) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.models.Tool || mongoose.model<Tool>('Tool', ToolSchema);
