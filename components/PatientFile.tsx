

import React, { useState } from 'react';
import type { Appointment, PatientRecord, MedicalHistory } from '../types';
import { UserIcon, PhoneIcon, EmailIcon, PencilIcon, ClipboardListIcon, CalendarIcon, SaveIcon, TrashIcon } from './icons';
import { MedicalHistoryModal } from './MedicalHistoryModal';


interface PatientFileProps {
    patient: Appointment | null;
    record: PatientRecord;
    onUpdateMedicalHistory: (history: MedicalHistory) => void;
    onUpdateRecall: (recall?: { date: string; reason: string; }) => void;
}

const InfoCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-start">
        <div className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 mt-1 flex-shrink-0">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const HistorySection: React.FC<{ title: string; items: string[]; color: 'red' | 'yellow' | 'blue' | 'green' | 'gray' }> = ({ title, items, color }) => {
    if (items.length === 0) return null;
    
    const colorClasses = {
        red: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
        green: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
        gray: 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-300',
    };

    return (
        <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <span key={index} className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[color]}`}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

const RecallManager: React.FC<{ recall: PatientRecord['recall'], onUpdateRecall: PatientFileProps['onUpdateRecall'] }> = ({ recall, onUpdateRecall }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(recall?.date ? new Date(recall.date).toISOString().slice(0, 10) : '');
    const [reason, setReason] = useState(recall?.reason || '');

    const handleSave = () => {
        if (date && reason) {
            onUpdateRecall({ date: new Date(date).toISOString(), reason });
            setIsEditing(false);
        }
    };
    
    const handleDelete = () => {
        onUpdateRecall(undefined);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-3 space-y-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-1 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                <input type="text" placeholder="Motivo del recall" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-1 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                <div className="flex justify-end space-x-2">
                    {recall && <button onClick={handleDelete} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4" /></button>}
                    <button onClick={() => setIsEditing(false)} className="font-semibold text-sm px-3 py-1">Cancelar</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white font-semibold text-sm px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1"><SaveIcon className="w-4 h-4" /><span>Guardar</span></button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span>Recall / Próximo Control</span>
                </h3>
                <button onClick={() => setIsEditing(true)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar Recall">
                    <PencilIcon className="w-4 h-4" />
                </button>
            </div>
             {recall ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{new Date(recall.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{recall.reason}</p>
                </div>
            ) : (
                <div className="p-3 text-sm text-center bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                    No hay recall programado.
                </div>
            )}
        </div>
    );
};

export const PatientFile: React.FC<PatientFileProps> = ({ patient, record, onUpdateMedicalHistory, onUpdateRecall }) => {
    const [isEditingHistory, setIsEditingHistory] = useState(false);

    if (!patient) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No se ha seleccionado ningún paciente.</p>
            </div>
        );
    }
    
    const { medicalHistory } = record;
    const hasHistory = medicalHistory.systemicDiseases.length > 0 ||
                       medicalHistory.pastSurgeries.length > 0 ||
                       medicalHistory.allergies.length > 0 ||
                       medicalHistory.currentMedications.length > 0 ||
                       medicalHistory.habits.length > 0 ||
                       medicalHistory.familyHistory.trim() !== '';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{patient.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID Paciente: {patient.id}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4 border border-gray-200 dark:border-gray-700">
                <InfoCard label="Teléfono" value={patient.phone} icon={<PhoneIcon />} />
                <InfoCard label="Email" value={patient.email} icon={<EmailIcon />} />
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-2">
                     <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <ClipboardListIcon className="w-5 h-5 text-gray-400" />
                        <span>Anamnesis / Historial Médico</span>
                     </h3>
                    <button onClick={() => setIsEditingHistory(true)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar Historial Médico">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                </div>
                {hasHistory ? (
                     <div className="p-3 space-y-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <HistorySection title="Alergias" items={medicalHistory.allergies} color="red" />
                        <HistorySection title="Enfermedades Sistémicas" items={medicalHistory.systemicDiseases} color="yellow" />
                        <HistorySection title="Medicación Actual" items={medicalHistory.currentMedications} color="blue" />
                        <HistorySection title="Cirugías Previas" items={medicalHistory.pastSurgeries} color="gray" />
                        <HistorySection title="Hábitos" items={medicalHistory.habits} color="gray" />
                        {medicalHistory.familyHistory && (
                             <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">Antecedentes Familiares</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{medicalHistory.familyHistory}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-3 text-sm text-center bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                        No hay historial médico registrado.
                    </div>
                )}
            </div>

            <RecallManager recall={record.recall} onUpdateRecall={onUpdateRecall} />

            <div>
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Historial de Sesiones</h3>
                {record.sessions.length > 0 ? (
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {record.sessions.map(session => (
                            <li key={session.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{session.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(session.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="p-3 text-sm text-center bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                        No hay sesiones previas.
                    </div>
                )}
            </div>
            {isEditingHistory && (
                <MedicalHistoryModal
                    history={record.medicalHistory}
                    onClose={() => setIsEditingHistory(false)}
                    onSave={(newHistory) => {
                        onUpdateMedicalHistory(newHistory);
                        setIsEditingHistory(false);
                    }}
                />
            )}
        </div>
    );
};