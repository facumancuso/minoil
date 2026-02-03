import type { TestBenchStatus, TestBenchSpecification } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Thermometer, Gauge } from 'lucide-react';

const testBenchData: TestBenchStatus = {
  status: 'Available',
  specifications: [
    { name: 'Torque Máx.', value: '50,000 Nm', icon: Gauge },
    { name: 'Potencia Máx.', value: '1,500 HP', icon: Zap },
    { name: 'Temp. Operativa', value: '-20°C a 60°C', icon: Thermometer },
  ],
};

const statusTranslations = {
  Available: 'Disponible',
  'In Use': 'En Uso',
  'Under Maintenance': 'En Mantenimiento',
};

const statusColors = {
  Available: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  'In Use': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  'Under Maintenance': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
};

export default function TestBenchStatus() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Estado del Banco de Pruebas</CardTitle>
        </div>
        <Badge variant="outline" className={statusColors[testBenchData.status]}>{statusTranslations[testBenchData.status]}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">Especificaciones y disponibilidad en tiempo real.</p>
        <ul className="space-y-3">
          {testBenchData.specifications.map((spec: TestBenchSpecification) => (
            <li key={spec.name} className="flex items-center text-sm">
              <spec.icon className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium flex-1">{spec.name}</span>
              <span className="text-muted-foreground">{spec.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
