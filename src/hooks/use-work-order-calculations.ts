
import { useMemo } from 'react';
import { isValid, parseISO, eachDayOfInterval, isWeekend } from 'date-fns';
import type { WorkOrder } from '@/lib/types';

export function useWorkOrderCalculations(order: WorkOrder) {
  const calculations = useMemo(() => {
    const today = new Date();

    const toValidDate = (date: any): Date | null => {
        if (!date) return null;
        if (date.seconds) return new Date(date.seconds * 1000);
        if (date instanceof Date) return isValid(date) ? date : null;

        const dateStr = date as string;

        // Para cualquier string de fecha, extraer solo la parte YYYY-MM-DD
        // y crear la fecha en zona horaria local para evitar desfases por UTC
        const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const [, year, month, day] = dateMatch;
            const localDate = new Date(Number(year), Number(month) - 1, Number(day));
            return isValid(localDate) ? localDate : null;
        }

        const parsed = parseISO(dateStr);
        return isValid(parsed) ? parsed : null;
    };

    const createdAt = toValidDate(order.createdAt);
    const evaluationStartDate = toValidDate(order.evaluationStartDate);
    const evaluationEndDate = toValidDate(order.evaluationEndDate);
    const assemblyStartDate = toValidDate(order.assemblyStartDate);
    const assemblyEndDate = toValidDate(order.assemblyEndDate);

    // Cuenta días hábiles incluyendo el día inicial y el final
    const calculateInclusiveBusinessDays = (start: Date | null, end: Date | null): number | null => {
        if (!start || !end) return null;
        if (start > end) return 0;

        // Obtener todos los días en el intervalo (incluye inicio y fin)
        const allDays = eachDayOfInterval({ start, end });

        // Contar solo los días que NO son fin de semana
        const businessDays = allDays.filter(day => !isWeekend(day));

        return businessDays.length;
    }


    // 1. Tiempo de espera para desarme y evaluación (en días hábiles)
    let evaluationWaitTime: number | null = null;
    if (createdAt) {
      const endWaitDate = evaluationStartDate || today;
      evaluationWaitTime = calculateInclusiveBusinessDays(createdAt, endWaitDate);
    }

    // 2. Tiempo de desarme y evaluación (en días hábiles)
    let evaluationTime: number | null = null;
    if (evaluationStartDate) {
      const endEvalDate = evaluationEndDate || today;
      evaluationTime = calculateInclusiveBusinessDays(evaluationStartDate, endEvalDate);
    }
    
    // 3. Horas-hombre de desarme y evaluación (basado en días hábiles)
    let calculatedManHours: number | null = null;
    const evalMechanics = order.evaluationMechanics || 0;
    if (evaluationTime !== null && evalMechanics > 0) {
        calculatedManHours = evaluationTime * evalMechanics * 8; // Asumiendo 8 horas por día hábil
    }

    // 4. Tiempo de armado (en días hábiles)
    let assemblyTime: number | null = null;
    if(assemblyStartDate) {
        const endAssemblyDate = assemblyEndDate || today;
        assemblyTime = calculateInclusiveBusinessDays(assemblyStartDate, endAssemblyDate);
    }

    // 5. Horas-hombre de armado
    let calculatedAssemblyManHours: number | null = null;
    const assemblyMechanics = order.assemblyMechanics || 0;
    if (assemblyTime !== null && assemblyMechanics > 0) {
        calculatedAssemblyManHours = assemblyTime * assemblyMechanics * 8; // Asumiendo 8 horas por día hábil
    }


    return {
      evaluationWaitTime,
      evaluationTime,
      calculatedManHours,
      assemblyTime,
      calculatedAssemblyManHours
    };
  }, [order]);

  return calculations;
}
