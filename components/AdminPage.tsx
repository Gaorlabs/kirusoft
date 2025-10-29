

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// FIX: Added 'ToothState' to imports for type safety in data transformations.
import type { Appointment, Doctor, Promotion, AppSettings, AppointmentStatus, PatientRecord, Payment, AppliedTreatment, Budget, ClinicalFinding, DentalTreatment, TreatmentApplication, ToothState } from '../types';
import { APPOINTMENT_STATUS_CONFIG, KANBAN_COLUMNS, DENTAL_SERVICES_MAP, TREATMENT_CATEGORIES } from '../constants';
import {
    DashboardIcon, AppointmentIcon, UsersIcon, MegaphoneIcon, SettingsIcon, PlusIcon, PencilIcon, TrashIcon, BriefcaseIcon, DentalIcon, MoonIcon, SunIcon, OdontogramIcon, ChevronDownIcon, CalendarIcon, WhatsappIcon, DollarSignIcon, SaveIcon, PrintIcon, ClockIcon, CloseIcon
} from './icons';
import { AdminAppointmentModal } from './AdminAppointmentModal';
import { AdminDoctorModal } from './AdminDoctorModal';
import { AdminPromotionModal } from './AdminPromotionModal';
import { AgendaView } from './AgendaView';
import { DoctorAvailabilityModal } from './DoctorAvailabilityModal';
import { AdminPaymentModal } from './AdminPaymentModal';
import { AdminTreatmentModal } from './AdminTreatmentModal';
import { BudgetToPrint } from './BudgetToPrint';


type AdminTab = 'dashboard' | 'agenda' | 'patients' | 'doctors' | 'promotions' | 'settings' | 'accounts' | 'services' | 'cotizaciones';
type MainView = 'odontogram' | 'plan' | 'history' | 'prescriptions' | 'consents' | 'accounts';

type Theme = 'light' | 'dark';

interface AdminPageProps {
    appointments: Appointment[];
    doctors: Doctor[];
    promotions: Promotion[];
    settings: AppSettings;
    patientRecords: Record<string, PatientRecord>;
    treatments: DentalTreatment[];
    onSaveAppointment: (data: Omit<Appointment, 'id'> & { id?: string }) => void;
    onDeleteAppointment: (id: string) => void;
    onSaveDoctor: (data: Omit<Doctor, 'id'> & { id?: string }) => void;
    onDeleteDoctor: (id: string) => void;
    onSavePromotion: (data: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => void;
    onDeletePromotion: (id: string) => void;
    onTogglePromotionStatus: (id: string) => void;
    onSaveTreatment: (data: Omit<DentalTreatment, 'icon'> & { id?: string; }) => void;
    onDeleteTreatment: (id: string) => void;
    onUpdateBudget: (patientId: string, budgetId: string, data: Partial<Budget>) => void;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    onLogout: () => void;
    onOpenClinicalRecord: (patient: Appointment, targetTab?: MainView, initialEditBudgetId?: string) => void;
    onSendToWhatsapp: (patient: Appointment, htmlContent: string, documentType: string) => Promise<boolean>;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
        <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-full text-pink-600 dark:text-pink-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isActive
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
    </button>
);


const AdminAccountsView: React.FC<{
    patientRecords: Record<string, PatientRecord>,
    appointments: Appointment[],
    treatments: DentalTreatment[];
    onOpenClinicalRecord: (patient: Appointment, targetTab: MainView) => void;
}> = ({ patientRecords, appointments, treatments, onOpenClinicalRecord }) => {

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    const patientSummaries = useMemo(() => {
        const summaries: Record<string, { patientId: string; name: string; totalBilled: number; totalPaid: number; balance: number; appointment: Appointment }> = {};

        appointments.forEach(app => {
            if (!summaries[app.id]) {
                summaries[app.id] = {
                    patientId: app.id,
                    name: app.name,
                    totalBilled: 0,
                    totalPaid: 0,
                    balance: 0,
                    appointment: app,
                };
            }
        });

        Object.values(patientRecords).forEach((record: PatientRecord) => {
            const summary = summaries[record.patientId];
            if (summary) {
                const billed = (record.sessions || []).flatMap(s => s.treatments).reduce((sum: number, t: AppliedTreatment) => sum + (Number(treatmentsMap[t.treatmentId]?.price) || 0), 0);
                const paid = (record.payments || []).reduce((sum: number, p: Payment) => sum + (Number(p.amount) || 0), 0);
                
                summary.totalBilled = billed;
                summary.totalPaid = paid;
                summary.balance = billed - paid;
            }
        });
        
        return Object.values(summaries);

    }, [patientRecords, appointments, treatmentsMap]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Finanzas - Cuentas por Cobrar</h2>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Facturado</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Pagado</th>
                            <th scope="col" className="px-6 py-3 text-right">Saldo Pendiente</th>
                             <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientSummaries.map(summary => (
                            <tr key={summary.patientId} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{summary.name}</td>
                                <td className="px-6 py-4 text-right">S/ {summary.totalBilled.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">S/ {summary.totalPaid.toFixed(2)}</td>
                                <td className={`px-6 py-4 text-right font-semibold ${summary.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>S/ {summary.balance.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onOpenClinicalRecord(summary.appointment, 'accounts')}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 font-semibold py-1 px-3 rounded-full text-xs"
                                    >
                                        Administrar Pagos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface BudgetFollowUpModalProps {
    budget: { id: string, patientId: string, notes?: string, followUpDate?: string };
    onClose: () => void;
    onSave: (patientId: string, budgetId: string, data: { notes: string; followUpDate?: string }) => void;
}

const BudgetFollowUpModal: React.FC<BudgetFollowUpModalProps> = ({ budget, onClose, onSave }) => {
    const [followUpDate, setFollowUpDate] = useState(budget.followUpDate ? new Date(budget.followUpDate).toISOString().slice(0, 10) : '');
    const [notes, setNotes] = useState(budget.notes || '');

    const handleSave = () => {
        onSave(budget.patientId, budget.id, {
            notes,
            followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editar Seguimiento</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Fecha de Seguimiento</label>
                        <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full mt-1 p-2 text-sm rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Notas de Seguimiento</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full mt-1 p-2 text-sm rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-2">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg">Guardar</button>
                </div>
            </div>
        </div>
    );
};

interface BudgetActionModalProps {
    budget: Budget & { patientName: string };
    patient: Appointment;
    findings: ClinicalFinding[];
    onClose: () => void;
    onSendToWhatsapp: (patient: Appointment, htmlContent: string, documentType: string) => Promise<boolean>;
    doctors: Doctor[];
    settings: AppSettings;
    treatments: DentalTreatment[];
}

const BudgetActionModal: React.FC<BudgetActionModalProps> = ({ budget, patient, findings, onClose, onSendToWhatsapp, doctors, settings, treatments }) => {
    const [isSending, setIsSending] = useState(false);
    
    useEffect(() => {
        // This effect handles printing when the modal is opened for that purpose.
        const handlePrint = () => {
            const printContent = document.getElementById('budget-to-print');
            if (printContent) {
                const docTitle = `Presupuesto - ${patient.name}`;
                const winPrint = window.open('', '', 'width=900,height=650');
                if (winPrint) {
                    document.title = docTitle;
                    winPrint.document.write(`<html><head><title>${docTitle}</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }</style></head><body>`);
                    winPrint.document.write(printContent.innerHTML);
                    winPrint.document.write('</body></html>');
                    winPrint.document.close();
                    winPrint.focus();
                    setTimeout(() => {
                        winPrint.print();
                        winPrint.close();
                        document.title = 'Kiru Consultorio Dental';
                        onClose();
                    }, 500);
                }
            }
        };

        handlePrint();
    }, []);

    const handleSend = async () => {
        const printContent = document.getElementById('budget-to-print');
        if (!printContent) return;
        setIsSending(true);
        const success = await onSendToWhatsapp(patient, printContent.innerHTML, 'budget');
        if (success) {
            alert('Presupuesto enviado con éxito.');
        }
        setIsSending(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Vista Previa: {budget.name}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-900 p-8">
                    <div id="budget-to-print" className="shadow-lg">
                        <BudgetToPrint budget={budget} patientName={patient.name} findings={findings} doctors={doctors} settings={settings} treatments={treatments} />
                    </div>
                </div>
                <div className="p-4 flex justify-end space-x-2 bg-slate-50 dark:bg-slate-800/50 border-t">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleSend} disabled={isSending} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 disabled:bg-slate-400">
                        <WhatsappIcon />
                        <span>{isSending ? 'Enviando...' : 'Enviar por WhatsApp'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminBudgetsView: React.FC<Omit<AdminPageProps, 'onLogout' | 'setSettings' | 'promotions' | 'onSaveAppointment' | 'onDeleteAppointment' | 'onSaveDoctor' | 'onDeleteDoctor' | 'onSavePromotion' | 'onDeletePromotion' | 'onTogglePromotionStatus' | 'onSaveTreatment' | 'onDeleteTreatment'>> = ({
    patientRecords, appointments, treatments, onUpdateBudget, onOpenClinicalRecord, onSendToWhatsapp, doctors, settings
}) => {
    const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);
    const [actionModalData, setActionModalData] = useState<{ budget: any; patient: Appointment; } | null>(null);
    const [followUpModalData, setFollowUpModalData] = useState<any | null>(null);

    const treatmentsMap = useMemo(() => treatments.reduce((acc, t) => ({...acc, [t.id]: t }), {} as Record<string, DentalTreatment>), [treatments]);
    const patientMap = useMemo(() => appointments.reduce((acc, app) => ({...acc, [app.id]: app }), {} as Record<string, Appointment>), [appointments]);
    // FIX: Added explicit types for 'r' and 't' to resolve 'Property does not exist on type unknown' errors.
    const allFindings = useMemo(() => Object.values(patientRecords).flatMap((r: PatientRecord) => [...Object.values(r.permanentOdontogram).flatMap((t: ToothState) => t.findings), ...Object.values(r.deciduousOdontogram).flatMap((t: ToothState) => t.findings)]), [patientRecords]);

    const allBudgets = useMemo(() => {
        // FIX: Added explicit type for 'record' to resolve 'Property does not exist on type unknown' errors.
        return Object.values(patientRecords).flatMap((record: PatientRecord) =>
            (record.budgets || []).map(budget => {
                const total = budget.proposedSessions.flatMap(s => s.findingIds).reduce((acc, findingId) => {
                    const finding = allFindings.find(f => f.id === findingId);
                    return acc + (finding ? treatmentsMap[finding.condition]?.price || 0 : 0);
                }, 0);
                return { ...budget, patientId: record.patientId, patientName: patientMap[record.patientId]?.name || 'N/A', total };
            })
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [patientRecords, patientMap, allFindings, treatmentsMap]);

    const statusConfig = {
        proposed: { text: 'Propuesto', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text_color: 'text-yellow-800 dark:text-yellow-300' },
        accepted: { text: 'Aceptado', bg: 'bg-green-100 dark:bg-green-900/40', text_color: 'text-green-800 dark:text-green-300' },
        rejected: { text: 'Rechazado', bg: 'bg-red-100 dark:bg-red-900/40', text_color: 'text-red-800 dark:text-red-300' },
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Gestión de Cotizaciones</h2>
            <div className="space-y-4">
                {allBudgets.map(budget => (
                    <div key={budget.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                        <div className="p-4 flex items-center cursor-pointer" onClick={() => setExpandedBudgetId(prev => prev === budget.id ? null : budget.id)}>
                            <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                                <span className="font-semibold">{budget.patientName}</span>
                                <span>{budget.name}</span>
                                <span><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[budget.status].bg} ${statusConfig[budget.status].text_color}`}>{statusConfig[budget.status].text}</span></span>
                                <span className="font-semibold text-right">S/ {budget.total.toFixed(2)}</span>
                                <span>{budget.followUpDate ? `Seguimiento: ${new Date(budget.followUpDate).toLocaleDateString()}` : 'Sin seguimiento'}</span>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 ml-4 text-slate-500 transition-transform ${expandedBudgetId === budget.id ? 'rotate-180' : ''}`} />
                        </div>
                        {expandedBudgetId === budget.id && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-semibold text-sm">Sesiones</h4>
                                        {budget.proposedSessions.map(s => <p key={s.id} className="text-sm">{s.name}</p>)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Observaciones</h4>
                                        <p className="text-sm whitespace-pre-wrap">{budget.observations || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Seguimiento</h4>
                                        <p className="text-sm">{budget.notes || 'Sin notas.'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => onOpenClinicalRecord(patientMap[budget.patientId], 'plan', budget.id)} className="text-sm font-semibold bg-yellow-500 text-white px-3 py-1.5 rounded-lg">Editar Plan Completo</button>
                                    <button onClick={() => setFollowUpModalData(budget)} className="text-sm font-semibold bg-blue-500 text-white px-3 py-1.5 rounded-lg">Editar Seguimiento</button>
                                    <button onClick={() => setActionModalData({ budget, patient: patientMap[budget.patientId] })} className="text-sm font-semibold bg-slate-500 text-white px-3 py-1.5 rounded-lg">Imprimir/Enviar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {actionModalData && <BudgetActionModal {...actionModalData} findings={allFindings} onClose={() => setActionModalData(null)} onSendToWhatsapp={onSendToWhatsapp} doctors={doctors} settings={settings} treatments={treatments} />}
            {followUpModalData && <BudgetFollowUpModal budget={followUpModalData} onClose={() => setFollowUpModalData(null)} onSave={(patientId, budgetId, data) => onUpdateBudget(patientId, budgetId, data)} />}
        </div>
    );
};


const AdminDashboardView: React.FC<{
    appointments: Appointment[];
    patientRecords: Record<string, PatientRecord>;
    doctors: Doctor[];
    settings: AppSettings;
    treatments: DentalTreatment[];
}> = ({ appointments, patientRecords, doctors, settings, treatments }) => {

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    const allFindings = useMemo(() => {
        // FIX: Added explicit types for 'record' and 'tooth' to resolve 'Property does not exist on type unknown' errors.
        return Object.values(patientRecords).flatMap((record: PatientRecord) => {
            const permanentFindings = Object.values(record.permanentOdontogram).flatMap((tooth: ToothState) => tooth.findings);
            const deciduousFindings = Object.values(record.deciduousOdontogram).flatMap((tooth: ToothState) => tooth.findings);
            return [...permanentFindings, ...deciduousFindings];
        });
    }, [patientRecords]);

    const {
        newPatientsThisMonth,
        pendingRecallsCount,
        totalRevenue,
        pendingBudgetsCount
    } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const firstAppointmentDate: Record<string, Date> = {};
        [...appointments].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).forEach(app => {
            // FIX: Replaced `acc` with `firstAppointmentDate` to correct a reference error. The `acc` variable was not defined in the scope of the `forEach` loop, and the intended logic was to check for the existence of an appointment email in the `firstAppointmentDate` object.
            if (!firstAppointmentDate[app.email]) {
                firstAppointmentDate[app.email] = new Date(app.dateTime);
            }
        });

        let newPatients = 0;
        Object.values(firstAppointmentDate).forEach(date => {
            if (date >= startOfMonth) {
                newPatients++;
            }
        });
        
        let overdueRecalls = 0;
        let pendingBudgets = 0;
        
        Object.values(patientRecords).forEach((r: PatientRecord) => {
            if (r.recall && new Date(r.recall.date) < now) {
                overdueRecalls++;
            }
            pendingBudgets += (r.budgets || []).filter(b => b.status === 'proposed').length;
        });

        const revenue = Object.values(patientRecords)
            .flatMap((record: PatientRecord) => record.payments || [])
            .reduce((sum: number, payment: Payment) => sum + (Number(payment.amount) || 0), 0);

        return {
            newPatientsThisMonth: newPatients,
            pendingRecallsCount: overdueRecalls,
            totalRevenue: revenue,
            pendingBudgetsCount: pendingBudgets,
        };
    }, [appointments, patientRecords]);

    const doctorsMap = useMemo(() => doctors.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {} as Record<string, Doctor>), [doctors]);
    const appointmentsMap = useMemo(() => appointments.reduce((acc, app) => ({ ...acc, [app.id]: app }), {} as Record<string, Appointment>), [appointments]);

    const revenueByDoctor = useMemo(() => {
        const revenueMap: Record<string, number> = {};
        Object.values(patientRecords).forEach((record: PatientRecord) => {
            (record.sessions || []).forEach(session => {
                if (session.doctorId) {
                    const completedTreatments = session.treatments.filter(t => t.status === 'completed');
                    const sessionRevenue = completedTreatments.reduce((sum, t) => sum + (Number(treatmentsMap[t.treatmentId]?.price) || 0), 0);
                    revenueMap[session.doctorId] = (revenueMap[session.doctorId] || 0) + sessionRevenue;
                }
            });
        });
        const sortedRevenue = Object.entries(revenueMap).map(([doctorId, total]) => ({
            doctorName: doctorsMap[doctorId]?.name || 'Sin Asignar',
            total,
        })).sort((a, b) => b.total - a.total);

        const total = sortedRevenue.reduce((sum, item) => sum + item.total, 0);

        return { data: sortedRevenue, total };
    }, [patientRecords, doctorsMap, treatmentsMap]);
    
    const popularTreatments = useMemo(() => {
        const treatmentCounts = Object.values(patientRecords)
            .flatMap((r: PatientRecord) => r.sessions || [])
            .flatMap(s => s.treatments)
            .reduce((acc, t) => {
                acc[t.treatmentId] = (acc[t.treatmentId] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(treatmentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([treatmentId, count]) => ({
                name: treatmentsMap[treatmentId]?.label || 'Desconocido',
                count
            }));
    }, [patientRecords, treatmentsMap]);

    const budgetTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.values(patientRecords).forEach((record: PatientRecord) => {
            (record.budgets || []).forEach(budget => {
                const total = budget.proposedSessions.flatMap(s => s.findingIds).reduce((acc, findingId) => {
                    const finding = allFindings.find((f: ClinicalFinding) => f.id === findingId);
                    return acc + (finding ? treatmentsMap[finding.condition]?.price || 0 : 0);
                }, 0);
                totals[budget.id] = total;
            });
        });
        return totals;
    }, [patientRecords, allFindings, treatmentsMap]);
    
    const pendingBudgets = useMemo(() => {
        const budgets: (Appointment & { budget: Budget })[] = [];
        Object.values(patientRecords).forEach((record: PatientRecord) => {
            if (record.budgets) {
                record.budgets.forEach(budget => {
                    if (budget.followUpDate) {
                        const needsFollowUp = new Date(budget.followUpDate) <= new Date();
                        if (budget.status === 'proposed' && needsFollowUp) {
                            const patientAppointment = appointmentsMap[record.patientId];
                            if (patientAppointment) {
                                budgets.push({ ...patientAppointment, budget });
                            }
                        }
                    }
                });
            }
        });
        return budgets.sort((a,b) => new Date(a.budget.followUpDate!).getTime() - new Date(b.budget.followUpDate!).getTime());
    }, [patientRecords, appointmentsMap]);

    const pendingRecalls = useMemo(() => {
        const recalls: (Appointment & { recall: { date: string; reason: string } })[] = [];
        const now = new Date();
        Object.values(patientRecords).forEach((record: PatientRecord) => {
            if (record.recall && new Date(record.recall.date) < now) {
                const patientAppointment = appointmentsMap[record.patientId];
                if (patientAppointment) {
                    recalls.push({ ...patientAppointment, recall: record.recall });
                }
            }
        });
        return recalls.sort((a, b) => new Date(a.recall.date).getTime() - new Date(b.recall.date).getTime());
    }, [patientRecords, appointmentsMap]);

    const doctorColors = ['#ec4899', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];
    const maxPopularTreatmentCount = popularTreatments.length > 0 ? popularTreatments[0].count : 1;

    const createPieChartBackground = () => {
        if (revenueByDoctor.total === 0) return 'conic-gradient(#e5e7eb 0% 100%)';
        let gradient = 'conic-gradient(';
        let currentPercentage = 0;
        revenueByDoctor.data.forEach((item, index) => {
            const percentage = (item.total / revenueByDoctor.total) * 100;
            const color = doctorColors[index % doctorColors.length];
            gradient += `${color} ${currentPercentage}% ${currentPercentage + percentage}%, `;
            currentPercentage += percentage;
        });
        return gradient.slice(0, -2) + ')';
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 <StatCard title="Ingresos Totales" value={`S/ ${totalRevenue.toFixed(2)}`} icon={<DollarSignIcon />} />
                 <StatCard title="Pacientes Nuevos (Mes)" value={newPatientsThisMonth} icon={<UsersIcon />} />
                 <StatCard title="Presupuestos Pendientes" value={pendingBudgetsCount} icon={<BriefcaseIcon />} />
                 <StatCard title="Recalls Vencidos" value={pendingRecallsCount} icon={<CalendarIcon />} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Tratamientos Populares</h3>
                        <div className="space-y-4">
                            {popularTreatments.map(({name, count}) => (
                                <div key={name}>
                                    <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        <span>{name}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-pink-500 h-2.5 rounded-full" style={{width: `${(count / maxPopularTreatmentCount) * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Recalls Pendientes</h3>
                         <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Paciente</th>
                                        <th scope="col" className="px-4 py-2">Fecha Recall</th>
                                        <th scope="col" className="px-4 py-2">Motivo</th>
                                        <th scope="col" className="px-4 py-2 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRecalls.length > 0 ? pendingRecalls.map(app => (
                                        <tr key={app.id} className="border-b dark:border-slate-700">
                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{app.name}</td>
                                            <td className="px-4 py-2 text-red-600 dark:text-red-400 font-semibold">{new Date(app.recall.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{app.recall.reason}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={() => {
                                                    const message = `Hola ${app.name}, te escribimos de Kiru para recordarte que tienes un control pendiente (${app.recall.reason}). ¡Te esperamos!`;
                                                    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                                }} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Contactar por WhatsApp">
                                                    <WhatsappIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="text-center py-8">No hay recalls pendientes.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Ingresos por Doctor</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-full" style={{ background: createPieChartBackground() }}></div>
                                <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold">S/{revenueByDoctor.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                {revenueByDoctor.data.map((item, index) => (
                                    <div key={item.doctorName} className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: doctorColors[index % doctorColors.length] }}></span>
                                        <span className="font-semibold">{item.doctorName}:</span>
                                        <span className="ml-auto text-slate-600 dark:text-slate-300">S/{item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Presupuestos a Dar Seguimiento</h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {pendingBudgets.length > 0 ? pendingBudgets.map(app => (
                                <div key={app.budget.id} className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{app.name}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">{app.budget.name} - S/ {budgetTotals[app.budget.id]?.toFixed(2) || '0.00'}</p>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Seguimiento: {new Date(app.budget.followUpDate!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                                        </div>
                                        <button onClick={() => {
                                                const message = `Hola ${app.name}, te escribimos de Kiru para dar seguimiento a tu presupuesto para ${app.budget.name}. ¿Tienes alguna consulta?`;
                                                window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                            }} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Contactar por WhatsApp">
                                            <WhatsappIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay presupuestos que requieran seguimiento.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PatientDetailsView: React.FC<{
    patient: Appointment;
    appointments: Appointment[];
    onEdit: () => void;
    onOpenClinicalRecord: (appointment: Appointment) => void;
}> = ({ patient, appointments, onEdit, onOpenClinicalRecord }) => {
    
    const patientAppointments = useMemo(() => {
        return appointments
            .filter(app => app.email === patient.email)
            .sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }, [appointments, patient.email]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md h-full p-6 flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{patient.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Mostrando datos de la cita más recente.</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={onEdit} className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105">
                        <PencilIcon className="w-5 h-5"/>
                        <span>Editar</span>
                    </button>
                    <button onClick={() => onOpenClinicalRecord(patient)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105">
                        <BriefcaseIcon className="w-5 h-5"/>
                        <span>Ficha Clínica</span>
                    </button>
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
            <div className="space-y-4 mb-6">
                 <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Información de Contacto</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Teléfono:</span> {patient.phone}</p>
                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Email:</span> {patient.email}</p>
                 </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Historial de Citas</h3>
            <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                <ul className="space-y-3">
                    {patientAppointments.length > 0 ? patientAppointments.map(app => (
                        <li key={app.id} onClick={() => onOpenClinicalRecord(app)} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{DENTAL_SERVICES_MAP[app.service]}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(app.dateTime).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${APPOINTMENT_STATUS_CONFIG[app.status].color} ${APPOINTMENT_STATUS_CONFIG[app.status].textColor}`}>
                                    {APPOINTMENT_STATUS_CONFIG[app.status].title}
                                </span>
                            </div>
                        </li>
                    )) : (
                         <li className="p-3 text-center text-slate-500 dark:text-slate-400">No hay citas registradas para este paciente.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const AdminTreatmentsView: React.FC<{
    treatments: DentalTreatment[];
    onSave: (data: Omit<DentalTreatment, 'icon'> & { id?: string; }) => void;
    onDelete: (id: string) => void;
}> = ({ treatments, onSave, onDelete }) => {
    const [editingTreatment, setEditingTreatment] = useState<DentalTreatment | {} | null>(null);

    const handleSave = (data: Omit<DentalTreatment, 'icon'> & { id?: string; }) => {
        onSave(data);
        setEditingTreatment(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Servicios y Precios</h2>
                <button onClick={() => setEditingTreatment({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nuevo Servicio</span></button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Servicio</th>
                            <th scope="col" className="px-6 py-3">Categoría</th>
                            <th scope="col" className="px-6 py-3 text-right">Precio</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {treatments.map(treatment => (
                            <tr key={treatment.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{treatment.label}</td>
                                <td className="px-6 py-4">{treatment.category}</td>
                                <td className="px-6 py-4 text-right font-semibold">S/ {Number(treatment.price).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => setEditingTreatment(treatment)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(treatment.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingTreatment && <AdminTreatmentModal treatment={editingTreatment as DentalTreatment} onClose={() => setEditingTreatment(null)} onSave={handleSave} />}
        </div>
    );
};


export const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [theme, setTheme] = useState<Theme>('dark');
    const [agendaView, setAgendaView] = useState<'kanban' | 'calendar'>('kanban');
    
    const [editingAppointment, setEditingAppointment] = useState<Appointment | Partial<Appointment> | null>(null);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | Partial<Doctor> | null>(null);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | Partial<Promotion> | null>(null);
    const [localSettings, setLocalSettings] = useState(props.settings);
    
    const [draggedItem, setDraggedItem] = useState<Appointment | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<AppointmentStatus | null>(null);
    const [editingAvailabilityDoctor, setEditingAvailabilityDoctor] = useState<Doctor | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);

    const patientMap = useMemo(() => props.appointments.reduce((acc, app) => {
        if (!acc[app.email] || new Date(app.dateTime) > new Date(acc[app.email].dateTime)) {
            acc[app.email] = app;
        }
        return acc;
    }, {} as Record<string, Appointment>), [props.appointments]);

    const patients = useMemo(() => Object.values(patientMap).sort((a: Appointment, b: Appointment) => a.name.localeCompare(b.name)), [patientMap]);

    useEffect(() => {
        if (activeTab !== 'patients') {
            setSelectedPatient(null);
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedPatient && !patients.find(p => p.email === selectedPatient.email)) {
            setSelectedPatient(null);
        }
    }, [patients, selectedPatient]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
     useEffect(() => {
        setLocalSettings(props.settings);
    }, [props.settings]);
    
    const handleSaveAppointment = (data: Omit<Appointment, 'id'> & { id?: string }) => {
        props.onSaveAppointment(data);
        setEditingAppointment(null);
    };

    const handleAppointmentStatusChange = (appointmentId: string, status: AppointmentStatus) => {
        const appointment = props.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            props.onSaveAppointment({ ...appointment, status });
        }
    };
    
    const handleSaveDoctor = (data: Omit<Doctor, 'id'> & { id?: string }) => {
        props.onSaveDoctor(data);
        setEditingDoctor(null);
        setEditingAvailabilityDoctor(null);
    };

    const handleSavePromotion = (data: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => {
        props.onSavePromotion(data);
        setEditingPromotion(null);
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        props.setSettings(localSettings);
        alert('Configuración guardada!');
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointment: Appointment) => {
        setDraggedItem(appointment);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: AppointmentStatus) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== status) {
            setDragOverStatus(status);
        }
    };

    const handleDragLeave = () => {
        setDragOverStatus(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: AppointmentStatus) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== status) {
            handleAppointmentStatusChange(draggedItem.id, status);
        }
        setDraggedItem(null);
        setDragOverStatus(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboardView appointments={props.appointments} patientRecords={props.patientRecords} doctors={props.doctors} settings={props.settings} treatments={props.treatments} />;
            case 'agenda':
                 return (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Agenda</h2>
                             <div className="flex items-center space-x-4">
                                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                                    <button onClick={() => setAgendaView('kanban')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${agendaView === 'kanban' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Kanban</button>
                                    <button onClick={() => setAgendaView('calendar')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${agendaView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Calendario</button>
                                </div>
                                <button onClick={() => setEditingAppointment({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nueva Cita</span></button>
                             </div>
                        </div>
                        {agendaView === 'kanban' ? (
                            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                                {KANBAN_COLUMNS.map(status => (
                                    <div 
                                        key={status} 
                                        className={`w-72 flex-shrink-0 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-3 flex flex-col transition-colors ${dragOverStatus === status ? 'bg-blue-100 dark:bg-slate-700' : ''}`}
                                        onDragOver={(e) => handleDragOver(e, status)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, status)}
                                    >
                                        <div className="flex items-center mb-4">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${APPOINTMENT_STATUS_CONFIG[status].kanbanHeaderBg}`}></span>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{APPOINTMENT_STATUS_CONFIG[status].title}</h3>
                                            <span className="ml-auto text-sm font-bold bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center">
                                                {props.appointments.filter(a => a.status === status).length}
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                            {props.appointments.filter(app => app.status === status).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(app => (
                                                <div 
                                                    key={app.id} 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, app)}
                                                    className={`bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing ${draggedItem?.id === app.id ? 'opacity-50' : ''}`}
                                                >
                                                    <p className="font-bold text-slate-800 dark:text-white">{app.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{DENTAL_SERVICES_MAP[app.service]}</p>
                                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{new Date(app.dateTime).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    <div className="border-t border-slate-200 dark:border-slate-600 my-3"></div>
                                                    <div className="flex justify-start items-center">
                                                        <div className="flex items-center space-x-1">
                                                            <button onClick={() => props.onOpenClinicalRecord(app)} className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Abrir Ficha Clínica"><OdontogramIcon className="w-5 h-5" /></button>
                                                            <button onClick={() => setEditingAppointment(app)} className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Editar Cita"><PencilIcon className="w-5 h-5" /></button>
                                                             <button onClick={() => {
                                                                const phone = app.phone.replace(/\D/g, '');
                                                                const message = `Hola ${app.name}, te confirmamos tu cita para ${DENTAL_SERVICES_MAP[app.service]} el ${new Date(app.dateTime).toLocaleString('es-ES')}. ¡Te esperamos en Kiru!`;
                                                                window.open(`https://wa.me/51${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                                            }} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Enviar WhatsApp">
                                                                <WhatsappIcon className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={() => props.onDeleteAppointment(app.id)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Eliminar Cita"><TrashIcon className="w-5 h-5" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-full">
                                <AgendaView 
                                    appointments={props.appointments} 
                                    doctors={props.doctors}
                                    onSelectAppointment={(app) => setEditingAppointment(app)}
                                />
                            </div>
                        )}
                    </div>
                );
            case 'patients': {
                return (
                    <div className="flex h-full gap-6">
                        <div className="w-1/3 flex flex-col">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex-shrink-0">Pacientes ({patients.length})</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex-1 overflow-y-auto">
                                {patients.map(patient => (
                                    <button 
                                        key={patient.id}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-700 transition-colors ${selectedPatient?.email === patient.email ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                       <p className="font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                                       <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{patient.email}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-2/3">
                            {selectedPatient ? (
                                <PatientDetailsView 
                                    patient={selectedPatient}
                                    appointments={props.appointments}
                                    onEdit={() => setEditingAppointment(selectedPatient)}
                                    onOpenClinicalRecord={(app) => props.onOpenClinicalRecord(app)}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                                    <div className="text-center">
                                        <div className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4">
                                            <UsersIcon />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-semibold">Seleccione un paciente de la lista</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">Aquí se mostrarán sus detalles e historial de citas.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            case 'doctors':
                 return (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctores</h2>
                            <button onClick={() => setEditingDoctor({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nuevo Doctor</span></button>
                        </div>
                         <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Especialidad</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.doctors.map(doc => (
                                        <tr key={doc.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{doc.name}</td>
                                            <td className="px-6 py-4">{doc.specialty}</td>
                                            <td className="px-6 py-4 flex items-center space-x-2">
                                                 <button onClick={() => setEditingDoctor(doc)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => setEditingAvailabilityDoctor(doc)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Gestionar Disponibilidad"><CalendarIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => props.onDeleteDoctor(doc.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'promotions':
                 return (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Promociones</h2>
                            <button onClick={() => setEditingPromotion({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nueva Promoción</span></button>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                           <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Título</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.promotions.map(promo => (
                                        <tr key={promo.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{promo.title}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => props.onTogglePromotionStatus(promo.id)} className={`px-3 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>{promo.isActive ? 'Activa' : 'Inactiva'}</button>
                                            </td>
                                            <td className="px-6 py-4 flex items-center space-x-2">
                                                 <button onClick={() => setEditingPromotion(promo)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => props.onDeletePromotion(promo.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'accounts':
                return <AdminAccountsView
                    patientRecords={props.patientRecords}
                    appointments={props.appointments}
                    treatments={props.treatments}
                    onOpenClinicalRecord={props.onOpenClinicalRecord}
                />;
            case 'cotizaciones':
                return <AdminBudgetsView
                    patientRecords={props.patientRecords}
                    appointments={props.appointments}
                    treatments={props.treatments}
                    onUpdateBudget={props.onUpdateBudget}
                    onOpenClinicalRecord={props.onOpenClinicalRecord}
                    onSendToWhatsapp={props.onSendToWhatsapp}
                    doctors={props.doctors}
                    settings={props.settings}
                />;
            case 'services':
                return <AdminTreatmentsView 
                    treatments={props.treatments} 
                    onSave={props.onSaveTreatment} 
                    onDelete={props.onDeleteTreatment} 
                />;
            case 'settings': {
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Configuración</h2>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 max-w-2xl">
                            <form onSubmit={handleSettingsSave} className="space-y-6">
                                <div>
                                    <label htmlFor="clinicName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de la Clínica</label>
                                    <input type="text" name="clinicName" id="clinicName" value={localSettings.clinicName} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dirección</label>
                                    <input type="text" name="clinicAddress" id="clinicAddress" value={localSettings.clinicAddress} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                                    <input type="text" name="clinicPhone" id="clinicPhone" value={localSettings.clinicPhone} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                    <input type="email" name="clinicEmail" id="clinicEmail" value={localSettings.clinicEmail} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="heroImageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Imagen Principal (Landing)</label>
                                    <input type="text" name="heroImageUrl" id="heroImageUrl" value={localSettings.heroImageUrl} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="loginImageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Imagen (Login)</label>
                                    <input type="text" name="loginImageUrl" id="loginImageUrl" value={localSettings.loginImageUrl} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">Configuración de Pagos</h3>
                                
                                <div className="space-y-4 p-4 border rounded-lg border-slate-300 dark:border-slate-600">
                                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Yape</h4>
                                    <div>
                                        <label htmlFor="yapeQrUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de QR Yape</label>
                                        <input type="text" name="yapeQrUrl" id="yapeQrUrl" value={localSettings.yapeInfo.qrUrl} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, qrUrl: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="yapeRecipientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Titular (Yape)</label>
                                        <input type="text" name="yapeRecipientName" id="yapeRecipientName" value={localSettings.yapeInfo.recipientName} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, recipientName: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="yapePhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Teléfono (Yape)</label>
                                        <input type="text" name="yapePhoneNumber" id="yapePhoneNumber" value={localSettings.yapeInfo.phoneNumber} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, phoneNumber: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 p-4 border rounded-lg border-slate-300 dark:border-slate-600">
                                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Plin</h4>
                                    <div>
                                        <label htmlFor="plinQrUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de QR Plin</label>
                                        <input type="text" name="plinQrUrl" id="plinQrUrl" value={localSettings.plinInfo.qrUrl} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, qrUrl: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="plinRecipientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Titular (Plin)</label>
                                        <input type="text" name="plinRecipientName" id="plinRecipientName" value={localSettings.plinInfo.recipientName} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, recipientName: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="plinPhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Teléfono (Plin)</label>
                                        <input type="text" name="plinPhoneNumber" id="plinPhoneNumber" value={localSettings.plinInfo.phoneNumber} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, phoneNumber: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="whatsappNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de WhatsApp (para confirmación de cita)</label>
                                    <input type="text" name="whatsappNumber" id="whatsappNumber" value={localSettings.whatsappNumber} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>

                                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">Integraciones</h3>
                                <div>
                                    <label htmlFor="n8nWebhookUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de Webhook n8n</label>
                                    <input type="text" name="n8nWebhookUrl" id="n8nWebhookUrl" value={localSettings.n8nWebhookUrl} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Pega aquí la URL del webhook de n8n para activar el envío de documentos por WhatsApp. Puedes crear uno gratis en n8n.cloud.</p>
                                </div>

                                <div className="pt-2 text-right">
                                     <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors`}>
            <aside className="w-64 bg-white dark:bg-slate-800 p-4 flex flex-col border-r border-slate-200 dark:border-slate-700">
                 <div className="flex items-center space-x-2 mb-8 px-2">
                    <div className="w-9 h-9 text-blue-600 dark:text-blue-400"><DentalIcon /></div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{props.settings.clinicName} Admin</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    <TabButton icon={<DashboardIcon />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton icon={<AppointmentIcon />} label="Agenda" isActive={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
                    <TabButton icon={<BriefcaseIcon />} label="Pacientes" isActive={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
                    <TabButton icon={<UsersIcon />} label="Doctores" isActive={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
                    <TabButton icon={<MegaphoneIcon />} label="Promociones" isActive={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
                    <TabButton icon={<DollarSignIcon />} label="Finanzas" isActive={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
                    <TabButton icon={<BriefcaseIcon />} label="Cotizaciones" isActive={activeTab === 'cotizaciones'} onClick={() => setActiveTab('cotizaciones')} />
                    <TabButton icon={<DentalIcon />} label="Servicios" isActive={activeTab === 'services'} onClick={() => setActiveTab('services')} />
                    <TabButton icon={<SettingsIcon />} label="Configuración" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                 <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                        <button onClick={props.onLogout} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors">Cerrar Sesión</button>
                    </div>
                     <button onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600/50 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                        <span>Cambiar Tema</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto flex flex-col">
                {renderContent()}
            </main>
            
            {editingAppointment && <AdminAppointmentModal appointment={editingAppointment} doctors={props.doctors} onClose={() => setEditingAppointment(null)} onSave={handleSaveAppointment} />}
            {editingDoctor && <AdminDoctorModal doctor={editingDoctor} onClose={() => setEditingDoctor(null)} onSave={handleSaveDoctor} />}
            {editingPromotion && <AdminPromotionModal promotion={editingPromotion} onClose={() => setEditingPromotion(null)} onSave={handleSavePromotion} />}
            {editingAvailabilityDoctor && <DoctorAvailabilityModal doctor={editingAvailabilityDoctor} onClose={() => setEditingAvailabilityDoctor(null)} onSave={handleSaveDoctor} />}
        </div>
    );
};