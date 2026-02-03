import mongoose, { Schema, Model } from "mongoose";
import { UserRole } from "@/lib/types";

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash this!
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'Pruebas' },
    permissions: {
        workOrders: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        inventory: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        clients: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        tools: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        users: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        }
    },
    createdAt: { type: Date, default: Date.now }
});

// Avoid recompilation error
const UserModel: Model<any> = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
