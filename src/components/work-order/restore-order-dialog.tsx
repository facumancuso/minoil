
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
import { useToast } from "@/hooks/use-toast";
import type { WorkOrder } from "@/lib/types";
import { updateWorkOrderAction } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type RestoreOrderDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: WorkOrder;
  onOrderRestored?: () => void;
};

export function RestoreOrderDialog({ isOpen, onOpenChange, order, onOrderRestored }: RestoreOrderDialogProps) {
  const [note, setNote] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await updateWorkOrderAction(
        order.id, 
        { status: 'Espera de Desarme y Evaluación' },
        note || 'Orden restaurada desde el historial.'
      );
      
      if (result.success) {
        toast({
          title: "Orden Restaurada",
          description: `La OT ${order.id} ha sido movida a la lista de órdenes activas.`,
        });
        onOrderRestored?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al Restaurar",
        description: error instanceof Error ? error.message : "No se pudo restaurar la orden.",
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  const handleClose = () => {
      if(isRestoring) return;
      setNote("");
      onOpenChange(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurar Orden de Trabajo: {order.id}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción moverá la orden de trabajo de vuelta a la lista de activas con el estado 'Espera de Desarme y Evaluación'.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="restore-note">Motivo de la restauración (opcional)</Label>
          <Textarea
            id="restore-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Se cerró por error, el cliente solicitó una nueva revisión, etc."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restaurando...
                </>
            ) : "Confirmar Restauración"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
