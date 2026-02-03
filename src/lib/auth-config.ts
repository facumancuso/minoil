import { UserRole } from "./types";

export const USER_ROLES: Record<string, UserRole> = {
    // Admin / Full Access
    "gaston@minoil.com": "Admin",
    "sebastian@minoil.com": "Admin",
    "renato@minoil.com": "Admin",
    "admin@minoil.com": "Admin",
    "facundo.mancuso@minoil.com": "Admin",
    "facundo@minoil.com": "Admin",

    // Gerente de Taller
    "adrian@minoil.com": "Gerente de Taller",
    "adrian.foolini@minoil.com": "Gerente de Taller",

    // Responsable de Compras
    "german@minoil.com": "Responsable de Compras",
    "german.rodriguez@minoil.com": "Responsable de Compras",
    "compras@minoil.com": "Responsable de Compras",

    // Gerente Técnico
    "osvaldo@minoil.com": "Gerente Técnico",
    "osvaldo.begueri@minoil.com": "Gerente Técnico",

    // Default/Guest
    "invitado@minoil.com": "Pruebas",
    "guest": "Pruebas"
};

export const getUserRole = (email?: string | null): UserRole => {
    if (!email) return "Pruebas"; // Default role for anonymous or unknown
    const normalizedEmail = email.toLowerCase();
    return USER_ROLES[normalizedEmail] || "Pruebas"; // Default to 'Pruebas' (Restricted?) or maybe 'Gerente'
};

// Permissions config to centralize logic
// Which tabs/sections are accessible by which role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    "Admin": ["work-orders", "gantt", "clients", "inventory", "history", "statistics"],
    "Director": ["work-orders", "gantt", "clients", "inventory", "history", "statistics"], // Assuming Director sees all
    "Gerente": ["work-orders", "gantt", "clients", "inventory", "history", "statistics"],

    "Gerente de Taller": ["work-orders", "inventory"], // Only OT and Stock
    "Gerente Técnico": ["work-orders", "inventory"], // Only OT and Stock

    "Responsable de Compras": ["inventory"], // ONLY stock

    "Pruebas": ["work-orders", "gantt", "inventory"] // Guest access
};
