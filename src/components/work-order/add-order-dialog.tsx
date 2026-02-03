
"use client";

import { useForm, Controller } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/hooks/use-data";
import { addWorkOrderAction } from "@/app/actions";
import { Client } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  orderNumber: z.string().min(1, "El número de OT es requerido."),
  component: z.string().min(1, "El tipo de componente es requerido."),
  brand: z.string().min(1, "La marca es requerida."),
  equipment: z.string().min(1, "La serie/modelo es requerida."),
  serialNumber: z.string().min(1, "El número de serie es requerido."),
  solped: z.string().optional(),
  purchaseOrder: z.string().optional(),
  client: z.string().min(1, "El cliente es requerido."),
  clientId: z.string().min(1, "Debe seleccionar un cliente válido."),
  workOrderType: z.enum(['Normal', 'Garantía'], {
    required_error: 'Debe seleccionar un tipo de orden.'
  }),
  createdAt: z.string().optional(),
  estimatedEvaluationStartDate: z.string().optional(),
});

type AddOrderFormValues = z.infer<typeof formSchema>;

type AddOrderDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddOrder: (data: AddOrderFormValues) => Promise<any>;
};

export function AddOrderDialog({ isOpen, onOpenChange, onAddOrder }: AddOrderDialogProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<AddOrderFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: clients, isLoading: isLoadingClients } = useClients();
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue
  } = useForm<AddOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workOrderType: 'Normal',
      createdAt: new Date().toISOString().split('T')[0],
      estimatedEvaluationStartDate: new Date().toISOString().split('T')[0],
      orderNumber: '',
      client: '',
      clientId: '',
      component: '',
      brand: '',
      serialNumber: '',
      equipment: '',
      solped: '',
      purchaseOrder: ''
    }
  });

  const handleFormSubmit = (data: AddOrderFormValues) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    setIsLoading(true);
    try {
      // Use the parent handler which manages state and refresh
      const result = await onAddOrder(formData);

      if (result.success) {
        // Parent shows success toast
        reset();
        setIsConfirmOpen(false);
        setFormData(null);
        onOpenChange(false);
      } else {
        // Parent shows error toast, we just stop loading here if needed
        setIsConfirmOpen(false);
      }
    } catch (error) {
      // Parent handles error
      setIsConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setIsConfirmOpen(false);
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Nueva Orden de Trabajo</DialogTitle>
            <DialogDescription>
              Complete los detalles a continuación para crear una nueva orden de trabajo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="orderNumber">Número de OT *</Label>
                <Input
                  id="orderNumber"
                  placeholder="Ej: OT-12345"
                  {...register("orderNumber")}
                  disabled={isSubmitting}
                />
                {errors.orderNumber && <p className="text-sm text-destructive">{errors.orderNumber.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="createdAt">Fecha Ingreso Taller</Label>
                <Input
                  id="createdAt"
                  type="date"
                  {...register("createdAt")}
                  disabled={isSubmitting}
                />
                {errors.createdAt && <p className="text-sm text-destructive">{errors.createdAt.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimatedEvaluationStartDate">Fecha Estimada de Inicio D&amp;E</Label>
                <Input
                  id="estimatedEvaluationStartDate"
                  type="date"
                  {...register("estimatedEvaluationStartDate")}
                  disabled={isSubmitting}
                />
                {errors.estimatedEvaluationStartDate && <p className="text-sm text-destructive">{errors.estimatedEvaluationStartDate.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isComboboxOpen}
                        className="w-full justify-between font-normal"
                        disabled={isLoadingClients}
                      >
                        {field.value
                          ? clients?.find((client) => client.id === field.value)?.name
                          : "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar cliente..."
                        />
                        <CommandList>
                          <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                          <CommandGroup>
                            {clients?.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  setValue("clientId", client.id);
                                  setValue("client", client.name);
                                  setIsComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === client.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {client.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="component">Tipo de Componente *</Label>
              <Input
                id="component"
                placeholder="Ej: Transmisión"
                {...register("component")}
                disabled={isSubmitting}
              />
              {errors.component && <p className="text-sm text-destructive">{errors.component.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  placeholder="Ej: CAT"
                  {...register("brand")}
                  disabled={isSubmitting}
                />
                {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="equipment">Serie/Modelo *</Label>
                <Input
                  id="equipment"
                  placeholder="Ej: 793F"
                  {...register("equipment")}
                  disabled={isSubmitting}
                />
                {errors.equipment && <p className="text-sm text-destructive">{errors.equipment.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Número de Serie *</Label>
                <Input
                  id="serialNumber"
                  placeholder="Ej: SN-1A2B3C"
                  {...register("serialNumber")}
                  disabled={isSubmitting}
                />
                {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Orden *</Label>
              <Controller
                name="workOrderType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex items-center gap-4"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Normal" id="type-normal" />
                      <Label htmlFor="type-normal" className="font-normal cursor-pointer">
                        Reparación Normal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Garantía" id="type-garantia" />
                      <Label htmlFor="type-garantia" className="font-normal cursor-pointer">
                        Reclamo por Garantía
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.workOrderType && (
                <p className="text-sm text-destructive">{errors.workOrderType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="solped">SOLPED / REQUI</Label>
                <Input
                  id="solped"
                  placeholder="Número de solicitud"
                  {...register("solped")}
                  disabled={isSubmitting}
                />
                {errors.solped && <p className="text-sm text-destructive">{errors.solped.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseOrder">Orden de Compra</Label>
                <Input
                  id="purchaseOrder"
                  placeholder="Número de OC"
                  {...register("purchaseOrder")}
                  disabled={isSubmitting}
                />
                {errors.purchaseOrder && (
                  <p className="text-sm text-destructive">{errors.purchaseOrder.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full"
            >
              {isSubmitting ? "Validando..." : "Crear Orden"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Creación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas crear esta orden de trabajo con los datos ingresados?
            </AlertDialogDescription>
            {formData && (
              <div className="mt-4 p-3 bg-muted rounded-md text-left text-sm text-foreground">
                <div><strong>OT:</strong> {formData.orderNumber}</div>
                <div><strong>Cliente:</strong> {formData.client}</div>
                <div><strong>Componente:</strong> {formData.component}</div>
                <div><strong>Tipo:</strong> {formData.workOrderType}</div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
