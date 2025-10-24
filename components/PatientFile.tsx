import React from 'react';
import type { Appointment, PatientRecord } from '../types';
import { UserIcon, PhoneIcon, EmailIcon, CalendarIcon } from './icons';

interface PatientFileProps {
    patient: Appointment | null;
    record: PatientRecord;
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

export const PatientFile: React.FC<PatientFileProps> = ({ patient, record }) => {
    
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
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Alertas Médicas</h3>
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
        </div>
    );
};