
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { CheckCircle, GanttChartSquare, Users, Wrench, BarChart2, Bell, Truck, Package, Search, Printer, FileText, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const timeline = [
  {
    week: 1,
    title: "Fundamentos y Gestión de Órdenes",
    days: [
      { day: 1, task: "Configuración y Diseño Inicial", description: "Análisis de requerimientos, definición de la paleta de colores, tipografías y configuración del proyecto.", icon: Wrench, questions: [
          "¿Cuál es la identidad de marca de la empresa? (Logos, colores primarios/secundarios)",
          "¿Existen manuales de estilo o guías de diseño que debamos seguir?",
          "¿Qué otras aplicaciones o software utilizan actualmente? ¿Qué les gusta y qué no les gusta de ellas?",
          "¿Quiénes serán los usuarios principales y cuáles son sus niveles de habilidad técnica?"
      ]},
      { day: 2, task: "Dashboard y Autenticación", description: "Diseño del dashboard y desarrollo de un sistema de inicio de sesión simulado por roles.", icon: Users, questions: [
          "¿Qué roles de usuario existen en el taller? (Ej: Administrador, Mecánico, Bodeguero, Supervisor)",
          "¿Qué información o acciones debería poder ver/hacer cada rol al iniciar sesión?",
          "¿Es necesario un dashboard general o cada rol debe tener una vista inicial diferente?",
          "¿Cómo es el proceso actual para asignar permisos a los empleados?"
      ]},
      { day: 3, task: "Tabla de Órdenes de Trabajo (OT)", description: "Desarrollo del componente para listar, filtrar y ordenar las OT con su información clave.", icon: GanttChartSquare, questions: [
          "¿Qué información es indispensable ver en el listado de órdenes de un vistazo?",
          "¿Cuáles son los filtros más comunes que usan para buscar una OT? (Por cliente, estado, fecha, etc.)",
          "¿El orden por defecto debería ser por fecha de creación, urgencia o algún otro criterio?",
          "¿Qué estados puede tener una orden de trabajo a lo largo de su ciclo de vida?"
      ]},
      { day: 4, task: "Formularios de Creación/Actualización", description: "Creación de formularios modales para añadir y actualizar órdenes de trabajo.", icon: FileText, questions: [
          "¿Qué datos se deben registrar obligatoriamente al crear una nueva OT?",
          "¿Quién tiene permiso para crear nuevas órdenes? ¿Y para actualizar su estado?",
          "¿Hay campos que solo deberían ser editables en ciertas etapas del proceso?",
          "¿Se necesita adjuntar archivos (fotos, documentos) a una orden de trabajo?"
      ]},
      { day: 5, task: "Revisión y Ajustes", description: "Pruebas de funcionalidades, corrección de errores y refinamiento de la interfaz.", icon: CheckCircle, questions: [
          "¿El flujo de crear y actualizar una orden se siente intuitivo?",
          "¿Hay algún campo o información que falte en los formularios o en la tabla?",
          "¿La navegación entre las distintas vistas es clara y lógica?",
          "Basado en el uso inicial, ¿hay algo que dificulte las tareas diarias?"
      ]},
    ]
  },
  {
    week: 2,
    title: "Visualización de Datos y Módulos de Gestión",
    days: [
      { day: 6, task: "Gráficos de Estadísticas y KPIs", description: "Implementación de KPIs y gráficos para una visualización rápida del estado operativo.", icon: BarChart2, questions: [
          "¿Cuáles son los 3-5 indicadores clave que la gerencia necesita ver diariamente?",
          "¿Qué tipo de comparativas son más útiles? (Ej: Mes actual vs. mes anterior)",
          "¿Qué información sobre la carga de trabajo o cuellos de botella sería útil visualizar?",
          "¿Les interesa ver gráficos por tipo de componente más reparado o por cliente con más órdenes?"
      ]},
      { day: 7, task: "Diagrama de Gantt", description: "Creación de una vista de Gantt para visualizar la duración y solapamiento de las OT.", icon: GanttChartSquare, questions: [
          "¿Cómo planifican actualmente la carga de trabajo en el tiempo?",
          "¿Sería útil poder filtrar el Gantt por cliente, equipo o tipo de trabajo?",
          "¿Qué información debería mostrar la barra de cada tarea en el Gantt? (Ej: N° de OT, estado)",
          "¿Necesitan ver dependencias entre tareas en el diagrama de Gantt?"
      ]},
      { day: 8, task: "Módulo de Gestión de Clientes", description: "Desarrollo de un directorio de clientes para añadir, editar y ver su historial.", icon: Users, questions: [
          "¿Qué información de contacto es crucial para cada cliente? (Nombre, empresa, email, teléfono)",
          "¿Sería útil poder ver un historial de todas las reparaciones de un cliente específico?",
          "¿Necesitan registrar notas o comentarios específicos para cada cliente?",
          "¿Cómo gestionan actualmente su base de datos de clientes?"
      ]},
      { day: 9, task: "Historial y Reportes Imprimibles", description: "Diseño del historial de OT y una ficha técnica imprimible para cada orden.", icon: Printer, questions: [
          "¿Qué información debe contener obligatoriamente la ficha técnica de una OT?",
          "¿Este reporte es para uso interno, para el cliente, o ambos?",
          "¿En qué formato prefieren el reporte? (PDF, impresión directa)",
          "¿Necesitan poder buscar en el historial por rangos de fechas o por cliente?"
      ]},
      { day: 10, task: "Revisión y Pruebas de Integración", description: "Asegurar que todos los módulos funcionen en conjunto y realizar ajustes de usabilidad.", icon: CheckCircle, questions: [
          "¿Los gráficos reflejan la información que esperaban ver?",
          "¿La vista de Gantt ayuda a entender mejor la planificación?",
          "¿El módulo de clientes facilita la gestión de contactos y su historial?",
          "¿Hay alguna funcionalidad que se sienta desconectada del resto de la aplicación?"
      ]},
    ]
  },
  {
    week: 3,
    title: "Funcionalidades Avanzadas y Despliegue",
    days: [
      { day: 11, task: "Observación de Tareas por Usuario", description: "Creación de una vista para supervisar las tareas asignadas a cada usuario.", icon: Search, questions: [
          "¿Cómo supervisan actualmente el trabajo individual de los miembros del equipo?",
          "¿Sería útil para los supervisores ver una lista de tareas por empleado y su estado?",
          "¿Los empleados necesitan una vista personal de 'Mis Tareas'?",
          "¿Deberían existir notificaciones cuando una tarea se completa o se bloquea?"
      ]},
      { day: 12, task: "Módulo de Cotizaciones", description: "Implementación de un editor de cotizaciones para generar PDFs para el cliente.", icon: FileText, questions: [
          "¿Qué estructura tiene una cotización actualmente? (Ítems, mano de obra, impuestos, etc.)",
          "¿Necesitan un catálogo predefinido de ítems y servicios o los añaden manualmente?",
          "¿La cotización debe ser aprobada o rechazada por el cliente dentro del sistema?",
          "¿Cómo se genera y envía la cotización al cliente actualmente?"
      ]},
      { day: 13, task: "Bases para Módulo de Inventario", description: "Diseño de la interfaz y estructura de datos para la futura gestión de stock.", icon: Package, questions: [
          "¿Cómo controlan el stock de repuestos y herramientas hoy en día?",
          "¿Qué información es clave para cada ítem del inventario? (Código, nombre, cantidad, ubicación)",
          "¿Necesitan alertas de stock bajo?",
          "¿El inventario debe descontarse automáticamente al usar un repuesto en una OT?"
      ]},
      { day: 14, task: "Pruebas Finales y Despliegue", description: "Realización de pruebas exhaustivas, optimización del rendimiento y preparación para el despliegue.", icon: Truck, questions: [
          "¿Quiénes serán los usuarios finales que participarán en la capacitación?",
          "¿Cuál es la infraestructura técnica disponible para desplegar la aplicación?",
          "¿Existe un plan de respaldo de datos que debamos considerar?",
          "¿Cómo se gestionará el soporte técnico una vez que la aplicación esté en producción?"
      ]},
      { day: 15, task: "Capacitación y Entrega Final", description: "Sesión de capacitación para los usuarios clave y entrega oficial de la aplicación.", icon: CheckCircle, questions: [
          "¿Los usuarios se sienten cómodos con todas las funcionalidades de la aplicación?",
          "¿Hay alguna parte del flujo de trabajo que necesite una explicación más detallada?",
          "¿Cómo se recogerá el feedback de los usuarios después del lanzamiento?",
          "¿Cuáles son los próximos pasos o futuras funcionalidades deseadas para la plataforma?"
      ]},
    ]
  }
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-bold tracking-tight">
              MineOps Central
            </h1>
          </div>
          <Button onClick={() => router.push('/')}>
            Ir a la Aplicación
          </Button>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Plan de Desarrollo del Proyecto
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Una planificación detallada para la creación de la plataforma MineOps Central en un plazo de 3 semanas.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {timeline.map((weekData) => (
            <Card key={weekData.week} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="font-headline text-xl">
                  Semana {weekData.week}: {weekData.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {weekData.days.map((dayData) => (
                     <AccordionItem value={`item-${dayData.day}`} key={dayData.day} className="border-b px-6">
                        <AccordionTrigger className="hover:no-underline">
                           <div className="flex items-start gap-4 text-left">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                                <dayData.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold leading-tight">Día {dayData.day}: {dayData.task}</p>
                                <p className="mt-1 text-sm text-muted-foreground font-normal">{dayData.description}</p>
                              </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="pl-14 pr-4 py-4 border-l-2 border-dashed border-primary/50 ml-5">
                             <h4 className="flex items-center text-sm font-semibold mb-3 text-primary">
                                <HelpCircle className="h-4 w-4 mr-2"/>
                                Preguntas Clave para Recolección de Datos
                             </h4>
                             <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                {dayData.questions.map((q, index) => (
                                    <li key={index}>{q}</li>
                                ))}
                             </ul>
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
         <div className="mt-16 text-center">
            <p className="text-muted-foreground">Este plan estratégico asegura una entrega incremental y de alta calidad, permitiendo revisiones y ajustes continuos.</p>
            <Button size="lg" className="mt-6" onClick={() => router.push('/')}>
                Acceder a la Versión Actual
            </Button>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MineOps Central. Una solución a medida para la gestión de operaciones.</p>
        </div>
      </footer>
    </div>
  );
}
