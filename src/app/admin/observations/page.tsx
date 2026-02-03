
'use client';

import { useState } from 'react';
import type { UserTask } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const statusIcons = {
  'Pendiente': <Clock className="h-4 w-4 text-yellow-500" />,
  'En Progreso': <Clock className="h-4 w-4 text-blue-500" />,
  'Completada': <CheckCircle className="h-4 w-4 text-green-500" />,
  'Bloqueada': <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const statusColors = {
  'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'En Progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Completada': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Bloqueada': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};


export default function AdminObservationsPage() {
  const [userTasks] = useState<UserTask[]>([]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Observación de Tareas por Usuario
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userTasks.map((userTask) => (
          <Card key={userTask.user.email}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{getInitials(userTask.user.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-semibold">{userTask.user.role}</CardTitle>
                  <CardDescription className="text-sm">{userTask.user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tareas Asignadas ({userTask.tasks.length})</h3>
                {userTask.tasks.length > 0 ? (
                    userTask.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-2">
                                {statusIcons[task.status]}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{task.title}</span>
                                    <span className="text-xs text-muted-foreground">Orden: {task.orderId}</span>
                                </div>
                            </div>
                           <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>{task.status}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay tareas asignadas.</p>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
