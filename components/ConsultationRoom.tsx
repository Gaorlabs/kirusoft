


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Odontogram } from './Odontogram';
import { Toolbar } from './Toolbar';
import { TreatmentPlan } from './TreatmentPlan';
import type { OdontogramState, ToothCondition, ToothSurfaceName, WholeToothCondition, ToothState, AppliedTreatment, Session, ClinicalFinding, Appointment, PatientRecord, Prescription, ConsentForm, Payment, Doctor, MedicalHistory, Budget, ProposedSession, AppSettings, DentalTreatment } from '../types';
import { ALL_TEETH_PERMANENT, ALL_TEETH_DECIDUOUS, QUADRANTS_PERMANENT, QUADRANTS_DECIDUOUS } from '../constants';
import { DentalIcon, SaveIcon, MoonIcon, SunIcon, CalendarIcon, ArrowLeftIcon, OdontogramIcon, BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, ClipboardListIcon, DollarSignIcon, PlusIcon } from './icons';
import { ClinicalFindings } from './ClinicalFindings';
import { StatusBar } from './StatusBar';
import { PatientFile } from './PatientFile';
import { ClinicalHistory } from './ClinicalHistory';
import { Prescriptions } from './Prescriptions';
import { Consents } from './Consents';
import { Accounts } from './Accounts';
import { BudgetToPrint } from './BudgetToPrint';
import { PrescriptionToPrint } from './PrescriptionToPrint';
import { ConsentToPrint } from './ConsentToPrint';
import { PaymentReceiptToPrint } from './PaymentReceiptToPrint';


type OdontogramType = 'permanent' | 'deciduous';
type Theme = 'light' | 'dark';
type MainView = 'odontogram' | 'plan' | 'history' | 'prescriptions' | 'consents' | 'accounts';
type DocumentType = 'budget' | 'prescription' | 'consent' | 'paymentReceipt' | 'accountStatement';

interface ConsultationRoomProps {
    patient: Appointment;
    patientRecord: PatientRecord;
    onSave: (record: PatientRecord) => void;
    onNavigateToAdmin: () => void;
    onNavigateToPatient: (direction: 'next' | 'previous') => void;
    isFirstPatient: boolean;
    isLastPatient: boolean;
    onSavePayment: (paymentData: { patientId: string; amount: number; method: string; date: string; id?: string }) => void;
    onDeletePayment: (paymentId: string, patientId: string) => void;
    initialTab?: MainView;
    initialEditBudgetId?: string;
    doctors: Doctor[];
    settings: AppSettings;
    treatments: DentalTreatment[];
    onSendToWhatsapp: (patient: Appointment, htmlContent: string, documentType: string) => Promise<boolean>;
}


export function ConsultationRoom({ 
    patient, 
    patientRecord, 
    onSave, 
    onNavigateToAdmin, 
    onNavigateToPatient, 
    isFirstPatient, 
    isLastPatient, 
    onSavePayment, 
    onDeletePayment, 
    initialTab,
    initialEditBudgetId, 
    doctors, 
    settings, 
    treatments,
    onSendToWhatsapp
}: ConsultationRoomProps) {
    const [record, setRecord] = useState(patientRecord);
    const [theme, setTheme] = useState<Theme>('dark');
    const [activeView, setActiveView] = useState<MainView>(initialTab || 'odontogram');
    const [odontogramType, setOdontogramType] = useState<OdontogramType>('permanent');
    const [activeTooth, setActiveTooth] = useState<{ toothId: number; surface: ToothSurfaceName | 'whole' } | null>(null);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [editingFinding, setEditingFinding] = useState<ClinicalFinding | null>(null);

    const [documentToAction, setDocumentToAction] = useState<{ type: string, item: any } | null>(null);
    const [isSending, setIsSending] = useState(false);
    
    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);
    
    useEffect(() => {
        setRecord(patientRecord);
        setActiveView(initialTab || 'odontogram');
    }, [patientRecord, initialTab]);

    useEffect(() => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
    }, [theme]);
    
    const allFindings = useMemo(() => {
        const permanentFindings = Object.values(record.permanentOdontogram).flatMap((tooth: ToothState) => tooth.findings);
        const deciduousFindings = Object.values(record.deciduousOdontogram).flatMap((tooth: ToothState) => tooth.findings);
        return [...permanentFindings, ...deciduousFindings];
    }, [record.permanentOdontogram, record.deciduousOdontogram]);

    // This effect handles both printing and sending to WhatsApp
    useEffect(() => {
        const performDocumentAction = async () => {
            if (!documentToAction) return;

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            const root = createRoot(tempDiv);
            
            try {
                const { type, item } = documentToAction;
                const isSendAction = type.startsWith('send_');
                const actionType = isSendAction ? type.substring(5) : type;

                let documentTitle = '';
                let elementToRender;

                switch (actionType) {
                    case 'budget':
                        documentTitle = `Presupuesto - ${patient.name}`;
                        elementToRender = <BudgetToPrint budget={item} patientName={patient.name} findings={allFindings} doctors={doctors} settings={settings} treatments={treatments} />;
                        break;
                    case 'prescription':
                         documentTitle = `Receta - ${patient.name}`;
                         elementToRender = <PrescriptionToPrint prescription={item} patientName={patient.name} clinicName={settings.clinicName} doctor={doctors.find(d => d.id === item.doctorId)} />;
                        break;
                    case 'consent':
                        documentTitle = `Consentimiento - ${patient.name}`;
                        elementToRender = <ConsentToPrint consent={item} patientName={patient.name} clinicName={settings.clinicName} doctor={doctors.find(d => d.id === item.doctorId)} />;
                        break;
                    case 'paymentReceipt':
                        documentTitle = `Recibo - ${patient.name}`;
                        elementToRender = <PaymentReceiptToPrint payment={item} patientName={patient.name} clinicName={settings.clinicName} receiptNumber={item.id.slice(0,6).toUpperCase()} />;
                        break;
                }

                if (elementToRender) {
                    await new Promise(resolve => root.render(
                      <React.StrictMode>
                        {React.cloneElement(elementToRender, { ref: (el: HTMLDivElement) => { if(el) resolve(el); } })}
                      </React.StrictMode>
                    ));
                    
                    const htmlContent = tempDiv.innerHTML;
                    
                    if (isSendAction) {
                        onSendToWhatsapp(patient, htmlContent, actionType).then(success => {
                            if (success) {
                                alert('Documento enviado con éxito por WhatsApp.');
                            }
                        }).finally(() => {
                            setIsSending(false);
                            setDocumentToAction(null);
                        });
                    } else {
                        const winPrint = window.open('', '', 'width=900,height=650');
                        if (winPrint) {
                            document.title = documentTitle;
                            winPrint.document.write(`<html><head><title>${documentTitle}</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }</style></head><body>`);
                            winPrint.document.write(htmlContent);
                            winPrint.document.write('</body></html>');
                            winPrint.document.close();
                            winPrint.focus();
                            setTimeout(() => {
                                winPrint.print();
                                winPrint.close();
                                document.title = 'Kiru Consultorio Dental';
                                setDocumentToAction(null);
                            }, 500);
                        } else {
                            setDocumentToAction(null);
                        }
                    }
                } else {
                    setDocumentToAction(null);
                    setIsSending(false);
                }
            } finally {
                // Cleanup
                root.unmount();
                if (tempDiv.parentNode) {
                    document.body.removeChild(tempDiv);
                }
            }
        };
        
        performDocumentAction();
    }, [documentToAction, patient, allFindings, doctors, settings, treatments, onSendToWhatsapp]);

    const handleDocumentAction = (action: 'print' | 'send', type: DocumentType, item: any) => {
        if (action === 'send') {
             if (!settings.n8nWebhookUrl) {
                alert("La URL del webhook de n8n no está configurada. Por favor, configúrela en el panel de administración en la pestaña de 'Configuración'.");
                return;
            }
            setIsSending(true);
            setDocumentToAction({ type: `send_${type}`, item });
        } else {
            setDocumentToAction({ type, item });
        }
    };

    const isPermanent = odontogramType === 'permanent';
    const odontogramState = isPermanent ? record.permanentOdontogram : record.deciduousOdontogram;
    
    const setOdontogramState = (updater: React.SetStateAction<OdontogramState>) => {
        setRecord(prev => {
            const newOdontogramState = typeof updater === 'function' ? updater(isPermanent ? prev.permanentOdontogram : prev.deciduousOdontogram) : updater;
            if (isPermanent) {
                return { ...prev, permanentOdontogram: newOdontogramState };
            } else {
                return { ...prev, deciduousOdontogram: newOdontogramState };
            }
        });
    };

    const allCompletedTreatments = useMemo(() => {
        return record.sessions
            .flatMap(session => session.treatments)
            .filter(treatment => treatment.status === 'completed')
            .map(treatment => {
                const treatmentInfo = treatmentsMap[treatment.treatmentId];
                return `${treatmentInfo.label} (Diente ${treatment.toothId})`;
            });
    }, [record.sessions, treatmentsMap]);

    const handleDeleteFinding = (findingId: string) => {
        setRecord(prev => {
            const newRecord = structuredClone(prev);
            let found = false;

            for (const toothId in newRecord.permanentOdontogram) {
                const tooth = newRecord.permanentOdontogram[toothId];
                const initialLength = tooth.findings.length;
                tooth.findings = tooth.findings.filter(f => f.id !== findingId);
                if (tooth.findings.length < initialLength) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                for (const toothId in newRecord.deciduousOdontogram) {
                    const tooth = newRecord.deciduousOdontogram[toothId];
                    const initialLength = tooth.findings.length;
                    tooth.findings = tooth.findings.filter(f => f.id !== findingId);
                    if (tooth.findings.length < initialLength) {
                        break;
                    }
                }
            }
            return newRecord;
        });
    };
    
    const addFinding = useCallback((treatmentId: ToothCondition | WholeToothCondition, toothInfo: { toothId: number; surface: ToothSurfaceName | 'whole' }) => {
        const treatmentInfo = treatments.find(t => t.id === treatmentId);
        if (!treatmentInfo) return;

        setOdontogramState(prevState => {
            const { toothId, surface } = toothInfo;
            const currentTooth = prevState[toothId];

            if (!currentTooth) return prevState;

            const newFinding: ClinicalFinding = {
                id: crypto.randomUUID(),
                toothId: toothId,
                surface: surface,
                condition: treatmentId,
            };
            
            const alreadyExists = currentTooth.findings.some(f => f.toothId === toothId && f.surface === surface && f.condition === treatmentId);
            if (alreadyExists) {
                return prevState;
            }
            
            const updatedTooth: ToothState = {
                ...currentTooth,
                findings: [...currentTooth.findings, newFinding],
            };

            return {
                ...prevState,
                [toothId]: updatedTooth,
            };
        });

    }, [setOdontogramState, treatments]);
    
    const applyCompletedTreatment = useCallback((treatmentId: ToothCondition | WholeToothCondition, toothInfo: { toothId: number; surface: ToothSurfaceName | 'whole' }) => {
        const treatmentInfo = treatments.find(t => t.id === treatmentId);
        if (!treatmentInfo) return;

        setOdontogramState(prevState => {
            const { toothId, surface } = toothInfo;
            const tooth = prevState[toothId];
            if (!tooth) return prevState;

            const newTreatment: AppliedTreatment = {
                id: crypto.randomUUID(),
                treatmentId,
                toothId,
                surface,
                status: 'completed',
                sessionId: 'historical',
            };
            
            const updatedTooth = structuredClone(tooth);
            
            const updateLocation = (key: ToothSurfaceName | 'whole') => {
                const targetArray = key === 'whole' ? updatedTooth.whole : updatedTooth.surfaces[key as ToothSurfaceName];
                if (!targetArray.some(t => t.treatmentId === treatmentId)) {
                    targetArray.push(newTreatment);
                }
            };

            if (treatmentInfo.appliesTo === 'surface' && surface !== 'whole' && surface !== 'root') {
                 if (treatmentId === 'crown') {
                    Object.keys(updatedTooth.surfaces).forEach(s => {
                        if (s !== 'root') updatedTooth.surfaces[s as ToothSurfaceName] = [newTreatment];
                    });
                } else {
                   updateLocation(surface as ToothSurfaceName);
                }
            } else if (treatmentInfo.appliesTo === 'root' && (surface === 'root' || surface === 'whole')) {
                updateLocation('root');
            } else if (treatmentInfo.appliesTo === 'whole_tooth') {
                updateLocation('whole');
                Object.keys(updatedTooth.surfaces).forEach(s => {
                    updatedTooth.surfaces[s as ToothSurfaceName] = [];
                });
            }

            return { ...prevState, [toothId]: updatedTooth };
        });
    }, [setOdontogramState, treatments]);

     const updateFinding = (findingId: string, newCondition: ToothCondition | WholeToothCondition) => {
        setRecord(prev => {
            const newRecord = structuredClone(prev);
            let found = false;
            
            const findAndUpdate = (odontogram: OdontogramState) => {
                for (const toothId in odontogram) {
                    const tooth = odontogram[toothId];
                    const findingIndex = tooth.findings.findIndex(f => f.id === findingId);
                    if (findingIndex > -1) {
                        tooth.findings[findingIndex].condition = newCondition;
                        return true;
                    }
                }
                return false;
            }

            if (findAndUpdate(newRecord.permanentOdontogram)) {
                found = true;
            }
            if (!found) {
                findAndUpdate(newRecord.deciduousOdontogram);
            }
            
            return newRecord;
        });
    };

     const handleToothClick = (toothInfo: { toothId: number; surface: ToothSurfaceName | 'whole' }) => {
        setActiveTooth(toothInfo);
        setIsTreatmentModalOpen(true);
    };
    
    const handleEditFindingClick = (finding: ClinicalFinding) => {
        setEditingFinding(finding);
        setActiveTooth({ toothId: finding.toothId, surface: finding.surface });
        setIsTreatmentModalOpen(true);
    };

    const handleSelectTreatmentFromModal = (treatmentId: ToothCondition | WholeToothCondition) => {
        const treatmentInfo = treatments.find(t => t.id === treatmentId);
    
        if (editingFinding) {
            updateFinding(editingFinding.id, treatmentId);
        } else if (activeTooth && treatmentInfo) {
            // Pathologies and proposed extractions are findings. Others are historical completed treatments.
            if (treatmentInfo.category === 'Patología' || treatmentInfo.id === 'extraction') {
                addFinding(treatmentId, activeTooth);
            } else {
                applyCompletedTreatment(treatmentId, activeTooth);
            }
        }
        setIsTreatmentModalOpen(false);
        setActiveTooth(null);
        setEditingFinding(null);
    };
    
    const handleSaveOrUpdateBudget = (budgetData: Partial<Budget> & { proposedSessions: Omit<ProposedSession, 'id'>[] }) => {
        let updatedRecord: PatientRecord;
        setRecord(prev => {
            const newRecord = structuredClone(prev);
            
            if (budgetData.id) { // Update
                const index = newRecord.budgets.findIndex(b => b.id === budgetData.id);
                if (index > -1) {
                    const existingBudget = newRecord.budgets[index];
                    const updatedSessions = budgetData.proposedSessions.map(ps => ({ ...ps, id: crypto.randomUUID() }));
                    newRecord.budgets[index] = { ...existingBudget, ...budgetData, proposedSessions: updatedSessions };
                }
            } else { // Create
                const newBudget: Budget = {
                    id: crypto.randomUUID(),
                    name: budgetData.name || `Presupuesto ${new Date().toLocaleDateString()}`,
                    date: new Date().toISOString(),
                    status: 'proposed',
                    observations: budgetData.observations,
                    proposedSessions: budgetData.proposedSessions.map(ps => ({ ...ps, id: crypto.randomUUID() })),
                };
                newRecord.budgets.push(newBudget);
            }
            updatedRecord = newRecord;
            return newRecord;
        });
        // Immediately save to global state to update Admin view
        setTimeout(() => onSave(updatedRecord), 0);
        alert('Presupuesto guardado con éxito.');
        setActiveView('plan');
    };

    const handleUpdateBudget = (budgetId: string, updatedData: Partial<Budget>) => {
        let updatedRecord: PatientRecord;
        setRecord(prev => {
             updatedRecord = {
                ...prev,
                budgets: prev.budgets.map(b => b.id === budgetId ? { ...b, ...updatedData } : b)
            };
            return updatedRecord;
        });
        setTimeout(() => onSave(updatedRecord), 0);
    };

    const handleActivateBudget = (budgetId: string) => {
        const budgetToActivate = record.budgets.find(b => b.id === budgetId);
        if (!budgetToActivate) return;
    
        const newSessions: Session[] = [];
        const assignedFindingIds = new Set<string>();
    
        for (const proposed of budgetToActivate.proposedSessions) {
            const sessionId = crypto.randomUUID();
            const treatments: AppliedTreatment[] = [];
    
            for (const findingId of proposed.findingIds) {
                const finding = allFindings.find(f => f.id === findingId);
                if (finding) {
                    treatments.push({
                        id: crypto.randomUUID(),
                        treatmentId: finding.condition,
                        toothId: finding.toothId,
                        surface: finding.surface,
                        status: 'proposed',
                        sessionId: sessionId,
                    });
                    assignedFindingIds.add(findingId);
                }
            }
    
            newSessions.push({
                id: sessionId,
                name: proposed.name,
                status: 'pending',
                date: new Date().toISOString(),
                scheduledDate: proposed.scheduledDate,
                treatments: treatments,
                notes: '',
                documents: [],
                doctorId: proposed.doctorId,
            });
        }
    
        setRecord(prev => {
            const newRecord = structuredClone(prev);
            newRecord.sessions = newSessions;
            newRecord.budgets = prev.budgets.map(b => 
                b.id === budgetId ? { ...b, status: 'accepted' } : { ...b, status: b.status === 'accepted' ? 'rejected' : b.status }
            );

            Object.values(newRecord.permanentOdontogram).forEach((tooth: ToothState) => {
                tooth.findings = tooth.findings.filter(f => !assignedFindingIds.has(f.id));
            });
            Object.values(newRecord.deciduousOdontogram).forEach((tooth: ToothState) => {
                tooth.findings = tooth.findings.filter(f => !assignedFindingIds.has(f.id));
            });
    
            return newRecord;
        });
    
        alert('Plan de tratamiento activado.');
    };
    
    const handleToggleTreatmentStatus = (sessionId: string, treatmentId: string) => {
        let treatmentToUpdate: AppliedTreatment | null = null;
        
        const newSessions = record.sessions.map(session => {
            if (session.id !== sessionId) return session;
            
            const newTreatments = session.treatments.map(treatment => {
                if (treatment.id === treatmentId) {
                    const updatedTreatment: AppliedTreatment = {
                        ...treatment,
                        status: treatment.status === 'proposed' ? 'completed' : 'proposed'
                    };
                    treatmentToUpdate = updatedTreatment;
                    return updatedTreatment;
                }
                return treatment;
            });
            return { ...session, treatments: newTreatments };
        });

        if (treatmentToUpdate) {
            const finalTreatment = treatmentToUpdate;
            const isToothPermanent = ALL_TEETH_PERMANENT.includes(finalTreatment.toothId);
            const targetOdontogramKey = isToothPermanent ? 'permanentOdontogram' : 'deciduousOdontogram';
            
            setRecord(prev => {
                 const newRecord = structuredClone(prev);
                 newRecord.sessions = newSessions;
                 
                 const tooth = newRecord[targetOdontogramKey][finalTreatment.toothId];
                 const treatmentInfo = treatments.find(t => t.id === finalTreatment.treatmentId);

                 if (treatmentInfo) {
                    const updateLocation = (key: ToothSurfaceName | 'whole') => {
                        const targetArray = key === 'whole' ? tooth.whole : tooth.surfaces[key as ToothSurfaceName];
                        const existingIndex = targetArray.findIndex(t => t.id === finalTreatment.id);
                        if (existingIndex > -1) {
                            targetArray[existingIndex] = finalTreatment;
                        } else {
                            targetArray.push(finalTreatment);
                        }
                    };
                     if (treatmentInfo.appliesTo === 'surface' && finalTreatment.surface !== 'whole' && finalTreatment.surface !== 'root') {
                         if (finalTreatment.treatmentId === 'crown') {
                            Object.keys(tooth.surfaces).forEach(s => {
                                if (s !== 'root') tooth.surfaces[s as ToothSurfaceName] = [finalTreatment];
                            });
                        } else {
                             updateLocation(finalTreatment.surface as ToothSurfaceName);
                        }
                    } else if (treatmentInfo.appliesTo === 'root' && (finalTreatment.surface === 'root' || finalTreatment.surface === 'whole')) {
                        updateLocation('root');
                    } else if (treatmentInfo.appliesTo === 'whole_tooth') {
                        updateLocation('whole');
                        Object.keys(tooth.surfaces).forEach(s => {
                            tooth.surfaces[s as ToothSurfaceName] = [];
                        });
                    }
                 }
                 return newRecord;
            });
        } else {
            setRecord(prev => ({...prev, sessions: newSessions}));
        }
    };

    const handleUpdateSession = (sessionId: string, updatedData: Partial<Session>) => {
        setRecord(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === sessionId ? {...s, ...updatedData} : s)
        }))
    };
    
    const handleUpdatePrescriptions = (prescriptions: Prescription[]) => {
        setRecord(prev => ({ ...prev, prescriptions }));
    };

    const handleUpdateConsents = (consents: ConsentForm[]) => {
        setRecord(prev => ({ ...prev, consents }));
    };

    const handleUpdateMedicalHistory = (medicalHistory: MedicalHistory) => {
        setRecord(prev => ({ ...prev, medicalHistory }));
    };

    const onUpdateRecall = (recallData?: { date: string; reason: string; }) => {
        setRecord(prev => ({ ...prev, recall: recallData }));
    };
    
    const quadrants = isPermanent ? QUADRANTS_PERMANENT : QUADRANTS_DECIDUOUS;
    
    const TabButton = ({ view, label, icon }: { view: MainView; label: string; icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeView === view
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
            <header className="bg-white dark:bg-gray-800 py-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                     <button
                        onClick={onNavigateToAdmin}
                        className="flex items-center space-x-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5"/>
                        <span>Panel</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigateToPatient('previous')} disabled={isFirstPatient} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeftIcon /></button>
                        <span className="font-semibold text-lg">{patient?.name}</span>
                        <button onClick={() => onNavigateToPatient('next')} disabled={isLastPatient} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRightIcon /></button>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'} className="flex items-center justify-center w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-full transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5"/>}
                    </button>
                     <button onClick={() => onSave(record)} title="Guardar Cambios" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">
                        <SaveIcon className="w-5 h-5" />
                        <span>Guardar Cambios</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                    <PatientFile patient={patient} record={record} onUpdateMedicalHistory={handleUpdateMedicalHistory} onUpdateRecall={onUpdateRecall} />
                </aside>
                
                <main className="flex-1 flex flex-col p-4 overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="flex space-x-1">
                            <TabButton view="odontogram" label="Odontograma" icon={<OdontogramIcon className="w-5 h-5"/>} />
                            <TabButton view="plan" label="Presupuestos y Plan" icon={<CalendarIcon className="w-5 h-5"/>} />
                            <TabButton view="history" label="Historial" icon={<BriefcaseIcon className="w-5 h-5"/>} />
                            <TabButton view="prescriptions" label="Recetas" icon={<FileTextIcon className="w-5 h-5"/>} />
                            <TabButton view="consents" label="Consentimientos" icon={<ClipboardListIcon className="w-5 h-5"/>} />
                            <TabButton view="accounts" label="Cuentas" icon={<DollarSignIcon className="w-5 h-5"/>} />
                        </nav>
                    </div>

                    <div className="flex-1 overflow-y-auto p-1">
                        {activeView === 'odontogram' && (
                           <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                                            <button onClick={() => setOdontogramType('permanent')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${odontogramType === 'permanent' ? 'bg-white dark:bg-gray-100 text-gray-800 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Permanente</button>
                                            <button onClick={() => setOdontogramType('deciduous')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${odontogramType === 'deciduous' ? 'bg-white dark:bg-gray-100 text-gray-800 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Temporal</button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 flex flex-col items-center justify-center overflow-auto">
                                        <Odontogram
                                            quadrants={quadrants}
                                            odontogramState={odontogramState}
                                            onToothClick={handleToothClick}
                                            activeToothInfo={activeTooth}
                                        />
                                    </div>
                                    <StatusBar activeTooth={activeTooth} />
                                </div>
                                <div className="flex-1 mt-4 overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Hallazgos Clínicos Registrados</h3>
                                    <ClinicalFindings 
                                        findings={allFindings}
                                        onDeleteFinding={handleDeleteFinding}
                                        onEditFinding={handleEditFindingClick}
                                        treatments={treatments}
                                    />
                                     {allFindings.length > 0 && (
                                        <div className="mt-6 text-center">
                                            <button
                                                onClick={() => setActiveView('plan')}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-0.5"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Crear Presupuesto</span>
                                            </button>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Crea una cotización y organiza los tratamientos en sesiones para el paciente.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                         {activeView === 'plan' && <TreatmentPlan sessions={record.sessions} findings={allFindings} onSaveOrUpdateBudget={handleSaveOrUpdateBudget} onActivateBudget={handleActivateBudget} onToggleTreatmentStatus={handleToggleTreatmentStatus} budgets={record.budgets} doctors={doctors} onUpdateBudget={handleUpdateBudget} onPrintBudget={(budget) => handleDocumentAction('print', 'budget', budget)} treatments={treatments} initialEditBudgetId={initialEditBudgetId} />}
                         {activeView === 'history' && <ClinicalHistory sessions={record.sessions} onUpdateSession={handleUpdateSession} treatments={treatments} />}
                         {activeView === 'prescriptions' && <Prescriptions prescriptions={record.prescriptions} onUpdate={handleUpdatePrescriptions} patientName={patient.name} doctors={doctors} treatments={allCompletedTreatments} onAction={handleDocumentAction} isSending={isSending} />}
                         {activeView === 'consents' && <Consents consents={record.consents} onUpdate={handleUpdateConsents} patientName={patient.name} doctors={doctors} onAction={handleDocumentAction} isSending={isSending} />}
                         {activeView === 'accounts' && <Accounts sessions={record.sessions} patientId={record.patientId} payments={record.payments} onSavePayment={onSavePayment} onDeletePayment={onDeletePayment} patientName={patient.name} treatments={treatments} onAction={handleDocumentAction} isSending={isSending}/>}
                    </div>
                </main>

                {isTreatmentModalOpen && (
                    <Toolbar
                        target={activeTooth}
                        onClose={() => {
                            setIsTreatmentModalOpen(false);
                            setActiveTooth(null);
                            setEditingFinding(null);
                        }}
                        onSelectTreatment={handleSelectTreatmentFromModal}
                        treatments={treatments}
                    />
                )}
            </div>
        </div>
    );
}