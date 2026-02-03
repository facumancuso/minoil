
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { WorkOrder } from "@/lib/types";
import { useEffect, useState } from "react";
import { addWorkOrderAction, deleteWorkOrderAction } from "@/app/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

const formSchema = z.object({
  id: z.string().min(1, "El número de OT es requerido."),
  component: z.string().min(1, "El tipo de componente es requerido."),
  brand: z.string().min(1, "La marca es requerida."),
  equipment: z.string().min(1, "La serie/modelo es requerida."),
  serialNumber: z.string().min(1, "El número de serie es requerido."),
  solped: z.string().optional(),
  purchaseOrder: z.string().optional(),
  client: z.string().min(1, "El cliente es requerido."),
});

type EditOrderFormValues = z.infer<typeof formSchema>;

type EditOrderDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: WorkOrder;
  onUpdate: (order: WorkOrder) => void;
};

export function EditOrderDialog({ isOpen, onOpenChange, order, onUpdate }: EditOrderDialogProps) {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<EditOrderFormValues | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: order,
  });

  useEffect(() => {
    reset(order);
  }, [order, reset]);
  
  const handleFormSubmit = (data: EditOrderFormValues) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;
    
    const idHasChanged = formData.id !== order.id;

    try {
        if (idHasChanged) {
            // Re-create the work order with the new ID and delete the old one
            const newOrderPayload = {
                ...order, // a-z spread of original order data
                ...formData, // a-z spread of any edited fields
            };
            
            await addWorkOrderAction(newOrderPayload);
            await deleteWorkOrderAction(order.id);
            
            toast({
                title: "Orden Recreada",
                description: `La OT antigua ${order.id} fue eliminada y recreada como ${formData.id}.`,
            });
        }
        
        onUpdate(order);
        onOpenChange(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `No se pudo modificar la orden de trabajo. ${error.message}`,
        });
    } finally {
        setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Editar Detalles de la Orden de Trabajo</DialogTitle>
            <DialogDescription>
              Modifique la información principal de la OT.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id">Número de OT</Label>
                <Input id="id" {...register("id")} />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Input id="client" {...register("client")} />
                {errors.client && <p className="text-sm text-destructive">{errors.client.message}</p>}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="componente">Tipo de Componente</Label>
              <Input id="componente" {...register("component")} />
              {errors.component && <p className="text-sm text-destructive">{errors.component.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" {...register("brand")} />
                {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="equipment">Equipo (Serie/Modelo)</Label>
                <Input id="equipment" {...register("equipment")} />
                {errors.equipment && <p className="text-sm text-destructive">{errors.equipment.message}</p>}
              </div>
               <div className="grid gap-2">
                <Label htmlFor="serialNumber">Número de Serie</Label>
                <Input id="serialNumber" {...register("serialNumber")} />
                {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="solped">SOLPED / REQUI</Label>
                <Input id="solped" {...register("solped")} />
                {errors.solped && <p className="text-sm text-destructive">{errors.solped.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseOrder">Orden de Compra</Label>
                <Input id="purchaseOrder" {...register("purchaseOrder")} />
                {errors.purchaseOrder && <p className="text-sm text-destructive">{errors.purchaseOrder.message}</p>}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cambios</AlertDialogTitle>
            <AlertDialogDescription>
              {formData?.id !== order.id ?
                `Estás a punto de cambiar el ID de la OT de "${order.id}" a "${formData?.id}". Esto creará una nueva orden y eliminará la antigua. ¿Continuar?` :
                "¿Estás seguro de que deseas guardar los cambios en esta orden de trabajo?"
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
