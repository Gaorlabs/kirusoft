

import React from 'react';
import type { Prescription, Doctor } from '../types';
import { DentalIcon } from './icons';

interface PrescriptionToPrintProps {
    prescription: Prescription;
    clinicName: string;
    patientName: string;
    doctor?: Doctor;
}

export const PrescriptionToPrint = React.forwardRef<HTMLDivElement, PrescriptionToPrintProps>(
    ({ prescription, clinicName, patientName, doctor }, ref) => {
    
    const recommendationsList = prescription.recommendations ? prescription.recommendations.split('\n').map(r => r.replace(/^- /, '')).filter(r => r) : [];

    return (
        <div ref={ref} className="bg-white text-slate-800 font-sans">
            <div className="w-[210mm] min-h-[297mm] p-10 mx-auto flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b border-slate-300">
                    <div className="flex items-center space-x-4">
                        <DentalIcon className="w-16 h-16 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{clinicName} Dental</h1>
                            <p className="text-slate-500 text-xs">Salud y Estética Dental de Confianza</p>
                        </div>
                    </div>
                    {doctor && (
                        <div className="text-right">
                            <p className="font-bold text-lg">{doctor.name}</p>
                            <p className="text-sm text-slate-600">{doctor.specialty}</p>
                            <p className="text-sm text-slate-500 font-mono">{doctor.licenseNumber}</p>
                        </div>
                    )}
                </header>

                {/* Patient Info */}
                <section className="my-8">
                    <h2 className="text-2xl font-bold text-slate-500 mb-4 tracking-wider uppercase">Receta Médica</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Paciente</p>
                            <p className="font-bold text-slate-800 text-base">{patientName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Fecha de Emisión</p>
                            <p className="font-bold text-slate-800 text-base">{new Date(prescription.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        {prescription.relatedTreatment && (
                            <div className="col-span-2 mt-2">
                                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Tratamiento Asociado</p>
                                <p className="font-medium text-slate-800 text-base">{prescription.relatedTreatment}</p>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Body */}
                <main className="flex-1 space-y-8">
                    <div>
                        <h3 className="font-bold text-pink-600 text-2xl mb-3">Rp/</h3>
                        <div className="space-y-4">
                            {prescription.medications.map((med, index) => (
                                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                                    <p className="font-bold text-slate-900 text-lg">{index + 1}. {med.name}</p>
                                    <p className="text-slate-500 text-sm mb-2">{med.presentation}</p>
                                    <p className="text-slate-700 bg-slate-50 p-2 rounded-md whitespace-pre-wrap">{med.dosage}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {recommendationsList.length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-200 pb-2 mb-3">Recomendaciones</h3>
                            <ul className="pl-5 list-disc space-y-2 text-slate-700">
                                {recommendationsList.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-auto pt-16 text-center">
                    <div className="border-t-2 border-slate-400 w-80 mx-auto pt-4">
                        <p className="font-semibold text-lg">{doctor?.name}</p>
                        <p className="text-sm text-slate-500">Firma y Sello del Profesional</p>
                    </div>
                </footer>
            </div>
        </div>
    );
});