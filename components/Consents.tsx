import React, { useState } from 'react';
import type { ConsentForm } from '../types';
import { PlusIcon, CloseIcon, CheckIcon } from './icons';
import { CONSENT_TEMPLATES } from '../constants';

interface ConsentModalProps {
    onClose: () => void;
    onSave: (consent: Omit<ConsentForm, 'id' | 'dateSigned' | 'status'>) => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ onClose, onSave }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const template = CONSENT_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (template) {
            onSave({ templateId: template.id, title: template.title });
            onClose();
        } else {
            alert('Por favor, seleccione una plantilla.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Añadir Consentimiento</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plantilla de Consentimiento</label>
                        <select id="template" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="" disabled>Seleccione una plantilla...</option>
                            {CONSENT_TEMPLATES.map(template => (
                                <option key={template.id} value={template.id}>{template.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                        <button type="submit" className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Añadir</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ConsentsProps {
    consents: ConsentForm[];
    onUpdate: (consents: ConsentForm[]) => void;
}

export const Consents: React.FC<ConsentsProps> = ({ consents, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveConsent = (data: Omit<ConsentForm, 'id' | 'dateSigned' | 'status'>) => {
        const newConsent: ConsentForm = {
            ...data,
            id: crypto.randomUUID(),
            dateSigned: null,
            status: 'pending',
        };
        onUpdate([...consents, newConsent]);
    };

    const handleSignConsent = (id: string) => {
        if (window.confirm("¿Confirma que el paciente ha firmado este consentimiento?")) {
            const updatedConsents = consents.map(c => 
                c.id === id ? { ...c, status: 'signed' as const, dateSigned: new Date().toISOString() } : c
            );
            onUpdate(updatedConsents);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Consentimientos Informados</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon /><span>Añadir Consentimiento</span></button>
            </div>

            {consents.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay consentimientos registrados para este paciente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {consents.map(c => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{c.title}</p>
                                {c.status === 'signed' && c.dateSigned && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Firmado el {new Date(c.dateSigned).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div>
                                {c.status === 'pending' ? (
                                    <button onClick={() => handleSignConsent(c.id)} className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold py-1 px-3 rounded-full text-sm hover:bg-green-200">Marcar como Firmado</button>
                                ) : (
                                    <span className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-bold"><CheckIcon /><span>Firmado</span></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <ConsentModal onClose={() => setIsModalOpen(false)} onSave={handleSaveConsent} />}
        </div>
    );
};