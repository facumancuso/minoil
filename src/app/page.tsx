'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Mail, Lock } from 'lucide-react';
import { loginAction, getCurrentUserAction } from '@/app/auth-actions';

export default function RootPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUserAction();
      if (user) {
        router.push('/admin/work-orders');
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Campos requeridos", description: "Por favor ingresa tu correo y contraseña.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAction(email.trim(), password);
      if (res.success) {
        toast({ title: "Bienvenido", description: `Hola, ${res.user.name}` });
        router.push('/admin/work-orders');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de acceso',
          description: res.error || "Credenciales incorrectas",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Error de acceso',
        description: "Error al conectar con el servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Logo className="h-16 w-16 text-primary" />
          <p className="text-muted-foreground font-medium">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/80">
        <CardHeader className="text-center space-y-2 pb-6 pt-8">
          <div className="mx-auto mb-2 bg-primary/10 p-3 rounded-full w-fit ring-1 ring-primary/20">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl font-bold tracking-tight">Minoil Central</CardTitle>
          <CardDescription className="text-base">
            Ingresa a la plataforma de gestión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@minoil.com"
                  className="pl-9 h-10 transition-all focus:ring-2 focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••"
                  className="pl-9 h-10 transition-all focus:ring-2 focus:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground pb-8">
          <p>Acceso restringido a personal autorizado.</p>
          <p>© 2026 Minoil S.A. Todos los derechos reservados.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

