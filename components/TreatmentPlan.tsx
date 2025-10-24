
import React, { useState, useMemo } from 'react';
import type { Session, AppliedTreatment, ClinicalFinding } from '../types';
import { TREATMENTS_MAP } from '../constants';
import { CheckIcon, UndoIcon, PlusIcon, TrashIcon, SaveIcon, CalendarIcon } from './icons';

interface ProposedSession {
    id: string;
    name: string;
    scheduledDate: string;
    findingIds: string[];
}

interface TreatmentPlanBuilderProps {
    findings: ClinicalFinding[];
    onSavePlan: (sessions: Omit<ProposedSession, 'id'>[]) => void;
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ findings, onSavePlan }) => {
    const [sessions, setSessions] = useState<ProposedSession[]>([]);
    const [unassignedFindings, setUnassignedFindings] = useState(findings);

    const totalCost = useMemo(() => {
        return sessions.flatMap(s => s.findingIds).reduce((total, findingId) => {
            const finding = findings.find(f => f.id === findingId);
            const treatment = finding ? TREATMENTS_MAP[finding.condition] : null;
            return total + (treatment?.price || 0);
        }, 0);
    }, [sessions, findings]);

    const handleAddSession = () => {
        const newSession: ProposedSession = {
            id: crypto.randomUUID(),
            name: `Sesión ${sessions.length + 1}`,
            scheduledDate: '',
            findingIds: [],
        };
        setSessions([...sessions, newSession]);
    };

    const handleUpdateSession = (id: string, newName: string, newDate: string) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, name: newName, scheduledDate: newDate } : s));
    };

    const handleRemoveSession = (id: string) => {
        const sessionToRemove = sessions.find(s => s.id === id);
        if (sessionToRemove) {
            const findingsToUnassign = findings.filter(f => sessionToRemove.findingIds.includes(f.id));
            setUnassignedFindings(prev => [...prev, ...findingsToUnassign]);
        }
        setSessions(sessions.filter(s => s.id !== id));
    };

    const handleAssignFinding = (findingId: string, sessionId: string) => {
        setSessions(sessions.map(s => {
            if (s.id === sessionId) {
                return { ...s, findingIds: [...s.findingIds, findingId] };
            }
            return { ...s, findingIds: s.findingIds.filter(id => id !== findingId) };
        }));
        setUnassignedFindings(unassignedFindings.filter(f => f.id !== findingId));
    };
    
    const getFindingDetails = (id: string) => findings.find(f => f.id === id);

    const handleSave = () => {
        if (unassignedFindings.length > 0) {
            if (!window.confirm("Hay hallazgos sin asignar. ¿Desea guardad el plan de todos modos?")) {
                return;
            }
        }
        onSavePlan(sessions.map(({ id, ...rest }) => rest));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Constructor de Plan de Tratamiento</h3>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                    <SaveIcon /><span>Guardar Plan</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-semibold text-lg">Sesiones Propuestas</h4>
                    {sessions.map(session => (
                        <div key={session.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                             <div className="flex items-center justify-between mb-3">
                                <input 
                                    type="text" 
                                    value={session.name} 
                                    onChange={(e) => handleUpdateSession(session.id, e.target.value, session.scheduledDate)}
                                    className="text-md font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-gray-200"
                                />
                                <div className="flex items-center space-x-2">
                                     <input 
                                        type="date"
                                        value={session.scheduledDate}
                                        onChange={(e) => handleUpdateSession(session.id, session.name, e.target.value)}
                                        className="p-1 text-sm rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                    />
                                    <button onClick={() => handleRemoveSession(session.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <ul className="space-y-2 min-h-[50px]">
                                {session.findingIds.map(id => {
                                    const finding = getFindingDetails(id);
                                    const treatment = finding ? TREATMENTS_MAP[finding.condition] : null;
                                    return (
                                        <li key={id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                                            <span>{treatment?.label} (Diente: {finding?.toothId})</span>
                                            <span className="font-semibold">S/ {treatment?.price.toFixed(2)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                     <button onClick={handleAddSession} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <PlusIcon className="inline w-5 h-5 mr-2"/>Añadir Sesión
                    </button>
                     <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-gray-100">
                            <span>Total de la Propuesta:</span>
                            <span>S/ {totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-lg mb-3">Hallazgos Sin Asignar</h4>
                    <ul className="space-y-2">
                        {unassignedFindings.map(finding => {
                            const treatment = TREATMENTS_MAP[finding.condition];
                            return (
                                <li key={finding.id} className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm">
                                    <div>
                                        <p className="font-semibold">{treatment.label}</p>
                                        <p className="text-xs">Diente: {finding.toothId}</p>
                                    </div>
                                    <select onChange={(e) => handleAssignFinding(finding.id, e.target.value)} value="" className="p-1 text-xs rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        <option value="" disabled>Asignar...</option>
                                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SessionCard: React.FC<{ session: Session; onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void; }> = ({ session, onToggleTreatmentStatus }) => {
    const proposedItems = session.treatments.filter(t => t.status === 'proposed');
    const completedItems = session.treatments.filter(t => t.status === 'completed');

    const calculateTotal = (items: AppliedTreatment[]): number => {
        return items.reduce((total, item) => {
            const treatmentInfo = TREATMENTS_MAP[item.treatmentId];
            return total + (treatmentInfo ? treatmentInfo.price : 0);
        }, 0);
    };

    const proposedTotal = calculateTotal(proposedItems);
    const completedTotal = calculateTotal(completedItems);

    const renderItems = (items: AppliedTreatment[], type: 'proposed' | 'completed') => {
        if (items.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400 px-2 text-sm">No hay tratamientos en esta sección.</p>;
        }
        
        const borderColor = type === 'proposed' ? 'border-yellow-500/50' : 'border-green-500/50';

        return (
             <ul className="space-y-2">
                {items.map((item) => {
                    const treatmentInfo = TREATMENTS_MAP[item.treatmentId];
                    if (!treatmentInfo) return null;
                    
                    let description = `Diente: ${item.toothId}`;
                    if (treatmentInfo.appliesTo === 'surface' || treatmentInfo.appliesTo === 'root') {
                        description += ` - Sup: ${item.surface}`;
                    }

                    const actionButton = type === 'proposed' ? (
                        <button 
                            onClick={() => onToggleTreatmentStatus(session.id, item.id)}
                            className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Marcar como completado"
                        >
                            <CheckIcon />
                        </button>
                    ) : (
                         <button 
                            onClick={() => onToggleTreatmentStatus(session.id, item.id)}
                            className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                            title="Marcar como propuesto"
                        >
                            <UndoIcon />
                        </button>
                    );


                    return (
                        <li key={item.id} className={`flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border-l-4 ${borderColor}`}>
                           <div className="flex items-center space-x-3">
                                <div className="w-5 h-5">
                                     {actionButton}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{treatmentInfo.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                                </div>
                           </div>
                            <div className="text-right">
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">S/ {treatmentInfo.price.toFixed(2)}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{session.name}</h4>
                {session.scheduledDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4"/>
                        <span>{new Date(session.scheduledDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</span>
                    </div>
                )}
            </div>
            
            <div className="mb-2">
                <h5 className="text-md font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Propuestos</h5>
                {renderItems(proposedItems, 'proposed')}
                 <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-md text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="text-yellow-600 dark:text-yellow-400">S/ {proposedTotal.toFixed(2)}</span>
                </div>
            </div>

             <div className="mt-4">
                <h5 className="text-md font-semibold mb-2 text-green-600 dark:text-green-400">Completados</h5>
                {renderItems(completedItems, 'completed')}
                 <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-md text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="text-green-600 dark:text-green-400">S/ {completedTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

const TreatmentPlanDisplay: React.FC<{ sessions: Session[]; onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void }> = ({ sessions, onToggleTreatmentStatus }) => {
    const grandTotal = sessions.reduce((total, session) => {
        return total + session.treatments.reduce((sessionTotal, treatment) => {
             const treatmentInfo = TREATMENTS_MAP[treatment.treatmentId];
             return sessionTotal + (treatmentInfo ? treatmentInfo.price : 0);
        }, 0);
    }, 0);
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Plan de Tratamiento Activo</h3>
            
            {sessions.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay un plan de tratamiento activo.</p>
                </div>
            ) : (
                sessions.map(session => <SessionCard key={session.id} session={session} onToggleTreatmentStatus={onToggleTreatmentStatus} />)
            )}
            
            {sessions.length > 0 && (
                 <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-gray-100">
                        <span>Total General:</span>
                        <span>S/ {grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

interface TreatmentPlanProps {
    sessions: Session[];
    findings: ClinicalFinding[];
    onSavePlan: (sessions: Omit<ProposedSession, 'id'>[]) => void;
    onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void;
}

export const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ sessions, findings, onSavePlan, onToggleTreatmentStatus }) => {
    const hasFindings = findings.length > 0;
    const hasPlan = sessions.length > 0;

    if (hasPlan) {
        return <TreatmentPlanDisplay sessions={sessions} onToggleTreatmentStatus={onToggleTreatmentStatus} />;
    }

    if (hasFindings) {
        return <TreatmentPlanBuilder findings={findings} onSavePlan={onSavePlan} />;
    }

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Plan de Tratamiento</h3>
            <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No hay hallazgos clínicos para planificar.</p>
                <p className="text-sm text-gray-400 mt-1">Registre hallazgos en el odontograma para crear un plan.</p>
            </div>
        </div>
    );
};