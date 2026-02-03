"use server";

import dbConnect from "@/lib/db";
import WorkOrderModel from "@/models/WorkOrder";
import ClientModel from "@/models/Client";
import InventoryItemModel from "@/models/InventoryItem";
import ToolModel from "@/models/Tool";
import UserModel from "@/models/User";
import { WorkOrder, Client, InventoryItem, Tool } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function seedDatabaseAction() {
    try {
        await dbConnect();

        // 1. Clear existing data except Users
        await WorkOrderModel.deleteMany({});
        await ClientModel.deleteMany({});
        await InventoryItemModel.deleteMany({});
        await ToolModel.deleteMany({});

        console.log("🧹 Database cleared.");

        // 2. Seed/Update Users with permissions
        const usersToSeed = [
            {
                email: 'facundo.mancuso@minoil.com',
                password: '@Admin7',
                name: 'Facundo Mancuso',
                role: 'Admin',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: true },
                    inventory: { create: true, read: true, update: true, delete: true },
                    clients: { create: true, read: true, update: true, delete: true },
                    tools: { create: true, read: true, update: true, delete: true },
                    users: { create: true, read: true, update: true, delete: true }
                }
            },
            {
                email: 'adrian.foolini@minoil.com',
                password: 'Minoil2026',
                name: 'Adrian Foolini',
                role: 'Gerente de Taller',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: false },
                    inventory: { create: true, read: true, update: true, delete: false },
                    clients: { create: false, read: false, update: false, delete: false },
                    tools: { create: false, read: false, update: false, delete: false },
                    users: { create: false, read: false, update: false, delete: false }
                }
            },
            {
                email: 'german.rodriguez@minoil.com',
                password: 'Empre2026',
                name: 'German Rodriguez',
                role: 'Responsable de Compras',
                permissions: {
                    workOrders: { create: false, read: false, update: false, delete: false },
                    inventory: { create: true, read: true, update: true, delete: false },
                    clients: { create: false, read: false, update: false, delete: false },
                    tools: { create: false, read: false, update: false, delete: false },
                    users: { create: false, read: false, update: false, delete: false }
                }
            },
            {
                email: 'osvaldo.begueri@minoil.com',
                password: 'Compu2026',
                name: 'Osvaldo Begueri',
                role: 'Gerente Técnico',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: false },
                    inventory: { create: true, read: true, update: true, delete: false },
                    clients: { create: false, read: false, update: false, delete: false },
                    tools: { create: false, read: false, update: false, delete: false },
                    users: { create: false, read: false, update: false, delete: false }
                }
            },
            {
                email: 'gaston.victoria@minoil.com',
                password: '@Gaston2026',
                name: 'Gaston Victoria',
                role: 'Director',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: true },
                    inventory: { create: true, read: true, update: true, delete: true },
                    clients: { create: true, read: true, update: true, delete: true },
                    tools: { create: true, read: true, update: true, delete: true },
                    users: { create: true, read: true, update: true, delete: true }
                }
            },
            {
                email: 'sebastian.bongiovani@minoil.com',
                password: '@Minoil7',
                name: 'Sebastian Bongiovani',
                role: 'Director',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: true },
                    inventory: { create: true, read: true, update: true, delete: true },
                    clients: { create: true, read: true, update: true, delete: true },
                    tools: { create: true, read: true, update: true, delete: true },
                    users: { create: true, read: true, update: true, delete: true }
                }
            },
            {
                email: 'renato.gioja@minoil.com',
                password: '@Minoil7',
                name: 'Renato Gioja',
                role: 'Director',
                permissions: {
                    workOrders: { create: true, read: true, update: true, delete: true },
                    inventory: { create: true, read: true, update: true, delete: true },
                    clients: { create: true, read: true, update: true, delete: true },
                    tools: { create: true, read: true, update: true, delete: true },
                    users: { create: true, read: true, update: true, delete: true }
                }
            }
        ];

        // Upsert users (create or update if exists)
        for (const user of usersToSeed) {
            await UserModel.findOneAndUpdate(
                { email: user.email.toLowerCase() },
                { ...user, email: user.email.toLowerCase() },
                { upsert: true, new: true }
            );
        }

        console.log("👤 Users seeded/updated.");

        // 3. Seed Clients
        const clientsData = [
            {
                name: "Minera Escondida",
                contactPerson: "Juan Pérez",
                email: "juan.perez@escondida.cl",
                phone: "+56 55 222 3333"
            },
            {
                name: "Codelco Chuquicamata",
                contactPerson: "María González",
                email: "maria.gonzalez@codelco.cl",
                phone: "+56 55 444 5555"
            },
            {
                name: "Anglo American Sur",
                contactPerson: "Carlos López",
                email: "carlos.lopez@angloamerican.com",
                phone: "+56 2 2222 3333"
            }
        ];

        const createdClients = await ClientModel.create(clientsData);
        // Map to get IDs easily
        const clientDocs = JSON.parse(JSON.stringify(createdClients));

        console.log("👥 Clients seeded.");

        // 4. Seed Inventory
        const inventoryData = [
            {
                code: "REP-001",
                description: "Kit de Sellos Cilindro",
                quantity: 15,
                location: "Estante A-1",
                unitPrice: 150.00
            },
            {
                code: "REP-002",
                description: "Vástago Cromado 50mm",
                quantity: 5,
                location: "Estante B-2",
                unitPrice: 300.50
            },
            {
                code: "ACE-001",
                description: "Aceite Hidráulico ISO 68 (Litro)",
                quantity: 200,
                location: "Bodega Aceites",
                unitPrice: 5.20
            }
        ];
        await InventoryItemModel.create(inventoryData);
        console.log("📦 Inventory seeded.");

        // 5. Seed Tools
        const toolsData = [
            {
                code: "HER-001",
                description: "Llave de Torque 100-600 Nm",
                status: "Disponible",
                assignedTo: ""
            },
            {
                code: "HER-002",
                description: "Esmeril Angular 7\"",
                status: "En Uso",
                assignedTo: "Técnico 1"
            },
            {
                code: "HER-003",
                description: "Gata Hidráulica 50T",
                status: "En Mantenimiento",
                assignedTo: ""
            }
        ];
        await ToolModel.create(toolsData);
        console.log("🛠️ Tools seeded.");

        // 6. Seed Work Orders
        const workOrdersData: Partial<WorkOrder>[] = [
            {
                orderNumber: "OT-001",
                client: clientDocs[0].name,
                clientId: clientDocs[0].id,
                component: "Cilindro de Levante",
                brand: "Caterpillar",
                serialNumber: "SN-CAT-001",
                equipment: "CAT 793F",
                workOrderType: "Normal",
                status: "Espera de Desarme y Evaluación",
                progress: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                notes: [
                    {
                        status: "Espera de Desarme y Evaluación",
                        note: "Ingreso a taller para evaluación.",
                        timestamp: new Date(),
                        user: "system"
                    }
                ]
            },
            {
                orderNumber: "OT-002",
                client: clientDocs[1].name,
                clientId: clientDocs[1].id,
                component: "Suspensión Delantera",
                brand: "Komatsu",
                serialNumber: "SN-KOM-999",
                equipment: "Komatsu 930E",
                workOrderType: "Garantía",
                status: "Cotizacion",
                progress: 40,
                createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
                updatedAt: new Date(),
                evaluationStartDate: new Date(Date.now() - 86400000 * 4),
                evaluationEndDate: new Date(Date.now() - 86400000 * 3),
                notes: [
                    {
                        status: "Espera de Desarme y Evaluación",
                        note: "Ingreso inicial.",
                        timestamp: new Date(Date.now() - 86400000 * 5),
                        user: "system"
                    },
                    {
                        status: "Cotizacion",
                        note: "Evaluación terminada, generando cotización.",
                        timestamp: new Date(),
                        user: "system"
                    }
                ]
            }
        ];

        await WorkOrderModel.create(workOrdersData);
        console.log("📝 Work Orders seeded.");

        revalidatePath('/');

        return { success: true };

    } catch (error) {
        console.error("❌ Seed failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al inicializar BD"
        };
    }
}
