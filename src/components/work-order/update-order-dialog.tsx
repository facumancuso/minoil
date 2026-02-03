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
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkOrder, Status } from "@/lib/types";
import { updateWorkOrderAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileUploadDnd } from "../ui/file-upload-dnd";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";

const ALL_STATUSES: Status[] = [
    'Espera de Desarme y Evaluación',
    'Desarme y Evaluación',
    'Simulacion',
    'Cotizacion',
    'Cotizacion al cliente',
    'Espera de repuesto',
    'Llegada de Repuesto',
    'Rechazado por Cliente',
    'Armado',
    'Listo para Entregar',
    'Entregado'
];

const toDateString = (date: any): string => {
    if (!date) return '';
    try {
        const d = date.seconds ? new Date(date.seconds * 1000) : (typeof date === 'string' ? parseISO(date) : date);
        // Return in local timezone format YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
};

const baseUpdateSchema = z.object({
    status: z.custom<Status>(),
    note: z.string().optional(),
    updateDate: z.string().optional(),
});

type UpdateOrderFormValues = z.infer<typeof baseUpdateSchema> & {
    evaluationStartDate?: string;
    evaluationMechanics?: number;
    evaluationEstimatedEndDate?: Date;
    supplierQuotationDate?: string;
    isViableForRepair?: 'true' | 'false' | 'undefined';
    isStockUsage?: 'true' | 'false';
    assemblyStartDate?: string;
    assemblyEstimatedEndDate?: Date;
    assemblyMechanics?: number;
    deliveryDate?: string;

    // Fields for "Espera de repuesto"
    clientQuotationApprovalDate?: string;
    estimatedDeliveryDate?: string;
    sparePartsEstimatedArrivalDate?: string;
    sparePartsArrivalDate?: string;
};

type UpdateOrderDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    order: WorkOrder;
    onUpdate: (order: WorkOrder) => void;
};

export function UpdateOrderDialog({ isOpen, onOpenChange, order, onUpdate }: UpdateOrderDialogProps) {
    const { toast } = useToast();
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const getValidationSchema = (fromStatus: Status, toStatus: Status) => {
        let schema = baseUpdateSchema;

        if (toStatus === 'Desarme y Evaluación') {
            schema = schema.extend({
                evaluationStartDate: z.string().min(1, "La fecha de inicio es requerida."),
                evaluationMechanics: z.coerce.number().min(1, "Debe haber al menos un mecánico."),
                evaluationEstimatedEndDate: z.date({ required_error: "La fecha estimada de fin es requerida." }),
            });
        }

        if (toStatus === 'Simulacion') {
            schema = schema.extend({
                isViableForRepair: z.enum(['true', 'false', 'undefined']).optional(),
            });
        }

        if (toStatus === 'Cotizacion') {
            schema = schema.extend({
                supplierQuotationDate: z.string().min(1, "La fecha de recepción es requerida."),
            });
        }

        if (toStatus === 'Espera de repuesto') {
            schema = schema.extend({
                clientQuotationApprovalDate: z.string().min(1, 'La fecha de aprobación es requerida.'),
                estimatedDeliveryDate: z.string().optional(),
                sparePartsEstimatedArrivalDate: z.string().optional(),
            });
        }

        if (toStatus === 'Llegada de Repuesto') {
            schema = schema.extend({
                sparePartsArrivalDate: z.string().min(1, 'La fecha de llegada es requerida.'),
            });
        }

        if (toStatus === 'Armado') {
            schema = schema.extend({
                isStockUsage: z.enum(['true', 'false'], { required_error: 'Debe indicar si se utilizará stock.' }),
                assemblyStartDate: z.string().min(1, "La fecha de inicio de armado es requerida."),
                assemblyEstimatedEndDate: z.date({ required_error: "La fecha estimada de fin es requerida." }),
                assemblyMechanics: z.coerce.number().min(1, "Debe haber al menos un mecánico."),
            });
        }

        return schema;
    };

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, getValues } = useForm<UpdateOrderFormValues>({
        defaultValues: {
            status: order.status,
            note: "",
            updateDate: toDateString(new Date()),
            evaluationStartDate: toDateString(order.evaluationStartDate) || toDateString(new Date()),
            evaluationMechanics: order.evaluationMechanics ?? 1,
            evaluationEstimatedEndDate: order.evaluationEstimatedEndDate ? new Date(order.evaluationEstimatedEndDate) : undefined,
            supplierQuotationDate: toDateString(order.supplierQuotationDate) || toDateString(new Date()),
            isViableForRepair: order.isViableForRepair === undefined ? 'undefined' : String(order.isViableForRepair) as 'true' | 'false',
            isStockUsage: order.isStockUsage === undefined ? undefined : String(order.isStockUsage) as 'true' | 'false',
            assemblyStartDate: toDateString(order.assemblyStartDate) || toDateString(new Date()),
            assemblyEstimatedEndDate: order.assemblyEstimatedEndDate ? new Date(order.assemblyEstimatedEndDate) : undefined,
            assemblyMechanics: order.assemblyMechanics ?? 1,
            deliveryDate: toDateString(order.deliveryDate) || toDateString(new Date()),

            clientQuotationApprovalDate: toDateString(order.clientQuotationApprovalDate) || toDateString(new Date()),
            estimatedDeliveryDate: toDateString(order.estimatedDeliveryDate),
            sparePartsEstimatedArrivalDate: toDateString(order.sparePartsEstimatedArrivalDate),
            sparePartsArrivalDate: toDateString(order.sparePartsArrivalDate),
        },
        resolver: (values, context, options) => {
            const schema = getValidationSchema(order.status, values.status);
            return zodResolver(schema)(values, context, options);
        },
    });

    const watchedStatus = watch("status", order.status);


    useEffect(() => {
        if (isOpen) {
            reset({
                status: order.status,
                note: "",
                updateDate: toDateString(new Date()),
                evaluationStartDate: toDateString(order.evaluationStartDate) || toDateString(new Date()),
                evaluationMechanics: order.evaluationMechanics ?? 1,
                evaluationEstimatedEndDate: order.evaluationEstimatedEndDate ? new Date(order.evaluationEstimatedEndDate) : undefined,
                supplierQuotationDate: toDateString(order.supplierQuotationDate) || toDateString(new Date()),
                isViableForRepair: order.isViableForRepair === undefined ? 'undefined' : String(order.isViableForRepair) as 'true' | 'false',
                isStockUsage: order.isStockUsage === undefined ? undefined : String(order.isStockUsage) as 'true' | 'false',
                assemblyStartDate: toDateString(order.assemblyStartDate) || toDateString(new Date()),
                assemblyEstimatedEndDate: order.assemblyEstimatedEndDate ? new Date(order.assemblyEstimatedEndDate) : undefined,
                assemblyMechanics: order.assemblyMechanics ?? 1,
                deliveryDate: toDateString(order.deliveryDate) || toDateString(new Date()),

                clientQuotationApprovalDate: toDateString(order.clientQuotationApprovalDate) || toDateString(new Date()),
                estimatedDeliveryDate: toDateString(order.estimatedDeliveryDate),
                sparePartsEstimatedArrivalDate: toDateString(order.sparePartsEstimatedArrivalDate),
                sparePartsArrivalDate: toDateString(order.sparePartsArrivalDate),
            });
        }
    }, [order, isOpen, reset]);


    const onSubmit = async (data: UpdateOrderFormValues) => {
        const payload: Partial<WorkOrder> & { updateDate?: string } = {
            status: data.status,
        };

        const fromStatus = order.status;
        const toStatus = data.status;

        if (toStatus === 'Desarme y Evaluación') {
            payload.evaluationStartDate = data.evaluationStartDate;
            payload.evaluationMechanics = data.evaluationMechanics;
            payload.evaluationEstimatedEndDate = data.evaluationEstimatedEndDate;
        }

        if (toStatus === 'Simulacion') {
            payload.evaluationEndDate = data.updateDate;
            // Guardar isViableForRepair solo si el usuario seleccionó una opción (true o false)
            if (data.isViableForRepair === 'true') {
                payload.isViableForRepair = true;
            } else if (data.isViableForRepair === 'false') {
                payload.isViableForRepair = false;
            }
            // Si es 'undefined' o cualquier otro valor, no se incluye en el payload
            if (attachedFiles.length > 0) {
                payload.evaluationReports = [
                    ...(order.evaluationReports || []),
                    ...attachedFiles.map(file => ({ name: file.name, type: file.type, size: file.size }))
                ];
            }
        }

        if (toStatus === 'Cotizacion') {
            payload.supplierQuotationDate = data.supplierQuotationDate;
            payload.updateDate = data.supplierQuotationDate;
            if (attachedFiles.length > 0) {
                payload.supplierQuotes = [
                    ...(order.supplierQuotes || []),
                    ...attachedFiles.map(file => ({ name: file.name, type: file.type, size: file.size }))
                ];
            }
        }

        if (toStatus === 'Cotizacion al cliente') {
            payload.clientQuotationDate = data.updateDate;
            if (attachedFiles.length > 0) {
                payload.clientQuotes = [
                    ...(order.clientQuotes || []),
                    ...attachedFiles.map(file => ({ name: file.name, type: file.type, size: file.size }))
                ];
            }
        }

        if (toStatus === 'Espera de repuesto') {
            // Saving data related to entering this stage
            payload.clientQuotationApprovalDate = data.clientQuotationApprovalDate;
            payload.estimatedDeliveryDate = data.estimatedDeliveryDate;
            payload.sparePartsEstimatedArrivalDate = data.sparePartsEstimatedArrivalDate;

            payload.sparePartsEstimatedArrivalDate = data.sparePartsEstimatedArrivalDate;
        }

        if (toStatus === 'Llegada de Repuesto') {
            payload.sparePartsArrivalDate = data.sparePartsArrivalDate;
            payload.updateDate = data.sparePartsArrivalDate;
        }

        if (toStatus === 'Armado') {
            if (data.isStockUsage === undefined) {
                toast({ variant: "destructive", title: "Campo Requerido", description: "Debe indicar si se utilizará stock." });
                return;
            }
            payload.isStockUsage = data.isStockUsage === 'true';
            payload.assemblyStartDate = data.assemblyStartDate;
            payload.assemblyEstimatedEndDate = data.assemblyEstimatedEndDate;
            payload.assemblyMechanics = data.assemblyMechanics;

            if (attachedFiles.length > 0) {
                payload.purchaseOrderFiles = [
                    ...(order.purchaseOrderFiles || []),
                    ...attachedFiles.map(file => ({ name: file.name, type: file.type, size: file.size }))
                ];
            }
        }

        if (toStatus === 'Listo para Entregar') {
            payload.assemblyEndDate = data.updateDate;
        }

        if (toStatus === 'Entregado') {
            payload.deliveryDate = data.deliveryDate;
        }

        // Ensure general updateDate is set if not already handled by a specific field
        if (!payload.updateDate) {
            payload.updateDate = data.updateDate;
        }

        try {
            await updateWorkOrderAction(order.id, payload, data.note);
            onOpenChange(false);
            onUpdate(order);
            toast({
                title: "Orden Actualizada",
                description: `La OT ${order.id} se actualizó a: ${data.status}.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar la orden de trabajo.",
            });
        }
    };

    const renderStageSpecificFields = (status: Status) => {
        const fromStatus = order.status;
        const toStatus = status;

        if (toStatus === 'Desarme y Evaluación') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Iniciar Desarme y Evaluación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="grid gap-2">
                            <Label htmlFor="evaluationStartDate">Fecha Inicio Desarme *</Label>
                            <Controller name="evaluationStartDate" control={control} render={({ field }) => <Input id="evaluationStartDate" type="date" {...field} />} />
                            {errors.evaluationStartDate && <p className="text-sm text-destructive">{errors.evaluationStartDate.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label>Fecha Fin Estimada D&E *</Label>
                            <Controller
                                name="evaluationEstimatedEndDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value && isValid(field.value) ? format(field.value, "dd 'de' MMMM, yyyy", { locale: es }) : <span>Seleccione una fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.evaluationEstimatedEndDate && <p className="text-sm text-destructive">{errors.evaluationEstimatedEndDate.message}</p>}
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="evaluationMechanics">N° de Mecánicos Asignados *</Label>
                            <Controller name="evaluationMechanics" control={control} render={({ field }) => <Input id="evaluationMechanics" type="number" min="1" {...field} />} />
                            {errors.evaluationMechanics && <p className="text-sm text-destructive">{errors.evaluationMechanics.message}</p>}
                        </div>
                    </div>
                </div>
            );
        }

        if (toStatus === 'Simulacion') {
            return (
                <div className="p-3 sm:p-4 border bg-muted/50 rounded-lg mt-4 space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Finalizar Evaluación</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground -mt-2 sm:-mt-3">
                        La fecha de esta actualización se guardará como la fecha de fin de D&E. El siguiente paso será pedir cotización a proveedores.
                    </p>

                    <div className="space-y-2">
                        <Label className="text-sm">Adjuntar Informes de Evaluación (Opcional)</Label>
                        <FileUploadDnd onFilesChange={setAttachedFiles} />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">¿Reparación Viable?</Label>
                        <Controller
                            name="isViableForRepair"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap items-center gap-3 sm:gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" id="viable-yes" />
                                        <Label htmlFor="viable-yes" className="font-normal cursor-pointer text-sm">Sí</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" id="viable-no" />
                                        <Label htmlFor="viable-no" className="font-normal cursor-pointer text-sm">No</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.isViableForRepair && <p className="text-xs sm:text-sm text-destructive">{errors.isViableForRepair.message}</p>}
                    </div>
                </div>
            );
        }

        if (toStatus === 'Cotizacion') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Cargar Presupuesto de Proveedor</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="supplierQuotationDate">Fecha Recepción Cotización Proveedor *</Label>
                        <Controller name="supplierQuotationDate" control={control} render={({ field }) => <Input id="supplierQuotationDate" type="date" {...field} />} />
                        {errors.supplierQuotationDate && <p className="text-sm text-destructive">{errors.supplierQuotationDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Adjuntar Archivos de Presupuesto (PDF, Word, Excel)</Label>
                        <FileUploadDnd onFilesChange={setAttachedFiles} />
                    </div>
                </div>
            );
        }
        if (toStatus === 'Cotizacion al cliente') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Cargar Presupuesto para Cliente</h4>
                    <p className="text-sm text-muted-foreground -mt-3">
                        La fecha de esta actualización se guardará como la fecha de cotización a cliente.
                    </p>
                    <div className="space-y-2">
                        <Label>Adjuntar Archivos de Presupuesto para Cliente (PDF, Word, Excel)</Label>
                        <FileUploadDnd onFilesChange={setAttachedFiles} />
                    </div>
                </div>
            );
        }

        if (toStatus === 'Espera de repuesto') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Registro de Aprobación y Repuestos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="grid gap-2">
                            <Label htmlFor="clientQuotationApprovalDate">Fecha Aprobación Cliente *</Label>
                            <Controller name="clientQuotationApprovalDate" control={control} render={({ field }) => <Input id="clientQuotationApprovalDate" type="date" {...field} />} />
                            {errors.clientQuotationApprovalDate && <p className="text-sm text-destructive">{errors.clientQuotationApprovalDate.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sparePartsEstimatedArrivalDate">Estimada Llegada Repuesto</Label>
                            <Controller name="sparePartsEstimatedArrivalDate" control={control} render={({ field }) => <Input id="sparePartsEstimatedArrivalDate" type="date" {...field} />} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="estimatedDeliveryDate">Fecha Estimada Entrega (Cliente)</Label>
                            <Controller name="estimatedDeliveryDate" control={control} render={({ field }) => <Input id="estimatedDeliveryDate" type="date" {...field} />} />
                        </div>
                    </div>
                </div>
            );
        }

        if (toStatus === 'Llegada de Repuesto') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Registrar Llegada de Repuesto</h4>
                    <p className="text-sm text-muted-foreground -mt-3">
                        La fecha de esta actualización se guardará como la fecha de llegada del repuesto.
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="sparePartsArrivalDate">Fecha de Llegada del Repuesto *</Label>
                        <Controller name="sparePartsArrivalDate" control={control} render={({ field }) => <Input id="sparePartsArrivalDate" type="date" {...field} />} />
                        {errors.sparePartsArrivalDate && <p className="text-sm text-destructive">{errors.sparePartsArrivalDate.message}</p>}
                    </div>
                </div>
            );
        }

        if (toStatus === 'Armado') {
            // If coming from 'Espera de repuesto', we might want to ensure 'sparePartsArrivalDate' is set?
            // asking user for it if not set? For now, we leave it standard.
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Iniciar Armado</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="grid gap-2">
                            <Label htmlFor="assemblyStartDate">Fecha Inicio Armado *</Label>
                            <Controller name="assemblyStartDate" control={control} render={({ field }) => <Input id="assemblyStartDate" type="date" {...field} />} />
                            {errors.assemblyStartDate && <p className="text-sm text-destructive">{errors.assemblyStartDate.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label>Fecha Fin Estimada Armado *</Label>
                            <Controller
                                name="assemblyEstimatedEndDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value && isValid(field.value) ? format(field.value, "dd 'de' MMMM, yyyy", { locale: es }) : <span>Seleccione una fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.assemblyEstimatedEndDate && <p className="text-sm text-destructive">{errors.assemblyEstimatedEndDate.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assemblyMechanics">N° de Mecánicos en Armado *</Label>
                            <Controller name="assemblyMechanics" control={control} render={({ field }) => <Input id="assemblyMechanics" type="number" min="1" {...field} />} />
                            {errors.assemblyMechanics && <p className="text-sm text-destructive">{errors.assemblyMechanics.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2 pt-4">
                        <Label>Adjuntar OC del cliente u otro documento de aprobación</Label>
                        <FileUploadDnd onFilesChange={setAttachedFiles} />
                    </div>
                    <div className="space-y-2 pt-4">
                        <Label className="font-semibold">¿Se utilizará stock existente? *</Label>
                        <Controller
                            name="isStockUsage"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="stock-yes" /><Label htmlFor="stock-yes" className="font-normal cursor-pointer">Sí</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="stock-no" /><Label htmlFor="stock-no" className="font-normal cursor-pointer">No</Label></div>
                                </RadioGroup>
                            )}
                        />
                        {errors.isStockUsage && <p className="text-sm text-destructive">{errors.isStockUsage.message}</p>}
                    </div>
                </div>
            );
        }

        if (toStatus === 'Listo para Entregar') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Finalizar Armado</h4>
                    <p className="text-sm text-muted-foreground -mt-3">
                        La fecha de esta actualización se guardará como la fecha de fin de armado.
                    </p>
                </div>
            );
        }

        if (toStatus === 'Entregado') {
            return (
                <div className="p-4 border bg-muted/50 rounded-lg mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Registrar Entrega a Cliente</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                        <Controller name="deliveryDate" control={control} render={({ field }) => <Input id="deliveryDate" type="date" {...field} />} />
                    </div>
                </div>
            );
        }
        return null;
    }

    const showGeneralUpdateDate = watchedStatus !== 'Cotizacion';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-headline text-base sm:text-lg">Actualizar OT: {order.orderNumber || order.id}</DialogTitle>
                    <DialogDescription>
                        Etapa Actual: <span className="font-semibold text-primary">{order.status}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("❌ Form validation errors:", errors))} className="space-y-4 py-2 sm:py-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="grid gap-1.5 sm:gap-2">
                            <Label htmlFor="status-select" className="text-sm">Cambiar Etapa a:</Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="status-select" className="text-sm">
                                            <SelectValue placeholder="Selecciona una nueva etapa" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[50vh]">
                                            {ALL_STATUSES.map(status => (
                                                <SelectItem key={status} value={status} className="text-sm">
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        {showGeneralUpdateDate && (<div className="grid gap-1.5 sm:gap-2">
                            <Label htmlFor="update-date" className="text-sm">Fecha de Actualización</Label>
                            <Controller name="updateDate" control={control} render={({ field }) => <Input id="update-date" type="date" className="text-sm" {...field} />} />
                            {errors.updateDate && <p className="text-xs sm:text-sm text-destructive">{errors.updateDate.message}</p>}
                        </div>)}
                    </div>

                    {renderStageSpecificFields(watchedStatus)}

                    <div className="grid gap-1.5 sm:gap-2 pt-3 sm:pt-4">
                        <Label htmlFor="note" className="text-sm">Nota de Actualización</Label>
                        <Controller name="note" control={control} render={({ field }) => (
                            <Textarea id="note" placeholder="Añada una observación sobre este cambio... (Opcional)" className="text-sm min-h-[80px]" {...field} />
                        )} />
                        {errors.note && <p className="text-xs sm:text-sm text-destructive">{errors.note.message}</p>}
                    </div>

                    <DialogFooter className="pt-3 sm:pt-4 flex-col sm:flex-row gap-2">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? "Guardando..." : "Actualizar Orden"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
