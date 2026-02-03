
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';
import { getCurrentUserAction } from '@/app/auth-actions';
import { FirebaseProvider } from '@/firebase/provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const currentUser = await getCurrentUserAction();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleTabChange = (value: string) => {
    router.push(`/admin/${value}`);
  };

  const activeTab = pathname.split('/')[2] || 'work-orders';

  useEffect(() => {
    if (loading || roleLoading) return;

    // Redirect Responsable de Compras to inventory only
    if (role === 'Responsable de Compras' && activeTab !== 'inventory') {
      router.push('/admin/inventory');
    }

    // Redirect Gerente de Taller and Gerente Técnico to work-orders or inventory only
    if ((role === 'Gerente de Taller' || role === 'Gerente Técnico') &&
        activeTab !== 'work-orders' && activeTab !== 'inventory') {
      router.push('/admin/work-orders');
    }
  }, [role, activeTab, loading, roleLoading, router]);

  if (loading || !user || roleLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background p-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Skeleton className="h-8 w-24" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Skeleton className="h-10 w-full max-w-lg mb-4" />
          <Skeleton className="h-[60vh] w-full" />
        </main>
      </div>
    );
  }

  return (
    <FirebaseProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Link href="/admin/work-orders" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span>Minoil</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-foreground">
                {user.isAnonymous ? 'Invitado' : user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {role}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.isAnonymous ? 'Usuario Invitado' : user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  const { logoutAction } = await import('@/app/auth-actions');
                  await logoutAction();
                  window.location.href = '/';
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {role === 'Responsable de Compras' ? (
            // Only Inventory for Compras
            <Tabs value="inventory" className="mb-4">
              <TabsList>
                <TabsTrigger value="inventory">Inventario</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : role === 'Gerente de Taller' || role === 'Gerente Técnico' ? (
            // Only Work Orders and Inventory for Gerente de Taller and Gerente Técnico
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
              <TabsList>
                <TabsTrigger value="work-orders">Órdenes de Trabajo</TabsTrigger>
                <TabsTrigger value="inventory">Inventario</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            // Full access for Admin/Director/etc
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
              <TabsList>
                {['work-orders', 'gantt', 'clients', 'inventory', 'history'].map(tab => {
                  // Mapping tab to label
                  const labels: Record<string, string> = {
                    'work-orders': 'Órdenes de Trabajo',
                    'gantt': 'Gantt',
                    'clients': 'Clientes',
                    'inventory': 'Inventario',
                    'history': 'Historial'
                  };

                  return (
                    <TabsTrigger key={tab} value={tab}>{labels[tab]}</TabsTrigger>
                  )
                })}
                {['Admin', 'Director'].includes(role) && (
                  <>
                    <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
                    <TabsTrigger value="backups">Backups</TabsTrigger>
                  </>
                )}
              </TabsList>
            </Tabs>
          )}
          {children}
        </main>
      </div>
    </FirebaseProvider>
  );
}
