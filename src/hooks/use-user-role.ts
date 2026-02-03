import { useEffect, useState } from "react";
import { UserRole } from "@/lib/types";
import { getCurrentUserAction } from "@/app/auth-actions";

export function useUserRole() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<UserRole>("Pruebas");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            const currentUser = await getCurrentUserAction();
            if (currentUser) {
                setUser(currentUser);
                setRole(currentUser.role as UserRole);
            } else {
                setRole("Pruebas");
            }
            setLoading(false);
        }
        fetchUser();
    }, []);

    return { user, role, loading };
}
