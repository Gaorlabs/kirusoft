


import React, { useState, useMemo, useEffect } from 'react';
import type { Session, AppliedTreatment, ClinicalFinding, Budget, ProposedSession, Doctor, DentalTreatment } from '../types';
import { CheckIcon, UndoIcon, PlusIcon, TrashIcon, SaveIcon, CalendarIcon, ChevronDownIcon, PrintIcon, PencilIcon, ClockIcon } from './icons';

interface TreatmentPlanBuilderProps {
    findings: ClinicalFinding[];
    onSaveBudget: (budgetData: Partial<Budget> & { proposedSessions: Omit<ProposedSession, 'id'>[] }) => void;
    onCancel: () => void;
    doctors: Doctor[];
    treatments: DentalTreatment[];
    budgetToEdit?: Budget | null;
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ findings, onSaveBudget, onCancel, doctors, treatments, budgetToEdit }) => {
    const [sessions, setSessions] = useState<ProposedSession[]>([{ id: crypto.randomUUID(), name: `Sesión 1`, scheduledDate: '', findingIds: [], doctorId: doctors[0]?.id || '' }]);
    const [unassignedFindings, setUnassignedFindings] = useState<ClinicalFinding[]>(findings);
    const [budgetName, setBudgetName] = useState(`Presupuesto ${new Date().toLocaleDateString()}`);
    const [observations, setObservations] = useState('');

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    useEffect(() => {
        if (budgetToEdit) {
            setBudgetName(budgetToEdit.name);
            setSessions(budgetToEdit.proposedSessions);
            setObservations(budgetToEdit.observations || '');
            const assignedFindingIds = new Set(budgetToEdit.proposedSessions.flatMap(s => s.findingIds));
            setUnassignedFindings(findings.filter(f => !assignedFindingIds.has(f.id)));
        } else {
            setUnassignedFindings(findings);
        }
    }, [budgetToEdit, findings]);


    const totalCost = useMemo(() => {
        const allAssignedFindingIds = sessions.flatMap(s => s.findingIds);
        return allAssignedFindingIds.reduce((total, findingId) => {
            const finding = findings.find(f => f.id === findingId);
            const treatment = finding ? treatmentsMap[finding.condition] : null;
            return total + (treatment?.price || 0);
        }, 0);
    }, [sessions, findings, treatmentsMap]);

    const handleAddSession = () => {
        const newSession: ProposedSession = {
            id: crypto.randomUUID(),
            name: `Sesión ${sessions.length + 1}`,
            scheduledDate: '',
            findingIds: [],
            doctorId: doctors[0]?.id || '',
        };
        setSessions([...sessions, newSession]);
    };

    const handleUpdateSession = (id: string, updatedData: Partial<Omit<ProposedSession, 'id'>>) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, ...updatedData } : s));
    };

    const handleRemoveSession = (id: string) => {
        const sessionToRemove = sessions.find(s => s.id === id);
        if (sessionToRemove) {
            const findingsToUnassign = findings.filter(f => sessionToRemove.findingIds.includes(f.id));
            setUnassignedFindings(prev => [...prev, ...findingsToUnassign].sort((a,b) => a.toothId - b.toothId));
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
        if (unassignedFindings.length > 0 && !budgetToEdit) { // Only confirm for new budgets
            if (!window.confirm("Hay hallazgos sin asignar. ¿Desea guardar el presupuesto de todos modos? Los hallazgos no asignados permanecerán en el odontograma.")) {
                return;
            }
        }
        onSaveBudget({ 
            id: budgetToEdit?.id,
            name: budgetName,
            observations: observations,
            proposedSessions: sessions.map(({ id, ...rest }) => rest) 
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                 <input 
                    type="text" 
                    value={budgetName} 
                    onChange={e => setBudgetName(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-200"
                />
                <div className="flex space-x-2">
                    <button onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                        <SaveIcon /><span>{budgetToEdit ? 'Actualizar' : 'Guardar'} Presupuesto</span>
                    </button>
                </div>
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
                                    onChange={(e) => handleUpdateSession(session.id, { name: e.target.value })}
                                    className="text-md font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-gray-200"
                                />
                                <div className="flex items-center space-x-2">
                                     <input 
                                        type="date"
                                        value={session.scheduledDate}
                                        onChange={(e) => handleUpdateSession(session.id, { scheduledDate: e.target.value })}
                                        className="p-1 text-sm rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                    />
                                    <select value={session.doctorId} onChange={(e) => handleUpdateSession(session.id, { doctorId: e.target.value })} className="p-1 text-xs rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <button onClick={() => handleRemoveSession(session.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <ul className="space-y-2 min-h-[50px]">
                                {session.findingIds.map(id => {
                                    const finding = getFindingDetails(id);
                                    const treatment = finding ? treatmentsMap[finding.condition] : null;
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
                    <div className="mt-4">
                        <label htmlFor="observations" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones Adicionales</label>
                        <textarea 
                            id="observations"
                            value={observations} 
                            onChange={e => setObservations(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                            placeholder="Añadir notas para el paciente o de uso interno..."
                        />
                    </div>
                     <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-gray-100">
                            <span>Total del Presupuesto:</span>
                            <span>S/ {totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-lg mb-3">Hallazgos Sin Asignar</h4>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {unassignedFindings.map(finding => {
                            const treatment = treatmentsMap[finding.condition];
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
                         {unassignedFindings.length === 0 && <p className="text-center text-sm text-slate-500 p-4">Todos los hallazgos han sido asignados.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SessionCard: React.FC<{ session: Session; treatmentsMap: Record<string, DentalTreatment>; onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void; }> = ({ session, treatmentsMap, onToggleTreatmentStatus }) => {
    const proposedItems = session.treatments.filter(t => t.status === 'proposed');
    const completedItems = session.treatments.filter(t => t.status === 'completed');

    const calculateTotal = (items: AppliedTreatment[]): number => {
        return items.reduce((total, item) => {
            const treatmentInfo = treatmentsMap[item.treatmentId];
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
                    const treatmentInfo = treatmentsMap[item.treatmentId];
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

const TreatmentPlanDisplay: React.FC<{ sessions: Session[]; treatmentsMap: Record<string, DentalTreatment>; onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void }> = ({ sessions, treatmentsMap, onToggleTreatmentStatus }) => {
    const grandTotal = sessions.reduce((total, session) => {
        return total + session.treatments.reduce((sessionTotal, treatment) => {
             const treatmentInfo = treatmentsMap[treatment.treatmentId];
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
                sessions.map(session => <SessionCard key={session.id} session={session} treatmentsMap={treatmentsMap} onToggleTreatmentStatus={onToggleTreatmentStatus} />)
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

const BudgetFollowUp: React.FC<{ budget: Budget; onUpdate: (data: Partial<Budget>) => void; onCancel: () => void; }> = ({ budget, onUpdate, onCancel }) => {
    const [followUpDate, setFollowUpDate] = useState(budget.followUpDate ? new Date(budget.followUpDate).toISOString().slice(0, 10) : '');
    const [notes, setNotes] = useState(budget.notes || '');
    
    const handleSave = () => {
        onUpdate({ followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined, notes });
    };

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Seguimiento</h5>
            <div>
                <label className="text-xs font-medium">Fecha de Seguimiento</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full mt-1 p-1 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
                <label className="text-xs font-medium">Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full mt-1 p-1 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex justify-end space-x-2">
                <button onClick={onCancel} className="text-sm font-semibold px-3 py-1">Cancelar</button>
                <button onClick={handleSave} className="text-sm font-semibold px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
        </div>
    );
};

const BudgetCard: React.FC<{ budget: Budget; findings: ClinicalFinding[]; treatmentsMap: Record<string, DentalTreatment>; onActivateBudget: (budgetId: string) => void; onPrint: () => void; onEdit: () => void; onUpdate: (id: string, data: Partial<Budget>) => void; }> = ({ budget, findings, treatmentsMap, onActivateBudget, onPrint, onEdit, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFollowingUp, setIsFollowingUp] = useState(false);
    
    const totalCost = useMemo(() => {
        return budget.proposedSessions.flatMap(s => s.findingIds).reduce((total, findingId) => {
            const finding = findings.find(f => f.id === findingId);
            return total + (finding ? treatmentsMap[finding.condition].price : 0);
        }, 0);
    }, [budget, findings, treatmentsMap]);

    const statusConfig = {
        proposed: { text: 'Propuesto', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text_color: 'text-yellow-800 dark:text-yellow-300' },
        accepted: { text: 'Aceptado', bg: 'bg-green-100 dark:bg-green-900/40', text_color: 'text-green-800 dark:text-green-300' },
        rejected: { text: 'Rechazado', bg: 'bg-red-100 dark:bg-red-900/40', text_color: 'text-red-800 dark:text-red-300' },
    };

    const handleUpdateFollowUp = (data: Partial<Budget>) => {
        onUpdate(budget.id, data);
        setIsFollowingUp(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 flex justify-between items-center">
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex-grow">
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">{budget.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(budget.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right mx-4">
                    <p className="font-bold text-xl">S/ {totalCost.toFixed(2)}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[budget.status].bg} ${statusConfig[budget.status].text_color}`}>{statusConfig[budget.status].text}</span>
                </div>
                <div className="flex items-center space-x-1">
                    {budget.status === 'proposed' && <button onClick={onEdit} className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-full transition-all transform hover:scale-110 active:scale-95" title="Editar Presupuesto"><PencilIcon className="w-5 h-5" /></button>}
                    <button onClick={onPrint} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-all transform hover:scale-110 active:scale-95" title="Imprimir/Descargar Presupuesto"><PrintIcon className="w-5 h-5" /></button>
                    {budget.status === 'proposed' && <button onClick={() => setIsFollowingUp(!isFollowingUp)} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-all transform hover:scale-110 active:scale-95" title="Programar Seguimiento"><ClockIcon className="w-5 h-5" /></button>}
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all transform hover:scale-110 active:scale-95" title="Ver/Ocultar Detalles"><ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    {budget.observations && (
                         <div className="mb-4">
                            <h5 className="font-semibold text-sm text-slate-600 dark:text-slate-400">Observaciones</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-300 whitespace-pre-wrap p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md mt-1">{budget.observations}</p>
                        </div>
                    )}
                    {budget.proposedSessions.map(session => (
                        <div key={session.id} className="mb-2">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{session.name}</p>
                            <ul className="list-disc pl-5 text-sm">
                                {session.findingIds.map(fid => {
                                    const f = findings.find(fin => fin.id === fid);
                                    if (!f) return null;
                                    const t = treatmentsMap[f.condition];
                                    return <li key={fid}>{t.label} (Diente: {f.toothId})</li>
                                })}
                            </ul>
                        </div>
                    ))}
                    {budget.status === 'proposed' && (
                        <div className="mt-4 text-right">
                            <button onClick={() => onActivateBudget(budget.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Activar Plan</button>
                        </div>
                    )}
                </div>
            )}
            {isFollowingUp && <BudgetFollowUp budget={budget} onUpdate={handleUpdateFollowUp} onCancel={() => setIsFollowingUp(false)} />}
        </div>
    );
};

interface BudgetManagerProps {
    budgets: Budget[];
    findings: ClinicalFinding[];
    onSaveOrUpdateBudget: (budgetData: Partial<Budget> & { proposedSessions: Omit<ProposedSession, 'id'>[] }) => void;
    onActivateBudget: (budgetId: string) => void;
    onUpdateBudget: (id: string, data: Partial<Budget>) => void;
    onPrintBudget: (budget: Budget) => void;
    doctors: Doctor[];
    treatments: DentalTreatment[];
    initialEditBudgetId?: string;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, findings, onSaveOrUpdateBudget, onActivateBudget, onUpdateBudget, onPrintBudget, doctors, treatments, initialEditBudgetId }) => {
    const [builderMode, setBuilderMode] = useState<'new' | 'edit' | 'closed'>('closed');
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    const handleEdit = (budget: Budget) => {
        setBudgetToEdit(budget);
        setBuilderMode('edit');
    };

    useEffect(() => {
        if (initialEditBudgetId) {
            const budget = budgets.find(b => b.id === initialEditBudgetId);
            if (budget) {
                handleEdit(budget);
            }
        }
    }, [initialEditBudgetId, budgets]);

    const handleSave = (budgetData: Partial<Budget> & { proposedSessions: Omit<ProposedSession, 'id'>[] }) => {
        onSaveOrUpdateBudget(budgetData);
        setBuilderMode('closed');
        setBudgetToEdit(null);
    };

    const handleCancel = () => {
        setBuilderMode('closed');
        setBudgetToEdit(null);
    };
    
    if(builderMode !== 'closed') {
        return <TreatmentPlanBuilder findings={findings} onSaveBudget={handleSave} onCancel={handleCancel} doctors={doctors} treatments={treatments} budgetToEdit={budgetToEdit} />
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Presupuestos del Paciente</h3>
                {findings.length > 0 && <button onClick={() => setBuilderMode('new')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon /><span>Nuevo Presupuesto</span></button>}
            </div>
            {budgets.length > 0 ? (
                <div className="space-y-4">
                    {budgets.map(b => <BudgetCard key={b.id} budget={b} findings={findings} treatmentsMap={treatmentsMap} onActivateBudget={onActivateBudget} onPrint={() => onPrintBudget(b)} onEdit={() => handleEdit(b)} onUpdate={onUpdateBudget} />)}
                </div>
            ) : (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay presupuestos guardados.</p>
                </div>
            )}
        </div>
    );
};


interface TreatmentPlanProps {
    sessions: Session[];
    findings: ClinicalFinding[];
    budgets: Budget[];
    onSaveOrUpdateBudget: (budgetData: Partial<Budget> & { proposedSessions: Omit<ProposedSession, 'id'>[] }) => void;
    onActivateBudget: (budgetId: string) => void;
    onToggleTreatmentStatus: (sessionId: string, treatmentId: string) => void;
    onUpdateBudget: (id: string, data: Partial<Budget>) => void;
    onPrintBudget: (budget: Budget) => void;
    doctors: Doctor[];
    treatments: DentalTreatment[];
    initialEditBudgetId?: string;
}

export const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ sessions, findings, budgets, onSaveOrUpdateBudget, onActivateBudget, onToggleTreatmentStatus, onUpdateBudget, onPrintBudget, doctors, treatments, initialEditBudgetId }) => {
    const hasActivePlan = sessions.length > 0;
    const hasBudgets = budgets.length > 0;
    const hasFindings = findings.length > 0;

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    return (
        <div>
            {hasActivePlan && (
                <div className="mb-8">
                    <TreatmentPlanDisplay sessions={sessions} treatmentsMap={treatmentsMap} onToggleTreatmentStatus={onToggleTreatmentStatus} />
                </div>
            )}

            {(hasBudgets || hasFindings) && (
                <BudgetManager 
                    budgets={budgets} 
                    findings={findings} 
                    onSaveOrUpdateBudget={onSaveOrUpdateBudget} 
                    onActivateBudget={onActivateBudget} 
                    onUpdateBudget={onUpdateBudget} 
                    onPrintBudget={onPrintBudget} 
                    doctors={doctors} 
                    treatments={treatments}
                    initialEditBudgetId={initialEditBudgetId}
                />
            )}

            {!hasActivePlan && !hasBudgets && !hasFindings && (
                 <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Presupuestos y Plan de Tratamiento</h3>
                    <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No hay hallazgos clínicos para planificar.</p>
                        <p className="text-sm text-gray-400 mt-1">Registre hallazgos en el odontograma para crear un presupuesto.</p>
                    </div>
                </div>
            )}
        </div>
    );
};