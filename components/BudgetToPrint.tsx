

import React, { useMemo } from 'react';
import type { Budget, ClinicalFinding, Doctor, AppSettings } from '../types';
import { TREATMENTS_MAP } from '../constants';
import { DentalIcon } from './icons';

interface BudgetToPrintProps {
    budget: Budget;
    patientName: string;
    findings: ClinicalFinding[];
    doctors: Doctor[];
    settings: AppSettings;
}

export const BudgetToPrint = React.forwardRef<HTMLDivElement, BudgetToPrintProps>(
    ({ budget, patientName, findings, doctors, settings }, ref) => {
    
    const doctorsMap = useMemo(() => doctors.reduce((acc, doc) => ({...acc, [doc.id]: doc}), {} as Record<string, Doctor>), [doctors]);

    const totalCost = useMemo(() => {
        return budget.proposedSessions.flatMap(s => s.findingIds).reduce((total, findingId) => {
            const finding = findings.find(f => f.id === findingId);
            return total + (finding ? TREATMENTS_MAP[finding.condition].price : 0);
        }, 0);
    }, [budget, findings]);

    return (
        <div ref={ref} className="bg-white text-slate-800 font-sans">
            <div className="w-[210mm] h-[297mm] p-12 mx-auto">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b-2 border-slate-200">
                    <div className="flex items-center space-x-4">
                        <DentalIcon className="w-16 h-16 text-blue-600" />
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight">{settings.clinicName} Dental</h1>
                            <p className="text-slate-500 text-sm mt-1">{settings.clinicAddress}</p>
                            <p className="text-slate-500 text-sm">{settings.clinicPhone} | {settings.clinicEmail}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-widest">Presupuesto</h2>
                        <p className="text-sm"><span className="font-semibold">ID:</span> {budget.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm"><span className="font-semibold">Fecha:</span> {new Date(budget.date).toLocaleDateString('es-ES')}</p>
                        <p className="text-sm"><span className="font-semibold">Validez:</span> 30 días</p>
                    </div>
                </header>

                {/* Patient Info */}
                <section className="my-8">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Presupuesto para:</p>
                        <p className="font-bold text-slate-800 text-2xl">{patientName}</p>
                        <p className="font-semibold text-slate-700 text-lg">{budget.name}</p>
                    </div>
                </section>
                
                {/* Detailed Plan */}
                <main className="space-y-6">
                    {budget.proposedSessions.map((session, sessionIndex) => {
                        const doctor = session.doctorId ? doctorsMap[session.doctorId] : null;
                        return(
                            <div key={session.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 p-3 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-blue-700">Sesión {sessionIndex + 1}: {session.name}</h3>
                                    <div className="text-right text-xs">
                                        {session.scheduledDate && <p><span className="font-semibold">Fecha Sugerida:</span> {new Date(session.scheduledDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>}
                                        {doctor && <p><span className="font-semibold">Doctor:</span> {doctor.name}</p>}
                                    </div>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-500 text-xs uppercase">
                                            <th className="p-2 font-semibold">Procedimiento</th>
                                            <th className="p-2 font-semibold">Pieza</th>
                                            <th className="p-2 font-semibold">Superficie</th>
                                            <th className="p-2 font-semibold text-right">Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.findingIds.map((fid) => {
                                            const f = findings.find(fin => fin.id === fid);
                                            if (!f) return null;
                                            const t = TREATMENTS_MAP[f.condition];
                                            
                                            return (
                                                <tr key={fid} className="border-t border-slate-100">
                                                    <td className="p-2">{t.label}</td>
                                                    <td className="p-2">{f.toothId}</td>
                                                    <td className="p-2 capitalize">{f.surface}</td>
                                                    <td className="p-2 text-right font-mono">S/ {t.price.toFixed(2)}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </main>

                {/* Financial Summary */}
                <section className="mt-10 flex justify-end">
                    <div className="w-2/5 space-y-2 text-base">
                        <div className="flex justify-between font-semibold">
                            <span className="text-slate-600">Subtotal:</span>
                            <span className="font-mono">S/ {totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span className="text-slate-600">Descuento:</span>
                            <span className="font-mono">S/ 0.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-2xl border-t-2 pt-2 mt-2 border-slate-800">
                            <span>TOTAL:</span>
                            <span className="font-mono text-blue-600">S/ {totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
                    <h4 className="font-semibold uppercase tracking-wider mb-2">Términos y Condiciones</h4>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.</li>
                        <li>Los precios están expresados en Soles (PEN) y no incluyen IGV, a menos que se especifique lo contrario.</li>
                        <li>Este plan de tratamiento puede estar sujeto a cambios según la evolución clínica del paciente.</li>
                        <li>Los pagos por cada sesión deben realizarse antes de iniciar el tratamiento correspondiente.</li>
                    </ul>

                    <div className="mt-16 flex justify-between items-end">
                        <div className="text-center">
                            <div className="border-t-2 border-slate-400 w-64 pt-2">
                                <p className="font-semibold text-sm">Firma del Paciente</p>
                                <p>(En señal de aceptación)</p>
                            </div>
                        </div>
                        <p className="text-center">¡Gracias por confiar en {settings.clinicName} Dental!</p>
                    </div>
                </footer>
            </div>
        </div>
    );
});
