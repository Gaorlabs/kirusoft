

import React from 'react';
import type { DentalTreatment, AppointmentStatus } from './types';
import { CariesIcon, CrownIcon, EndodonticsIcon, FillingIcon, HealthyIcon, ImplantIcon, MissingIcon, UneruptedIcon, ExtractionIcon, PreventionIcon, RemovableProsthesisIcon, PulpotomyIcon, PostAndCoreIcon, FractureIcon } from './components/icons';

export const INITIAL_DENTAL_TREATMENTS: DentalTreatment[] = [
    { id: 'caries', label: 'Caries', category: 'Patología', price: 80, appliesTo: 'surface', icon: <CariesIcon /> },
    { id: 'fractura', label: 'Fractura', category: 'Patología', price: 0, appliesTo: 'surface', icon: <FractureIcon /> },
    { id: 'remanente-radicular', label: 'Remanente Radicular', category: 'Patología', price: 0, appliesTo: 'root', icon: <ExtractionIcon /> },
    { id: 'restauracion-temporal', label: 'Restauración Temporal', category: 'Patología', price: 50, appliesTo: 'surface', icon: <FillingIcon /> },
    { id: 'extraction', label: 'Extracción', category: 'Cirugía', price: 150, appliesTo: 'whole_tooth', icon: <ExtractionIcon /> },
    { id: 'filling', label: 'Obturación', category: 'Operatoria', price: 120, appliesTo: 'surface', icon: <FillingIcon /> },
    { id: 'sealant', label: 'Sellador', category: 'Operatoria', price: 60, appliesTo: 'surface', icon: <PreventionIcon /> },
    { id: 'endodontics', label: 'Endodoncia', category: 'Endodoncia', price: 450, appliesTo: 'root', icon: <EndodonticsIcon /> },
    { id: 'pulpotomy', label: 'Pulpotomía', category: 'Endodoncia', price: 250, appliesTo: 'root', icon: <PulpotomyIcon /> },
    { id: 'crown', label: 'Corona', category: 'Rehabilitación', price: 1000, appliesTo: 'surface', icon: <CrownIcon /> },
    { id: 'corona-temporal', label: 'Corona Temporal', category: 'Patología', price: 200, appliesTo: 'surface', icon: <CrownIcon /> },
    { id: 'implant', label: 'Implante', category: 'Rehabilitación', price: 3000, appliesTo: 'root', icon: <ImplantIcon /> },
    { id: 'post-and-core', label: 'Perno y Muñón', category: 'Rehabilitación', price: 300, appliesTo: 'root', icon: <PostAndCoreIcon /> },
    { id: 'removable-prosthesis', label: 'Prótesis Removible', category: 'Rehabilitación', price: 1200, appliesTo: 'whole_tooth', icon: <RemovableProsthesisIcon /> },
    { id: 'missing', label: 'Ausente', category: 'Otros', price: 0, appliesTo: 'whole_tooth', icon: <MissingIcon /> },
    { id: 'unerupted', label: 'No Erupcionado', category: 'Otros', price: 0, appliesTo: 'whole_tooth', icon: <UneruptedIcon /> },
];

export const DENTAL_SERVICES = [
    { id: 'general_consultation', label: 'Consulta General / Diagnóstico' },
    { id: 'prevention', label: 'Limpieza y Prevención' },
    { id: 'restorations', label: 'Restauraciones (Curaciones)' },
    { id: 'endodontics', label: 'Endodoncia' },
    { id: 'orthodontics', label: 'Ortodoncia' },
    { id: 'oral_surgery', label: 'Cirugía Bucal' },
    { id: 'cosmetic_dentistry', label: 'Estética Dental' },
    { id: 'emergency', label: 'Urgencia' },
];

export const DENTAL_SERVICES_MAP = DENTAL_SERVICES.reduce((acc, service) => {
    acc[service.id] = service.label;
    return acc;
}, {} as Record<string, string>);

export const TREATMENT_CATEGORIES = [
    'Patología',
    'Operatoria',
    'Endodoncia',
    'Rehabilitación',
    'Cirugía',
    'Otros',
];

export const QUADRANTS_PERMANENT = {
    UPPER_RIGHT: [18, 17, 16, 15, 14, 13, 12, 11],
    UPPER_LEFT: [21, 22, 23, 24, 25, 26, 27, 28],
    LOWER_RIGHT: [48, 47, 46, 45, 44, 43, 42, 41],
    LOWER_LEFT: [31, 32, 33, 34, 35, 36, 37, 38],
};

export const ALL_TEETH_PERMANENT = [
    ...QUADRANTS_PERMANENT.UPPER_RIGHT,
    ...QUADRANTS_PERMANENT.UPPER_LEFT,
    ...QUADRANTS_PERMANENT.LOWER_RIGHT.slice().reverse(),
    ...QUADRANTS_PERMANENT.LOWER_LEFT.slice().reverse(),
];

export const QUADRANTS_DECIDUOUS = {
    UPPER_RIGHT: [55, 54, 53, 52, 51],
    UPPER_LEFT: [61, 62, 63, 64, 65],
    LOWER_RIGHT: [85, 84, 83, 82, 81],
    LOWER_LEFT: [71, 72, 73, 74, 75],
};

export const ALL_TEETH_DECIDUOUS = [
    ...QUADRANTS_DECIDUOUS.UPPER_RIGHT,
    ...QUADRANTS_DECIDUOUS.UPPER_LEFT,
    ...QUADRANTS_DECIDUOUS.LOWER_RIGHT.slice().reverse(),
    ...QUADRANTS_DECIDUOUS.LOWER_LEFT.slice().reverse(),
];

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, { title: string; color: string; textColor: string; borderColor: string; kanbanHeaderBg: string; }> = {
    requested: { title: 'Por Confirmar', color: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-800 dark:text-yellow-200', borderColor: 'border-yellow-500', kanbanHeaderBg: 'bg-yellow-500' },
    confirmed: { title: 'Confirmadas', color: 'bg-blue-100 dark:bg-blue-900/50', textColor: 'text-blue-800 dark:text-blue-200', borderColor: 'border-blue-500', kanbanHeaderBg: 'bg-blue-500' },
    waiting: { title: 'En Sala de Espera', color: 'bg-purple-100 dark:bg-purple-900/50', textColor: 'text-purple-800 dark:text-purple-200', borderColor: 'border-purple-500', kanbanHeaderBg: 'bg-purple-500' },
    in_consultation: { title: 'En Consulta', color: 'bg-teal-100 dark:bg-teal-900/50', textColor: 'text-teal-800 dark:text-teal-200', borderColor: 'border-teal-500', kanbanHeaderBg: 'bg-teal-500' },
    completed: { title: 'Completadas', color: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-800 dark:text-green-200', borderColor: 'border-green-500', kanbanHeaderBg: 'bg-green-500' },
    canceled: { title: 'Canceladas', color: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-800 dark:text-red-200', borderColor: 'border-red-500', kanbanHeaderBg: 'bg-red-500' },
};

export const KANBAN_COLUMNS: AppointmentStatus[] = ['requested', 'confirmed', 'waiting', 'in_consultation', 'completed', 'canceled'];


export const CONSENT_TEMPLATES = [
    {
        id: 'extraction',
        title: 'Consentimiento para Extracción Dental',
        content: `Yo, [PACIENTE], por la presente autorizo al profesional a cargo y a su equipo a realizar el procedimiento de extracción dental.\n\nHe sido informado(a) sobre la naturaleza del procedimiento, los beneficios, los riesgos potenciales (incluyendo, pero no limitado a, dolor, hinchazón, infección, sangrado, daño a dientes adyacentes, y parestesia) y las alternativas al tratamiento.\n\nEntiendo que no hay garantías sobre el resultado del procedimiento y que se me han respondido todas mis preguntas a mi entera satisfacción.\n\nFecha: [FECHA]`
    },
    {
        id: 'endodontics',
        title: 'Consentimiento para Endodoncia',
        content: `Yo, [PACIENTE], autorizo al profesional a cargo a realizar un tratamiento de conductos (endodoncia).\n\nSe me ha explicado que este procedimiento implica la remoción del tejido pulpar (nervio), la limpieza y desinfección de los conductos radiculares, y su posterior sellado.\n\nComprendo los riesgos, que incluyen la posibilidad de fractura del instrumento dentro del conducto, perforación de la raíz, y la posibilidad de que el tratamiento no elimine completamente la infección, pudiendo requerir un retratamiento o cirugía apical.\n\nConfirmo que he tenido la oportunidad de hacer preguntas y que estas han sido contestadas satisfactoriamente.\n\nFecha: [FECHA]`
    },
    {
        id: 'implant',
        title: 'Consentimiento para Implante Dental',
        content: `Yo, [PACIENTE], doy mi consentimiento para la colocación de un implante dental.\n\nComprendo que este es un procedimiento quirúrgico para reemplazar una raíz dental perdida y que servirá como soporte para una futura corona. Se me han explicado los riesgos, incluyendo infección, fallo del implante en integrarse con el hueso, y daño a estructuras anatómicas cercanas.\n\nEntiendo el plan de tratamiento, los costos asociados y el tiempo de curación requerido.\n\nFecha: [FECHA]`
    },
    {
        id: 'cosmetic',
        title: 'Consentimiento para Procedimiento Cosmético',
        content: `Yo, [PACIENTE], consiento en someterme a un procedimiento cosmético (ej. blanqueamiento, carillas).\n\nEntiendo que este es un tratamiento electivo para mejorar la estética de mi sonrisa y que los resultados pueden variar. He discutido mis expectativas con el profesional y comprendo los posibles riesgos, beneficios y alternativas.\n\nAcepto que los resultados no son permanentes y pueden requerir mantenimiento futuro.\n\nFecha: [FECHA]`
    },
];

export const COMMON_MEDICATIONS = [
    { name: 'Amoxicilina', presentation: '500mg Cápsulas', dosage: 'Tomar 1 cápsula cada 8 horas por 7 días.' },
    { name: 'Ibuprofeno', presentation: '400mg Tabletas', dosage: 'Tomar 1 tableta cada 6 horas si hay dolor.' },
    { name: 'Paracetamol', presentation: '500mg Tabletas', dosage: 'Tomar 1 tableta cada 8 horas para fiebre o dolor.' },
    { name: 'Clorhexidina enjuague bucal', presentation: '0.12% Solución', dosage: 'Realizar enjuagues con 15ml por 30 segundos, 2 veces al día.' },
    { name: 'Clindamicina', presentation: '300mg Cápsulas', dosage: 'Tomar 1 cápsula cada 6 horas por 7 días.' },
    { name: 'Ketorolaco', presentation: '10mg Tabletas', dosage: 'Tomar 1 tableta cada 8 horas por 3 días (máximo).' },
    { name: 'Dexametasona', presentation: '4mg Tabletas', dosage: 'Tomar 1 tableta dosis única o según indicación profesional.' },
    { name: 'Metronidazol', presentation: '500mg Tabletas', dosage: 'Tomar 1 tableta cada 8 horas por 7 días (usualmente combinado).' },
    { name: 'Nistatina enjuague bucal', presentation: '100,000 U.I./mL Suspensión', dosage: 'Enjuagar con 5ml por 2 minutos y tragar, 4 veces al día.' },
];

export const COMMON_RECOMMENDATIONS = [
    'No escupir ni enjuagarse las primeras 24 horas.',
    'Aplicar hielo en la zona por 15 minutos.',
    'Dieta blanda y fría las primeras 24 horas.',
    'No consumir alcohol ni fumar.',
    'Mantener una buena higiene bucal con cepillado suave en la zona.',
];