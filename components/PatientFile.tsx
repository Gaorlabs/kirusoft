
import React, { useState } from 'react';
import type { Appointment, PatientRecord } from '../types';
import { UserIcon, PhoneIcon, EmailIcon, CalendarIcon, PencilIcon, CloseIcon, PlusIcon, TrashIcon } from './icons';

const MedicalAlertsModal: React.FC<{
    alerts: string[];
    onClose: () => void;
    onSave: (alerts: string[]) => void;
}> = ({ alerts, onClose, onSave }) => {
    const [currentAlerts, setCurrentAlerts] = useState(alerts);
    const [newAlert, setNewAlert] = useState('');

    const handleAddAlert = () => {
        if (newAlert.trim() && !currentAlerts.includes(newAlert.trim())) {
            setCurrentAlerts([...currentAlerts, newAlert.trim()]);
            setNewAlert('');
        }
    };

    const handleRemoveAlert = (alertToRemove: string) => {
        setCurrentAlerts(currentAlerts.filter(alert => alert !== alertToRemove));
    };

    const handleSave = () => {
        onSave(currentAlerts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editar Alertas Médicas</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newAlert}
                            onChange={(e) => setNewAlert(e.target.value)}
                            placeholder="Añadir nueva alerta..."
                            className="flex-grow block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                        <button onClick={handleAddAlert} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {currentAlerts.length > 0 ? currentAlerts.map((alert, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <span className="text-sm">{alert}</span>
                                <button onClick={() => handleRemoveAlert(alert)} className="text-red-500 hover:text-red-700">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">No hay alertas.</p>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSave} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar</button>
                </div>
            </div>
        </div>
    );
};

interface PatientFileProps {
    patient: Appointment | null;
    record: PatientRecord;
    onUpdateMedicalAlerts: (alerts: string[]) => void;
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

export const PatientFile: React.FC<PatientFileProps> = ({ patient, record, onUpdateMedicalAlerts }) => {
    const [isEditingAlerts, setIsEditingAlerts] = useState(false);

    if (!patient) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No se ha seleccionado ningún paciente.</p>
            </div>
        );
    }
    
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
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Alertas Médicas</h3>
                    <button onClick={() => setIsEditingAlerts(true)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar Alertas Médicas">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                </div>
                {record.medicalAlerts.length > 0 ? (
                     <div className="p-3 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                        {record.medicalAlerts.join(', ')}
                    </div>
                ) : (
                    <div className="p-3 text-sm bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                        No hay alertas registradas.
                    </div>
                )}
            </div>

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
            {isEditingAlerts && (
                <MedicalAlertsModal
                    alerts={record.medicalAlerts}
                    onClose={() => setIsEditingAlerts(false)}
                    onSave={onUpdateMedicalAlerts}
                />
            )}
        </div>
    );
};