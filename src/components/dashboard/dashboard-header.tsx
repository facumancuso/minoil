
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@/firebase";

type DashboardHeaderProps = {
  onAddOrder: () => void;
};

export default function DashboardHeader({ onAddOrder }: DashboardHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const auth = useAuth();
  
  const canAddOrder = profile?.role === 'Admin' || profile?.role === 'Gerente de Taller';

  const handleSignOut = async () => {
    if (!auth) return;
    await auth.signOut();
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
          Central de Minoil
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
         <div className="flex flex-col items-end">
          {user ? (
            <>
              <p className="text-sm font-medium text-foreground">
                {profile?.email || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Rol: {profile?.role || 'Usuario'}
              </p>
            </>
          ) : (
            <div className="h-full w-40 animate-pulse rounded-md bg-muted" />
          )}
        </div>
        {canAddOrder && (
          <Button size="sm" className="gap-1" onClick={onAddOrder}>
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Orden</span>
          </Button>
        )}
        <Button size="icon" variant="outline" onClick={handleSignOut} title="Cerrar Sesión">
            <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
