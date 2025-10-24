import React, { useState } from 'react';
import type { Session } from '../types';
import { PencilIcon, SaveIcon, PlusIcon, TrashIcon } from './icons';
import { TREATMENTS_MAP } from '../constants';

interface SessionCardProps {
    session: Session;
    onUpdateSession: (sessionId: string, updatedData: Partial<Session>) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onUpdateSession }) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(session.notes);

    const handleSaveNotes = () => {
        onUpdateSession(session.id, { notes });
        setIsEditingNotes(false);
    };

    const handleAddDocument = () => {
        const docName = prompt("Nombre del documento:", "");
        if (docName) {
            const newDoc = { id: crypto.randomUUID(), name: docName, type: 'pdf' as const };
            onUpdateSession(session.id, { documents: [...session.documents, newDoc] });
        }
    };
    
    const handleDeleteDocument = (docId: string) => {
        if(window.confirm("¿Está seguro de que desea eliminar este documento?")) {
            onUpdateSession(session.id, { documents: session.documents.filter(d => d.id !== docId) });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{session.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Treatments */}
                <div>
                    <h5 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Tratamientos Realizados</h5>
                    {session.treatments.length > 0 ? (
                        <ul className="space-y-2">
                            {session.treatments.map(t => {
                                const info = TREATMENTS_MAP[t.treatmentId];
                                return (
                                    <li key={t.id} className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                        <p className="font-semibold text-blue-800 dark:text-blue-300">{info?.label}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Diente: {t.toothId} {t.surface !== 'whole' && `- Sup: ${t.surface}`}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No se realizaron tratamientos en esta sesión.</p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300">Notas Clínicas</h5>
                        {isEditingNotes ? (
                             <button onClick={handleSaveNotes} className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-semibold">
                                <SaveIcon className="w-4 h-4" /><span>Guardar</span>
                            </button>
                        ) : (
                             <button onClick={() => setIsEditingNotes(true)} className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold">
                                <PencilIcon className="w-4 h-4" /><span>Editar</span>
                            </button>
                        )}
                    </div>
                    {isEditingNotes ? (
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={5}
                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md min-h-[100px] whitespace-pre-wrap">
                            {notes || <span className="italic text-gray-400">No hay notas para esta sesión.</span>}
                        </div>
                    )}
                </div>
                
                {/* Documents */}
                <div className="md:col-span-2">
                     <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300">Documentos Adjuntos</h5>
                         <button onClick={handleAddDocument} className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold">
                            <PlusIcon className="w-4 h-4" /><span>Añadir</span>
                        </button>
                    </div>
                     {session.documents.length > 0 ? (
                        <ul className="space-y-2">
                            {session.documents.map(doc => (
                                <li key={doc.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <span className="text-gray-700 dark:text-gray-300">{doc.name}</span>
                                    <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay documentos adjuntos.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ClinicalHistoryProps {
    sessions: Session[];
    onUpdateSession: (sessionId: string, updatedData: Partial<Session>) => void;
}

export const ClinicalHistory: React.FC<ClinicalHistoryProps> = ({ sessions, onUpdateSession }) => {
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">Historial de Sesiones</h3>
            {sortedSessions.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay sesiones registradas para este paciente.</p>
                    <p className="text-sm text-gray-400 mt-1">Cree una sesión en el Plan de Tratamiento.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedSessions.map(session => (
                        <SessionCard key={session.id} session={session} onUpdateSession={onUpdateSession} />
                    ))}
                </div>
            )}
        </div>
    );
};