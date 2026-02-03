
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Esta página ya no es el destino principal. Redirigir a la vista de admin.
    router.push('/admin/work-orders');
  }, [router]);

  return null; // No renderizar nada mientras redirige.
}
