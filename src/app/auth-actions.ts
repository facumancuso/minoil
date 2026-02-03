"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { UserRole } from "@/lib/types";

// Simple cookie-based session
const SESSION_COOKIE = "minoil_session";

export async function loginAction(email: string, password: string) {
    try {
        await dbConnect();

        // Normalize email: trim whitespace and convert to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`🔐 Intento de login con email: ${normalizedEmail}`);

        // Find user (case-insensitive search)
        const user = await UserModel.findOne({ 
            email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
        });

        console.log(`🔍 Usuario encontrado:`, user ? `${user.email}` : 'No encontrado');

        if (!user) {
            console.log(`❌ Usuario no encontrado para: ${normalizedEmail}`);
            return { success: false, error: "Usuario no encontrado" };
        }

        if (user.password !== password) {
            console.log(`❌ Contraseña incorrecta para: ${normalizedEmail}`);
            return { success: false, error: "Contraseña incorrecta" };
        }

        // Create Session Data
        const sessionData = JSON.stringify({
            uid: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
        });

        // Set Cookie
        (await cookies()).set(SESSION_COOKIE, sessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        console.log(`✅ Login exitoso para: ${user.name}`);
        return { success: true, user: { email: user.email, role: user.role, name: user.name } };

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Error en el servidor" };
    }
}

export async function logoutAction() {
    (await cookies()).delete(SESSION_COOKIE);
    return { success: true };
}

export async function getCurrentUserAction() {
    try {
        const sessionCookie = (await cookies()).get(SESSION_COOKIE);
        if (!sessionCookie || !sessionCookie.value) {
            return null;
        }

        const userData = JSON.parse(sessionCookie.value);
        return userData; // { uid, email, name, role }
    } catch (error) {
        return null;
    }
}
