
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
import { Client } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido."),
  contactPerson: z.string().min(1, "La persona de contacto es requerida."),
  email: z.string().email("El email no es válido."),
  phone: z.string().min(1, "El teléfono es requerido."),
});

type ClientFormValues = z.infer<typeof formSchema>;

type AddEditClientDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (client: Client) => void;
  client: Client | null;
};

export function AddEditClientDialog({ isOpen, onOpenChange, onSave, client }: AddEditClientDialogProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: client?.id || crypto.randomUUID(),
        name: client?.name || '',
        contactPerson: client?.contactPerson || '',
        email: client?.email || '',
        phone: client?.phone || ''
    },
  });

  useEffect(() => {
    if (client) {
      reset(client);
    } else {
      reset({
        id: crypto.randomUUID(),
        name: '',
        contactPerson: '',
        email: '',
        phone: ''
      });
    }
  }, [client, reset]);


  const onSubmit = (data: ClientFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {client ? "Editar Cliente" : "Añadir Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client ? "Edite los detalles del cliente." : "Complete los detalles para agregar un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Empresa</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactPerson">Persona de Contacto</Label>
            <Input id="contactPerson" {...register("contactPerson")} />
            {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email de Contacto</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono de Contacto</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
