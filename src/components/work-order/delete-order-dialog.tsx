
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { WorkOrder } from "@/lib/types";
import { deleteWorkOrderAction } from "@/app/actions";
import { Loader2 } from "lucide-react";

const DELETION_PASSWORD = "1234";

type DeleteOrderDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: WorkOrder;
  onOrderDeleted?: () => void;
};

export function DeleteOrderDialog({ isOpen, onOpenChange, order, onOrderDeleted }: DeleteOrderDialogProps) {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const isPasswordCorrect = password === DELETION_PASSWORD;

  const handleDelete = async () => {
    if (!isPasswordCorrect) {
      toast({
        variant: "destructive",
        title: "Contraseña Incorrecta",
        description: "No se puede eliminar la orden.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteWorkOrderAction(order.id);
      if (result.success) {
        toast({
          title: "Orden Eliminada",
          description: `La orden de trabajo ${order.id} ha sido eliminada permanentemente.`,
        });
        onOrderDeleted?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: error instanceof Error ? error.message : "No se pudo eliminar la orden.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleClose = () => {
      if(isDeleting) return;
      setPassword("");
      onOpenChange(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar Orden de Trabajo: {order.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es irreversible y eliminará permanentemente la orden de trabajo y todo su historial.
            <br />
            Para confirmar, ingrese la contraseña de seguridad.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="delete-password">Contraseña de Seguridad</Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese la clave para confirmar"
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isPasswordCorrect || isDeleting}
          >
            {isDeleting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                </>
            ) : "Eliminar Definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    