
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InventoryItem } from "@/lib/types";
import { useEffect } from "react";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  id: z.string(),
  code: z.string().min(1, "El código es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  quantity: z.coerce.number().min(0, "La cantidad no puede ser negativa."),
  location: z.string().min(1, "La ubicación es requerida."),
  unitPrice: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
});

type ItemFormValues = z.infer<typeof formSchema>;

type EditItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (item: InventoryItem) => void;
  item: InventoryItem;
};

export function EditItemDialog({ isOpen, onOpenChange, onSave, item }: EditItemDialogProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...item,
      unitPrice: item.unitPrice ?? 0,
    },
  });

  useEffect(() => {
    reset({
      ...item,
      unitPrice: item.unitPrice ?? 0,
    });
  }, [item, reset]);


  const onSubmit = (data: ItemFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Editar Repuesto
          </DialogTitle>
          <DialogDescription>
            Actualice los detalles del ítem de inventario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" {...register("code")} />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" {...register("location")} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="unitPrice">Precio Unitario (USD)</Label>
              <Input id="unitPrice" type="number" step="0.01" {...register("unitPrice")} />
              {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice.message}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
