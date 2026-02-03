'use client';

import { useState } from 'react';
import type { InventoryItem, Tool } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Pencil, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EditItemDialog } from './edit-item-dialog';
import { Skeleton } from '../ui/skeleton';
import { useInventory, useTools } from '@/hooks/use-data';
import { updateInventoryItemAction, deleteInventoryItemAction, deleteToolAction } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const toolStatusColors: Record<Tool['status'], string> = {
  'Disponible': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  'En Uso': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  'En Mantenimiento': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
};

export function InventoryManagement() {
  const { data: spareParts, isLoading: isLoadingParts, refresh: refreshInventory } = useInventory();
  const { data: tools, isLoading: isLoadingTools, refresh: refreshTools } = useTools();

  const [partsFilter, setPartsFilter] = useState('');
  const [toolsFilter, setToolsFilter] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'part' | 'tool'; name: string } | null>(null);
  const { toast } = useToast();

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      const result = await updateInventoryItemAction(item);
      if (result.success) {
        setEditingItem(null);
        toast({
          title: 'Repuesto Actualizado',
          description: `El repuesto ${item.code} ha sido actualizado.`,
        });
        refreshInventory();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'No se pudo guardar el repuesto.',
        });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el repuesto.',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const result = itemToDelete.type === 'part'
        ? await deleteInventoryItemAction(itemToDelete.id)
        : await deleteToolAction(itemToDelete.id);

      if (result.success) {
        toast({
          title: itemToDelete.type === 'part' ? 'Repuesto Eliminado' : 'Herramienta Eliminada',
          description: `${itemToDelete.name} ha sido eliminado del inventario.`,
        });
        if (itemToDelete.type === 'part') {
          refreshInventory();
        } else {
          refreshTools();
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'No se pudo eliminar el elemento.',
        });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el elemento.',
      });
    } finally {
      setItemToDelete(null);
    }
  };


  const filteredParts = spareParts?.filter(
    (item) =>
      item.description.toLowerCase().includes(partsFilter.toLowerCase()) ||
      item.code.toLowerCase().includes(partsFilter.toLowerCase())
  ) ?? [];

  const filteredTools = tools?.filter(
    (tool) =>
      tool.description.toLowerCase().includes(toolsFilter.toLowerCase()) ||
      tool.code.toLowerCase().includes(toolsFilter.toLowerCase())
  ) ?? [];

  return (
    <>
      <Tabs defaultValue="parts">
        <TabsList className="mb-4">
          <TabsTrigger value="parts">Repuestos</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <CardTitle>Stock de Repuestos</CardTitle>
              <CardDescription>
                Directorio de todos los repuestos disponibles en bodega. Haz clic en una fila para editar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o descripción..."
                    value={partsFilter}
                    onChange={(e) => setPartsFilter(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Añadir Repuesto
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingParts ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      filteredParts.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono">{item.code}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono">${(item.unitPrice ?? 0).toLocaleString('de-DE')}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setItemToDelete({ id: item.id, type: 'part', name: item.description })}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Control de Herramientas</CardTitle>
              <CardDescription>
                Inventario y estado de las herramientas del taller.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o descripción..."
                    value={toolsFilter}
                    onChange={(e) => setToolsFilter(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Añadir Herramienta
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Asignada a</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTools ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      filteredTools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell className="font-mono">{tool.code}</TableCell>
                          <TableCell className="font-medium">{tool.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={toolStatusColors[tool.status]}>
                              {tool.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{tool.assignedTo || '---'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {/* TODO: Add edit tool dialog */}}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setItemToDelete({ id: tool.id, type: 'tool', name: tool.description })}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {editingItem && (
        <EditItemDialog
          isOpen={!!editingItem}
          onOpenChange={() => setEditingItem(null)}
          item={editingItem}
          onSave={handleSaveItem}
        />
      )}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento{' '}
              <strong>{itemToDelete?.name}</strong> del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
