

import type { UserProfile, UserRole } from './types';

const roles: UserRole[] = [
    "Admin",
    "Gerente de Taller",
    "Responsable de Compras",
    "Gerente Técnico",
    "Gerente",
    "Director",
    "Pruebas",
];

export const exampleUsers: UserProfile[] = [
    { email: "admin@example.com", role: "Admin" },
    { email: "pruebas@example.com", role: "Gerente" },
    { email: "adrian@example.com", role: "Gerente de Taller" },
    { email: "compras@example.com", role: "Responsable de Compras" },
    { email: "gerente.tecnico@example.com", role: "Gerente Técnico" },
    { email: "gerente.general@example.com", role: "Gerente" },
    { email: "director@example.com", role: "Director" },
];

// This part seems to be related to the old role system, let's keep it but adapt it to UserRole if needed later.
// For now, it is not used directly for auth.
const oldExampleUsers = [
    { email: "llegada@example.com", role: "Llegada de componente" },
    { email: "de@example.com", role: "Desarme y Evaluación" },
    { email: "cotizacion@example.com", role: "Cotización" },
    { email: "aprobacion@example.com", role: "Aprobación Cliente" },
    { email: "compras@example.com", role: "Compra de Repuestos" },
    { email: "recepcion@example.com", role: "Recepción de Repuestos" },
    { email: "armado@example.com", role: "Armado" },
    { email: "entrega@example.com", role: "Listo para Entrega" },
    { email: "bodega@example.com", role: "Stock y Bodega" },
    { email: "herramientas@example.com", role: "Control Herramientas" },
];
