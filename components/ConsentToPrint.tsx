

import React from 'react';
import type { ConsentForm, Doctor } from '../types';
import { DentalIcon } from './icons';

interface ConsentToPrintProps {
    consent: ConsentForm;
    clinicName: string;
    patientName: string;
    doctor?: Doctor;
}

export const ConsentToPrint = React.forwardRef<HTMLDivElement, ConsentToPrintProps>(
    ({ consent, clinicName, patientName, doctor }, ref) => {
    
    const getFormattedContent = () => {
        return consent.content
            .replace(/\[PACIENTE\]/g, `__${patientName.toUpperCase()}__`)
            .replace(/\[FECHA\]/g, consent.dateSigned ? new Date(consent.dateSigned).toLocaleDateString('es-ES') : '__' + new Date().toLocaleDateString('es-ES') + '__');
    };

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
                        </div>
                    )}
                </header>

                {/* Title and Patient Info */}
                <section className="my-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-wider uppercase">{consent.title}</h2>
                </section>
            
                {/* Body */}
                <main className="flex-1 space-y-6 text-justify text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap">{getFormattedContent()}</p>
                </main>

                {/* Footer with Signatures */}
                <footer className="mt-auto pt-16 grid grid-cols-2 gap-16 items-end">
                    <div className="text-center">
                        <div className="p-4 h-32 flex items-center justify-center">
                            {consent.signatureDataUrl && <img src={consent.signatureDataUrl} alt="Firma del paciente" className="h-24" />}
                        </div>
                        <div className="border-t-2 border-slate-400 pt-2">
                            <p className="font-semibold text-base">{patientName}</p>
                            <p className="text-sm text-slate-500">Firma del Paciente o Apoderado</p>
                        </div>
                    </div>
                     <div className="text-center">
                        <div className="h-32"></div>
                        <div className="border-t-2 border-slate-400 pt-2">
                            <p className="font-semibold text-base">{doctor?.name}</p>
                            <p className="text-sm text-slate-500">Firma y Sello del Profesional</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});