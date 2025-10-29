

import React, { useMemo } from 'react';
import type { Budget, ClinicalFinding, Doctor, AppSettings, DentalTreatment } from '../types';
import { DentalIcon } from './icons';

interface BudgetToPrintProps {
    budget: Budget;
    patientName: string;
    findings: ClinicalFinding[];
    doctors: Doctor[];
    settings: AppSettings;
    treatments: DentalTreatment[];
}

export const BudgetToPrint = React.forwardRef<HTMLDivElement, BudgetToPrintProps>(
    ({ budget, patientName, findings, doctors, settings, treatments }, ref) => {
    
    const doctorsMap = useMemo(() => doctors.reduce((acc, doc) => ({...acc, [doc.id]: doc}), {} as Record<string, Doctor>), [doctors]);

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    const totalCost = useMemo(() => {
        return budget.proposedSessions.flatMap(s => s.findingIds).reduce((total, findingId) => {
            const finding = findings.find(f => f.id === findingId);
            return total + (finding ? treatmentsMap[finding.condition].price : 0);
        }, 0);
    }, [budget, findings, treatmentsMap]);

    const allProposedTreatments = useMemo(() => {
        return budget.proposedSessions.map(session => {
            const sessionFindings = session.findingIds.map(fid => findings.find(f => f.id === fid)).filter((f): f is ClinicalFinding => !!f);
            return {
                ...session,
                findings: sessionFindings,
                doctor: session.doctorId ? doctorsMap[session.doctorId] : null,
            };
        });
    }, [budget, findings, doctorsMap]);

    return (
        <div ref={ref} className="bg-white text-slate-800 font-sans">
            <div className="w-[210mm] min-h-[297mm] p-10 mx-auto flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b border-slate-300">
                    <div className="flex items-center space-x-4">
                        <DentalIcon className="w-16 h-16 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{settings.clinicName} Dental</h1>
                            <p className="text-slate-500 text-xs">{settings.clinicAddress}</p>
                            <p className="text-slate-500 text-xs">{settings.clinicPhone} | {settings.clinicEmail}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-wider">Presupuesto</h2>
                        <p className="text-xs font-mono text-slate-500 mt-1">ID: {budget.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs font-mono text-slate-500">Fecha: {new Date(budget.date).toLocaleDateString('es-ES')}</p>
                    </div>
                </header>

                {/* Patient Info */}
                <section className="my-8 flex justify-between items-end">
                     <div>
                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Paciente</p>
                        <p className="font-bold text-slate-800 text-xl">{patientName}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Plan de Tratamiento</p>
                        <p className="font-bold text-slate-800 text-lg">{budget.name}</p>
                    </div>
                </section>
                
                {/* Detailed Plan Table */}
                <main className="flex-1">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                                <th className="p-3 font-semibold border-b-2 border-slate-200">Sesión</th>
                                <th className="p-3 font-semibold border-b-2 border-slate-200">Procedimiento</th>
                                <th className="p-3 font-semibold border-b-2 border-slate-200">Detalle</th>
                                <th className="p-3 font-semibold border-b-2 border-slate-200 text-right">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProposedTreatments.map(session => (
                                session.findings.map((finding, index) => {
                                    const treatment = treatmentsMap[finding.condition];
                                    return (
                                        <tr key={finding.id} className="border-b border-slate-100">
                                            {index === 0 && (
                                                <td rowSpan={session.findings.length} className="p-3 align-top border-r border-slate-100">
                                                    <p className="font-bold">{session.name}</p>
                                                    {session.scheduledDate && <p className="text-xs text-slate-500">{new Date(session.scheduledDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>}
                                                    {session.doctor && <p className="text-xs text-slate-500">{session.doctor.name}</p>}
                                                </td>
                                            )}
                                            <td className="p-3">{treatment.label}</td>
                                            <td className="p-3 text-slate-500">
                                                Pieza: {finding.toothId}
                                                {finding.surface !== 'whole' && `, Sup: ${finding.surface}`}
                                            </td>
                                            <td className="p-3 text-right font-mono">S/ {treatment.price.toFixed(2)}</td>
                                        </tr>
                                    );
                                })
                            ))}
                        </tbody>
                    </table>
                </main>

                 {/* Observations */}
                {budget.observations && (
                    <section className="mt-8">
                        <h4 className="font-semibold uppercase tracking-wider mb-2 text-slate-600 text-xs">Observaciones Adicionales</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap p-4 bg-slate-50 border rounded-lg">{budget.observations}</p>
                    </section>
                )}

                {/* Financial Summary & Footer */}
                <footer className="mt-auto pt-8">
                    <div className="flex justify-end">
                        <div className="w-2/5 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal:</span>
                                <span className="font-mono">S/ {totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Descuento:</span>
                                <span className="font-mono">S/ 0.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl border-t-2 pt-2 mt-2 border-slate-800">
                                <span>TOTAL:</span>
                                <span className="font-mono text-blue-600">S/ {totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-16 flex justify-between items-end text-xs text-slate-500">
                         <div className="w-1/2">
                            <h4 className="font-semibold uppercase tracking-wider mb-2 text-slate-600">Términos</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Presupuesto válido por 30 días.</li>
                                <li>Plan de tratamiento sujeto a cambios según evolución clínica.</li>
                            </ul>
                        </div>
                        <div className="text-center w-1/3">
                            <div className="border-t border-slate-400 pt-2">
                                <p className="font-semibold text-sm text-slate-700">Firma del Paciente</p>
                                <p>(Aceptación del Presupuesto)</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});