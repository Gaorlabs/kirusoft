

import React from 'react';
import type { DentalTreatment, AppointmentStatus } from './types';
import { CariesIcon, CrownIcon, EndodonticsIcon, FillingIcon, HealthyIcon, ImplantIcon, MissingIcon, UneruptedIcon, ExtractionIcon, PreventionIcon, RemovableProsthesisIcon, PulpotomyIcon, PostAndCoreIcon } from './components/icons';

export const DENTAL_TREATMENTS: DentalTreatment[] = [
    { id: 'caries', label: 'Caries', category: 'Patología', price: 80, appliesTo: 'surface', icon: <CariesIcon /> },
    { id: 'extraction', label: 'Extracción', category: 'Cirugía', price: 150, appliesTo: 'whole_tooth', icon: <ExtractionIcon /> },
    { id: 'filling', label: 'Obturación', category: 'Operatoria', price: 120, appliesTo: 'surface', icon: <FillingIcon /> },
    { id: 'sealant', label: 'Sellador', category: 'Operatoria', price: 60, appliesTo: 'surface', icon: <PreventionIcon /> },
    { id: 'endodontics', label: 'Endodoncia', category: 'Endodoncia', price: 450, appliesTo: 'root', icon: <EndodonticsIcon /> },
    { id: 'pulpotomy', label: 'Pulpotomía', category: 'Endodoncia', price: 250, appliesTo: 'root', icon: <PulpotomyIcon /> },
    { id: 'crown', label: 'Corona', category: 'Rehabilitación', price: 1000, appliesTo: 'surface', icon: <CrownIcon /> },
    { id: 'implant', label: 'Implante', category: 'Rehabilitación', price: 3000, appliesTo: 'root', icon: <ImplantIcon /> },
    { id: 'post-and-core', label: 'Perno y Muñón', category: 'Rehabilitación', price: 300, appliesTo: 'root', icon: <PostAndCoreIcon /> },
    { id: 'removable-prosthesis', label: 'Prótesis Removible', category: 'Rehabilitación', price: 1200, appliesTo: 'whole_tooth', icon: <RemovableProsthesisIcon /> },
    { id: 'missing', label: 'Ausente', category: 'Otros', price: 0, appliesTo: 'whole_tooth', icon: <MissingIcon /> },
    { id: 'unerupted', label: 'No Erupcionado', category: 'Otros', price: 0, appliesTo: 'whole_tooth', icon: <UneruptedIcon /> },
];

export const DENTAL_SERVICES = [
    { id: 'prevention', label: 'Prevención y Diagnóstico' },
    { id: 'restorations', label: 'Restauraciones' },
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

export const TREATMENTS_MAP = DENTAL_TREATMENTS.reduce((acc, treatment) => {
    acc[treatment.id] = treatment;
    return acc;
}, {} as Record<string, DentalTreatment>);


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
    },
    {
        id: 'endodontics',
        title: 'Consentimiento para Endodoncia',
    },
    {
        id: 'implant',
        title: 'Consentimiento para Implante Dental',
    },
    {
        id: 'cosmetic',
        title: 'Consentimiento para Procedimiento Cosmético',
    },
];